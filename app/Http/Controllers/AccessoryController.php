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

        $isFiltered = ! empty($filters['search']) || ! empty($filters['category']);

        $accessories = $isFiltered
            ? Accessory::active()->filter($filters)->latest()->paginate(16)->withQueryString()
            : Accessory::active()->filter($filters)->latest()->paginate(100)->withQueryString();

        return Inertia::render('Catalog/AccessoriesPage', [
            'accessories' => $accessories,
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    public function show(Accessory $accessory): Response
    {
        abort_if(! $accessory->is_active && ! auth()->user()?->isAdmin(), 404);

        $relatedAccessories = $accessory->getRelated(4);

        return Inertia::render('Catalog/AccessoryDetailPage', [
            'accessory' => $accessory,
            'relatedAccessories' => $relatedAccessories,
        ]);
    }
}
