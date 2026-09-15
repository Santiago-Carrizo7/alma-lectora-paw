<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use Database\Seeders\BookSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(BookSeeder::class);
    }
    public function test_catalog_page_can_be_rendered(): void
    {
        $response = $this->get('/libros');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/BooksPage')
            ->has('books')
            ->has('filters')
            ->has('genres')
        );
    }

    public function test_catalog_can_be_filtered_by_search(): void
    {
        $response = $this->get('/libros?search=Boulevard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/BooksPage')
            ->where('filters.search', 'Boulevard')
            ->has('books')
        );
    }

    public function test_book_detail_page_can_be_rendered(): void
    {
        $book = Book::first();
        $this->assertNotNull($book);

        $response = $this->get("/libros/{$book->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/BookDetailPage')
            ->where('book.id', $book->id)
            ->has('book.authors')
        );
    }
}
