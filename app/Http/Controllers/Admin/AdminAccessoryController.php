<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AccessoriesExport;
use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\AccessoryCategory;
use App\Models\Combo;
use App\Support\HtmlSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminAccessoryController extends Controller
{
    /**
     * Export accessories catalog to Excel preserving current filters.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = [
            'search' => (string) $request->input('search', ''),
            'category' => (string) $request->input('category', ''),
            'stock_status' => (string) $request->input('stock_status', ''),
            'sort' => (string) $request->input('sort', ''),
            'tab' => (string) $request->input('tab', ''),
        ];

        return Excel::download(new AccessoriesExport($filters), 'catalogo-accesorios-alma-lectora.xlsx');
    }

    /**
     * Display a listing of accessories with pagination, filters and tabs.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => (string) $request->input('search', ''),
            'category' => (string) $request->input('category', ''),
            'stock_status' => (string) $request->input('stock_status', ''),
            'sort' => (string) $request->input('sort', ''),
            'tab' => (string) $request->input('tab', 'available'),
        ];

        $query = $filters['tab'] === 'archived'
            ? Accessory::onlyTrashed()->with('category')
            : Accessory::withoutTrashed()->with('category');

        $query->filter($filters);
        if (empty($filters['sort'])) {
            $query->latest();
        }

        $accessories = $query
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'available' => Accessory::withoutTrashed()->count(),
            'archived' => Accessory::onlyTrashed()->count(),
        ];

        $categories = AccessoryCategory::active()->orderBy('order')->get(['id', 'slug', 'label', 'emoji']);

        return Inertia::render('Admin/Accessories/Index', [
            'accessories' => $accessories,
            'filters' => $filters,
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
        $validated = $this->validateAndResolveAccessory($request);

        Accessory::create($validated);

        return redirect()->route('admin.accessories.index')->with('success', 'Accesorio registrado con éxito.');
    }

    /**
     * Show the form for editing the specified accessory.
     */
    public function edit(Accessory $accessory): Response
    {
        $accessory->load('category');
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
        $previousImages = array_filter(array_merge(
            [$accessory->cover_url],
            is_array($accessory->additional_images) ? $accessory->additional_images : []
        ));

        $validated = $this->validateAndResolveAccessory($request);

        $accessory->update($validated);

        $currentImages = array_filter(array_merge(
            [$accessory->cover_url],
            is_array($accessory->additional_images) ? $accessory->additional_images : []
        ));
        foreach (array_diff($previousImages, $currentImages) as $removedUrl) {
            AdminMediaController::deleteLocalUploadIfUnused($removedUrl);
        }

        return redirect()->route('admin.accessories.index')->with('success', 'Accesorio actualizado con éxito.');
    }

    /**
     * Validate accessory payload and safely resolve category_id without querying UUID columns with non-UUID text.
     *
     * @return array<string, mixed>
     */
    protected function validateAndResolveAccessory(Request $request): array
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'promo_quantity' => 'nullable|integer|min:1',
            'promo_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|uuid|exists:accessory_categories,id',
            'category' => 'nullable|string|max:100',
            'cover_url' => 'nullable|string|max:1000',
            'additional_images' => 'nullable|array|max:3',
            'additional_images.*' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['description'] = HtmlSanitizer::clean($validated['description'] ?? null);

        $validated['additional_images'] = array_values(array_filter(
            $validated['additional_images'] ?? [],
            fn ($u) => is_string($u) && trim($u) !== ''
        ));

        if (empty($validated['category_id']) && ! empty($validated['category'])) {
            $catVal = trim((string) $validated['category']);

            if (Str::isUuid($catVal)) {
                $category = AccessoryCategory::find($catVal);
            } else {
                $normalized = mb_strtolower($catVal);
                $category = AccessoryCategory::whereRaw('LOWER(slug) = ?', [$normalized])
                    ->orWhereRaw('LOWER(label) = ?', [$normalized])
                    ->first();
            }

            if (! $category) {
                throw ValidationException::withMessages([
                    'category' => 'La categoría seleccionada no existe.',
                ]);
            }

            $validated['category_id'] = $category->id;
        }

        if (empty($validated['category_id'])) {
            throw ValidationException::withMessages([
                'category_id' => 'La categoría es obligatoria.',
            ]);
        }

        unset($validated['category']);

        return $validated;
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
     * Remove the specified accessory permanently from storage, guarding combo integrity.
     */
    public function forceDestroy(string $id): RedirectResponse
    {
        $accessory = Accessory::withTrashed()->findOrFail($id);

        $blockingCombos = Combo::withTrashed()
            ->whereHas('accessories', fn ($q) => $q->where('accessory_id', $accessory->id))
            ->pluck('title');

        if ($blockingCombos->isNotEmpty()) {
            return back()->with(
                'error',
                "No se puede eliminar definitivamente el accesorio \"{$accessory->title}\" porque forma parte de los combos: ".$blockingCombos->implode(', ').'.'
            );
        }

        $images = array_filter(array_merge(
            [$accessory->cover_url],
            is_array($accessory->additional_images) ? $accessory->additional_images : []
        ));

        $accessory->forceDelete();

        foreach ($images as $url) {
            AdminMediaController::deleteLocalUploadIfUnused($url);
        }

        return back()->with('success', 'Accesorio eliminado definitivamente.');
    }
}
