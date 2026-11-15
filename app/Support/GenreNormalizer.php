<?php

namespace App\Support;

use Illuminate\Support\Str;

class GenreNormalizer
{
    /**
     * Spanish short connectors kept lowercase inside multi-word titles unless leading.
     */
    private const LOWERCASE_WORDS = [
        'a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'los', 'o', 'para', 'por', 'sin', 'y',
    ];

    /**
     * Curated base literary genres with canonical Spanish spelling and accents.
     */
    public const DEFAULT_GENRES = [
        'Fantasía',
        'Novela Histórica',
        'Desarrollo Personal',
        'Ciencia Ficción',
        'Romance',
        'Terror',
        'Filosofía',
        'Infantil',
        'Ensayo',
    ];

    /**
     * Produce an accent-insensitive, case-insensitive, whitespace-collapsed lookup key.
     */
    public static function key(string $value): string
    {
        $collapsed = preg_replace('/\s+/', ' ', trim($value)) ?? '';

        return Str::ascii(mb_strtolower($collapsed, 'UTF-8'));
    }

    /**
     * Format a genre name in clean Spanish Title Case (e.g. "FANtasía" -> "Fantasía").
     */
    public static function canonicalCase(string $value): string
    {
        $collapsed = preg_replace('/\s+/', ' ', trim($value)) ?? '';
        if ($collapsed === '') {
            return '';
        }

        $words = explode(' ', $collapsed);
        $formatted = [];

        foreach ($words as $index => $word) {
            $lower = mb_strtolower($word, 'UTF-8');

            if ($index > 0 && in_array($lower, self::LOWERCASE_WORDS, true)) {
                $formatted[] = $lower;
                continue;
            }

            $formatted[] = mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8')
                .mb_substr($lower, 1, null, 'UTF-8');
        }

        return implode(' ', $formatted);
    }

    /**
     * Resolve a user-provided genre against existing canonical names (ignoring accents/case),
     * falling back to clean Spanish Title Case when it is genuinely new.
     *
     * @param  iterable<int|string, string>  $existingGenres
     */
    public static function resolveOrCanonical(string $rawGenre, iterable $existingGenres = []): string
    {
        $targetKey = self::key($rawGenre);
        if ($targetKey === '') {
            return '';
        }

        foreach ($existingGenres as $candidate) {
            $trimmed = trim((string) $candidate);
            if ($trimmed !== '' && self::key($trimmed) === $targetKey) {
                return $trimmed;
            }
        }

        foreach (self::DEFAULT_GENRES as $defaultGenre) {
            if (self::key($defaultGenre) === $targetKey) {
                return $defaultGenre;
            }
        }

        return self::canonicalCase($rawGenre);
    }
}
