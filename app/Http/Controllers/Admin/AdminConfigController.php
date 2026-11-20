<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessoryCategory;
use App\Models\Book;
use App\Models\BookGenre;
use App\Models\StoreConfig;
use App\Support\GenreNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminConfigController extends Controller
{
    /**
     * Display the administration configuration panel.
     */
    public function index(): Response
    {
        $config = StoreConfig::firstOrCreate([], [
            'whatsapp_phone' => '5493875708557',
            'instagram_url' => 'https://www.instagram.com/alma.lectora.al/?hl=es-la',
            'is_store_open' => true,
        ]);

        $categories = AccessoryCategory::orderBy('order')->get();

        $bookGenres = Book::whereNotNull('genre')
            ->where('genre', '!=', '')
            ->distinct()
            ->pluck('genre');

        $storedGenres = Schema::hasTable('book_genres')
            ? BookGenre::pluck('name')
            : collect();

        $genres = $storedGenres
            ->merge($bookGenres)
            ->map(fn ($g) => trim((string) $g))
            ->filter(fn ($g) => $g !== '')
            ->unique(fn ($g) => GenreNormalizer::key($g))
            ->sort()
            ->values();

        return Inertia::render('Admin/Config/Index', [
            'config' => $config,
            'categories' => $categories,
            'genres' => $genres,
        ]);
    }

    /**
     * Update general store configuration.
     */
    public function updateStoreConfig(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'whatsapp_phone' => 'required|string|max:50',
            'instagram_url' => 'nullable|string|max:255',
            'is_store_open' => 'required|boolean',
        ]);

        $config = StoreConfig::first();
        if ($config) {
            $config->update($validated);
        } else {
            StoreConfig::create($validated);
        }

        return back()->with('success', 'Configuración general guardada exitosamente.');
    }

    /**
     * Create a new accessory category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'emoji' => 'nullable|string|max:10',
        ]);

        $slug = strtoupper(Str::slug($validated['label'], '_'));

        if ($slug === '') {
            throw ValidationException::withMessages([
                'label' => 'Indicá un nombre de categoría válido (con letras o números).',
            ]);
        }

        // The slug ignores case, accents and spacing, so it identifies duplicates
        // before the unique index on `slug` turns them into a 500 error.
        $alreadyExists = AccessoryCategory::query()
            ->get(['slug', 'label'])
            ->contains(fn (AccessoryCategory $category) => strtoupper((string) $category->slug) === $slug
                || strtoupper(Str::slug((string) $category->label, '_')) === $slug);

        if ($alreadyExists) {
            throw ValidationException::withMessages([
                'label' => 'Ya existe una categoría con ese nombre.',
            ]);
        }

        $maxOrder = AccessoryCategory::max('order') ?? 0;

        AccessoryCategory::create([
            'slug' => $slug,
            'label' => trim($validated['label']),
            'emoji' => !empty($validated['emoji']) ? trim($validated['emoji']) : null,
            'order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return back()->with('success', 'Categoría de accesorios creada exitosamente.');
    }

    /**
     * Delete an accessory category.
     */
    public function destroyCategory(AccessoryCategory $category): RedirectResponse
    {
        if ($category->accessories()->exists()) {
            return back()->with('error', 'No se puede eliminar la categoría porque tiene accesorios asociados.');
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada.');
    }

    /**
     * Create a new literary genre for book classification.
     */
    public function storeGenre(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $name = trim($validated['name']);
        if ($name === '') {
            throw ValidationException::withMessages([
                'name' => 'El nombre del género no puede estar vacío.',
            ]);
        }

        if (! Schema::hasTable('book_genres')) {
            return back()->with('error', 'Faltan ejecutar migraciones pendientes para registrar géneros.');
        }

        $existingGenres = BookGenre::pluck('name')->merge(
            Book::withTrashed()
                ->whereNotNull('genre')
                ->where('genre', '!=', '')
                ->pluck('genre')
        );

        $canonical = GenreNormalizer::resolveOrCanonical($name, $existingGenres);
        $targetKey = GenreNormalizer::key($canonical);

        $exists = $existingGenres->contains(
            fn ($g) => GenreNormalizer::key((string) $g) === $targetKey
        );

        if ($exists) {
            throw ValidationException::withMessages([
                'name' => "El género \"{$canonical}\" ya se encuentra registrado.",
            ]);
        }

        BookGenre::create(['name' => $canonical]);

        return back()->with('success', "Género literario \"{$canonical}\" creado exitosamente.");
    }

    /**
     * Update a genre name across persisted genres and all matching books.
     */
    public function updateGenre(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'old_name' => 'required|string|max:100',
            'new_name' => 'required|string|max:100',
        ]);

        $oldName = trim($validated['old_name']);
        $newName = trim($validated['new_name']);

        if ($newName === '') {
            throw ValidationException::withMessages([
                'new_name' => 'El nuevo nombre del género no puede estar vacío.',
            ]);
        }

        $oldKey = GenreNormalizer::key($oldName);
        $canonicalNew = GenreNormalizer::canonicalCase($newName);
        $newKey = GenreNormalizer::key($canonicalNew);
        $hasBookGenreTable = Schema::hasTable('book_genres');

        $matchingGenreIds = $hasBookGenreTable
            ? BookGenre::all(['id', 'name'])
                ->filter(fn (BookGenre $g) => GenreNormalizer::key($g->name) === $oldKey)
                ->pluck('id')
            : collect();

        $matchingBookIds = Book::withTrashed()
            ->whereNotNull('genre')
            ->get(['id', 'genre'])
            ->filter(fn (Book $b) => GenreNormalizer::key((string) $b->genre) === $oldKey)
            ->pluck('id');

        if ($matchingGenreIds->isEmpty() && $matchingBookIds->isEmpty()) {
            throw ValidationException::withMessages([
                'old_name' => "No existe ningún género registrado con el nombre \"{$oldName}\".",
            ]);
        }

        if ($oldName === $canonicalNew) {
            throw ValidationException::withMessages([
                'new_name' => 'El nuevo nombre debe ser diferente al actual.',
            ]);
        }

        if ($newKey !== $oldKey) {
            $collision = ($hasBookGenreTable ? BookGenre::pluck('name') : collect())
                ->merge(Book::withTrashed()->whereNotNull('genre')->pluck('genre'))
                ->contains(fn ($g) => GenreNormalizer::key((string) $g) === $newKey);

            if ($collision) {
                throw ValidationException::withMessages([
                    'new_name' => "Ya existe un género equivalente a \"{$canonicalNew}\".",
                ]);
            }
        }

        DB::transaction(function () use ($matchingBookIds, $matchingGenreIds, $canonicalNew, $newKey, $hasBookGenreTable) {
            if ($matchingBookIds->isNotEmpty()) {
                Book::withTrashed()->whereIn('id', $matchingBookIds)->update(['genre' => $canonicalNew]);
            }

            if ($hasBookGenreTable) {
                if ($matchingGenreIds->isNotEmpty()) {
                    BookGenre::whereIn('id', $matchingGenreIds)->delete();
                }

                $existsNew = BookGenre::pluck('name')
                    ->contains(fn ($g) => GenreNormalizer::key((string) $g) === $newKey);

                if (! $existsNew) {
                    BookGenre::create(['name' => $canonicalNew]);
                }
            }
        });

        return back()->with('success', 'Género literario actualizado correctamente.');
    }

    /**
     * Delete a genre from persisted genres and unlink it from all books.
     */
    public function destroyGenre(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $name = trim($validated['name']);
        $targetKey = GenreNormalizer::key($name);
        $hasBookGenreTable = Schema::hasTable('book_genres');

        $matchingGenreIds = $hasBookGenreTable
            ? BookGenre::all(['id', 'name'])
                ->filter(fn (BookGenre $g) => GenreNormalizer::key($g->name) === $targetKey)
                ->pluck('id')
            : collect();

        $matchingBookIds = Book::withTrashed()
            ->whereNotNull('genre')
            ->get(['id', 'genre'])
            ->filter(fn (Book $b) => GenreNormalizer::key((string) $b->genre) === $targetKey)
            ->pluck('id');

        if ($matchingGenreIds->isEmpty() && $matchingBookIds->isEmpty()) {
            throw ValidationException::withMessages([
                'name' => "No existe ningún género registrado con el nombre \"{$name}\".",
            ]);
        }

        DB::transaction(function () use ($matchingBookIds, $matchingGenreIds, $hasBookGenreTable) {
            if ($matchingBookIds->isNotEmpty()) {
                Book::withTrashed()->whereIn('id', $matchingBookIds)->update(['genre' => null]);
            }

            if ($hasBookGenreTable && $matchingGenreIds->isNotEmpty()) {
                BookGenre::whereIn('id', $matchingGenreIds)->delete();
            }
        });

        return back()->with('success', 'Género eliminado y desvinculado de los libros.');
    }
}
