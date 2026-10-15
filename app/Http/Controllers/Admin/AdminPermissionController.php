<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class AdminPermissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => Permission::orderBy('name')->get(['id', 'name', 'guard_name', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'guard_name' => 'nullable|string|max:255',
        ]);

        $validated['guard_name'] = $validated['guard_name'] ?? 'web';
        $validated['name'] = strtolower(trim($validated['name']));

        Permission::create($validated);

        return redirect()->route('admin.permissions.index')->with('success', 'Permiso creado correctamente.');
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $validated['name'] = strtolower(trim($validated['name']));
        $permission->update($validated);

        return redirect()->route('admin.permissions.index')->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('admin.permissions.index')->with('success', 'Permiso eliminado correctamente.');
    }
}
