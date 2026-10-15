<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = User::with('roles:id,name');

        if ($search) {
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('name', $like, "%{$search}%")
                  ->orWhere('email', $like, "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
            ],
            'availableRoles' => Role::pluck('name'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        // Mantenemos sincronizado el campo legacy 'role' con el primer rol asignado si existe
        $validated['role'] = in_array('super-admin', $validated['roles'] ?? []) || in_array('admin', $validated['roles'] ?? [])
            ? 'admin'
            : 'client';

        $user = User::create($validated);

        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('admin.users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function show(User $user): Response
    {
        return Inertia::render('Admin/Users/Show', [
            'user' => $user->load('roles:id,name'),
            'permissions' => $user->getAllPermissions()->map(fn ($perm) => [
                'id' => $perm->id,
                'name' => $perm->name,
            ]),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->only(['id', 'name', 'email', 'is_active']),
            'roles' => Role::get(['id', 'name']),
            'userRoles' => $user->roles->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ]);

        // REGLA CRÍTICA DE ROL: Evitar que un Super Admin se quite el rol a sí mismo
        if ($request->user()->id === $user->id && $user->hasRole('super-admin')) {
            if (!in_array('super-admin', $request->input('roles', []))) {
                return redirect()->back()->withErrors([
                    'roles' => 'No puedes quitarte a ti mismo el rol de Super Administrador.',
                ])->withInput();
            }
        }

        // Manejo seguro de la contraseña
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $validated['is_active'] = $request->boolean('is_active', true);
        $rolesInput = $request->input('roles', []);
        $validated['role'] = in_array('super-admin', $rolesInput) || in_array('admin', $rolesInput)
            ? 'admin'
            : 'client';

        $user->update($validated);

        // Sincronización robusta de roles
        $user->syncRoles($rolesInput);

        return redirect()->route('admin.users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Usuario eliminado correctamente.');
    }
}
