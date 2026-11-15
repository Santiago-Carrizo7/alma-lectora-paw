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

    public function test_verify_stock_endpoint_returns_realtime_stock_and_friendly_messages(): void
    {
        $bookOneLeft = Book::create([
            'isbn' => '9789870004444',
            'title' => 'Libro Único',
            'price' => 15000.00,
            'stock' => 1,
            'is_active' => true,
        ]);

        $bookOutOfStock = Book::create([
            'isbn' => '9789870005555',
            'title' => 'Libro Agotado',
            'price' => 12000.00,
            'stock' => 0,
            'is_active' => true,
        ]);

        $response = $this->postJson('/carrito/verificar-stock', [
            'items' => [
                [
                    'id' => $bookOneLeft->id,
                    'type' => 'BOOK',
                    'quantity' => 2,
                ],
                [
                    'id' => $bookOutOfStock->id,
                    'type' => 'BOOK',
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'valid' => false,
            'is_store_open' => true,
            'items' => [
                $bookOneLeft->id => [
                    'id' => $bookOneLeft->id,
                    'available_stock' => 1,
                    'requested_quantity' => 2,
                    'valid' => false,
                    'message' => 'Solamente nos queda 1 unidad de este libro.',
                ],
                $bookOutOfStock->id => [
                    'id' => $bookOutOfStock->id,
                    'available_stock' => 0,
                    'requested_quantity' => 1,
                    'valid' => false,
                    'message' => 'Este producto ya no tiene stock disponible.',
                ],
            ],
        ]);
    }

    public function test_order_lead_recalculates_prices_and_total_on_server_ignoring_client_tampering(): void
    {
        $book = Book::create([
            'isbn' => '9789870006666',
            'title' => 'Real DB Book',
            'price' => 20000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/pedidos/lead', [
            'customer_name' => 'Cliente Auditor',
            'customer_phone' => '5493875111222',
            'customer_email' => 'auditor@example.com',
            'customer_dni' => '33111222',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => 'Fake Tampered Title',
                    'quantity' => 2,
                    'unit_price' => 1.00,
                ],
            ],
            'total_amount' => 1.00,
        ]);

        $response->assertStatus(201);
        $order = OrderLead::findOrFail($response->json('orderId'));

        $this->assertEquals(40000.00, (float) $order->total_amount);
        $this->assertEquals('Real DB Book', $order->items[0]['title']);
        $this->assertEquals(20000.00, (float) $order->items[0]['unit_price']);
        $this->assertEquals(40000.00, (float) $order->items[0]['subtotal']);
    }

    public function test_order_lead_applies_bundle_promotions_on_server(): void
    {
        $book = Book::create([
            'isbn' => '9789870006667',
            'title' => 'Libro Promo',
            'price' => 20000.00,
            'promo_quantity' => 3,
            'promo_price' => 50000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/pedidos/lead', [
            'customer_name' => 'Cliente Promo',
            'customer_phone' => '5493875111333',
            'customer_email' => 'promo@example.com',
            'customer_dni' => '33111333',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => 'Libro Promo',
                    'quantity' => 4,
                    'unit_price' => 1.00,
                ],
            ],
            'total_amount' => 1.00,
        ]);

        $response->assertStatus(201);
        $order = OrderLead::findOrFail($response->json('orderId'));

        // 3 for 50000 + 1 for 20000 = 70000
        $this->assertEquals(70000.00, (float) $order->total_amount);
        $this->assertEquals(70000.00, (float) $order->items[0]['subtotal']);
    }

    public function test_order_lead_rejects_when_accumulated_stock_across_duplicate_lines_or_combo_exceeds_available(): void
    {
        $book = Book::create([
            'isbn' => '9789870006668',
            'title' => 'Libro Escaso',
            'price' => 15000.00,
            'stock' => 3,
            'is_active' => true,
        ]);

        $combo = Combo::create([
            'title' => 'Combo Escaso',
            'price' => 14000.00,
            'stock' => 2,
            'is_active' => true,
        ]);

        \App\Models\ComboBook::create([
            'combo_id' => $combo->id,
            'book_id' => $book->id,
            'quantity' => 1,
        ]);

        // 1 combo (uses 1 Book) + 3 Book = 4 > 3 available
        $comboResponse = $this->postJson('/pedidos/lead', [
            'customer_name' => 'Cliente Stock',
            'customer_phone' => '5493875111444',
            'customer_email' => 'stock@example.com',
            'customer_dni' => '33111444',
            'items' => [
                [
                    'id' => $combo->id,
                    'type' => 'COMBO',
                    'title' => $combo->title,
                    'quantity' => 1,
                    'unit_price' => 14000.00,
                ],
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 3,
                    'unit_price' => 15000.00,
                ],
            ],
            'total_amount' => 59000.00,
        ]);

        $comboResponse->assertStatus(422);
        $comboResponse->assertJsonValidationErrors(['stock']);

        // Duplicate lines of the same book: 2 + 2 = 4 > 3 available
        $dupResponse = $this->postJson('/pedidos/lead', [
            'customer_name' => 'Cliente Stock 2',
            'customer_phone' => '5493875111555',
            'customer_email' => 'stock2@example.com',
            'customer_dni' => '33111555',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 2,
                    'unit_price' => 15000.00,
                ],
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 2,
                    'unit_price' => 15000.00,
                ],
            ],
            'total_amount' => 60000.00,
        ]);

        $dupResponse->assertStatus(422);
        $dupResponse->assertJsonValidationErrors(['stock']);
    }

    public function test_order_confirmation_email_does_not_promise_inventory_reservation(): void
    {
        $order = OrderLead::create([
            'customer_name' => 'Lucía Gómez',
            'customer_phone' => '5493875123456',
            'customer_email' => 'lucia@example.com',
            'customer_dni' => '34123456',
            'items' => [
                [
                    'id' => 'book-1',
                    'type' => 'BOOK',
                    'title' => 'Rayuela',
                    'quantity' => 1,
                    'unit_price' => 15000,
                    'subtotal' => 15000,
                ],
            ],
            'total_amount' => 15000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $html = (new \App\Mail\OrderConfirmationMail($order))->render();

        $this->assertStringNotContainsString('apartados en nuestro inventario', $html);
        $this->assertStringContainsString('se confirman al coordinar el pedido', $html);
    }

    public function test_checkout_rejects_orders_exceeding_30_distinct_items(): void
    {
        $book = Book::create([
            'isbn' => '9789870000310',
            'title' => 'Libro Límite Checkout',
            'price' => 10000.00,
            'stock' => 50,
            'is_active' => true,
            'language' => 'es',
        ]);
        $items = array_fill(0, 31, [
            'id' => $book->id,
            'type' => 'BOOK',
            'title' => $book->title,
            'quantity' => 1,
            'unit_price' => (float) $book->price,
        ]);

        $response = $this->postJson('/pedidos/lead', [
            'customer_name' => 'Cliente Masivo',
            'customer_phone' => '5493875123456',
            'customer_email' => 'masivo@example.com',
            'customer_dni' => '34123456',
            'items' => $items,
            'total_amount' => 1000,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items']);
    }
}
