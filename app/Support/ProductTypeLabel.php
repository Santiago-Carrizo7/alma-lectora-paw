<?php

namespace App\Support;

/**
 * Spanish, user-facing label for the internal product type codes (BOOK, ACCESSORY, COMBO).
 */
class ProductTypeLabel
{
    private const LABELS = [
        'BOOK' => 'Libro',
        'ACCESSORY' => 'Accesorio',
        'COMBO' => 'Combo',
    ];

    public static function label(?string $type): string
    {
        return self::LABELS[strtoupper(trim((string) $type))] ?? 'Producto';
    }
}
