<?php

namespace Database\Seeders;

use App\Models\Accessory;
use App\Models\AccessoryCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class AccessorySeeder extends Seeder
{
    public function run(): void
    {
        $backupFile = database_path('seeders/backup_data.json');

        if (File::exists($backupFile)) {
            $data = json_decode(File::get($backupFile), true);
            $tables = $data['tables'] ?? $data;
            $categories = $tables['accessoryCategories'] ?? [];
            $accessories = $tables['accessories'] ?? [];

            foreach ($categories as $cat) {
                AccessoryCategory::updateOrCreate(
                    ['id' => $cat['id']],
                    [
                        'slug' => $cat['slug'],
                        'label' => $cat['label'],
                        'emoji' => $cat['emoji'] ?? null,
                        'order' => $cat['order'] ?? 0,
                        'is_active' => $cat['isActive'] ?? true,
                        'created_at' => $cat['createdAt'] ?? now(),
                        'updated_at' => $cat['updatedAt'] ?? now(),
                    ]
                );
            }

            foreach ($accessories as $acc) {
                Accessory::updateOrCreate(
                    ['id' => $acc['id']],
                    [
                        'title' => $acc['title'],
                        'description' => $acc['description'] ?? null,
                        'price' => $acc['price'] ?? 0,
                        'promo_quantity' => $acc['promoQuantity'] ?? null,
                        'promo_price' => $acc['promoPrice'] ?? null,
                        'stock' => $acc['stock'] ?? 0,
                        'category' => $acc['category'],
                        'cover_url' => $acc['coverUrl'] ?? null,
                        'additional_images' => $acc['additionalImages'] ?? [],
                        'is_active' => $acc['isActive'] ?? true,
                        'created_at' => $acc['createdAt'] ?? now(),
                        'updated_at' => $acc['updatedAt'] ?? now(),
                    ]
                );
            }

            return;
        }

        $categories = [
            [
                'slug' => 'velas',
                'label' => 'Velas Literarias',
                'emoji' => '🕯️',
                'order' => 1,
            ],
            [
                'slug' => 'senaladores',
                'label' => 'Señaladores',
                'emoji' => '🔖',
                'order' => 2,
            ],
            [
                'slug' => 'tote-bags',
                'label' => 'Tote Bags',
                'emoji' => '👜',
                'order' => 3,
            ],
            [
                'slug' => 'varios',
                'label' => 'Merchandising',
                'emoji' => '✨',
                'order' => 4,
            ],
        ];

        foreach ($categories as $cat) {
            AccessoryCategory::firstOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        $accessories = [
            [
                'title' => 'Vela Aromática "Noches de Invierno"',
                'description' => 'Vela de soja aromática con notas de canela, naranja dulce y vainilla. Duración estimada de 40 horas. Ideal para acompañar lecturas en días lluviosos.',
                'price' => 6500.00,
                'promo_quantity' => 2,
                'promo_price' => 12000.00,
                'stock' => 15,
                'category' => 'velas',
                'cover_url' => 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [
                    'https://images.unsplash.com/photo-1572726729437-3732efed3744?w=600&auto=format&fit=crop&q=80',
                ],
                'is_active' => true,
            ],
            [
                'title' => 'Vela Literaria "Café y Papel Viejo"',
                'description' => 'Aroma envolvente a café recién tostado, sándalo y notas de pergamino añejado. Presentada en frasco ámbar de 200g.',
                'price' => 6500.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 12,
                'category' => 'velas',
                'cover_url' => 'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Señalador Metálico "Luna de Medianoche"',
                'description' => 'Señalador de páginas de latón grabado con detalles astronómicos y borla de seda verde bosque. No daña las hojas ni deja marcas.',
                'price' => 2800.00,
                'promo_quantity' => 3,
                'promo_price' => 7500.00,
                'stock' => 30,
                'category' => 'senaladores',
                'cover_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Set de 4 Señaladores Botánicos en Acrílico',
                'description' => 'Flores secas reales encapsuladas en resina transparente con bordes pulidos y cinta de terciopelo. Cada diseño es único.',
                'price' => 4200.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 18,
                'category' => 'senaladores',
                'cover_url' => 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Tote Bag "All Books and No Sleep"',
                'description' => 'Bolsa de lienzo grueso 100% algodón ecológico de 380g. Bolsillo interno con cierre para celular y llaves. Manijas reforzadas.',
                'price' => 11500.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 14,
                'category' => 'tote-bags',
                'cover_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Tote Bag "Mi Biblioteca Móvil"',
                'description' => 'Lienzo crudo con serigrafía artesanal a un color. Espaciosa y resistente, soporta hasta 6 libros de tapa dura.',
                'price' => 11000.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 10,
                'category' => 'tote-bags',
                'cover_url' => 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Funda Acolchada para Libros "Bosque Encantado"',
                'description' => 'Funda protectora impermeable con cierre magnético y forro interior de felpa suave. Apta para libros estándar y ereaders de 6 a 8 pulgadas.',
                'price' => 9800.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 8,
                'category' => 'varios',
                'cover_url' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
            [
                'title' => 'Lámpara de Lectura Clip Recargable LED',
                'description' => 'Luz cálida y ámbar que no cansa la vista. Cuello flexible 360°, batería recargable por USB-C y 3 niveles de brillo regulable.',
                'price' => 12500.00,
                'promo_quantity' => null,
                'promo_price' => null,
                'stock' => 7,
                'category' => 'varios',
                'cover_url' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
                'additional_images' => [],
                'is_active' => true,
            ],
        ];

        foreach ($accessories as $data) {
            Accessory::firstOrCreate(
                ['title' => $data['title']],
                $data
            );
        }
    }
}
