<?php

namespace Tests\Unit;

use App\Support\PromoPricing;
use PHPUnit\Framework\TestCase;

class PromoPricingTest extends TestCase
{
    public function test_no_promo_at_all_is_valid(): void
    {
        $this->assertTrue(PromoPricing::isValid(18000, null, null));
        $this->assertTrue(PromoPricing::isValid(18000, '', ''));
    }

    public function test_promo_cheaper_than_regular_bundle_is_valid(): void
    {
        $this->assertTrue(PromoPricing::isValid(18000, 2, 30000));
        $this->assertTrue(PromoPricing::isValid('18000.00', '2', '35999.99'));
    }

    public function test_promo_equal_or_more_expensive_than_regular_bundle_is_invalid(): void
    {
        $this->assertFalse(PromoPricing::isValid(18000, 2, 36000));
        $this->assertFalse(PromoPricing::isValid(18000, 2, 42000));
        $this->assertFalse(PromoPricing::isValid('18000.00', '2', '45000.00'));
    }

    public function test_promo_with_only_one_of_its_two_values_is_invalid(): void
    {
        $this->assertFalse(PromoPricing::isValid(18000, 2, null));
        $this->assertFalse(PromoPricing::isValid(18000, null, 30000));
    }

    public function test_sanitize_drops_invalid_promos_and_keeps_valid_ones(): void
    {
        $this->assertSame(
            ['promo_quantity' => null, 'promo_price' => null],
            PromoPricing::sanitize(18000, 2, 42000)
        );
        $this->assertSame(
            ['promo_quantity' => null, 'promo_price' => null],
            PromoPricing::sanitize(18000, 2, null)
        );
        $this->assertSame(
            ['promo_quantity' => 2, 'promo_price' => 30000.0],
            PromoPricing::sanitize(18000, '2', '30000')
        );
    }
}
