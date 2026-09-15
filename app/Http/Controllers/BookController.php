<?php

namespace App\Http\Controllers;

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
        $filters = $request->only(['search', 'genre', 'badge']);

        $books = Book::with('authors')
            ->active()
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->get();

        $genres = Book::active()
            ->whereNotNull('genre')
            ->where('genre', '!=', '')
            ->distinct()
            ->pluck('genre')
            ->sort()
            ->values();

        return Inertia::render('Catalog/BooksPage', [
            'books' => $books,
            'filters' => $filters,
            'genres' => $genres,
        ]);
    }

    /**
     * Display the specified book detail.
     */
    public function show(Book $book): Response
    {
        $book->load('authors');

        return Inertia::render('Catalog/BookDetailPage', [
            'book' => $book,
        ]);
    }
}
