<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\OrderLead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $canViewDashboard = $user && ($user->hasRole('super-admin') || $user->can('ver dashboard'));

        if (! $canViewDashboard) {
            return Inertia::render('Admin/Dashboard', [
                'metrics' => [
                    'pending_orders' => 0,
                    'month_revenue' => 0,
                    'out_of_stock_books' => 0,
                    'month_confirmed_orders' => 0,
                    'period_total_orders' => 0,
                    'total_orders' => 0,
                    'total_confirmed_revenue' => 0,
                ],
                'recentOrders' => [],
            ]);
        }

        // Exact 30 calendar days including today (H-45 coherence)
        $last30Days = now()->subDays(29)->startOfDay();

        $metrics = [
            // 1. Pedidos pendientes de WhatsApp que requieren atención
            'pending_orders' => OrderLead::where('status', 'PENDING_WHATSAPP')->count(),

            // 2. Ventas confirmadas en los últimos 30 días
            'month_revenue' => (float) OrderLead::where('status', 'CONFIRMED')
                ->where('created_at', '>=', $last30Days)
                ->sum('total_amount'),

            // 3. Libros activos sin stock (agotados estrictamente stock = 0)
            'out_of_stock_books' => Book::active()->where('stock', 0)->count(),

            // 4. Pedidos confirmados en los últimos 30 días
            'month_confirmed_orders' => OrderLead::where('status', 'CONFIRMED')
                ->where('created_at', '>=', $last30Days)
                ->count(),

            // 5. Total de pedidos en los mismos 30 días (denominador coherente)
            'period_total_orders' => OrderLead::where('created_at', '>=', $last30Days)->count(),

            // Contexto secundario
            'total_orders' => OrderLead::count(),
            'total_confirmed_revenue' => (float) OrderLead::where('status', 'CONFIRMED')->sum('total_amount'),
        ];

        // Pedidos más recientes para gestión operativa inmediata
        $recentOrders = OrderLead::latest()
            ->take(8)
            ->get(['id', 'customer_name', 'customer_phone', 'customer_email', 'total_amount', 'status', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recentOrders' => $recentOrders,
        ]);
    }
}
