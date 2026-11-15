<?php

namespace App\Support;

class HtmlSanitizer
{
    /**
     * Sanitize descriptive HTML keeping basic text formatting tags without attributes.
     */
    public static function clean(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        // Strip dangerous tag blocks with their inner payload first.
        $withoutBlocks = preg_replace('/<(script|style|iframe|object|embed|svg)\b[^>]*>.*?<\/\1>/is', '', $html) ?? $html;
        $allowedOnly = strip_tags($withoutBlocks, '<p><br><strong><em><ul><ol><li><b><i>');
        $withoutAttributes = preg_replace('/<([a-z0-9]+)\b[^>]*>/i', '<$1>', $allowedOnly) ?? $allowedOnly;

        return trim($withoutAttributes);
    }
}
