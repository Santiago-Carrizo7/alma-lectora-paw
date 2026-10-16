<?php

namespace Database\Seeders;

use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use App\Models\OrderLead;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

class OrderLeadSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cargar pedidos originales del archivo de backup si existe
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

        // 2. Generar pedidos simulados realistas para alimentar analítica y reportes
        $books = Book::where('is_active', true)->get();
        if ($books->count() < 7) {
            return;
        }

        // Libros Best-Sellers (con mayor demanda)
        $bestSeller1 = Book::where('title', 'like', '%Boulevard%')->first() ?? $books[0];
        $bestSeller2 = Book::where('title', 'like', '%King of%')->first() ?? $books[1];
        $bestSeller3 = Book::where('title', 'like', '%Invisible%')->first() ?? $books[2];
        $bestSeller4 = $books[3];
        $bestSeller5 = $books[4];

        // Libros de Baja Rotación (solo 1 venta)
        $lowRotation1 = $books[5];
        $lowRotation2 = $books[6];

        // Accesorios y Combos
        $accessory1 = Accessory::first();
        $accessory2 = Accessory::skip(1)->first();
        $combo1 = Combo::first();

        // Clientes registrados en el sistema
        $camila = User::where('email', 'camila.rodriguez@gmail.com')->first();
        $mateo = User::where('email', 'mateo.benitez@gmail.com')->first();
        $sofia = User::where('email', 'sofia.morales@hotmail.com')->first();
        $lucas = User::where('email', 'lucas.fernandez@yahoo.com.ar')->first();
        $valentina = User::where('email', 'valentina.romero@gmail.com')->first();
        $martin = User::where('email', 'martin.guitian@gmail.com')->first();

        // Helper para mapear items
        $makeItem = function ($model, string $type, int $qty, ?float $customPrice = null) {
            $price = $customPrice ?? (float) $model->price;
            return [
                'id' => $model->id,
                'type' => $type,
                'title' => $model->title,
                'quantity' => $qty,
                'unit_price' => $price,
                'cover_url' => $model->cover_url ?? null,
            ];
        };

        $orders = [];

        // CAMILA RODRÍGUEZ (TOP 1 COMPRADORA - ~$180.000, 4 compras confirmadas)
        if ($camila) {
            $orders[] = [
                'user_id' => $camila->id,
                'customer_name' => $camila->name,
                'customer_email' => $camila->email,
                'customer_dni' => $camila->dni,
                'customer_phone' => $camila->phone,
                'postal_code' => $camila->postal_code,
                'address' => $camila->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(45),
                'items' => [
                    $makeItem($bestSeller1, 'BOOK', 2),
                    $accessory1 ? $makeItem($accessory1, 'ACCESSORY', 1) : null,
                ],
            ];

            $orders[] = [
                'user_id' => $camila->id,
                'customer_name' => $camila->name,
                'customer_email' => $camila->email,
                'customer_dni' => $camila->dni,
                'customer_phone' => $camila->phone,
                'postal_code' => $camila->postal_code,
                'address' => $camila->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(30),
                'items' => [
                    $makeItem($bestSeller2, 'BOOK', 2),
                    $makeItem($bestSeller3, 'BOOK', 1),
                ],
            ];

            $orders[] = [
                'user_id' => $camila->id,
                'customer_name' => $camila->name,
                'customer_email' => $camila->email,
                'customer_dni' => $camila->dni,
                'customer_phone' => $camila->phone,
                'postal_code' => $camila->postal_code,
                'address' => $camila->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(14),
                'items' => [
                    $combo1 ? $makeItem($combo1, 'COMBO', 1) : $makeItem($bestSeller1, 'BOOK', 1),
                ],
            ];

            $orders[] = [
                'user_id' => $camila->id,
                'customer_name' => $camila->name,
                'customer_email' => $camila->email,
                'customer_dni' => $camila->dni,
                'customer_phone' => $camila->phone,
                'postal_code' => $camila->postal_code,
                'address' => $camila->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(4),
                'items' => [
                    $makeItem($bestSeller1, 'BOOK', 2),
                    $makeItem($bestSeller4, 'BOOK', 1),
                ],
            ];
        }

        // MATEO BENÍTEZ (TOP 2 COMPRADOR - ~$125.000, 3 compras confirmadas)
        if ($mateo) {
            $orders[] = [
                'user_id' => $mateo->id,
                'customer_name' => $mateo->name,
                'customer_email' => $mateo->email,
                'customer_dni' => $mateo->dni,
                'customer_phone' => $mateo->phone,
                'postal_code' => $mateo->postal_code,
                'address' => $mateo->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(38),
                'items' => [
                    $makeItem($bestSeller2, 'BOOK', 2),
                    $accessory2 ? $makeItem($accessory2, 'ACCESSORY', 1) : null,
                ],
            ];

            $orders[] = [
                'user_id' => $mateo->id,
                'customer_name' => $mateo->name,
                'customer_email' => $mateo->email,
                'customer_dni' => $mateo->dni,
                'customer_phone' => $mateo->phone,
                'postal_code' => $mateo->postal_code,
                'address' => $mateo->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(22),
                'items' => [
                    $makeItem($bestSeller1, 'BOOK', 1),
                    $makeItem($bestSeller3, 'BOOK', 1),
                ],
            ];

            $orders[] = [
                'user_id' => $mateo->id,
                'customer_name' => $mateo->name,
                'customer_email' => $mateo->email,
                'customer_dni' => $mateo->dni,
                'customer_phone' => $mateo->phone,
                'postal_code' => $mateo->postal_code,
                'address' => $mateo->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(2),
                'items' => [
                    $makeItem($bestSeller4, 'BOOK', 2),
                ],
            ];
        }

        // SOFÍA MORALES (TOP 3 COMPRADORA - ~$78.000, 2 compras confirmadas)
        if ($sofia) {
            $orders[] = [
                'user_id' => $sofia->id,
                'customer_name' => $sofia->name,
                'customer_email' => $sofia->email,
                'customer_dni' => $sofia->dni,
                'customer_phone' => $sofia->phone,
                'postal_code' => $sofia->postal_code,
                'address' => $sofia->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(26),
                'items' => [
                    $makeItem($bestSeller3, 'BOOK', 2),
                    $makeItem($bestSeller5, 'BOOK', 1),
                ],
            ];

            $orders[] = [
                'user_id' => $sofia->id,
                'customer_name' => $sofia->name,
                'customer_email' => $sofia->email,
                'customer_dni' => $sofia->dni,
                'customer_phone' => $sofia->phone,
                'postal_code' => $sofia->postal_code,
                'address' => $sofia->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(7),
                'items' => [
                    $makeItem($bestSeller1, 'BOOK', 1),
                    $accessory1 ? $makeItem($accessory1, 'ACCESSORY', 1) : null,
                ],
            ];
        }

        // LUCAS FERNÁNDEZ (TOP 4 COMPRADOR - ~$48.000, 2 compras confirmadas)
        if ($lucas) {
            $orders[] = [
                'user_id' => $lucas->id,
                'customer_name' => $lucas->name,
                'customer_email' => $lucas->email,
                'customer_dni' => $lucas->dni,
                'customer_phone' => $lucas->phone,
                'postal_code' => $lucas->postal_code,
                'address' => $lucas->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(19),
                'items' => [
                    $makeItem($bestSeller2, 'BOOK', 1),
                    $makeItem($lowRotation1, 'BOOK', 1),
                ],
            ];

            $orders[] = [
                'user_id' => $lucas->id,
                'customer_name' => $lucas->name,
                'customer_email' => $lucas->email,
                'customer_dni' => $lucas->dni,
                'customer_phone' => $lucas->phone,
                'postal_code' => $lucas->postal_code,
                'address' => $lucas->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(3),
                'items' => [
                    $makeItem($bestSeller4, 'BOOK', 1),
                ],
            ];
        }

        // VALENTINA ROMERO (TOP 5 COMPRADORA - ~$32.000, 1 compra confirmada)
        if ($valentina) {
            $orders[] = [
                'user_id' => $valentina->id,
                'customer_name' => $valentina->name,
                'customer_email' => $valentina->email,
                'customer_dni' => $valentina->dni,
                'customer_phone' => $valentina->phone,
                'postal_code' => $valentina->postal_code,
                'address' => $valentina->address,
                'status' => 'CONFIRMED',
                'created_at' => Carbon::now()->subDays(11),
                'items' => [
                    $makeItem($bestSeller5, 'BOOK', 1),
                    $makeItem($lowRotation2, 'BOOK', 1),
                ],
            ];
        }

        // MARTÍN GUITIÁN (Pedido en proceso pendiente de WhatsApp)
        if ($martin) {
            $orders[] = [
                'user_id' => $martin->id,
                'customer_name' => $martin->name,
                'customer_email' => $martin->email,
                'customer_dni' => $martin->dni,
                'customer_phone' => $martin->phone,
                'postal_code' => $martin->postal_code,
                'address' => $martin->address,
                'status' => 'PENDING_WHATSAPP',
                'created_at' => Carbon::now()->subHours(8),
                'items' => [
                    $makeItem($bestSeller1, 'BOOK', 1),
                ],
            ];
        }

        // CLIENTE INVITADO GUEST (Pedido confirmado)
        $orders[] = [
            'user_id' => null,
            'customer_name' => 'Gonzalo Morales (Invitado)',
            'customer_email' => 'gonzalo.invitado@gmail.com',
            'customer_dni' => '34567890',
            'customer_phone' => '+54 9 387 599-8877',
            'postal_code' => '4400',
            'address' => 'Leguizamón 890',
            'status' => 'CONFIRMED',
            'created_at' => Carbon::now()->subDays(15),
            'items' => [
                $makeItem($bestSeller2, 'BOOK', 1),
            ],
        ];

        // CLIENTE INVITADO GUEST (Pedido cancelado)
        $orders[] = [
            'user_id' => null,
            'customer_name' => 'Mariana Torres (Invitada)',
            'customer_email' => 'mariana.torres@gmail.com',
            'customer_dni' => '32123456',
            'customer_phone' => '+54 9 387 522-3344',
            'postal_code' => '4400',
            'address' => 'Caseros 600',
            'status' => 'CANCELLED',
            'created_at' => Carbon::now()->subDays(20),
            'items' => [
                $accessory1 ? $makeItem($accessory1, 'ACCESSORY', 1) : $makeItem($bestSeller3, 'BOOK', 1),
            ],
        ];

        // Insertar las órdenes calculando total_amount automáticamente
        foreach ($orders as $orderData) {
            $filteredItems = array_values(array_filter($orderData['items'] ?? []));
            $totalAmount = 0.0;
            foreach ($filteredItems as $item) {
                $totalAmount += ((float) $item['unit_price']) * ((int) $item['quantity']);
            }

            OrderLead::create([
                'user_id' => $orderData['user_id'],
                'customer_name' => $orderData['customer_name'],
                'customer_email' => $orderData['customer_email'],
                'customer_dni' => $orderData['customer_dni'],
                'customer_phone' => $orderData['customer_phone'],
                'postal_code' => $orderData['postal_code'],
                'address' => $orderData['address'],
                'items' => $filteredItems,
                'total_amount' => $totalAmount,
                'status' => $orderData['status'],
                'created_at' => $orderData['created_at'],
                'updated_at' => $orderData['created_at'],
            ]);
        }
    }
}
