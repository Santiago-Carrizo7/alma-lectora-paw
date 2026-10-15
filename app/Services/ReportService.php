<?php

namespace App\Services;

use App\Models\Book;
use App\Models\OrderLead;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * Retrieve global commercial KPIs and conversion metrics.
     */
    public function getSummaryKpis(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = OrderLead::query();
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $allOrders = $query->get();
        $totalOrders = $allOrders->count();

        $confirmedOrders = $allOrders->where('status', 'CONFIRMED');
        $confirmedCount = $confirmedOrders->count();
        $pendingCount = $allOrders->where('status', 'PENDING_WHATSAPP')->count();
        $cancelledCount = $allOrders->where('status', 'CANCELLED')->count();

        $totalRevenue = (float) $confirmedOrders->sum('total_amount');
        $averageTicket = $confirmedCount > 0 ? round($totalRevenue / $confirmedCount, 2) : 0.0;
        $conversionRate = $totalOrders > 0 ? round(($confirmedCount / $totalOrders) * 100, 1) : 0.0;

        // Total book units sold in confirmed orders
        $totalUnitsSold = 0;
        foreach ($confirmedOrders as $order) {
            $items = is_array($order->items) ? $order->items : (json_decode($order->items, true) ?? []);
            foreach ($items as $item) {
                if (($item['type'] ?? '') === 'BOOK') {
                    $totalUnitsSold += (int) ($item['quantity'] ?? 1);
                }
            }
        }

        $totalBooksInCatalog = Book::withoutTrashed()->count();
        $criticalStockCount = Book::withoutTrashed()->where('stock', '<=', 3)->count();

        return [
            'total_orders' => $totalOrders,
            'confirmed_orders' => $confirmedCount,
            'pending_orders' => $pendingCount,
            'cancelled_orders' => $cancelledCount,
            'total_revenue' => $totalRevenue,
            'average_ticket' => $averageTicket,
            'conversion_rate' => $conversionRate,
            'units_sold' => $totalUnitsSold,
            'catalog_size' => $totalBooksInCatalog,
            'critical_stock_count' => $criticalStockCount,
        ];
    }

    /**
     * Top purchasing clients by confirmed order volume and total revenue.
     */
    public function getTopCustomers(int $limit = 5, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $query = OrderLead::where('status', 'CONFIRMED')->with('user');
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $orders = $query->get();
        $customers = [];

        foreach ($orders as $order) {
            $key = $order->user_id
                ? 'u_' . $order->user_id
                : 'e_' . strtolower(trim($order->customer_email ?: $order->customer_dni ?: $order->customer_name));

            if (!isset($customers[$key])) {
                $customers[$key] = [
                    'name' => $order->user?->name ?? $order->customer_name,
                    'email' => $order->user?->email ?? $order->customer_email,
                    'dni' => $order->user?->dni ?? $order->customer_dni ?? 'S/D',
                    'phone' => $order->user?->phone ?? $order->customer_phone ?? 'S/D',
                    'is_registered' => (bool) $order->user_id,
                    'orders_count' => 0,
                    'total_spent' => 0.0,
                    'last_order_at' => null,
                ];
            }

            $customers[$key]['orders_count'] += 1;
            $customers[$key]['total_spent'] += (float) $order->total_amount;

            $orderDate = $order->created_at?->format('Y-m-d H:i') ?? now()->format('Y-m-d H:i');
            if (!$customers[$key]['last_order_at'] || $orderDate > $customers[$key]['last_order_at']) {
                $customers[$key]['last_order_at'] = $orderDate;
            }
        }

        return collect(array_values($customers))
            ->sortByDesc('total_spent')
            ->values()
            ->take($limit);
    }

    /**
     * Best-selling books in confirmed orders.
     */
    public function getBestSellingBooks(int $limit = 5, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $sales = $this->aggregateBookSales($startDate, $endDate);

        return $sales->filter(fn ($book) => $book['units_sold'] > 0)
            ->sortByDesc('units_sold')
            ->values()
            ->take($limit);
    }

    /**
     * Least-selling books (books with at least 1 sale, ordered ascending).
     */
    public function getLeastSellingBooks(int $limit = 5, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $sales = $this->aggregateBookSales($startDate, $endDate);

        return $sales->filter(fn ($book) => $book['units_sold'] > 0)
            ->sortBy('units_sold')
            ->values()
            ->take($limit);
    }

    /**
     * Books in active catalog with zero sales recorded.
     */
    public function getBooksWithNoSales(?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $sales = $this->aggregateBookSales($startDate, $endDate);

        return $sales->filter(fn ($book) => $book['units_sold'] === 0)
            ->sortByDesc('stock')
            ->values();
    }

    /**
     * Critical stock alert list (stock <= threshold).
     */
    public function getCriticalStockBooks(int $threshold = 3): Collection
    {
        return Book::withoutTrashed()
            ->with('authors')
            ->where('stock', '<=', $threshold)
            ->orderBy('stock', 'asc')
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'isbn' => $book->isbn,
                    'authors' => $book->authors->pluck('name')->implode(', ') ?: 'Sin autor',
                    'stock' => (int) $book->stock,
                    'price' => (float) $book->price,
                    'status' => $book->stock === 0 ? 'Agotado' : 'Stock Crítico',
                ];
            });
    }

    /**
     * Aggregate full dataset for dashboard display and reporting.
     */
    public function getExecutiveReportData(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return [
            'kpis' => $this->getSummaryKpis($startDate, $endDate),
            'top_customers' => $this->getTopCustomers(5, $startDate, $endDate)->toArray(),
            'best_selling_books' => $this->getBestSellingBooks(5, $startDate, $endDate)->toArray(),
            'least_selling_books' => $this->getLeastSellingBooks(5, $startDate, $endDate)->toArray(),
            'no_sales_books' => $this->getBooksWithNoSales($startDate, $endDate)->take(10)->toArray(),
            'critical_stock' => $this->getCriticalStockBooks(3)->toArray(),
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'generated_by' => auth()->user()?->name ?? 'Sistema Administrativo',
        ];
    }

    /**
     * Internal helper to aggregate book sales from confirmed orders across the catalog.
     */
    protected function aggregateBookSales(?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $query = OrderLead::where('status', 'CONFIRMED');
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $orders = $query->get();
        $salesMap = [];

        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : (json_decode($order->items, true) ?? []);
            foreach ($items as $item) {
                if (($item['type'] ?? '') === 'BOOK' && !empty($item['id'])) {
                    $id = $item['id'];
                    $qty = (int) ($item['quantity'] ?? 1);
                    $price = (float) ($item['unit_price'] ?? $item['price'] ?? 0);

                    if (!isset($salesMap[$id])) {
                        $salesMap[$id] = [
                            'units_sold' => 0,
                            'total_revenue' => 0.0,
                            'title' => $item['title'] ?? 'Libro sin título',
                        ];
                    }

                    $salesMap[$id]['units_sold'] += $qty;
                    $salesMap[$id]['total_revenue'] += ($qty * $price);
                }
            }
        }

        $catalogBooks = Book::withoutTrashed()->with('authors')->get();

        return $catalogBooks->map(function ($book) use ($salesMap) {
            $bookSales = $salesMap[$book->id] ?? null;
            $unitsSold = $bookSales ? $bookSales['units_sold'] : 0;
            $totalRevenue = $bookSales ? $bookSales['total_revenue'] : 0.0;

            return [
                'id' => $book->id,
                'isbn' => $book->isbn,
                'title' => $book->title,
                'authors' => $book->authors->pluck('name')->implode(', ') ?: 'Sin autor',
                'genre' => $book->genre ?: 'General',
                'price' => (float) $book->price,
                'stock' => (int) $book->stock,
                'units_sold' => $unitsSold,
                'total_revenue' => $totalRevenue,
            ];
        });
    }
}
