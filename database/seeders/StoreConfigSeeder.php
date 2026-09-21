<?php

namespace Database\Seeders;

use App\Models\StoreConfig;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class StoreConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $backupFile = database_path('seeders/backup_data.json');

        if (File::exists($backupFile)) {
            $data = json_decode(File::get($backupFile), true);
            $tables = $data['tables'] ?? $data;
            $configs = $tables['storeConfig'] ?? [];

            if (isset($configs['whatsappPhone']) || isset($configs['whatsapp_phone'])) {
                $configs = [$configs];
            }

            foreach ($configs as $cfg) {
                StoreConfig::updateOrCreate(
                    ['id' => $cfg['id'] ?? null],
                    [
                        'whatsapp_phone' => $cfg['whatsappPhone'] ?? $cfg['whatsapp_phone'] ?? '5493875708557',
                        'instagram_url' => $cfg['instagramUrl'] ?? $cfg['instagram_url'] ?? 'https://www.instagram.com/alma.lectora.al/?hl=es-la',
                        'shipping_cost' => $cfg['shippingCost'] ?? $cfg['shipping_cost'] ?? 0.00,
                        'free_shipping_min' => $cfg['freeShippingMin'] ?? $cfg['free_shipping_min'] ?? 0.00,
                        'banner_message' => $cfg['bannerMessage'] ?? $cfg['banner_message'] ?? null,
                        'is_store_open' => $cfg['isStoreOpen'] ?? $cfg['is_store_open'] ?? true,
                    ]
                );
            }

            if (StoreConfig::count() > 0) {
                return;
            }
        }

        StoreConfig::firstOrCreate(
            ['whatsapp_phone' => '5493875708557'],
            [
                'instagram_url' => 'https://www.instagram.com/alma.lectora.al/?hl=es-la',
                'shipping_cost' => 0.00,
                'free_shipping_min' => 0.00,
                'banner_message' => null,
                'is_store_open' => true,
            ]
        );
    }
}
