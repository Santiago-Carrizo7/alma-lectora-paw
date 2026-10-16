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

        // Clientes frecuentes para pruebas de historial, compras y reportes gerenciales
        $clients = [
            [
                'name' => 'Camila Rodríguez',
                'email' => 'camila.rodriguez@gmail.com',
                'dni' => '39123456',
                'phone' => '+54 9 387 512-3456',
                'address' => 'Av. Belgrano 450, Piso 3 Depto B',
                'postal_code' => '4400',
            ],
            [
                'name' => 'Mateo Benítez',
                'email' => 'mateo.benitez@gmail.com',
                'dni' => '41234567',
                'phone' => '+54 9 387 423-4567',
                'address' => 'San Martín 1220',
                'postal_code' => '4400',
            ],
            [
                'name' => 'Sofía Morales',
                'email' => 'sofia.morales@hotmail.com',
                'dni' => '38456789',
                'phone' => '+54 9 387 634-5678',
                'address' => 'Av. San Martín 880 (San Lorenzo)',
                'postal_code' => '4401',
            ],
            [
                'name' => 'Lucas Fernández',
                'email' => 'lucas.fernandez@yahoo.com.ar',
                'dni' => '36789012',
                'phone' => '+54 9 387 445-6789',
                'address' => 'Mitre 312',
                'postal_code' => '4400',
            ],
            [
                'name' => 'Valentina Romero',
                'email' => 'valentina.romero@gmail.com',
                'dni' => '42345678',
                'phone' => '+54 9 387 556-7890',
                'address' => 'Los Sauces 45 (Vaqueros)',
                'postal_code' => '4401',
            ],
            [
                'name' => 'Martín Guitián',
                'email' => 'martin.guitian@gmail.com',
                'dni' => '35678901',
                'phone' => '+54 9 387 667-8901',
                'address' => 'Alvarado 720',
                'postal_code' => '4400',
            ],
            [
                'name' => 'Luciana Salgado',
                'email' => 'luciana.salgado@gmail.com',
                'dni' => '40567890',
                'phone' => '+54 9 387 478-9012',
                'address' => 'España 1050',
                'postal_code' => '4400',
            ],
            [
                'name' => 'Joaquín Navarro',
                'email' => 'joaquin.navarro@gmail.com',
                'dni' => '43123456',
                'phone' => '+54 9 387 589-0123',
                'address' => 'Zuviría 234',
                'postal_code' => '4400',
            ],
        ];

        foreach ($clients as $clientData) {
            User::updateOrCreate(
                ['email' => $clientData['email']],
                [
                    'name' => $clientData['name'],
                    'password' => Hash::make('password'),
                    'role' => 'client',
                    'dni' => $clientData['dni'],
                    'phone' => $clientData['phone'],
                    'address' => $clientData['address'],
                    'postal_code' => $clientData['postal_code'],
                    'is_active' => true,
                ]
            );
        }
    }
}
