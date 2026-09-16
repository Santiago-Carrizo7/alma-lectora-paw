<?php

namespace Tests\Feature;

use App\Models\Accessory;
use Database\Seeders\AccessorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccessoryCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AccessorySeeder::class);
    }

    public function test_accessories_page_can_be_rendered(): void
    {
        $response = $this->get('/accesorios');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/AccessoriesPage')
            ->has('accessories.data')
            ->has('categories')
            ->has('filters')
        );
    }

    public function test_accessories_can_be_filtered_by_category(): void
    {
        $response = $this->get('/accesorios?category=velas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/AccessoriesPage')
            ->where('filters.category', 'velas')
            ->has('accessories.data')
        );
    }

    public function test_accessories_can_be_filtered_by_search(): void
    {
        $response = $this->get('/accesorios?search=Invierno');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/AccessoriesPage')
            ->where('filters.search', 'Invierno')
            ->has('accessories.data')
        );
    }

    public function test_accessory_detail_page_can_be_rendered(): void
    {
        $accessory = Accessory::first();
        $this->assertNotNull($accessory);

        $response = $this->get("/accesorios/{$accessory->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/AccessoryDetailPage')
            ->where('accessory.id', $accessory->id)
            ->has('relatedAccessories')
        );
    }

    public function test_inactive_accessory_returns_404_for_guest(): void
    {
        $accessory = Accessory::create([
            'title' => 'Inactivo',
            'price' => 1000,
            'stock' => 0,
            'category' => 'velas',
            'is_active' => false,
        ]);

        $response = $this->get("/accesorios/{$accessory->id}");
        $response->assertStatus(404);
    }
}
