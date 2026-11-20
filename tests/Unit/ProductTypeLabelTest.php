<?php

namespace Tests\Unit;

use App\Support\ProductTypeLabel;
use PHPUnit\Framework\TestCase;

class ProductTypeLabelTest extends TestCase
{
    public function test_known_product_types_are_translated_to_spanish(): void
    {
        $this->assertSame('Libro', ProductTypeLabel::label('BOOK'));
        $this->assertSame('Accesorio', ProductTypeLabel::label('ACCESSORY'));
        $this->assertSame('Combo', ProductTypeLabel::label('COMBO'));
        $this->assertSame('Libro', ProductTypeLabel::label('book'));
    }

    public function test_unknown_or_missing_type_falls_back_to_generic_label(): void
    {
        $this->assertSame('Producto', ProductTypeLabel::label(null));
        $this->assertSame('Producto', ProductTypeLabel::label(''));
        $this->assertSame('Producto', ProductTypeLabel::label('GIFT_CARD'));
    }
}
