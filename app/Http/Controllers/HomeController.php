<?php

namespace App\Http\Controllers;

use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $like = Book::query()->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $bestSellers = Book::getDynamicBestSellers(12);

        if ($bestSellers->isEmpty()) {
            $bestSellers = Book::active()
                ->with('authors')
                ->orderByDesc('stock')
                ->take(10)
                ->get();
        }

        $featuredBooks = Book::active()
            ->with('authors')
            ->where('badge', $like, '%destacado%')
            ->take(10)
            ->get();

        $novelties = Book::active()
            ->with('authors')
            ->where('badge', $like, '%novedad%')
            ->take(10)
            ->get();

        if ($novelties->isEmpty()) {
            $novelties = Book::active()
                ->with('authors')
                ->latest()
                ->take(10)
                ->get();
        }

        $combos = Combo::active()
            ->with(['books.book.authors', 'accessories.accessory'])
            ->take(8)
            ->get();

        $featuredAccessories = Accessory::active()
            ->where('stock', '>', 0)
            ->take(8)
            ->get();

        return Inertia::render('Catalog/HomePage', [
            'bestSellers' => $bestSellers,
            'featuredBooks' => $featuredBooks,
            'novelties' => $novelties,
            'combos' => $combos,
            'featuredAccessories' => $featuredAccessories,
        ]);
    }
}
