<?php

namespace App\Http\Controllers\Admin;

use App\Exports\BooksExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBookRequest;
use App\Http\Requests\Admin\UpdateBookRequest;
use App\Http\Requests\Admin\UpdateBookStockRequest;
use App\Models\Author;
use App\Models\Book;
use App\Models\BookGenre;
use App\Models\Combo;
use App\Support\GenreNormalizer;
use App\Support\HtmlSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminBookController extends Controller
{
    /**
     * Export books catalog to Excel preserving current filters.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = [
            'search' => (string) $request->input('search', ''),
            'genre' => (string) $request->input('genre', ''),
            'stock_status' => (string) $request->input('stock_status', ''),
            'sort' => (string) $request->input('sort', ''),
            'tab' => (string) $request->input('tab', ''),
        ];

        return Excel::download(new BooksExport($filters), 'catalogo-libros-alma-lectora.xlsx');
    }

    /**
     * Display a listing of books with pagination, tabs and search.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => (string) $request->input('search', ''),
            'genre' => (string) $request->input('genre', ''),
            'stock_status' => (string) $request->input('stock_status', ''),
            'sort' => (string) $request->input('sort', ''),
            'tab' => (string) $request->input('tab', 'available'),
        ];

        $query = $filters['tab'] === 'archived'
            ? Book::onlyTrashed()->with('authors')
            : Book::withoutTrashed()->with('authors');

        $query->filter($filters);
        if (empty($filters['sort'])) {
            $query->latest();
        }

        $books = $query
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'available' => Book::withoutTrashed()->count(),
            'archived' => Book::onlyTrashed()->count(),
        ];

        $genres = Book::withTrashed()
            ->whereNotNull('genre')
            ->where('genre', '!=', '')
            ->distinct()
            ->orderBy('genre')
            ->pluck('genre')
            ->values();

        return Inertia::render('Admin/Books/Index', [
            'books' => $books,
            'filters' => $filters,
            'counts' => $counts,
            'genres' => $genres,
        ]);
    }

    /**
     * Show the form for creating a new book.
     */
    public function create(): Response
    {
        $authors = Author::orderBy('name')->get(['id', 'name']);
        $genres = $this->getGenreSuggestions();
        $availableBadges = $this->getBadgeSuggestions();

        return Inertia::render('Admin/Books/Form', [
            'authors' => $authors,
            'genres' => $genres,
            'availableBadges' => $availableBadges,
        ]);
    }

    /**
     * Create a new book and synchronize its authors inside a database transaction.
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
                'genre' => $this->normalizeGenre($validated['genre'] ?? null),
                'synopsis' => HtmlSanitizer::clean($validated['synopsis'] ?? null),
                'cover_url' => $validated['cover_url'] ?? null,
                'badge' => !empty($validated['badge']) ? trim($validated['badge']) : null,
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'published_date' => $validated['published_date'] ?? null,
                'language' => $validated['language'] ?? 'es',
                'additional_images' => array_values(array_filter($validated['additional_images'] ?? [], fn ($u) => is_string($u) && trim($u) !== '')),
            ]);

            if (!empty($validated['authors'])) {
                $this->syncBookAuthors($book, $validated['authors']);
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
        $genres = $this->getGenreSuggestions();
        $availableBadges = $this->getBadgeSuggestions();

        return Inertia::render('Admin/Books/Form', [
            'book' => $book,
            'authors' => $authors,
            'genres' => $genres,
            'availableBadges' => $availableBadges,
        ]);
    }

    protected function getGenreSuggestions(): Collection
    {
        $storedGenres = Schema::hasTable('book_genres')
            ? BookGenre::pluck('name')
            : collect();

        $bookGenres = Book::withoutTrashed()
            ->whereNotNull('genre')
            ->where('genre', '!=', '')
            ->pluck('genre');

        return collect(GenreNormalizer::DEFAULT_GENRES)
            ->merge($storedGenres)
            ->merge($bookGenres)
            ->map(fn ($g) => trim((string) $g))
            ->filter(fn ($g) => $g !== '')
            ->unique(fn ($g) => GenreNormalizer::key($g))
            ->sort()
            ->values();
    }

    /**
     * Resolve a submitted genre against canonical Spanish names (ignoring accents and case).
     */
    protected function normalizeGenre(?string $rawGenre): ?string
    {
        if ($rawGenre === null || trim($rawGenre) === '') {
            return null;
        }

        $storedGenres = Schema::hasTable('book_genres')
            ? BookGenre::pluck('name')
            : collect();

        $existingGenres = $storedGenres->merge(
            Book::withoutTrashed()
                ->whereNotNull('genre')
                ->where('genre', '!=', '')
                ->pluck('genre')
        );

        $canonical = GenreNormalizer::resolveOrCanonical($rawGenre, $existingGenres);

        if ($canonical !== '' && Schema::hasTable('book_genres')) {
            $targetKey = GenreNormalizer::key($canonical);
            $exists = BookGenre::pluck('name')
                ->contains(fn ($g) => GenreNormalizer::key((string) $g) === $targetKey);

            if (! $exists) {
                BookGenre::create(['name' => $canonical]);
            }
        }

        return $canonical !== '' ? $canonical : null;
    }

    /**
     * Synchronize a book's authors matching existing names without accent/case sensitivity.
     *
     * @param  array<int, string>  $authorInputs
     */
    protected function syncBookAuthors(Book $book, array $authorInputs): void
    {
        $allAuthors = Author::all(['id', 'name']);

        $authorIds = collect($authorInputs)->map(function ($authorInput) use ($allAuthors) {
            if (Str::isUuid($authorInput)) {
                return $authorInput;
            }

            $cleanName = preg_replace('/\s+/', ' ', trim((string) $authorInput)) ?? '';
            $targetKey = GenreNormalizer::key($cleanName);

            $existing = $allAuthors->first(
                fn (Author $author) => GenreNormalizer::key($author->name) === $targetKey
            );

            if ($existing) {
                return $existing->id;
            }

            $created = Author::create(['name' => $cleanName]);
            $allAuthors->push($created);

            return $created->id;
        })->unique()->values();

        $book->authors()->sync($authorIds);
    }

    protected function getBadgeSuggestions(): Collection
    {
        return collect(['Destacado', 'Novedad', 'Exclusivo'])
            ->merge(
                Book::withoutTrashed()
                    ->whereNotNull('badge')
                    ->where('badge', '!=', '')
                    ->whereNotIn('badge', ['Bestseller', 'bestseller', 'Más vendido', 'mas vendido', 'Agotado', 'Últimas unidades'])
                    ->pluck('badge')
            )
            ->unique()
            ->sort()
            ->values();
    }

    /**
     * Update the specified book and synchronize its authors inside a database transaction.
     */
    public function update(UpdateBookRequest $request, Book $book): RedirectResponse
    {
        $previousImages = array_filter(array_merge(
            [$book->cover_url],
            is_array($book->additional_images) ? $book->additional_images : []
        ));

        DB::transaction(function () use ($request, $book) {
            $validated = $request->validated();

            $book->update([
                'isbn' => $validated['isbn'],
                'title' => $validated['title'],
                'original_title' => $validated['original_title'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'genre' => $this->normalizeGenre($validated['genre'] ?? null),
                'synopsis' => HtmlSanitizer::clean($validated['synopsis'] ?? null),
                'cover_url' => $validated['cover_url'] ?? null,
                'badge' => !empty($validated['badge']) ? trim($validated['badge']) : null,
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'published_date' => $validated['published_date'] ?? null,
                'language' => $validated['language'] ?? 'es',
                'additional_images' => array_values(array_filter($validated['additional_images'] ?? [], fn ($u) => is_string($u) && trim($u) !== '')),
            ]);

            if (array_key_exists('authors', $validated)) {
                $this->syncBookAuthors($book, $validated['authors']);
            }
        });

        $book->refresh();
        $currentImages = array_filter(array_merge(
            [$book->cover_url],
            is_array($book->additional_images) ? $book->additional_images : []
        ));
        foreach (array_diff($previousImages, $currentImages) as $removedUrl) {
            AdminMediaController::deleteLocalUploadIfUnused($removedUrl);
        }

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
     * Restore the specified soft-deleted book from the trash.
     */
    public function restore(string $id): RedirectResponse
    {
        $book = Book::onlyTrashed()->findOrFail($id);
        $book->restore();

        return back()->with('success', 'Libro restaurado con éxito.');
    }

    /**
     * Remove the specified book permanently from storage, guarding combo integrity.
     */
    public function forceDestroy(string $id): RedirectResponse
    {
        $book = Book::withTrashed()->findOrFail($id);

        $blockingCombos = Combo::withTrashed()
            ->whereHas('books', fn ($q) => $q->where('book_id', $book->id))
            ->pluck('title');

        if ($blockingCombos->isNotEmpty()) {
            return back()->with(
                'error',
                "No se puede eliminar definitivamente el libro \"{$book->title}\" porque forma parte de los combos: ".$blockingCombos->implode(', ').'.'
            );
        }

        $images = array_filter(array_merge(
            [$book->cover_url],
            is_array($book->additional_images) ? $book->additional_images : []
        ));

        $book->forceDelete();

        foreach ($images as $url) {
            AdminMediaController::deleteLocalUploadIfUnused($url);
        }

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
