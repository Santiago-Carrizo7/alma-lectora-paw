<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminRoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::with('permissions:id,name')->orderBy('id')->get(),
            'permissions' => Permission::orderBy('name')->get(['id', 'name', 'guard_name', 'created_at']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Roles/Create', [
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => strtolower(trim($validated['name'])),
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('admin.roles.index')->with('success', 'Rol creado correctamente.');
    }

    public function show(Role $role): Response
    {
        return Inertia::render('Admin/Roles/Show', [
            'role' => $role->load('permissions:id,name'),
        ]);
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'rolePermissions' => $role->permissions->pluck('name'),
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        // REGLA CRÍTICA: Proteger el nombre de roles del sistema
        if ($role->name === 'super-admin' && $request->input('name') !== 'super-admin') {
            return redirect()->back()->withErrors([
                'name' => 'No se puede renombrar el rol fundamental del sistema (super-admin).'
            ])->withInput();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => strtolower(trim($validated['name']))]);

        // Si es super-admin, siempre conserva todos los permisos
        if ($role->name === 'super-admin') {
            $role->syncPermissions(Permission::all());
        } else {
            $role->syncPermissions($request->input('permissions', []));
        }

        return redirect()->route('admin.roles.index')->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        // REGLA CRÍTICA: No permitir eliminar los roles esenciales del sistema
        if (in_array(strtolower($role->name), ['super-admin', 'admin', 'client', 'guest'])) {
            return redirect()->route('admin.roles.index')
                ->with('error', "No es posible eliminar el rol esencial del sistema '{$role->name}'.");
        }

        $role->delete();

        return redirect()->route('admin.roles.index')->with('success', "Rol '{$role->name}' eliminado correctamente.");
    }
}
