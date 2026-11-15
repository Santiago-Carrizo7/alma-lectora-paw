<?php

namespace Tests\Feature;

use App\Models\Accessory;
use App\Models\Book;
use App\Models\OrderLead;
use Database\Seeders\AccessorySeeder;
use Database\Seeders\BookSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            BookSeeder::class,
            AccessorySeeder::class,
        ]);
    }

    public function test_home_page_can_be_rendered(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/HomePage')
            ->has('bestSellers')
            ->has('featuredBooks')
            ->has('novelties')
            ->has('featuredAccessories')
        );
    }

    public function test_home_page_calculates_best_sellers_dynamically_from_confirmed_orders_and_separates_featured(): void
    {
        $bookA = Book::create([
            'isbn' => '9789879990001',
            'title' => 'Top Seller Book A',
            'price' => 12000,
            'stock' => 20,
            'badge' => 'Novedad',
            'is_active' => true,
        ]);

        $bookB = Book::create([
            'isbn' => '9789879990002',
            'title' => 'Second Seller Book B',
            'price' => 14000,
            'stock' => 20,
            'badge' => 'Destacado',
            'is_active' => true,
        ]);

        OrderLead::create([
            'customer_name' => 'Cliente 1',
            'customer_phone' => '3875000001',
            'customer_email' => 'c1@test.com',
            'customer_dni' => '30000001',
            'items' => [
                ['id' => $bookA->id, 'type' => 'BOOK', 'title' => $bookA->title, 'quantity' => 10, 'unit_price' => 12000],
                ['id' => $bookB->id, 'type' => 'BOOK', 'title' => $bookB->title, 'quantity' => 4, 'unit_price' => 14000],
            ],
            'total_amount' => 176000,
            'status' => 'CONFIRMED',
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/HomePage')
            ->where('bestSellers.0.id', $bookA->id)
            ->where('bestSellers.0.badge', 'Más vendido')
            ->where('bestSellers.1.id', $bookB->id)
            ->where('bestSellers.1.badge', 'Más vendido')
            ->has('featuredBooks')
        );
    }
}
