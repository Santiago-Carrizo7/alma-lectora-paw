<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\User;
use Database\Seeders\BookSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
