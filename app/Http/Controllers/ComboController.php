<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use Inertia\Inertia;
use Inertia\Response;

class ComboController extends Controller
{
    public function show(Combo $combo): Response
    {
        abort_if(! $combo->is_active && ! auth()->user()?->isAdmin(), 404);

        $combo->load([
            'books.book.authors',
            'accessories.accessory',
        ]);

        return Inertia::render('Catalog/ComboDetailPage', [
            'combo' => $combo,
        ]);
    }
}
