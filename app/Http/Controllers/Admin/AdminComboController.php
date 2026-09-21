<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\ComboAccessory;
use App\Models\ComboBook;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminComboController extends Controller
{
    /**
     * Display a listing of promotional combos.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'available');

        $query = $tab === 'archived'
            ? Combo::onlyTrashed()->with(['books.book', 'accessories.accessory'])
            : Combo::withoutTrashed()->with(['books.book', 'accessories.accessory']);

        $search = $request->input('search');
        if ($search) {
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('title', $like, "%{$search}%")
                  ->orWhere('description', $like, "%{$search}%");
            });
        }

        $combos = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'available' => Combo::withoutTrashed()->count(),
            'archived' => Combo::onlyTrashed()->count(),
        ];

        return Inertia::render('Admin/Combos/Index', [
            'combos' => $combos,
            'filters' => [
                'search' => $search ?? '',
                'tab' => $tab,
            ],
            'counts' => $counts,
        ]);
    }

    /**
     * Show the form for creating a new combo.
     */
    public function create(): Response
    {
        $availableBooks = Book::withoutTrashed()->orderBy('title')->get(['id', 'title', 'price', 'cover_url']);
        $availableAccessories = Accessory::withoutTrashed()->orderBy('title')->get(['id', 'title', 'price', 'cover_url']);

        return Inertia::render('Admin/Combos/Form', [
            'availableBooks' => $availableBooks,
            'availableAccessories' => $availableAccessories,
        ]);
    }

    /**
     * Store a newly created combo in storage.
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
            'cover_url' => 'nullable|string|max:1000',
            'additional_images' => 'nullable|array',
            'is_active' => 'boolean',
            'books' => 'nullable|array',
            'books.*.id' => 'required|uuid|exists:books,id',
            'books.*.quantity' => 'required|integer|min:1',
            'accessories' => 'nullable|array',
            'accessories.*.id' => 'required|uuid|exists:accessories,id',
            'accessories.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            $combo = Combo::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'stock' => $validated['stock'],
                'cover_url' => $validated['cover_url'] ?? null,
                'additional_images' => $validated['additional_images'] ?? [],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['books'])) {
                foreach ($validated['books'] as $item) {
                    ComboBook::create([
                        'combo_id' => $combo->id,
                        'book_id' => $item['id'],
                        'quantity' => $item['quantity'],
                    ]);
                }
            }

            if (!empty($validated['accessories'])) {
                foreach ($validated['accessories'] as $item) {
                    ComboAccessory::create([
                        'combo_id' => $combo->id,
                        'accessory_id' => $item['id'],
                        'quantity' => $item['quantity'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.combos.index')->with('success', 'Combo promocional creado con éxito.');
    }

    /**
     * Show the form for editing the specified combo.
     */
    public function edit(Combo $combo): Response
    {
        $combo->load(['books.book', 'accessories.accessory']);
        $availableBooks = Book::withoutTrashed()->orderBy('title')->get(['id', 'title', 'price', 'cover_url']);
        $availableAccessories = Accessory::withoutTrashed()->orderBy('title')->get(['id', 'title', 'price', 'cover_url']);

        return Inertia::render('Admin/Combos/Form', [
            'combo' => $combo,
            'availableBooks' => $availableBooks,
            'availableAccessories' => $availableAccessories,
        ]);
    }

    /**
     * Update the specified combo in storage.
     */
    public function update(Request $request, Combo $combo): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'promo_quantity' => 'nullable|integer|min:1',
            'promo_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_url' => 'nullable|string|max:1000',
            'additional_images' => 'nullable|array',
            'is_active' => 'boolean',
            'books' => 'nullable|array',
            'books.*.id' => 'required|uuid|exists:books,id',
            'books.*.quantity' => 'required|integer|min:1',
            'accessories' => 'nullable|array',
            'accessories.*.id' => 'required|uuid|exists:accessories,id',
            'accessories.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($combo, $validated) {
            $combo->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'promo_quantity' => $validated['promo_quantity'] ?? null,
                'promo_price' => $validated['promo_price'] ?? null,
                'stock' => $validated['stock'],
                'cover_url' => $validated['cover_url'] ?? null,
                'additional_images' => $validated['additional_images'] ?? [],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            ComboBook::where('combo_id', $combo->id)->delete();
            if (!empty($validated['books'])) {
                foreach ($validated['books'] as $item) {
                    ComboBook::create([
                        'combo_id' => $combo->id,
                        'book_id' => $item['id'],
                        'quantity' => $item['quantity'],
                    ]);
                }
            }

            ComboAccessory::where('combo_id', $combo->id)->delete();
            if (!empty($validated['accessories'])) {
                foreach ($validated['accessories'] as $item) {
                    ComboAccessory::create([
                        'combo_id' => $combo->id,
                        'accessory_id' => $item['id'],
                        'quantity' => $item['quantity'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.combos.index')->with('success', 'Combo promocional actualizado con éxito.');
    }

    /**
     * Quickly update stock for the specified combo.
     */
    public function updateStock(Request $request, Combo $combo): RedirectResponse
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $combo->update(['stock' => $validated['stock']]);

        return back()->with('success', 'Stock del combo actualizado con éxito.');
    }

    /**
     * Toggle the active visibility status of the combo.
     */
    public function toggleActive(Combo $combo): RedirectResponse
    {
        $combo->update(['is_active' => !$combo->is_active]);

        return back()->with('success', 'Visibilidad del combo actualizada.');
    }

    /**
     * Soft delete (archive) the specified combo.
     */
    public function destroy(Combo $combo): RedirectResponse
    {
        $combo->delete();

        return back()->with('success', 'Combo archivado en la papelera.');
    }

    /**
     * Restore the specified soft-deleted combo.
     */
    public function restore(string $id): RedirectResponse
    {
        $combo = Combo::onlyTrashed()->findOrFail($id);
        $combo->restore();

        return back()->with('success', 'Combo reactivado con éxito.');
    }

    /**
     * Remove the specified combo permanently from storage.
     */
    public function forceDestroy(string $id): RedirectResponse
    {
        $combo = Combo::withTrashed()->findOrFail($id);
        $combo->forceDelete();

        return back()->with('success', 'Combo eliminado definitivamente.');
    }
}
