<?php

namespace Tests\Feature;

use App\Models\Accessory;
use App\Models\Book;
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
            ->has('novelties')
            ->has('featuredAccessories')
        );
    }
}
