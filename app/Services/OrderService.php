<?php

namespace App\Services;

use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;

class OrderService
{
    /**
     * Calculate authoritative line subtotal for a product and quantity, applying bundle promos if eligible.
     */
    public function calculateLineSubtotal(Book|Accessory|Combo $product, int $quantity): float
    {
        $unitPrice = (float) $product->price;
        $promoPrice = $product->promo_price ? (float) $product->promo_price : 0.0;
        $promoQty = $product->promo_quantity ? (int) $product->promo_quantity : 0;

        if ($promoQty > 0 && $promoPrice > 0 && $quantity >= $promoQty) {
            $bundles = intdiv($quantity, $promoQty);
            $remainder = $quantity % $promoQty;

            return round(($bundles * $promoPrice) + ($remainder * $unitPrice), 2);
        }

        return round($unitPrice * $quantity, 2);
    }

    /**
     * Validate active availability, accumulated stock (including combo components),
     * and compute authoritative server-side prices for checkout items.
     *
     * @param  array<int, array<string, mixed>>  $rawItems
     * @return array{items?: array<int, array<string, mixed>>, total_amount?: float, error?: string}
     */
    public function buildVerifiedOrderPayload(array $rawItems): array
    {
        $groupedDirect = [];

        foreach ($rawItems as $item) {
            if (empty($item['id']) || empty($item['type'])) {
                continue;
            }

            $type = (string) $item['type'];
            $id = (string) $item['id'];
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $key = "{$type}:{$id}";

            if (! isset($groupedDirect[$key])) {
                $groupedDirect[$key] = [
                    'type' => $type,
                    'id' => $id,
                    'quantity' => 0,
                    'fallback_title' => (string) ($item['title'] ?? 'este producto'),
                ];
            }

            $groupedDirect[$key]['quantity'] += $qty;
        }

        $loadedDirect = [];
        $stockRequirements = [];

        foreach ($groupedDirect as $key => $entry) {
            $product = $this->findProduct($entry['type'], $entry['id'], activeOnly: true);

            if (! $product) {
                return [
                    'error' => "Ya no queda stock disponible de {$entry['fallback_title']}.",
                ];
            }

            $loadedDirect[$key] = $product;
            $this->addRequirement($stockRequirements, $entry['type'], $entry['id'], $entry['quantity'], $product->title, $product);

            if ($entry['type'] === 'COMBO' && $product instanceof Combo) {
                foreach ($product->books as $comboBook) {
                    $compQty = max(1, (int) $comboBook->quantity) * $entry['quantity'];
                    $compId = (string) $comboBook->book_id;
                    $compBook = $this->findProduct('BOOK', $compId);
                    if (! $compBook) {
                        return [
                            'error' => "El libro incluido en {$product->title} ya no está disponible.",
                        ];
                    }
                    $this->addRequirement($stockRequirements, 'BOOK', $compId, $compQty, $compBook->title, $compBook);
                }

                foreach ($product->accessories as $comboAcc) {
                    $compQty = max(1, (int) $comboAcc->quantity) * $entry['quantity'];
                    $compId = (string) $comboAcc->accessory_id;
                    $compAcc = $this->findProduct('ACCESSORY', $compId);
                    if (! $compAcc) {
                        return [
                            'error' => "El accesorio incluido en {$product->title} ya no está disponible.",
                        ];
                    }
                    $this->addRequirement($stockRequirements, 'ACCESSORY', $compId, $compQty, $compAcc->title, $compAcc);
                }
            }
        }

        foreach ($stockRequirements as $req) {
            /** @var Book|Accessory|Combo $product */
            $product = $req['product'];
            $available = (int) $product->stock;

            if ($req['quantity'] > $available) {
                return [
                    'error' => $this->formatCheckoutStockMessage($req['title'], $available),
                ];
            }
        }

        $serverItems = [];
        $serverTotal = 0.0;

        foreach ($groupedDirect as $key => $entry) {
            /** @var Book|Accessory|Combo $product */
            $product = $loadedDirect[$key];
            $qty = $entry['quantity'];
            $lineSubtotal = $this->calculateLineSubtotal($product, $qty);
            $effectiveUnitPrice = round($lineSubtotal / $qty, 2);

            $serverItems[] = [
                'id' => (string) $product->id,
                'type' => $entry['type'],
                'title' => (string) $product->title,
                'quantity' => $qty,
                'list_price' => round((float) $product->price, 2),
                'unit_price' => $effectiveUnitPrice,
                'subtotal' => $lineSubtotal,
                'cover_url' => $product->cover_url,
            ];

            $serverTotal += $lineSubtotal;
        }

        return [
            'items' => $serverItems,
            'total_amount' => round($serverTotal, 2),
        ];
    }

