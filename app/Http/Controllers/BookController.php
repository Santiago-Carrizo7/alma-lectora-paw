<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display a listing of books in the catalog.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'genre', 'badge', 'author']);
        $bestSellerIds = Book::getTopSellingBookIds(15);

        $books = Book::with('authors')
            ->active()
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->get();

        $badgeFilter = mb_strtolower(trim((string) $request->input('badge', '')));
        if ($badgeFilter === 'más vendido' || $badgeFilter === 'mas vendido') {
            $books = $books->sortBy(function (Book $book) use ($bestSellerIds) {
                $rank = array_search($book->id, $bestSellerIds, true);

                return $rank !== false ? $rank : 9999;
            })->values();

            foreach ($books as $book) {
                $book->setAttribute('badge', 'Más vendido');
            }
        }

        $genres = Book::active()
            ->whereNotNull('genre')
            ->where('genre', '!=', '')
            ->distinct()
            ->pluck('genre')
            ->sort()
            ->values();

        $authors = Author::whereHas('books', fn ($q) => $q->active())
            ->orderBy('name')
            ->pluck('name')
            ->unique()
            ->values();

        return Inertia::render('Catalog/BooksPage', [
            'books' => $books,
            'filters' => $filters,
            'genres' => $genres,
            'authors' => $authors,
            'bestSellerIds' => $bestSellerIds,
        ]);
    }

    /**
     * Display the specified book detail.
     */
    public function show(Book $book): Response
    {
        abort_if(! $book->is_active && ! auth()->user()?->isAdmin(), 404);

        $book->load('authors');

        return Inertia::render('Catalog/BookDetailPage', [
            'book' => $book,
        ]);
    }
}
