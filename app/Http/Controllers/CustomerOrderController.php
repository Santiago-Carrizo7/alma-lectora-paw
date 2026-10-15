<?php

namespace App\Http\Controllers;

use App\Models\OrderLead;
use App\Models\StoreConfig;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    /**
     * Muestra el historial de compras del usuario autenticado.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $orders = OrderLead::where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        $storeConfig = StoreConfig::first();

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders,
            'whatsappPhone' => $storeConfig?->whatsapp_phone ?? '5493875708557',
        ]);
    }

    /**
     * Descarga el remito / comprobante en PDF de una orden perteneciente al usuario.
     */
    public function remito(OrderLead $order): HttpResponse
    {
        Gate::authorize('view', $order);

        $pdf = Pdf::loadView('pdf.order-remito', compact('order'))
            ->setPaper('a4', 'portrait');

        $shortId = strtoupper(substr($order->id, 0, 8));

        return $pdf->stream("comprobante-orden-{$shortId}.pdf");
    }
}
