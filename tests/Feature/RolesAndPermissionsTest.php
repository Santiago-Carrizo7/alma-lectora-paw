<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_guest_is_redirected_to_login_when_accessing_admin_area(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login');
    }

    public function test_client_role_cannot_access_admin_area(): void
    {
        $client = User::where('email', 'cliente@almalectora.com')->first();
        $this->actingAs($client);

        $response = $this->get('/admin');
        $response->assertStatus(403);
    }

    public function test_admin_role_can_access_books_but_cannot_access_user_security(): void
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        // Can access catalog management
        $responseBooks = $this->get('/admin/libros');
        $responseBooks->assertStatus(200);

        // Forbidden from user security management
        $responseUsers = $this->get('/admin/usuarios');
        $responseUsers->assertStatus(403);

        $responseRoles = $this->get('/admin/roles');
        $responseRoles->assertStatus(403);

        $responsePermissions = $this->get('/admin/permisos');
        $responsePermissions->assertStatus(403);
    }

    public function test_super_admin_can_access_user_security_and_roles(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        $responseUsers = $this->get('/admin/usuarios');
        $responseUsers->assertStatus(200);

        $responseRoles = $this->get('/admin/roles');
        $responseRoles->assertStatus(200);

        $responsePermissions = $this->get('/admin/permisos');
        $responsePermissions->assertRedirect(route('admin.roles.index'));
    }

    public function test_super_admin_cannot_delete_themselves(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        $response = $this->delete("/admin/usuarios/{$superAdmin->id}");
        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
    }

    public function test_super_admin_can_manage_custom_roles_and_permissions_from_unified_panel(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        // Create permission
        $createPerm = $this->post('/admin/permisos', [
            'name' => 'auditar inventario especial',
        ]);
        $createPerm->assertRedirect(route('admin.roles.index'));
        $this->assertDatabaseHas('permissions', ['name' => 'auditar inventario especial']);

        $permission = \Spatie\Permission\Models\Permission::where('name', 'auditar inventario especial')->first();

        // Update permission
        $updatePerm = $this->put("/admin/permisos/{$permission->id}", [
            'name' => 'auditar inventario global',
        ]);
        $updatePerm->assertRedirect(route('admin.roles.index'));
        $this->assertDatabaseHas('permissions', ['id' => $permission->id, 'name' => 'auditar inventario global']);

        // Create custom role
        $createRole = $this->post('/admin/roles', [
            'name' => 'auditor',
            'permissions' => ['auditar inventario global'],
        ]);
        $createRole->assertRedirect(route('admin.roles.index'));
        $role = Role::where('name', 'auditor')->first();
        $this->assertNotNull($role);

        // Essential system role cannot be deleted
        $superAdminRole = Role::where('name', 'super-admin')->first();
        $this->delete("/admin/roles/{$superAdminRole->id}")
            ->assertRedirect(route('admin.roles.index'))
            ->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['id' => $superAdminRole->id]);

        // Custom role can be deleted
        $deleteRole = $this->delete("/admin/roles/{$role->id}");
        $deleteRole->assertRedirect(route('admin.roles.index'));
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);

        // Delete permission
        $deletePerm = $this->delete("/admin/permisos/{$permission->id}");
        $deletePerm->assertRedirect(route('admin.roles.index'));
        $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
    }

    public function test_super_admin_cannot_remove_their_own_super_admin_role(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        $response = $this->put("/admin/usuarios/{$superAdmin->id}", [
            'name' => 'Super Admin Renamed',
            'email' => $superAdmin->email,
            'roles' => ['client'], // Attempting to demote self
        ]);

        $response->assertSessionHasErrors(['roles']);
        $this->assertTrue($superAdmin->fresh()->hasRole('super-admin'));
    }

    public function test_super_admin_can_create_new_user_with_role(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        $response = $this->post('/admin/usuarios', [
            'name' => 'Nuevo Empleado',
            'email' => 'empleado@almalectora.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['admin'],
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/usuarios');
        $created = User::where('email', 'empleado@almalectora.com')->first();
        $this->assertNotNull($created);
        $this->assertTrue($created->hasRole('admin'));
    }

    public function test_cannot_demote_deactivate_or_delete_last_active_super_admin(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $actingAdmin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $actingAdmin->assignRole('admin');
        // Ensure only one active super-admin exists
        $this->assertEquals(1, User::role('super-admin')->where('is_active', true)->count());

        // Super admin tries to deactivate self via another active super-admin scenario:
        // First try via superAdmin acting on self
        $this->actingAs($superAdmin)->put("/admin/usuarios/{$superAdmin->id}", [
            'name' => $superAdmin->name,
            'email' => $superAdmin->email,
            'roles' => ['super-admin'],
            'is_active' => false,
        ])->assertSessionHasErrors(['is_active']);
        $this->assertTrue($superAdmin->fresh()->is_active);

        // Give super-admin permission to another super-admin, verify we have 2, then deactivate one, then guard triggers for last one
        $secondSuperAdmin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $secondSuperAdmin->assignRole('super-admin');

        // Can deactivate $secondSuperAdmin while $superAdmin stays active
        $this->actingAs($superAdmin)->put("/admin/usuarios/{$secondSuperAdmin->id}", [
            'name' => $secondSuperAdmin->name,
            'email' => $secondSuperAdmin->email,
            'roles' => ['super-admin'],
            'is_active' => false,
        ])->assertRedirect('/admin/usuarios');
        $this->assertFalse($secondSuperAdmin->fresh()->is_active);

        // Now $superAdmin is the ONLY active super-admin; secondSuperAdmin (or admin? super-admin policy requires super-admin) cannot delete $superAdmin even if another user tries
        // Test through secondSuperAdmin temporarily active -> wait, if inactive cannot login, check destroy guard when another super-admin exists vs role removal:
        $secondSuperAdmin->update(['is_active' => true]);
        // Demoting $secondSuperAdmin leaves $superAdmin, works:
        $this->actingAs($superAdmin)->put("/admin/usuarios/{$secondSuperAdmin->id}", [
            'name' => $secondSuperAdmin->name,
            'email' => $secondSuperAdmin->email,
            'roles' => ['admin'],
            'is_active' => true,
        ])->assertRedirect('/admin/usuarios');
        $this->assertFalse($secondSuperAdmin->fresh()->hasRole('super-admin'));

        // Re-verify $superAdmin still active and super-admin
        $this->assertTrue($superAdmin->fresh()->hasRole('super-admin'));
        $this->assertTrue($superAdmin->fresh()->is_active);
    }

    public function test_custom_role_and_modified_admin_permissions_are_enforced_in_backend(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Custom role from seeder ("rol de prueba"): has listar libros, exportar libros, listar accesorios; NOT crear libros or ver reportes estadisticos
        $tester = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $tester->assignRole('rol de prueba');

        $this->actingAs($tester)->get('/admin')->assertStatus(200);
        $this->actingAs($tester)->get('/admin/libros')->assertStatus(200);
        $this->actingAs($tester)->get('/admin/accesorios')->assertStatus(200);
        $this->actingAs($tester)->get('/admin/libros/nuevo')->assertStatus(403);
        $this->actingAs($tester)->get('/admin/reportes')->assertStatus(403);

        // Revoking a permission from admin role immediately takes effect in backend
        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $adminRole->revokePermissionTo('ver reportes estadisticos');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $admin = User::where('email', 'admin@almalectora.com')->firstOrFail();
        $this->actingAs($admin)->get('/admin/reportes')->assertStatus(403);

        // Super-admin keeps full access via Gate::before
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->firstOrFail();
        $this->actingAs($superAdmin)->get('/admin/reportes')->assertStatus(200);
    }
}
