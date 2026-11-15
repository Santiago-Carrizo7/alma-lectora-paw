<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Combo;
use App\Models\ComboBook;
use App\Models\User;
use Database\Seeders\BookSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminBookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BookSeeder::class);
    }

    public function test_guests_are_redirected_to_login_when_accessing_admin_routes(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login');

        $booksResponse = $this->get('/admin/libros');
        $booksResponse->assertRedirect('/login');
    }

    public function test_non_admin_users_are_forbidden_from_accessing_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->get('/admin');
        $response->assertForbidden();

        $booksResponse = $this->actingAs($user)->get('/admin/libros');
        $booksResponse->assertForbidden();
    }

    public function test_admin_can_view_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
        );
    }

    public function test_admin_can_view_books_index_with_pagination_and_tabs(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/libros');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Books/Index')
            ->has('books.data')
            ->has('books.links')
            ->where('filters.tab', 'available')
            ->has('counts.available')
            ->has('counts.archived')
        );
    }

    public function test_admin_can_view_create_book_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/libros/nuevo');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Books/Form')
            ->has('authors')
        );
    }

    public function test_admin_can_store_a_book_with_existing_and_new_authors(): void
    {
        $admin = User::factory()->admin()->create();
        $existingAuthor = Author::first();

        $response = $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => '9789870011223',
            'title' => 'El Imperio Final (Edición Especial)',
            'price' => 24500.50,
            'stock' => 15,
            'genre' => 'Fantasía Épica',
            'badge' => 'Novedad',
            'is_active' => true,
            'authors' => [
                $existingAuthor->id,
                'Autor Nuevo PAW',
            ],
        ]);

        $response->assertRedirect('/admin/libros');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('books', [
            'isbn' => '9789870011223',
            'title' => 'El Imperio Final (Edición Especial)',
            'stock' => 15,
            'is_active' => true,
        ]);

        $newAuthor = Author::where('name', 'Autor Nuevo PAW')->first();
        $this->assertNotNull($newAuthor);

        $createdBook = Book::where('isbn', '9789870011223')->first();
        $this->assertTrue($createdBook->authors->contains($existingAuthor));
        $this->assertTrue($createdBook->authors->contains($newAuthor));
    }

    public function test_storing_book_requires_mandatory_and_unique_isbn(): void
    {
        $admin = User::factory()->admin()->create();
        $existingBook = Book::first();

        // Missing ISBN
        $responseWithoutIsbn = $this->actingAs($admin)->post('/admin/libros', [
            'title' => 'Libro sin ISBN',
            'price' => 10000,
            'stock' => 5,
        ]);
        $responseWithoutIsbn->assertSessionHasErrors(['isbn']);

        // Duplicate ISBN
        $responseDuplicateIsbn = $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => $existingBook->isbn,
            'title' => 'Libro con ISBN Repetido',
            'price' => 12000,
            'stock' => 3,
        ]);
        $responseDuplicateIsbn->assertSessionHasErrors(['isbn']);
    }

    public function test_admin_can_view_edit_book_page(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();

        $response = $this->actingAs($admin)->get("/admin/libros/{$book->id}/editar");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Books/Form')
            ->where('book.id', $book->id)
            ->has('authors')
        );
    }

    public function test_admin_can_update_book(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();

        $response = $this->actingAs($admin)->put("/admin/libros/{$book->id}", [
            'isbn' => $book->isbn,
            'title' => 'Título Modificado Test',
            'price' => 29990.00,
            'stock' => 42,
            'genre' => 'Filosofía',
            'is_active' => false,
            'authors' => [],
        ]);

        $response->assertRedirect('/admin/libros');
        $response->assertSessionHas('success');

        $book->refresh();
        $this->assertEquals('Título Modificado Test', $book->title);
        $this->assertEquals(42, $book->stock);
        $this->assertFalse($book->is_active);
    }

    public function test_admin_can_soft_delete_book(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();

        $response = $this->actingAs($admin)->delete("/admin/libros/{$book->id}");

        $response->assertSessionHas('success');
        $this->assertSoftDeleted('books', ['id' => $book->id]);
    }

    public function test_admin_can_restore_soft_deleted_book(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();
        $book->delete();
        $this->assertSoftDeleted('books', ['id' => $book->id]);

        $response = $this->actingAs($admin)->patch("/admin/libros/{$book->id}/restaurar");

        $response->assertSessionHas('success');
        $this->assertNotSoftDeleted('books', ['id' => $book->id]);
    }

    public function test_admin_can_force_delete_book(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();
        $bookId = $book->id;

        $response = $this->actingAs($admin)->delete("/admin/libros/{$bookId}/forzar");

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('books', ['id' => $bookId]);
    }

    public function test_admin_can_update_book_stock(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();

        $response = $this->actingAs($admin)->patch("/admin/libros/{$book->id}/stock", [
            'stock' => 88,
        ]);

        $response->assertSessionHas('success');
        $book->refresh();
        $this->assertEquals(88, $book->stock);
    }

    public function test_admin_can_toggle_book_active_status(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();
        $initialStatus = $book->is_active;

        $response = $this->actingAs($admin)->patch("/admin/libros/{$book->id}/toggle-active");

        $response->assertSessionHas('success');
        $book->refresh();
        $this->assertEquals(!$initialStatus, $book->is_active);
    }

    public function test_admin_cannot_force_delete_book_that_belongs_to_a_combo(): void
    {
        $admin = User::factory()->admin()->create();
        $book = Book::first();
        $combo = Combo::create([
            'title' => 'Combo Protegido',
            'price' => 25000,
            'stock' => 3,
            'is_active' => true,
        ]);
        ComboBook::create([
            'combo_id' => $combo->id,
            'book_id' => $book->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/libros/{$book->id}/forzar");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('books', ['id' => $book->id]);
        $this->assertDatabaseHas('combo_books', ['combo_id' => $combo->id, 'book_id' => $book->id]);
    }

    public function test_admin_can_upload_replace_delete_local_images_and_enforce_additional_images_limit(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        // Upload two local images
        $upload1 = $this->actingAs($admin)->postJson('/admin/upload-image', [
            'image' => UploadedFile::fake()->image('cover1.png', 200, 300),
        ]);
        $upload1->assertOk();
        $url1 = $upload1->json('url');
        $this->assertStringStartsWith('/storage/uploads/', $url1);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $url1));

        $upload2 = $this->actingAs($admin)->postJson('/admin/upload-image', [
            'image' => UploadedFile::fake()->image('cover2.png', 200, 300),
        ]);
        $upload2->assertOk();
        $url2 = $upload2->json('url');

        // Store book with url1
        $this->actingAs($admin)->post('/admin/libros', [
            'isbn' => '9789870099881',
            'title' => 'Libro con Portada Local',
            'price' => 18000,
            'stock' => 5,
            'cover_url' => $url1,
            'additional_images' => [$url2],
            'is_active' => true,
            'authors' => [],
        ])->assertRedirect('/admin/libros');

        $book = Book::where('isbn', '9789870099881')->firstOrFail();

        // Reject deleting still-referenced upload via endpoint
        $this->actingAs($admin)->deleteJson('/admin/upload-image', ['url' => $url1])
            ->assertOk()
            ->assertJson(['deleted' => false]);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $url1));

        // Reject path traversal
        $this->actingAs($admin)->deleteJson('/admin/upload-image', ['url' => '/storage/uploads/../secret.png'])
            ->assertStatus(422);

        // Enforce max:3 additional_images
        $this->actingAs($admin)->put("/admin/libros/{$book->id}", [
            'isbn' => $book->isbn,
            'title' => $book->title,
            'price' => 18000,
            'stock' => 5,
            'cover_url' => $url1,
            'additional_images' => ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'],
            'is_active' => true,
            'authors' => [],
        ])->assertSessionHasErrors(['additional_images']);

        // Replacing cover_url with url2 cleans up orphaned url1
        $this->actingAs($admin)->put("/admin/libros/{$book->id}", [
            'isbn' => $book->isbn,
            'title' => $book->title,
            'price' => 18000,
            'stock' => 5,
            'cover_url' => $url2,
            'additional_images' => [],
            'is_active' => true,
            'authors' => [],
        ])->assertRedirect('/admin/libros');

        Storage::disk('public')->assertMissing(str_replace('/storage/', '', $url1));
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $url2));

        // Unreferenced upload can be deleted explicitly
        $upload3 = $this->actingAs($admin)->postJson('/admin/upload-image', [
            'image' => UploadedFile::fake()->image('temp.png', 100, 100),
        ])->assertOk();
        $url3 = $upload3->json('url');
        $this->actingAs($admin)->deleteJson('/admin/upload-image', ['url' => $url3])
            ->assertOk()
            ->assertJson(['deleted' => true]);
        Storage::disk('public')->assertMissing(str_replace('/storage/', '', $url3));
    }
}
