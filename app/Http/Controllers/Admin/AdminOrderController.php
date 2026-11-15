<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderLead;
use App\Services\OrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}
    /**
     * Generate a PDF dispatch/packing slip (remito) for the given order.
     */
    public function remito(OrderLead $order): HttpResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view', $order);

        $pdf = Pdf::loadView('pdf.order-remito', compact('order'))
            ->setPaper('a4', 'portrait');

        $shortId = strtoupper(substr($order->id, 0, 8));

        return $pdf->stream("remito-orden-{$shortId}.pdf");
    }
    /**
     * Display a listing of order leads categorized by status tabs.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'PENDING_WHATSAPP');
        $search = $request->input('search');

        $query = OrderLead::query();

        if ($tab !== 'ALL') {
            $query->where('status', $tab);
        }

        if ($search) {
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('customer_name', $like, "%{$search}%")
                  ->orWhere('customer_phone', $like, "%{$search}%")
                  ->orWhere('customer_email', $like, "%{$search}%")
                  ->orWhere('customer_dni', $like, "%{$search}%");
            });
        }

        $orders = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'PENDING_WHATSAPP' => OrderLead::where('status', 'PENDING_WHATSAPP')->count(),
            'CONFIRMED' => OrderLead::where('status', 'CONFIRMED')->count(),
            'CANCELLED' => OrderLead::where('status', 'CANCELLED')->count(),
            'ALL' => OrderLead::count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'tab' => $tab,
                'search' => $search ?? '',
            ],
            'counts' => $counts,
        ]);
    }

    /**
     * Update status of an order lead (e.g. CONFIRMED, CANCELLED).
     */
    public function updateStatus(Request $request, OrderLead $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING_WHATSAPP,CONFIRMED,CANCELLED',
        ]);

        $newStatus = $validated['status'];

        $missingRestore = [];
        $errorKey = 'stock';

        $errorMessage = DB::transaction(function () use ($order, $newStatus, &$missingRestore, &$errorKey): ?string {
            $lockedOrder = OrderLead::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $previousStatus = $lockedOrder->status;

            // Idempotent no-op if the order already transitioned to the requested status.
            if ($previousStatus === $newStatus) {
                return null;
            }

            $allowedTransitions = [
                'PENDING_WHATSAPP' => ['CONFIRMED', 'CANCELLED'],
                'CONFIRMED' => ['CANCELLED', 'PENDING_WHATSAPP'],
                'CANCELLED' => ['PENDING_WHATSAPP'],
            ];

            if (! in_array($newStatus, $allowedTransitions[$previousStatus] ?? [], true)) {
                $errorKey = 'status';
                return 'Transición de estado no permitida: reactivá el pedido a pendiente antes de confirmarlo.';
            }

            if ($previousStatus !== 'CONFIRMED' && $newStatus === 'CONFIRMED') {
                $stockError = $this->orderService->confirmOrderStock($lockedOrder);
                if ($stockError !== null) {
                    return $stockError;
                }
            } elseif ($previousStatus === 'CONFIRMED' && $newStatus !== 'CONFIRMED') {
                $missingRestore = $this->orderService->restoreOrderStock($lockedOrder);
            }

            $lockedOrder->update(['status' => $newStatus]);

            return null;
        });

        if ($errorMessage !== null) {
            throw ValidationException::withMessages([
                $errorKey => $errorMessage,
            ]);
        }

        $actionText = $newStatus === 'CONFIRMED' ? 'confirmado' : ($newStatus === 'CANCELLED' ? 'cancelado' : 'actualizado');
        $response = back()->with('success', "Pedido {$actionText} correctamente.");

        if (! empty($missingRestore)) {
            $response->with('error', 'No se pudo reponer stock de los siguientes productos eliminados definitivamente: '.implode(', ', $missingRestore).'.');
        }

        return $response;
    }

    /**
     * Permanently remove an order lead from the system (confirmed orders must be cancelled first).
     */
    public function destroy(OrderLead $order): RedirectResponse
    {
        if ($order->status === 'CONFIRMED') {
            return back()->with('error', 'No se puede eliminar un pedido confirmado directamente. Cancelalo primero para reponer el stock en el inventario.');
        }

        $order->delete();

        return back()->with('success', 'Pedido eliminado correctamente.');
    }
}
