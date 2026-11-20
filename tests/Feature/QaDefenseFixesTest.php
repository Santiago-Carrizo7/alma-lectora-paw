<?php

namespace Tests\Feature;

use App\Models\AccessoryCategory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QaDefenseFixesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()->setLocale('es');
    }

    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Lectora Nueva',
            'email' => 'lectora@example.com',
            'dni' => '35123456',
            'phone' => '5493875123456',
            'address' => 'Av. San Martín 123',
            'postal_code' => '4400',
            'password' => 'password',
            'password_confirmation' => 'password',
        ], $overrides);
    }

    public function test_duplicate_email_registration_shows_spanish_message(): void
    {
        User::factory()->create(['email' => 'lectora@example.com']);

        $response = $this->post('/register', $this->registrationPayload());

        $response->assertSessionHasErrors([
            'email' => 'El correo electrónico ya está en uso.',
        ]);
    }

    public function test_registration_validation_messages_are_translated(): void
    {
        $response = $this->post('/register', $this->registrationPayload([
            'name' => '',
            'password' => 'abc',
            'password_confirmation' => 'xyz',
        ]));

        $response->assertSessionHasErrors([
            'name' => 'El campo nombre es obligatorio.',
            'password' => 'La confirmación del campo contraseña no coincide.',
        ]);

        $errors = session('errors')->getBag('default')->all();
        foreach ($errors as $message) {
            $this->assertStringNotContainsString('validation.', $message);
        }
    }

    public function test_book_promo_not_cheaper_than_regular_price_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => '9789870099001',
            'title' => 'Libro Promo Cara',
            'price' => 18000,
            'stock' => 5,
            'promo_quantity' => 2,
            'promo_price' => 42000,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors([
            'promo_price' => 'El precio promocional debe ser menor que $36.000 (precio normal × cantidad).',
        ]);
        $this->assertDatabaseMissing('books', ['isbn' => '9789870099001']);
    }

    public function test_book_promo_requires_both_quantity_and_price(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::create(['isbn' => '9789870099002', 'title' => 'Libro', 'price' => 18000, 'stock' => 5, 'is_active' => true]);

        $response = $this->actingAs($admin)->put("/admin/libros/{$book->id}", [
            'isbn' => '9789870099002',
            'title' => 'Libro',
            'price' => 18000,
            'stock' => 5,
            'promo_quantity' => 2,
        ]);

        $response->assertSessionHasErrors('promo_price');
        $this->assertNull($book->fresh()->promo_quantity);
    }

    public function test_cheaper_book_promo_is_accepted(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => '9789870099003',
            'title' => 'Libro Promo Real',
            'price' => 18000,
            'stock' => 5,
            'promo_quantity' => 2,
            'promo_price' => 32000,
            'is_active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('books', ['isbn' => '9789870099003', 'promo_quantity' => 2]);
    }

    public function test_accessory_promo_not_cheaper_than_regular_price_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        AccessoryCategory::create(['slug' => 'VELAS', 'label' => 'Velas', 'order' => 1, 'is_active' => true]);

        $response = $this->actingAs($admin)->post('/admin/accesorios', [
            'title' => 'Vela Promo Cara',
            'price' => 5000,
            'stock' => 5,
            'category' => 'VELAS',
            'promo_quantity' => 3,
            'promo_price' => 15000,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('promo_price');
        $this->assertDatabaseMissing('accessories', ['title' => 'Vela Promo Cara']);
    }

    public function test_book_seeder_drops_promotions_more_expensive_than_regular_price(): void
    {
        $this->seed(\Database\Seeders\BookSeeder::class);

        $overpriced = Book::withTrashed()
            ->whereNotNull('promo_quantity')
            ->whereRaw('promo_price >= price * promo_quantity')
            ->count();
        $halfPromos = Book::withTrashed()
            ->where(fn ($q) => $q->whereNull('promo_quantity')->whereNotNull('promo_price'))
            ->orWhere(fn ($q) => $q->whereNotNull('promo_quantity')->whereNull('promo_price'))
            ->count();

        $this->assertSame(0, $overpriced);
        $this->assertSame(0, $halfPromos);
        $this->assertGreaterThan(0, Book::whereNotNull('promo_quantity')->count());
    }

    public function test_combo_promo_update_not_cheaper_than_regular_price_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $combo = Combo::create(['title' => 'Combo', 'price' => 20000, 'stock' => 3, 'is_active' => true]);

        $response = $this->actingAs($admin)->put("/admin/combos/{$combo->id}", [
            'title' => 'Combo',
            'price' => 20000,
            'stock' => 3,
            'promo_quantity' => 2,
            'promo_price' => 40000,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('promo_price');
        $this->assertNull($combo->fresh()->promo_price);
    }
}
