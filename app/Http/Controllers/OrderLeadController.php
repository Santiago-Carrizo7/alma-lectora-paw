<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderLeadRequest;
use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;
use App\Models\StoreConfig;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderLeadController extends Controller
{
    /**
     * Show the checkout page.
     */
    public function create(): Response
    {
        return Inertia::render('Checkout/Index');
    }

    /**
     * Validate stock and persist the order lead before WhatsApp redirection.
     */
    public function store(StoreOrderLeadRequest $request): JsonResponse
    {
        $config = StoreConfig::first();
        if (! ($config?->is_store_open ?? true)) {
            return response()->json([
                'message' => 'La tienda se encuentra temporalmente cerrada para nuevos pedidos.',
                'errors' => [
                    'store' => ['La tienda se encuentra temporalmente cerrada para nuevos pedidos.'],
                ],
            ], 422);
        }

        $items = $request->input('items', []);

        foreach ($items as $item) {
            $product = match ($item['type']) {
                'BOOK' => Book::active()->find($item['id']),
                'ACCESSORY' => Accessory::active()->find($item['id']),
                'COMBO' => Combo::active()->find($item['id']),
                default => null,
            };

            if (! $product || $item['quantity'] > $product->stock) {
                $available = $product ? $product->stock : 0;
                $message = "Stock insuficiente para {$item['title']}. Disponibles: {$available}";

                return response()->json([
                    'message' => $message,
                    'errors' => [
                        'stock' => [$message],
                    ],
                ], 422);
            }
        }

        $orderLead = OrderLead::create([
            'customer_name' => $request->input('customer_name'),
            'customer_phone' => $request->input('customer_phone'),
            'customer_email' => $request->input('customer_email'),
            'customer_dni' => $request->input('customer_dni'),
            'postal_code' => $request->input('postal_code'),
            'address' => $request->input('address'),
            'items' => $items,
            'total_amount' => $request->input('total_amount'),
            'status' => 'PENDING_WHATSAPP',
        ]);

        return response()->json([
            'success' => true,
            'orderId' => $orderLead->id,
        ], 201);
    }
}
