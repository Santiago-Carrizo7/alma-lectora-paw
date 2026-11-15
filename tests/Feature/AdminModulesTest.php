<?php

namespace Tests\Feature;

use App\Models\Accessory;
use App\Models\AccessoryCategory;
use App\Models\Book;
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

    public function test_confirming_order_decrements_stock_and_cancelling_restores_stock(): void
    {
        $admin = User::factory()->admin()->create();

        $book = Book::create([
            'isbn' => '9789870007777',
            'title' => 'Rayuela',
            'price' => 18000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $comboComponentBook = Book::create([
            'isbn' => '9789870008888',
            'title' => 'Bestiario',
            'price' => 12000,
            'stock' => 6,
            'is_active' => true,
        ]);

        $combo = Combo::create([
            'title' => 'Combo Cortázar',
            'price' => 25000,
            'stock' => 4,
            'is_active' => true,
        ]);
        \App\Models\ComboBook::create([
            'combo_id' => $combo->id,
            'book_id' => $comboComponentBook->id,
            'quantity' => 2,
        ]);

        $order = OrderLead::create([
            'customer_name' => 'Julio Cortázar',
            'customer_phone' => '3875111222',
            'customer_email' => 'julio@test.com',
            'customer_dni' => '20111222',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 2,
                    'unit_price' => 18000,
                ],
                [
                    'id' => $combo->id,
                    'type' => 'COMBO',
                    'title' => $combo->title,
                    'quantity' => 1,
                    'unit_price' => 25000,
                ],
            ],
            'total_amount' => 61000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        // Rejecting a pending order moves it to CANCELLED without altering any stock
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CANCELLED',
        ]);
        $this->assertEquals('CANCELLED', $order->fresh()->status);
        $this->assertEquals(5, $book->fresh()->stock);
        $this->assertEquals(4, $combo->fresh()->stock);
        $this->assertEquals(6, $comboComponentBook->fresh()->stock);

        // Direct transition from CANCELLED to CONFIRMED is rejected by transition matrix (H-26)
        $blockedResponse = $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $blockedResponse->assertSessionHasErrors('status');
        $this->assertEquals('CANCELLED', $order->fresh()->status);

        // Reactivate cancelled order to PENDING_WHATSAPP without altering stock (H-44)
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'PENDING_WHATSAPP',
        ]);
        $this->assertEquals('PENDING_WHATSAPP', $order->fresh()->status);

        // Confirm order -> book goes 5->3, combo goes 4->3, comboComponentBook goes 6->4
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $this->assertEquals('CONFIRMED', $order->fresh()->status);
        $this->assertEquals(3, $book->fresh()->stock);
        $this->assertEquals(3, $combo->fresh()->stock);
        $this->assertEquals(4, $comboComponentBook->fresh()->stock);

        // Cancel confirmed order -> stock goes back to 5, 4, 6
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CANCELLED',
        ]);
        $this->assertEquals('CANCELLED', $order->fresh()->status);
        $this->assertEquals(5, $book->fresh()->stock);
        $this->assertEquals(4, $combo->fresh()->stock);
        $this->assertEquals(6, $comboComponentBook->fresh()->stock);

        // Reactivate to PENDING_WHATSAPP, then attempt to confirm when stock is insufficient
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'PENDING_WHATSAPP',
        ]);
        $book->update(['stock' => 1]);
        $failResponse = $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $failResponse->assertSessionHasErrors('stock');
        $this->assertEquals('PENDING_WHATSAPP', $order->fresh()->status);
        $this->assertEquals(1, $book->fresh()->stock);
    }

    public function test_rich_text_fields_strip_dangerous_html_on_save(): void
    {
        $admin = User::factory()->admin()->create();
        $category = AccessoryCategory::create([
            'slug' => 'SEGURIDAD',
            'label' => 'Seguridad',
            'emoji' => '🔖',
            'order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($admin)->post('/admin/accesorios', [
            'title' => 'Señalador Seguro',
            'description' => '<p onmouseover="alert(1)">Texto limpio</p><script>alert("xss")</script><strong>Negrita</strong>',
            'price' => 3500,
            'stock' => 10,
            'category_id' => $category->id,
            'is_active' => true,
        ])->assertRedirect('/admin/accesorios');

        $accessory = Accessory::where('title', 'Señalador Seguro')->firstOrFail();
        $this->assertSame('<p>Texto limpio</p><strong>Negrita</strong>', $accessory->description);
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
            'whatsapp_phone' => '5493875999888',
            'instagram_url' => 'https://instagram.com/alma.lectora.al',
            'is_store_open' => false,
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('store_config', [
            'whatsapp_phone' => '5493875999888',
            'instagram_url' => 'https://instagram.com/alma.lectora.al',
            'is_store_open' => false,
        ]);
    }

    public function test_admin_catalogs_support_combinable_filters_sorting_and_dynamic_exports(): void
    {
        $admin = User::factory()->admin()->create();

        $bookLow = Book::create([
            'isbn' => '9789870001001',
            'title' => 'Alpha Libro',
            'price' => 30000,
            'stock' => 2,
            'genre' => 'Fantasía',
            'is_active' => true,
        ]);
        $bookHigh = Book::create([
            'isbn' => '9789870001002',
            'title' => 'Beta Libro',
            'price' => 10000,
            'stock' => 10,
            'genre' => 'Fantasía',
            'is_active' => true,
        ]);
        $bookArchived = Book::create([
            'isbn' => '9789870001003',
            'title' => 'Gamma Archivado',
            'price' => 15000,
            'stock' => 0,
            'genre' => 'Historia',
            'is_active' => false,
        ]);
        $bookArchived->delete();

        // Filter by genre + sort by price_asc
        $response = $this->actingAs($admin)->get('/admin/libros?genre=Fantasía&sort=price_asc');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Books/Index')
            ->has('books.data', 2)
            ->where('books.data.0.id', $bookHigh->id)
            ->where('books.data.1.id', $bookLow->id)
        );

        // Filter by low_stock (1 to 3)
        $lowStockResp = $this->actingAs($admin)->get('/admin/libros?stock_status=low_stock');
        $lowStockResp->assertStatus(200);
        $lowStockResp->assertInertia(fn (Assert $page) => $page
            ->has('books.data', 1)
            ->where('books.data.0.id', $bookLow->id)
        );

        // Verify global vs filtered query on BooksExport
        $globalExport = new \App\Exports\BooksExport([]);
        $this->assertEquals(3, $globalExport->query()->count());

        $filteredExport = new \App\Exports\BooksExport(['stock_status' => 'low_stock', 'tab' => 'available']);
        $this->assertEquals(1, $filteredExport->query()->count());

        // Download endpoint returns 200
        $this->actingAs($admin)->get('/admin/libros/export?sort=price_desc')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/accesorios/export')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/combos/export')->assertStatus(200);
    }

    public function test_admin_can_update_accessory_with_category_and_rejects_nonexistent_category(): void
    {
        $admin = User::factory()->admin()->create();
        $catVelas = AccessoryCategory::create([
            'slug' => 'VELAS',
            'label' => 'Velas Aromáticas',
            'order' => 1,
            'is_active' => true,
        ]);
        $catSeparadores = AccessoryCategory::create([
            'slug' => 'SEPARADORES',
            'label' => 'Separadores',
            'order' => 2,
            'is_active' => true,
        ]);

        // Reject nonexistent category with 422 validation error, never 500
        $badResponse = $this->actingAs($admin)->post('/admin/accesorios', [
            'title' => 'Accesorio Inválido',
            'price' => 3000,
            'stock' => 5,
            'category' => 'INEXISTENTE',
            'is_active' => true,
        ]);
        $badResponse->assertSessionHasErrors('category');
        $this->assertDatabaseMissing('accessories', ['title' => 'Accesorio Inválido']);

        $accessory = Accessory::create([
            'title' => 'Vela Inicial',
            'price' => 4000,
            'stock' => 10,
            'category_id' => $catVelas->id,
            'is_active' => true,
        ]);

        $updateResponse = $this->actingAs($admin)->put("/admin/accesorios/{$accessory->id}", [
            'title' => 'Separador Editado',
            'price' => 4500,
            'stock' => 12,
            'category_id' => $catSeparadores->id,
            'is_active' => true,
        ]);
        $updateResponse->assertRedirect('/admin/accesorios');
        $this->assertEquals($catSeparadores->id, $accessory->fresh()->category_id);
    }

    public function test_confirming_order_accumulates_combo_components_and_duplicate_items_preventing_negative_stock(): void
    {
        $admin = User::factory()->admin()->create();

        $bookA = Book::create([
            'isbn' => '9789870009001',
            'title' => 'Libro Componente A',
            'price' => 15000,
            'stock' => 3,
            'is_active' => true,
        ]);

        $comboC = Combo::create([
            'title' => 'Combo Con A',
            'price' => 20000,
            'stock' => 1,
            'is_active' => true,
        ]);

        \App\Models\ComboBook::create([
            'combo_id' => $comboC->id,
            'book_id' => $bookA->id,
            'quantity' => 1,
        ]);

        // 1 Combo (requires 1 Book A) + 3 Book A = 4 Book A > 3 available
        $failingOrder = OrderLead::create([
            'customer_name' => 'Cliente Excedido',
            'customer_phone' => '3875000111',
            'customer_email' => 'excedido@test.com',
            'customer_dni' => '30000111',
            'items' => [
                [
                    'id' => $comboC->id,
                    'type' => 'COMBO',
                    'title' => $comboC->title,
                    'quantity' => 1,
                    'unit_price' => 20000,
                ],
                [
                    'id' => $bookA->id,
                    'type' => 'BOOK',
                    'title' => $bookA->title,
                    'quantity' => 3,
                    'unit_price' => 15000,
                ],
            ],
            'total_amount' => 65000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $failResponse = $this->actingAs($admin)->patch("/admin/pedidos/{$failingOrder->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $failResponse->assertSessionHasErrors('stock');
        $this->assertEquals('PENDING_WHATSAPP', $failingOrder->fresh()->status);
        $this->assertEquals(3, $bookA->fresh()->stock);
        $this->assertEquals(1, $comboC->fresh()->stock);

        // 1 Combo (1 A) + 2 A = 3 A -> succeeds, leaving exact 0 stock (never negative)
        $validOrder = OrderLead::create([
            'customer_name' => 'Cliente Exacto',
            'customer_phone' => '3875000222',
            'customer_email' => 'exacto@test.com',
            'customer_dni' => '30000222',
            'items' => [
                [
                    'id' => $comboC->id,
                    'type' => 'COMBO',
                    'title' => $comboC->title,
                    'quantity' => 1,
                    'unit_price' => 20000,
                ],
                [
                    'id' => $bookA->id,
                    'type' => 'BOOK',
                    'title' => $bookA->title,
                    'quantity' => 2,
                    'unit_price' => 15000,
                ],
            ],
            'total_amount' => 50000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $okResponse = $this->actingAs($admin)->patch("/admin/pedidos/{$validOrder->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $okResponse->assertSessionHasNoErrors();
        $this->assertEquals('CONFIRMED', $validOrder->fresh()->status);
        $this->assertEquals(0, $bookA->fresh()->stock);
        $this->assertEquals(0, $comboC->fresh()->stock);
    }

    public function test_confirming_order_is_idempotent_and_does_not_double_decrement_stock(): void
    {
        $admin = User::factory()->admin()->create();

        $book = Book::create([
            'isbn' => '9789870009002',
            'title' => 'Libro Idempotencia',
            'price' => 10000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $order = OrderLead::create([
            'customer_name' => 'Cliente Doble Clic',
            'customer_phone' => '3875000333',
            'customer_email' => 'doble@test.com',
            'customer_dni' => '30000333',
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 2,
                    'unit_price' => 10000,
                ],
            ],
            'total_amount' => 20000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", ['status' => 'CONFIRMED'])
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)->patch("/admin/pedidos/{$order->id}/estado", ['status' => 'CONFIRMED'])
            ->assertSessionHasNoErrors();

        $this->assertEquals('CONFIRMED', $order->fresh()->status);
        $this->assertEquals(3, $book->fresh()->stock);
    }

    public function test_admin_can_create_rename_and_delete_genres_without_false_success(): void
    {
        $admin = User::factory()->admin()->create();

        $book = Book::create([
            'isbn' => '9789870009003',
            'title' => 'Libro de Poesía',
            'price' => 12000,
            'stock' => 4,
            'genre' => 'Lírica',
            'is_active' => true,
        ]);

        // Create a real genre
        $this->actingAs($admin)->post('/admin/configuracion/generos', [
            'name' => 'Realismo Mágico',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('book_genres', ['name' => 'Realismo Mágico']);

        // Reject duplicate case-insensitively
        $this->actingAs($admin)->post('/admin/configuracion/generos', [
            'name' => 'realismo mágico',
        ])->assertSessionHasErrors('name');

        // Reject renaming a nonexistent genre (old = new) instead of false success
        $this->actingAs($admin)->put('/admin/configuracion/generos', [
            'old_name' => 'Género Inexistente',
            'new_name' => 'Género Inexistente',
        ])->assertSessionHasErrors('old_name');

        // Renaming an existing genre updates both book_genres and books
        $this->actingAs($admin)->put('/admin/configuracion/generos', [
            'old_name' => 'Lírica',
            'new_name' => 'Poesía Contemporánea',
        ])->assertSessionHasNoErrors();

        $this->assertEquals('Poesía Contemporánea', $book->fresh()->genre);
        $this->assertDatabaseHas('book_genres', ['name' => 'Poesía Contemporánea']);

        // Delete existing genre removes it from book_genres and unlinks books
        $this->actingAs($admin)->delete('/admin/configuracion/generos', [
            'name' => 'Poesía Contemporánea',
        ])->assertSessionHasNoErrors();

        $this->assertNull($book->fresh()->genre);
        $this->assertDatabaseMissing('book_genres', ['name' => 'Poesía Contemporánea']);
    }

    public function test_confirmed_order_cannot_be_deleted_and_archived_products_behave_safely(): void
    {
        $admin = User::factory()->admin()->create();

        $book = Book::create([
            'isbn' => '9789870009010',
            'title' => 'Libro Archivable',
            'price' => 10000,
            'stock' => 5,
            'is_active' => true,
        ]);

        // Archived book in pending order must report archived message on confirm (H-06)
        $archivedOrder = OrderLead::create([
            'customer_name' => 'Cliente Archivo',
            'customer_phone' => '5493875000010',
            'customer_email' => 'archivo@example.com',
            'customer_dni' => '30000010',
            'items' => [
                ['id' => $book->id, 'type' => 'BOOK', 'title' => $book->title, 'quantity' => 1, 'unit_price' => 10000],
            ],
            'total_amount' => 10000,
            'status' => 'PENDING_WHATSAPP',
        ]);

        $book->delete(); // soft delete

        $confirmArchived = $this->actingAs($admin)->patch("/admin/pedidos/{$archivedOrder->id}/estado", [
            'status' => 'CONFIRMED',
        ]);
        $confirmArchived->assertSessionHasErrors(['stock']);
        $stockErrors = session('errors')->get('stock');
        $this->assertStringContainsString('archivado', $stockErrors[0]);

        $book->restore();

        // Confirm valid order, then verify direct delete is blocked (H-05)
        $this->actingAs($admin)->patch("/admin/pedidos/{$archivedOrder->id}/estado", [
            'status' => 'CONFIRMED',
        ])->assertSessionHasNoErrors();
        $this->assertEquals(4, $book->fresh()->stock);

        $this->actingAs($admin)->delete("/admin/pedidos/{$archivedOrder->id}")
            ->assertSessionHas('error');
        $this->assertDatabaseHas('order_leads', ['id' => $archivedOrder->id, 'status' => 'CONFIRMED']);

        // Soft-delete book while order is confirmed, then cancel -> stock still restores (H-07)
        $book->delete();
        $this->actingAs($admin)->patch("/admin/pedidos/{$archivedOrder->id}/estado", [
            'status' => 'CANCELLED',
        ])->assertSessionHas('success');
        $this->assertEquals(5, Book::withTrashed()->find($book->id)->stock);

        // Cancelled order can now be deleted safely
        $this->actingAs($admin)->delete("/admin/pedidos/{$archivedOrder->id}")
            ->assertSessionHas('success');
        $this->assertDatabaseMissing('order_leads', ['id' => $archivedOrder->id]);
    }

    public function test_admin_cannot_force_delete_accessory_belonging_to_a_combo(): void
    {
        $admin = User::factory()->admin()->create();
        $category = AccessoryCategory::create([
            'slug' => 'SENALADORES',
            'label' => 'Señaladores',
            'order' => 1,
            'is_active' => true,
        ]);
        $accessory = Accessory::create([
            'title' => 'Señalador Combo',
            'category_id' => $category->id,
            'category' => $category->slug,
            'price' => 1500,
            'stock' => 4,
            'is_active' => true,
        ]);
        $combo = Combo::create([
            'title' => 'Combo Lector',
            'price' => 12000,
            'stock' => 2,
            'is_active' => true,
        ]);
        \App\Models\ComboAccessory::create([
            'combo_id' => $combo->id,
            'accessory_id' => $accessory->id,
            'quantity' => 1,
        ]);

        $this->actingAs($admin)->delete("/admin/accesorios/{$accessory->id}/forzar")
            ->assertSessionHas('error');
        $this->assertDatabaseHas('accessories', ['id' => $accessory->id]);
    }

    public function test_seeders_are_idempotent_normalize_prices_and_preserve_stock(): void
    {
        $this->seed(\Database\Seeders\BookSeeder::class);
        $this->seed(\Database\Seeders\AccessorySeeder::class);
        $this->seed(\Database\Seeders\OrderLeadSeeder::class);

        $initialOrders = OrderLead::count();
        $this->assertGreaterThan(0, $initialOrders);

        // Modify stock of an existing book and re-run seeders
        $book = Book::firstOrFail();
        $book->update(['stock' => 77]);

        $this->seed(\Database\Seeders\BookSeeder::class);
        $this->seed(\Database\Seeders\AccessorySeeder::class);
        $this->seed(\Database\Seeders\OrderLeadSeeder::class);

        // H-31: no duplicate orders
        $this->assertEquals($initialOrders, OrderLead::count());

        // H-32: stock preserved across re-seed
        $this->assertEquals(77, $book->fresh()->stock);

        // H-30: normalized items contain unit_price and subtotal
        $sampleOrder = OrderLead::firstOrFail();
        $firstItem = $sampleOrder->items[0] ?? [];
        $this->assertArrayHasKey('unit_price', $firstItem);
        $this->assertArrayHasKey('subtotal', $firstItem);
    }

    public function test_genres_and_authors_normalize_accents_and_casing_and_spanish_pagination_exists(): void
    {
        $admin = User::factory()->admin()->create();
        $existingAuthor = \App\Models\Author::create(['name' => 'Gabriel García Márquez']);

        // Store book with mixed-case / unaccented genre and unaccented author name
        $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => '9789879990001',
            'title' => 'Prueba Normalización',
            'price' => 15000,
            'stock' => 5,
            'genre' => 'FANtasía',
            'is_active' => true,
            'authors' => ['gabriel garcia marquez'],
        ])->assertRedirect('/admin/libros');

        $book = Book::where('isbn', '9789879990001')->firstOrFail();
        $this->assertSame('Fantasía', $book->genre);
        $this->assertCount(1, $book->authors);
        $this->assertSame($existingAuthor->id, $book->authors->first()->id);
        $this->assertSame(1, \App\Models\Author::where('name', 'like', '%Márquez%')->count());

        // New genre saves in clean Title Case, and unaccented duplicate is rejected
        $this->actingAs($admin)->post('/admin/configuracion/generos', [
            'name' => 'cuentos DE misterio',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('book_genres', ['name' => 'Cuentos de Misterio']);

        $this->actingAs($admin)->post('/admin/configuracion/generos', [
            'name' => 'fantasia',
        ])->assertSessionHasErrors('name');

        // Spanish pagination translations exist instead of falling back to raw keys
        app()->setLocale('es');
        $this->assertSame('&laquo; Anterior', __('pagination.previous'));
        $this->assertSame('Siguiente &raquo;', __('pagination.next'));
    }
}
