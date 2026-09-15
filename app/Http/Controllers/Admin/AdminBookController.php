<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBookRequest;
use App\Http\Requests\Admin\UpdateBookRequest;
use App\Http\Requests\Admin\UpdateBookStockRequest;
use App\Models\Author;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminBookController extends Controller
{
    /**
     * Display a listing of books with pagination, tabs and search.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'available');

        $query = $tab === 'archived'
            ? Book::onlyTrashed()->with('authors')
            : Book::withoutTrashed()->with('authors');

        $books = $query
            ->filter($request->only('search'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'available' => Book::withoutTrashed()->count(),
            'archived' => Book::onlyTrashed()->count(),
        ];

        return Inertia::render('Admin/Books/Index', [
            'books' => $books,
            'filters' => [
                'search' => $request->input('search', ''),
                'tab' => $tab,
            ],
            'counts' => $counts,
        ]);
    }

    /**
     * Show the form for creating a new book.
     */
    public function create(): Response
    {
        $authors = Author::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Books/Form', [
            'authors' => $authors,
        ]);
    }

    /**
     * Store a newly created book in storage.
     */
    public function store(StoreBookRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $validated = $request->validated();

            $book = Book::create([
                'isbn' => $validated['isbn'],
                'title' => $validated['title'],
                'original_title' => $validated['original_title'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'genre' => $validated['genre'] ?? null,
                'synopsis' => $validated['synopsis'] ?? null,
                'cover_url' => $validated['cover_url'] ?? null,
                'badge' => $validated['badge'] ?? null,
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'published_date' => $validated['published_date'] ?? null,
                'language' => $validated['language'] ?? 'es',
                'additional_images' => $validated['additional_images'] ?? [],
            ]);

            if (!empty($validated['authors'])) {
                $authorIds = collect($validated['authors'])->map(function ($authorInput) {
                    if (Str::isUuid($authorInput)) {
                        return $authorInput;
                    }
                    return Author::firstOrCreate(['name' => trim($authorInput)])->id;
                });

                $book->authors()->sync($authorIds);
            }
        });

        return redirect()->route('admin.books.index')->with('success', 'Libro registrado con éxito.');
    }

    /**
     * Show the form for editing the specified book.
     */
    public function edit(Book $book): Response
    {
        $book->load('authors');
        $authors = Author::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Books/Form', [
            'book' => $book,
            'authors' => $authors,
        ]);
    }

    /**
     * Update the specified book in storage.
     */
    public function update(UpdateBookRequest $request, Book $book): RedirectResponse
    {
        DB::transaction(function () use ($request, $book) {
            $validated = $request->validated();

            $book->update([
                'isbn' => $validated['isbn'],
                'title' => $validated['title'],
                'original_title' => $validated['original_title'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'genre' => $validated['genre'] ?? null,
                'synopsis' => $validated['synopsis'] ?? null,
                'cover_url' => $validated['cover_url'] ?? null,
                'badge' => $validated['badge'] ?? null,
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'published_date' => $validated['published_date'] ?? null,
                'language' => $validated['language'] ?? 'es',
                'additional_images' => $validated['additional_images'] ?? [],
            ]);

            if (array_key_exists('authors', $validated)) {
                $authorIds = collect($validated['authors'])->map(function ($authorInput) {
                    if (Str::isUuid($authorInput)) {
                        return $authorInput;
                    }
                    return Author::firstOrCreate(['name' => trim($authorInput)])->id;
                });

                $book->authors()->sync($authorIds);
            }
        });

        return redirect()->route('admin.books.index')->with('success', 'Libro actualizado con éxito.');
    }

    /**
     * Toggle the active visibility status of the book.
     */
    public function toggleActive(Book $book): RedirectResponse
    {
        $book->update(['is_active' => !$book->is_active]);

        return back()->with('success', 'Visibilidad del libro actualizada.');
    }

    /**
     * Soft delete (archive) the specified book.
     */
    public function destroy(Book $book): RedirectResponse
    {
        $book->delete();

        return back()->with('success', 'Libro archivado en la papelera.');
    }

    /**
     * Restore the specified soft-deleted book.
     */
    public function restore(string $id): RedirectResponse
    {
        $book = Book::onlyTrashed()->findOrFail($id);
        $book->restore();

        return back()->with('success', 'Libro restaurado con éxito.');
    }

    /**
     * Remove the specified book permanently from storage.
     */
    public function forceDestroy(string $id): RedirectResponse
    {
        $book = Book::withTrashed()->findOrFail($id);
        $book->forceDelete();

        return back()->with('success', 'Libro eliminado definitivamente.');
    }

    /**
     * Quickly update stock for the specified book.
     */
    public function updateStock(UpdateBookStockRequest $request, Book $book): RedirectResponse
    {
        $book->update(['stock' => $request->validated()['stock']]);

        return back()->with('success', 'Stock actualizado con éxito.');
    }
}