    /**
     * Validate and decrement accumulated stock for an order inside an active DB transaction.
     * Must be called with $lockedOrder already locked via lockForUpdate().
     */
    public function confirmOrderStock(OrderLead $lockedOrder): ?string
    {
        $items = is_array($lockedOrder->items) ? $lockedOrder->items : [];
        $resolved = $this->loadAndLockOrderRequirements($items, withTrashed: false);

        if ($resolved['error'] !== null) {
            return $resolved['error'];
        }

        $requirements = $resolved['requirements'];
        $lockedProducts = $resolved['products'];

        // Validate accumulated stock for every unique product BEFORE decrementing any.
        foreach ($requirements as $key => $req) {
            $product = $lockedProducts[$key];
            $available = (int) $product->stock;

            if ($available < $req['quantity']) {
                $label = $product->title ?: $req['title'];

                return "No se puede confirmar el pedido: stock insuficiente para {$label} (disponibles: {$available}, solicitados: {$req['quantity']}).";
            }
        }

        foreach ($requirements as $key => $req) {
            $lockedProducts[$key]->decrement('stock', $req['quantity']);
        }

        return null;
    }

    /**
     * Restore accumulated stock for a previously confirmed order inside an active DB transaction.
     *
     * @return array<int, string> Titles of products that no longer exist even in trash and could not be restored.
     */
    public function restoreOrderStock(OrderLead $lockedOrder): array
    {
        $items = is_array($lockedOrder->items) ? $lockedOrder->items : [];
        $resolved = $this->loadAndLockOrderRequirements($items, withTrashed: true, ignoreMissing: true);

        foreach ($resolved['requirements'] as $key => $req) {
            if (isset($resolved['products'][$key])) {
                $resolved['products'][$key]->increment('stock', $req['quantity']);
            }
        }

        return $resolved['missing'];
    }

