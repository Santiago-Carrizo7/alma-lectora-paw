<?php

namespace Tests\Feature;

use App\Models\Accessory;
use App\Models\AccessoryCategory;
use App\Models\Combo;
use App\Models\OrderLead;
use App\Models\StoreConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_accessories_and_create_accessory(): void
    {
        $admin = User::factory()->admin()->create();
        AccessoryCategory::create([
            'slug' => 'VELAS',
            'label' => 'Velas Aromáticas',
            'emoji' => '🕯️',
            'order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/accesorios');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Accessories/Index')
            ->has('accessories')
            ->has('categories')
        );

        $createResponse = $this->actingAs($admin)->post('/admin/accesorios', [
            'title' => 'Vela Aromática de Café',
            'description' => 'Vela hecha a mano con cera de soja.',
            'price' => 5200.00,
            'stock' => 15,
            'category' => 'VELAS',
            'is_active' => true,
        ]);

        $createResponse->assertRedirect('/admin/accesorios');
        $this->assertDatabaseHas('accessories', [
            'title' => 'Vela Aromática de Café',
            'stock' => 15,
        ]);

        $accessory = Accessory::where('title', 'Vela Aromática de Café')->first();

        // Update stock
        $stockResponse = $this->actingAs($admin)->patch("/admin/accesorios/{$accessory->id}/stock", [
            'stock' => 30,
        ]);
        $stockResponse->assertSessionHasNoErrors();
        $this->assertEquals(30, $accessory->fresh()->stock);
    }

    public function test_admin_can_view_combos_and_create_combo(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/combos');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Combos/Index')
            ->has('combos')
        );

        $createResponse = $this->actingAs($admin)->post('/admin/combos', [
            'title' => 'Combo Lectura de Otoño',
            'description' => 'Pack de libro con vela y señalador.',
            'price' => 19500.00,
            'stock' => 8,
            'is_active' => true,
        ]);

        $createResponse->assertRedirect('/admin/combos');
        $this->assertDatabaseHas('combos', [
            'title' => 'Combo Lectura de Otoño',
            'stock' => 8,
        ]);
    }

    public function test_admin_can_view_orders_and_update_status(): void
    {
        $admin = User::factory()->admin()->create();

        $order = OrderLead::create([
            'customer_name' => 'María Pérez',
            'customer_phone' => '3875123456',
            'customer_email' => 'maria@test.com',
            'customer_dni' => '38123456',
            'postal_code' => '4400',
            'address' => 'Av. San Martín 123',
            'items' => [
                [
                    'title' => 'Cien Años de Soledad',
                    'quantity' => 1,
                    'unitPrice' => 15000,
                ],
            ],
            'total_amount' => 15000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $response = $this->actingAs($admin)->get('/admin/pedidos');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Orders/Index')
            ->has('orders')
            ->has('counts')
        );

        // Update status to CONFIRMED
        $patchResponse = $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $patchResponse->assertSessionHasNoErrors();
        $this->assertEquals('CONFIRMED', $order->fresh()->status);
    }

    public function test_admin_can_view_and_update_store_config(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/configuracion');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Config/Index')
            ->has('config')
            ->has('categories')
            ->has('genres')
        );

        $updateResponse = $this->actingAs($admin)->put('/admin/configuracion/tienda', [
            'whatsapp_phone' => '5493875708557',
            'instagram_url' => 'https://instagram.com/alma.lectora.al',
            'shipping_cost' => 1500.00,
            'free_shipping_min' => 30000.00,
            'banner_message' => '¡Envíos gratis en compras superiores a $30.000!',
            'is_store_open' => true,
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('store_config', [
            'shipping_cost' => 1500.00,
            'free_shipping_min' => 30000.00,
        ]);
    }
}
