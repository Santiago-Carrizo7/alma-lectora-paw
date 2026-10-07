<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $metrics = [
            'total_books' => Book::count(),
            'active_books' => Book::active()->count(),
            'low_stock_books' => Book::active()->where('stock', '<=', 3)->count(),
            'total_accessories' => Accessory::count(),
            'total_combos' => Combo::count(),
            'total_orders' => OrderLead::count(),
            'pending_orders' => OrderLead::where('status', 'PENDING_WHATSAPP')->count(),
            'confirmed_orders' => OrderLead::where('status', 'CONFIRMED')->count(),
            'confirmed_revenue' => (float) OrderLead::where('status', 'CONFIRMED')->sum('total_amount'),
        ];

        // Grouping for Recharts: Books per Genre
        $booksByGenre = Book::select('genre', DB::raw('count(*) as count'))
            ->whereNotNull('genre')
            ->where('genre', '!=', '')
            ->groupBy('genre')
            ->orderByDesc('count')
            ->take(6)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->genre,
                'cantidad' => (int) $item->count,
            ]);

        // Grouping for Recharts: Orders by Status
        $ordersByStatus = OrderLead::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $label = match ($item->status) {
                    'PENDING_WHATSAPP' => 'Pendiente WA',
                    'CONFIRMED' => 'Confirmado',
                    'CANCELLED' => 'Cancelado',
                    default => $item->status,
                };

                return [
                    'status' => $item->status,
                    'label' => $label,
                    'cantidad' => (int) $item->count,
                ];
            });

        // 5 most recent orders for quick view
        $recentOrders = OrderLead::latest()
            ->take(5)
            ->get(['id', 'customer_name', 'customer_phone', 'total_amount', 'status', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'booksByGenre' => $booksByGenre,
            'ordersByStatus' => $ordersByStatus,
            'recentOrders' => $recentOrders,
        ]);
    }
}
