<?php

namespace Database\Seeders;

use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\ComboAccessory;
use App\Models\ComboBook;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ComboSeeder extends Seeder
{
    public function run(): void
    {
        $backupFile = database_path('seeders/backup_data.json');

        if (File::exists($backupFile)) {
            $data = json_decode(File::get($backupFile), true);
            $tables = $data['tables'] ?? $data;
            $combos = $tables['combos'] ?? [];
            $comboBooks = $tables['comboBooks'] ?? [];
            $comboAccessories = $tables['comboAccessories'] ?? [];

            foreach ($combos as $c) {
                Combo::updateOrCreate(
                    ['id' => $c['id']],
                    [
                        'title' => $c['title'],
                        'description' => $c['description'] ?? null,
                        'price' => $c['price'] ?? 0,
                        'promo_quantity' => $c['promoQuantity'] ?? null,
                        'promo_price' => $c['promoPrice'] ?? null,
                        'cover_url' => $c['coverUrl'] ?? null,
                        'additional_images' => $c['additionalImages'] ?? [],
                        'stock' => $c['stock'] ?? 0,
                        'is_active' => $c['isActive'] ?? true,
                        'created_at' => $c['createdAt'] ?? now(),
                        'updated_at' => $c['updatedAt'] ?? now(),
                    ]
                );
            }

            foreach ($comboBooks as $cb) {
                ComboBook::updateOrCreate(
                    [
                        'combo_id' => $cb['comboId'],
                        'book_id' => $cb['bookId'],
                    ],
                    [
                        'quantity' => $cb['quantity'] ?? 1,
                    ]
                );
            }

            foreach ($comboAccessories as $ca) {
                ComboAccessory::updateOrCreate(
                    [
                        'combo_id' => $ca['comboId'],
                        'accessory_id' => $ca['accessoryId'],
                    ],
                    [
                        'quantity' => $ca['quantity'] ?? 1,
                    ]
                );
            }

            if (!empty($combos)) {
                return;
            }
        }

        if (Combo::count() > 0) {
            return;
        }

        $book1 = Book::active()->first();
        $book2 = Book::active()->skip(1)->first();
        $accessory1 = Accessory::active()->first();

        if (! $book1) {
            return;
        }

        $combo = Combo::create([
            'title' => 'Combo Lectura & Calidez',
            'description' => '<p>Disfrutá de una experiencia de lectura inmersiva con nuestra selección especial. Incluye títulos seleccionados y accesorios literarios para acompañar tus tardes.</p>',
            'price' => 38500.00,
            'promo_quantity' => 2,
            'promo_price' => 72000.00,
            'cover_url' => $book1->cover_url,
            'additional_images' => array_filter([$book2?->cover_url, $accessory1?->cover_url]),
            'stock' => 5,
            'is_active' => true,
        ]);

        ComboBook::create([
            'combo_id' => $combo->id,
            'book_id' => $book1->id,
            'quantity' => 1,
        ]);

        if ($book2) {
            ComboBook::create([
                'combo_id' => $combo->id,
                'book_id' => $book2->id,
                'quantity' => 1,
            ]);
        }

        if ($accessory1) {
            ComboAccessory::create([
                'combo_id' => $combo->id,
                'accessory_id' => $accessory1->id,
                'quantity' => 1,
            ]);
        }
    }
}
