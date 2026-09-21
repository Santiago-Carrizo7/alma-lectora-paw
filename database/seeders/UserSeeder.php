<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
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
            $users = $tables['users'] ?? [];

            foreach ($users as $u) {
                User::updateOrCreate(
                    ['email' => $u['email']],
                    [
                        'name' => explode('@', $u['email'])[0],
                        'password' => $u['passwordHash'],
                        'role' => strtolower($u['rol'] ?? 'admin'),
                        'is_active' => $u['activo'] ?? true,
                    ]
                );
            }
        }

        // Usuario administrador por defecto para desarrollo local
        User::firstOrCreate(
            ['email' => 'admin@almalectora.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
