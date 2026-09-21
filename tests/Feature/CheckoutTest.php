<?php

namespace Tests\Feature;

use App\Models\Accessory;
use App\Models\AccessoryCategory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;
use App\Models\StoreConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        StoreConfig::create([
            'whatsapp_phone' => '5493875708557',
            'instagram_url' => 'https://www.instagram.com/alma.lectora.al/?hl=es-la',
            'shipping_cost' => 0.00,
            'free_shipping_min' => 0.00,
            'is_store_open' => true,
        ]);
    }

    public function test_checkout_page_can_be_rendered(): void
    {
        $response = $this->get('/checkout');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Checkout/Index')
        );
    }

    public function test_order_lead_can_be_created_successfully(): void
    {
        $book = Book::create([
            'isbn' => '9789870001111',
            'title' => 'Test Book',
            'price' => 15000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $category = AccessoryCategory::create([
            'slug' => 'test-cat',
            'label' => 'Test Category',
            'order' => 1,
            'is_active' => true,
        ]);

        $accessory = Accessory::create([
            'title' => 'Test Bookmark',
            'category' => 'test-cat',
            'price' => 2500.00,
            'stock' => 5,
            'is_active' => true,
        ]);

        $combo = Combo::create([
            'title' => 'Test Combo Pack',
            'price' => 16000.00,
            'stock' => 3,
            'is_active' => true,
        ]);

        $payload = [
            'customer_name' => 'Juan Perez',
            'customer_phone' => '5493875112233',
            'customer_email' => 'juan.perez@example.com',
            'customer_dni' => '35123456',
            'postal_code' => '4400',
            'address' => 'Av. San Martín 123',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => 'Test Book',
                    'quantity' => 2,
                    'unit_price' => 15000.00,
                ],
                [
                    'id' => $accessory->id,
                    'type' => 'ACCESSORY',
                    'title' => 'Test Bookmark',
                    'quantity' => 1,
                    'unit_price' => 2500.00,
                ],
                [
                    'id' => $combo->id,
                    'type' => 'COMBO',
                    'title' => 'Test Combo Pack',
                    'quantity' => 1,
                    'unit_price' => 16000.00,
                ],
            ],
            'total_amount' => 48500.00,
        ];

        $response = $this->postJson('/pedidos/lead', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $orderId = $response->json('orderId');
        $this->assertNotNull($orderId);

        $this->assertDatabaseHas('order_leads', [
            'id' => $orderId,
            'customer_name' => 'Juan Perez',
            'customer_phone' => '5493875112233',
            'customer_email' => 'juan.perez@example.com',
            'customer_dni' => '35123456',
            'status' => 'PENDING_WHATSAPP',
        ]);
    }

    public function test_order_lead_fails_with_422_when_product_stock_is_insufficient(): void
    {
        $book = Book::create([
            'isbn' => '9789870002222',
            'title' => 'Rare Book',
            'price' => 20000.00,
            'stock' => 1,
            'is_active' => true,
        ]);

        $payload = [
            'customer_name' => 'Maria Lopez',
            'customer_phone' => '5493875998877',
            'customer_email' => 'maria@example.com',
            'customer_dni' => '28999888',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => 'Rare Book',
                    'quantity' => 5, // exceeds stock of 1
                    'unit_price' => 20000.00,
                ],
            ],
            'total_amount' => 100000.00,
        ];

        $response = $this->postJson('/pedidos/lead', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['stock']);
        $this->assertEquals(0, OrderLead::count());
    }

    public function test_order_lead_fails_with_422_when_store_is_closed(): void
    {
        $config = StoreConfig::first();
        $config->update(['is_store_open' => false]);

        $book = Book::create([
            'isbn' => '9789870003333',
            'title' => 'Another Book',
            'price' => 10000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $payload = [
            'customer_name' => 'Carlos Gomez',
            'customer_phone' => '5493875443322',
            'customer_email' => 'carlos@example.com',
            'customer_dni' => '30111222',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => 'Another Book',
                    'quantity' => 1,
                    'unit_price' => 10000.00,
                ],
            ],
            'total_amount' => 10000.00,
        ];

        $response = $this->postJson('/pedidos/lead', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['store']);
    }

    public function test_order_lead_validation_requires_mandatory_fields(): void
    {
        $response = $this->postJson('/pedidos/lead', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_dni',
            'items',
            'total_amount',
        ]);
    }
}
