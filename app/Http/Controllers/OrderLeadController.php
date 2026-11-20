<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderLeadRequest;
use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;
use App\Models\StoreConfig;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderLeadController extends Controller
{
    public function __construct(protected OrderService $orderService) {}
    /**
     * Show the checkout page.
     */
    public function create(): Response
    {
        return Inertia::render('Checkout/Index');
    }

    /**
     * Verify real-time stock availability and store status for cart items.
     */
    public function verifyStock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|string',
            'items.*.type' => 'required|in:BOOK,ACCESSORY,COMBO',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $config = StoreConfig::first();
        $isStoreOpen = (bool) ($config?->is_store_open ?? true);

        $allValid = true;
        $resultsById = [];

        foreach ($validated['items'] as $item) {
            $id = (string) $item['id'];
            $type = (string) $item['type'];
            $qty = (int) $item['quantity'];

            $product = match ($type) {
                'BOOK' => Book::active()->find($id),
                'ACCESSORY' => Accessory::active()->find($id),
                'COMBO' => Combo::active()->find($id),
                default => null,
            };

            $available = $product ? (int) $product->stock : 0;
            $isValid = $product !== null && $qty <= $available;

            $message = null;
            if (! $isValid) {
                $allValid = false;
                $noun = $type === 'BOOK' ? 'este libro' : 'este producto';

                if ($available <= 0) {
                    $message = 'Este producto ya no tiene stock disponible.';
                } elseif ($available === 1) {
                    $message = "Solamente nos queda 1 unidad de {$noun}.";
                } else {
                    $message = "Solamente nos quedan {$available} unidades de {$noun}.";
                }
            }

            $resultsById[$id] = [
                'id' => $id,
                'available_stock' => $available,
                'requested_quantity' => $qty,
                'valid' => $isValid,
                'message' => $message,
            ];
        }

        return response()->json([
            'valid' => $allValid,
            'is_store_open' => $isStoreOpen,
            'items' => $resultsById,
        ]);
    }

    /**
     * Validate stock and persist the order lead before WhatsApp redirection.
     */
    public function store(StoreOrderLeadRequest $request): JsonResponse
    {
        $config = StoreConfig::first();
        if (! ($config?->is_store_open ?? true)) {
            $closedMessage = 'No están disponibles los envíos por WhatsApp en estos momentos, la tienda se encuentra temporalmente cerrada.';

            return response()->json([
                'message' => $closedMessage,
                'errors' => [
                    'store' => [$closedMessage],
                ],
            ], 422);
        }

        $rawItems = $request->input('items', []);
        $verified = $this->orderService->buildVerifiedOrderPayload($rawItems);

        if (isset($verified['error'])) {
            return response()->json([
                'message' => $verified['error'],
                'errors' => [
                    'stock' => [$verified['error']],
                ],
            ], 422);
        }

        $orderLead = OrderLead::create([
            'user_id' => $request->user()?->id,
            'customer_name' => $request->input('customer_name'),
            'customer_phone' => $request->input('customer_phone'),
            'customer_email' => $request->input('customer_email'),
            'customer_dni' => $request->input('customer_dni'),
            'postal_code' => $request->input('postal_code'),
            'address' => $request->input('address'),
            'items' => $verified['items'],
            'total_amount' => $verified['total_amount'],
            'status' => 'PENDING_WHATSAPP',
        ]);

        // Lets the checkout screen tell the truth when SMTP is unavailable.
        $emailSent = false;

        if (!empty($orderLead->customer_email)) {
            try {
                \Illuminate\Support\Facades\Mail::to($orderLead->customer_email)
                    ->send(new \App\Mail\OrderConfirmationMail($orderLead));
                $emailSent = true;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("No se pudo enviar email de confirmación para orden {$orderLead->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'orderId' => $orderLead->id,
            'totalAmount' => (float) $orderLead->total_amount,
            'emailSent' => $emailSent,
        ], 201);
    }
}
