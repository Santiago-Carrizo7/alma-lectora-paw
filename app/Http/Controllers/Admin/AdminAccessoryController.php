<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\AccessoryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccessoryController extends Controller
{
    /**
     * Display a listing of accessories with pagination, filters and tabs.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'available');

        $query = $tab === 'archived'
            ? Accessory::onlyTrashed()
            : Accessory::withoutTrashed();

        $accessories = $query
            ->filter($request->only(['search', 'category']))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'available' => Accessory::withoutTrashed()->count(),
            'archived' => Accessory::onlyTrashed()->count(),
        ];

        $categories = AccessoryCategory::active()->orderBy('order')->get(['id', 'slug', 'label', 'emoji']);

        return Inertia::render('Admin/Accessories/Index', [
            'accessories' => $accessories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'tab' => $tab,
            ],
            'counts' => $counts,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new accessory.
     */
    public function create(): Response
    {
        $categories = AccessoryCategory::active()->orderBy('order')->get(['id', 'slug', 'label', 'emoji']);

        return Inertia::render('Admin/Accessories/Form', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created accessory in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'promo_quantity' => 'nullable|integer|min:1',
            'promo_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'cover_url' => 'nullable|string|max:1000',
            'additional_images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        Accessory::create($validated);

        return redirect()->route('admin.accessories.index')->with('success', 'Accesorio registrado con éxito.');
    }

    /**
     * Show the form for editing the specified accessory.
     */
    public function edit(Accessory $accessory): Response
    {
        $categories = AccessoryCategory::active()->orderBy('order')->get(['id', 'slug', 'label', 'emoji']);

        return Inertia::render('Admin/Accessories/Form', [
            'accessory' => $accessory,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified accessory in storage.
     */
    public function update(Request $request, Accessory $accessory): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'promo_quantity' => 'nullable|integer|min:1',
            'promo_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'cover_url' => 'nullable|string|max:1000',
            'additional_images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $accessory->update($validated);

        return redirect()->route('admin.accessories.index')->with('success', 'Accesorio actualizado con éxito.');
    }

    /**
     * Quickly update stock for the specified accessory.
     */
    public function updateStock(Request $request, Accessory $accessory): RedirectResponse
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $accessory->update(['stock' => $validated['stock']]);

        return back()->with('success', 'Stock del accesorio actualizado con éxito.');
    }

    /**
     * Toggle the active visibility status of the accessory.
     */
    public function toggleActive(Accessory $accessory): RedirectResponse
    {
        $accessory->update(['is_active' => !$accessory->is_active]);

        return back()->with('success', 'Visibilidad del accesorio actualizada.');
    }

    /**
     * Soft delete (archive) the specified accessory.
     */
    public function destroy(Accessory $accessory): RedirectResponse
    {
        $accessory->delete();

        return back()->with('success', 'Accesorio archivado en la papelera.');
    }

    /**
     * Restore the specified soft-deleted accessory.
     */
    public function restore(string $id): RedirectResponse
    {
        $accessory = Accessory::onlyTrashed()->findOrFail($id);
        $accessory->restore();

        return back()->with('success', 'Accesorio restaurado con éxito.');
    }

    /**
     * Remove the specified accessory permanently from storage.
     */
    public function forceDestroy(string $id): RedirectResponse
    {
        $accessory = Accessory::withTrashed()->findOrFail($id);
        $accessory->forceDelete();

        return back()->with('success', 'Accesorio eliminado definitivamente.');
    }
}
