<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la caché de los permisos de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Crear Permisos (usando firstOrCreate para idempotencia)
        $permissions = [
            // Libros
            'listar libros',
            'crear libros',
            'ver libros',
            'editar libros',
            'eliminar libros',
            'exportar libros',

            // Accesorios
            'listar accesorios',
            'crear accesorios',
            'ver accesorios',
            'editar accesorios',
            'eliminar accesorios',
            'exportar accesorios',

            // Combos
            'listar combos',
            'crear combos',
            'ver combos',
            'editar combos',
            'eliminar combos',
            'exportar combos',

            // Pedidos y Remitos
            'listar pedidos',
            'ver pedidos',
            'actualizar estado pedidos',
            'eliminar pedidos',
            'descargar remitos',

            // Reportes
            'ver dashboard',
            'ver reportes estadisticos',
            'descargar reportes',

            // Configuración
            'gestionar configuracion tienda',

            // Gestión de Usuarios, Roles y Permisos (Exclusivo Super-Admin)
            'listar usuarios',
            'crear usuarios',
            'editar usuarios',
            'eliminar usuarios',
            'listar roles',
            'gestionar roles',
            'listar permisos',
            'gestionar permisos',

            // Portal del Cliente
            'ver mis compras',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Crear Roles
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $roleClient = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $roleGuest = Role::firstOrCreate(['name' => 'guest', 'guard_name' => 'web']);

        // 3. Asignar Permisos a Roles
        // Super Admin tiene todos los permisos
        $roleSuperAdmin->syncPermissions(Permission::all());

        // Admin gestiona catálogo, pedidos, configuración y reportes (sin acceso a usuarios/roles)
        $roleAdmin->syncPermissions([
            'ver dashboard',
            'listar libros',
            'crear libros',
            'ver libros',
            'editar libros',
            'eliminar libros',
            'exportar libros',
            'listar accesorios',
            'crear accesorios',
            'ver accesorios',
            'editar accesorios',
            'eliminar accesorios',
            'exportar accesorios',
            'listar combos',
            'crear combos',
            'ver combos',
            'editar combos',
            'eliminar combos',
            'exportar combos',
            'listar pedidos',
            'ver pedidos',
            'actualizar estado pedidos',
            'eliminar pedidos',
            'descargar remitos',
            'ver reportes estadisticos',
            'descargar reportes',
            'gestionar configuracion tienda',
        ]);

        // Client puede consultar sus compras y descargar sus remitos
        $roleClient->syncPermissions([
            'ver mis compras',
            'descargar remitos',
        ]);

        // Guest solo puede navegar el catálogo
        $roleGuest->syncPermissions([
            'listar libros',
            'ver libros',
            'listar accesorios',
            'ver accesorios',
        ]);

        // 4. Crear Usuarios de prueba
        // Super Admin Principal
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@almalectora.com'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
        $superAdmin->syncRoles([$roleSuperAdmin]);

        // Admin Operativo
        $admin = User::updateOrCreate(
            ['email' => 'admin@almalectora.com'],
            [
                'name' => 'Administrador de Tienda',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
        $admin->syncRoles([$roleAdmin]);

        // Cliente de prueba
        $cliente = User::updateOrCreate(
            ['email' => 'cliente@almalectora.com'],
            [
                'name' => 'Juan Pérez (Cliente)',
                'password' => Hash::make('password'),
                'role' => 'client',
                'is_active' => true,
            ]
        );
        $cliente->syncRoles([$roleClient]);

        // Asignar rol a usuarios existentes que no tengan rol asignado todavía
        $existingAdmins = User::where('role', 'admin')
            ->whereNotIn('email', ['superadmin@almalectora.com', 'admin@almalectora.com'])
            ->get();

        foreach ($existingAdmins as $u) {
            if (!$u->hasAnyRole(Role::all())) {
                $u->assignRole($roleAdmin);
            }
        }
    }
}
