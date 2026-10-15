<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\OrderLead;
use App\Models\StoreConfig;
use App\Models\User;
use Database\Seeders\BookSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\StoreConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerOrdersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(BookSeeder::class);
        $this->seed(StoreConfigSeeder::class);
    }

    public function test_user_can_register_with_full_customer_fields_and_gets_client_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Comprador Nuevo',
            'email' => 'comprador@almalectora.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'dni' => '38123456',
            'phone' => '3875112233',
            'address' => 'Av. San Martín 450',
            'postal_code' => '4400',
        ]);

        $response->assertRedirect('/');

        $this->assertAuthenticated();

        $user = User::where('email', 'comprador@almalectora.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('38123456', $user->dni);
        $this->assertEquals('3875112233', $user->phone);
        $this->assertEquals('Av. San Martín 450', $user->address);
        $this->assertEquals('4400', $user->postal_code);
        $this->assertTrue($user->hasRole('client'));
    }

    public function test_authenticated_customer_checkout_persists_user_id(): void
    {
        $client = User::where('email', 'cliente@almalectora.com')->first();
        $this->actingAs($client);

        $book = Book::active()->first();

        $payload = [
            'customer_name' => $client->name,
            'customer_phone' => '3875123456',
            'customer_email' => $client->email,
            'customer_dni' => '40123456',
            'postal_code' => '4400',
            'address' => 'Balcarce 123',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 1,
                    'unit_price' => (float)$book->price,
                ],
            ],
            'total_amount' => (float)$book->price,
        ];

        $response = $this->postJson('/pedidos/lead', $payload);

        $response->assertStatus(201);
        $data = $response->json();
        $this->assertTrue($data['success']);

        $order = OrderLead::find($data['orderId']);
        $this->assertNotNull($order);
        $this->assertEquals($client->id, $order->user_id);
    }

    public function test_guest_checkout_persists_null_user_id(): void
    {
        $book = Book::active()->first();

        $payload = [
            'customer_name' => 'Invitado Comprador',
            'customer_phone' => '3875998877',
            'customer_email' => 'invitado@gmail.com',
            'customer_dni' => '35123456',
            'postal_code' => '4400',
            'address' => 'Mitre 200',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 1,
                    'unit_price' => (float)$book->price,
                ],
            ],
            'total_amount' => (float)$book->price,
        ];

        $response = $this->postJson('/pedidos/lead', $payload);

        $response->assertStatus(201);
        $data = $response->json();

        $order = OrderLead::find($data['orderId']);
        $this->assertNotNull($order);
        $this->assertNull($order->user_id);
    }

    public function test_customer_can_access_their_purchase_history(): void
    {
        $client = User::where('email', 'cliente@almalectora.com')->first();
        $this->actingAs($client);

        // Crear una orden propia
        $book = Book::active()->first();
        OrderLead::create([
            'user_id' => $client->id,
            'customer_name' => $client->name,
            'customer_phone' => '3875123456',
            'customer_email' => $client->email,
            'customer_dni' => '40123456',
            'items' => [
                ['id' => $book->id, 'type' => 'BOOK', 'title' => $book->title, 'quantity' => 1, 'unit_price' => 1000]
            ],
            'total_amount' => 1000,
            'status' => 'CONFIRMED',
        ]);

        $response = $this->get('/mis-compras');
        $response->assertStatus(200);
    }

    public function test_customer_cannot_download_remito_of_another_user(): void
    {
        $clientA = User::where('email', 'cliente@almalectora.com')->first();
        $clientB = User::factory()->create([
            'email' => 'otro@almalectora.com',
            'role' => 'client',
        ]);
        $clientB->assignRole('client');

        $book = Book::active()->first();

        // Orden de Client B
        $orderB = OrderLead::create([
            'user_id' => $clientB->id,
            'customer_name' => $clientB->name,
            'customer_phone' => '3875123456',
            'customer_email' => $clientB->email,
            'customer_dni' => '40123456',
            'items' => [
                ['id' => $book->id, 'type' => 'BOOK', 'title' => $book->title, 'quantity' => 1, 'unit_price' => 1000]
            ],
            'total_amount' => 1000,
            'status' => 'CONFIRMED',
        ]);

        // Client A intenta descargar remito de Client B -> 403 Forbidden
        $this->actingAs($clientA);
        $response = $this->get("/mis-compras/{$orderB->id}/remito");
        $response->assertStatus(403);

        // Client B descarga su propio remito -> 200 OK
        $this->actingAs($clientB);
        $responseB = $this->get("/mis-compras/{$orderB->id}/remito");
        $responseB->assertStatus(200);
    }
}
