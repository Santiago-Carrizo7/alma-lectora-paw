<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessoryCategory;
use App\Models\Book;
use App\Models\StoreConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'shipping_cost' => 0,
            'free_shipping_min' => 0,
            'banner_message' => null,
            'is_store_open' => true,
        ]);

        $categories = AccessoryCategory::orderBy('order')->get();

        $genres = Book::whereNotNull('genre')
            ->where('genre', '!=', '')
            ->distinct()
            ->orderBy('genre')
            ->pluck('genre')
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
            'shipping_cost' => 'required|numeric|min:0',
            'free_shipping_min' => 'required|numeric|min:0',
            'banner_message' => 'nullable|string',
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
        $category->delete();

        return back()->with('success', 'Categoría eliminada.');
    }

    /**
     * Update a genre name across all books.
     */
    public function updateGenre(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'old_name' => 'required|string|max:100',
            'new_name' => 'required|string|max:100',
        ]);

        Book::where('genre', $validated['old_name'])->update(['genre' => trim($validated['new_name'])]);

        return back()->with('success', 'Género literario actualizado en todos los libros.');
    }

    /**
     * Delete a genre across all books.
     */
    public function destroyGenre(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        Book::where('genre', $validated['name'])->update(['genre' => null]);

        return back()->with('success', 'Género desvinculado de los libros.');
    }
}
