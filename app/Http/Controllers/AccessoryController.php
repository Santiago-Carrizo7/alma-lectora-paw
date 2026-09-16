<?php

namespace App\Http\Controllers;

use App\Models\Accessory;
use App\Models\AccessoryCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccessoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category']);

        $categories = AccessoryCategory::active()
            ->orderBy('order')
            ->get();

        $accessories = Accessory::active()
            ->filter($filters)
            ->latest()
            ->paginate(16)
            ->withQueryString();

        return Inertia::render('Catalog/AccessoriesPage', [
            'accessories' => $accessories,
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    public function show(Accessory $accessory): Response
    {
        abort_if(! $accessory->is_active && ! auth()->user()?->isAdmin(), 404);

        $relatedAccessories = Accessory::active()
            ->where('category', $accessory->category)
            ->where('id', '!=', $accessory->id)
            ->take(4)
            ->get();

        return Inertia::render('Catalog/AccessoryDetailPage', [
            'accessory' => $accessory,
            'relatedAccessories' => $relatedAccessories,
        ]);
    }
}
