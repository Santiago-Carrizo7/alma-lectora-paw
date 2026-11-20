<?php

namespace App\Support;

/**
 * Normalizes identity and contact numbers typed by customers.
 */
class ContactNormalizer
{
    /**
     * Strip common separators (spaces, dashes, dots, parentheses) and a leading "+"
     * so values like "+54 9 387 512-3456" or "35.123.456" become plain digits.
     * Any other character is kept, so a `digits_between` rule still rejects letters.
     */
    public static function digits(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $clean = preg_replace('/[\s\-.()]+/u', '', $value) ?? $value;

        return str_starts_with($clean, '+') ? substr($clean, 1) : $clean;
    }

    /**
     * Shared Spanish messages for the DNI/CUIT and phone digit rules.
     *
     * @return array<string, string>
     */
    public static function messages(string $dniField, string $phoneField): array
    {
        return [
            "{$dniField}.digits_between" => 'El DNI o CUIT debe contener solo números (7 a 11 dígitos).',
            "{$phoneField}.digits_between" => 'El teléfono debe contener solo números (8 a 15 dígitos).',
        ];
    }
}
