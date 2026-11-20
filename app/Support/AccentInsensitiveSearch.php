<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

/**
 * Accent- and case-insensitive "contains" search without any DB extension.
 *
 * On PostgreSQL the column is lowercased and its Spanish accented letters are mapped
 * to plain ASCII with translate(); the search term is normalized the same way in PHP.
 * Other drivers keep the previous plain LIKE behaviour.
 */
class AccentInsensitiveSearch
{
    private const ACCENTED = 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ';

    private const PLAIN = 'aaaaaeeeeiiiiooooouuuuncaaaaaeeeeiiiiooooouuuunc';

    /**
     * Add a "column contains term" condition to the query.
     *
     * @param  'and'|'or'  $boolean
     */
    public static function where(Builder $query, string $column, string $term, string $boolean = 'and'): Builder
    {
        if ($query->getConnection()->getDriverName() !== 'pgsql') {
            return $query->where($column, 'like', "%{$term}%", null, $boolean);
        }

        $wrapped = $query->getQuery()->getGrammar()->wrap($column);

        // PostgreSQL uses backslash as the default LIKE escape character.
        return $query->whereRaw(
            "translate(lower({$wrapped}), ?, ?) like ?",
            [self::ACCENTED, self::PLAIN, '%'.self::escapeLike(self::normalize($term)).'%'],
            $boolean
        );
    }

    public static function orWhere(Builder $query, string $column, string $term): Builder
    {
        return self::where($query, $column, $term, 'or');
    }

    /**
     * Lowercase the term and strip the accents handled by the SQL translate() call.
     */
    public static function normalize(string $term): string
    {
        $from = mb_str_split(self::ACCENTED);
        $to = mb_str_split(self::PLAIN);

        return strtr(mb_strtolower(trim($term)), array_combine($from, $to));
    }

    /**
     * LIKE pattern for a plain (accent-sensitive) "contains" search, e.g. ISBN.
     * Wildcards in the term are escaped on PostgreSQL, matching where().
     */
    public static function containsPattern(Builder $query, string $term): string
    {
        if ($query->getConnection()->getDriverName() !== 'pgsql') {
            return "%{$term}%";
        }

        return '%'.self::escapeLike($term).'%';
    }

    private static function escapeLike(string $term): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term);
    }
}
