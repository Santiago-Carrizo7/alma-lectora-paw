<?php

namespace App\Support;

use Closure;

/**
 * Business rule for "q units for $P" promotions.
 *
 * OrderService charges every full bundle of `promo_quantity` units at `promo_price`,
 * so a promotion only makes sense when it is cheaper than buying those units at the
 * regular price, and it needs both values to exist.
 */
class PromoPricing
{
    /**
     * Whether the promo values form a valid promotion (or no promotion at all).
     */
    public static function isValid(mixed $price, mixed $promoQuantity, mixed $promoPrice): bool
    {
        $hasQuantity = ! self::isBlank($promoQuantity);
        $hasPromoPrice = ! self::isBlank($promoPrice);

        if (! $hasQuantity && ! $hasPromoPrice) {
            return true;
        }

        if (! $hasQuantity || ! $hasPromoPrice) {
            return false;
        }

        if (! is_numeric($price) || ! is_numeric($promoQuantity) || ! is_numeric($promoPrice) || (int) $promoQuantity < 1) {
            return false;
        }

        return (float) $promoPrice < self::regularBundlePrice($price, $promoQuantity);
    }

    /**
     * Return the promo columns to persist, dropping the promotion when it is invalid.
     *
     * @return array{promo_quantity: int|null, promo_price: float|null}
     */
    public static function sanitize(mixed $price, mixed $promoQuantity, mixed $promoPrice): array
    {
        if (self::isBlank($promoQuantity) || self::isBlank($promoPrice) || ! self::isValid($price, $promoQuantity, $promoPrice)) {
            return ['promo_quantity' => null, 'promo_price' => null];
        }

        return ['promo_quantity' => (int) $promoQuantity, 'promo_price' => (float) $promoPrice];
    }

    /**
     * Validation closure for the `promo_price` field.
     *
     * Pair it with `required_with` rules so a missing counterpart is reported separately.
     */
    public static function rule(mixed $price, mixed $promoQuantity): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($price, $promoQuantity): void {
            if (! is_numeric($price) || ! is_numeric($promoQuantity) || ! is_numeric($value)) {
                return;
            }

            if (! self::isValid($price, $promoQuantity, $value)) {
                $limit = self::regularBundlePrice($price, $promoQuantity);
                $decimals = floor($limit) == $limit ? 0 : 2;

                $fail('El precio promocional debe ser menor que $'.number_format($limit, $decimals, ',', '.').' (precio normal × cantidad).');
            }
        };
    }

    /**
     * Shared Spanish messages for the promo pairing rules.
     *
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return [
            'promo_price.required_with' => 'Indicá el precio promocional para la cantidad de la promoción.',
            'promo_quantity.required_with' => 'Indicá la cantidad de unidades de la promoción.',
        ];
    }

    private static function regularBundlePrice(mixed $price, mixed $promoQuantity): float
    {
        return round((float) $price * (int) $promoQuantity, 2);
    }

    private static function isBlank(mixed $value): bool
    {
        return $value === null || (is_string($value) && trim($value) === '');
    }
}
