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
        $responsePermissions->assertStatus(200);
    }

    public function test_super_admin_cannot_delete_themselves(): void
    {
        $superAdmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superAdmin);

        $response = $this->delete("/admin/usuarios/{$superAdmin->id}");
        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
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
}
