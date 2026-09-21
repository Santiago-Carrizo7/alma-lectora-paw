<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
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

        $order->update(['status' => $validated['status']]);

        $actionText = $validated['status'] === 'CONFIRMED' ? 'confirmado' : ($validated['status'] === 'CANCELLED' ? 'cancelado' : 'actualizado');

        return back()->with('success', "Pedido {$actionText} correctamente.");
    }

    /**
     * Permanently remove an order lead from the system.
     */
    public function destroy(OrderLead $order): RedirectResponse
    {
        $order->delete();

        return back()->with('success', 'Pedido eliminado correctamente.');
    }
}
