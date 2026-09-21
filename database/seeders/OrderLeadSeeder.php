<?php

namespace Database\Seeders;

use App\Models\OrderLead;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class OrderLeadSeeder extends Seeder
{
    public function run(): void
    {
        $backupFile = database_path('seeders/backup_data.json');

        if (File::exists($backupFile)) {
            $data = json_decode(File::get($backupFile), true);
            $tables = $data['tables'] ?? $data;
            $leads = $tables['orderLeads'] ?? [];

            foreach ($leads as $lead) {
                OrderLead::updateOrCreate(
                    ['id' => $lead['id']],
                    [
                        'customer_name' => $lead['customerName'],
                        'customer_phone' => $lead['customerPhone'],
                        'customer_email' => $lead['customerEmail'] ?? null,
                        'customer_dni' => $lead['customerDni'] ?? null,
                        'postal_code' => $lead['postalCode'] ?? null,
                        'address' => $lead['address'] ?? null,
                        'items' => $lead['items'] ?? [],
                        'total_amount' => $lead['totalAmount'] ?? 0,
                        'status' => $lead['status'] ?? 'PENDING_WHATSAPP',
                        'created_at' => $lead['createdAt'] ?? now(),
                        'updated_at' => $lead['updatedAt'] ?? now(),
                    ]
                );
            }
        }
    }
}