    /**
     * Lock all direct items and expanded combo components in deterministic key order.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array{requirements: array<string, array<string, mixed>>, products: array<string, Book|Accessory|Combo>, missing: array<int, string>, error: ?string}
     */
    protected function loadAndLockOrderRequirements(array $items, bool $withTrashed, bool $ignoreMissing = false): array
    {
        $requirements = $this->collectOrderRequirements($items);

        if (empty($requirements)) {
            return ['requirements' => [], 'products' => [], 'missing' => [], 'error' => null];
        }

        // Lock products in deterministic key order to prevent deadlocks across concurrent operations.
        ksort($requirements);

        $lockedProducts = [];
        $componentRequirements = [];
        $missingTitles = [];

        foreach ($requirements as $key => $req) {
            $product = $this->findProduct($req['type'], $req['id'], lock: true, withTrashed: $withTrashed);

            if (! $product) {
                if ($ignoreMissing) {
                    $missingTitles[] = $req['title'];
                    continue;
                }

                $isArchived = ! $withTrashed && $this->findProduct($req['type'], $req['id'], withTrashed: true) !== null;
                $reason = $isArchived
                    ? "No se puede confirmar el pedido: el producto \"{$req['title']}\" fue archivado y ya no está disponible en el catálogo."
                    : "No se puede confirmar el pedido: el producto \"{$req['title']}\" ya no está disponible en el catálogo.";

                return [
                    'requirements' => [],
                    'products' => [],
                    'missing' => [],
                    'error' => $reason,
                ];
            }

            $lockedProducts[$key] = $product;

            if ($req['type'] === 'COMBO' && $product instanceof Combo) {
                foreach ($product->books as $comboBook) {
                    $compId = (string) $comboBook->book_id;
                    $compQty = max(1, (int) $comboBook->quantity) * $req['quantity'];
                    $this->addRequirement($componentRequirements, 'BOOK', $compId, $compQty, $req['title']);
                }

                foreach ($product->accessories as $comboAcc) {
                    $compId = (string) $comboAcc->accessory_id;
                    $compQty = max(1, (int) $comboAcc->quantity) * $req['quantity'];
                    $this->addRequirement($componentRequirements, 'ACCESSORY', $compId, $compQty, $req['title']);
                }
            }
        }

        ksort($componentRequirements);

        foreach ($componentRequirements as $key => $compReq) {
            if (! isset($lockedProducts[$key])) {
                $compProduct = $this->findProduct($compReq['type'], $compReq['id'], lock: true, withTrashed: $withTrashed);

                if (! $compProduct) {
                    if ($ignoreMissing) {
                        $missingTitles[] = "componente de {$compReq['title']}";
                        continue;
                    }

                    $isArchived = ! $withTrashed && $this->findProduct($compReq['type'], $compReq['id'], withTrashed: true) !== null;
                    $reason = $isArchived
                        ? "No se puede confirmar el pedido: un componente del combo \"{$compReq['title']}\" fue archivado y ya no está disponible."
                        : "No se puede confirmar el pedido: un componente del combo \"{$compReq['title']}\" ya no está disponible en el catálogo.";

                    return [
                        'requirements' => [],
                        'products' => [],
                        'missing' => [],
                        'error' => $reason,
                    ];
                }

                $lockedProducts[$key] = $compProduct;
            }

            if (isset($requirements[$key])) {
                $requirements[$key]['quantity'] += $compReq['quantity'];
            } else {
                $requirements[$key] = $compReq;
            }
        }

        return [
            'requirements' => $requirements,
            'products' => $lockedProducts,
            'missing' => array_values(array_unique($missingTitles)),
            'error' => null,
        ];
    }

    /**
     * Collect direct item requirements grouped by type:id.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<string, array{type: string, id: string, quantity: int, title: string}>
     */
    protected function collectOrderRequirements(array $items): array
    {
        $requirements = [];

        foreach ($items as $item) {
            if (empty($item['id']) || empty($item['type'])) {
                continue;
            }

            $type = (string) $item['type'];
            $id = (string) $item['id'];
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $title = (string) ($item['title'] ?? 'Producto');

            $this->addRequirement($requirements, $type, $id, $qty, $title);
        }

        return $requirements;
    }

    /**
     * @param  array<string, array<string, mixed>>  $requirements
     */
    protected function addRequirement(
        array &$requirements,
        string $type,
        string $id,
        int $quantity,
        string $title,
        Book|Accessory|Combo|null $product = null
    ): void {
        $key = "{$type}:{$id}";

        if (! isset($requirements[$key])) {
            $requirements[$key] = [
                'type' => $type,
                'id' => $id,
                'quantity' => 0,
                'title' => $title,
            ];
            if ($product !== null) {
                $requirements[$key]['product'] = $product;
            }
        }

        $requirements[$key]['quantity'] += $quantity;
    }

    protected function findProduct(
        string $type,
        string $id,
        bool $activeOnly = false,
        bool $lock = false,
        bool $withTrashed = false
    ): Book|Accessory|Combo|null {
        $query = match ($type) {
            'BOOK' => Book::query(),
            'ACCESSORY' => Accessory::query(),
            'COMBO' => Combo::with(['books', 'accessories']),
            default => null,
        };

        if (! $query) {
            return null;
        }

        if ($withTrashed) {
            $query->withTrashed();
        }

        if ($activeOnly) {
            $query->active();
        }

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->find($id);
    }

    protected function formatCheckoutStockMessage(string $title, int $available): string
    {
        if ($available <= 0) {
            return "Ya no queda stock disponible de {$title}.";
        }

        if ($available === 1) {
            return "Solamente nos queda 1 unidad de {$title}.";
        }

        return "Solamente nos quedan {$available} unidades de {$title}.";
    }
}
