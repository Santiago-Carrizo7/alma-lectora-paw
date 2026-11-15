<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminPermissionController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('admin.roles.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'guard_name' => 'nullable|string|max:255',
        ]);

        $validated['guard_name'] = $validated['guard_name'] ?? 'web';
        $validated['name'] = strtolower(trim($validated['name']));

        $permission = Permission::create($validated);

        if ($superAdminRole = Role::where('name', 'super-admin')->first()) {
            $superAdminRole->givePermissionTo($permission);
        }

        return redirect()->route('admin.roles.index')->with('success', 'Permiso creado correctamente.');
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $validated['name'] = strtolower(trim($validated['name']));
        $permission->update($validated);

        return redirect()->route('admin.roles.index')->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('admin.roles.index')->with('success', 'Permiso eliminado correctamente.');
    }
}
