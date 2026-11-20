<?php

namespace App\Models;

use App\Support\AccentInsensitiveSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Accessory extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'accessories';

    protected $fillable = [
        'title',
        'description',
        'price',
        'promo_quantity',
        'promo_price',
        'stock',
        'category_id',
        'category',
        'cover_url',
        'additional_images',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'promo_quantity' => 'integer',
        'stock' => 'integer',
        'additional_images' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'category_label',
        'category_slug',
    ];

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(AccessoryCategory::class, 'category_id');
    }

    public function getCategoryLabelAttribute(): ?string
    {
        return $this->category?->label;
    }

    public function getCategorySlugAttribute(): ?string
    {
        return $this->category?->slug;
    }

    public function setCategoryAttribute($value): void
    {
        if (empty($value)) {
            return;
        }

        if (\Illuminate\Support\Str::isUuid($value)) {
            $this->attributes['category_id'] = $value;
            return;
        }

        $catId = AccessoryCategory::where('slug', $value)
            ->orWhereRaw('LOWER(label) = ?', [mb_strtolower($value)])
            ->value('id');

        if (! $catId) {
            $cat = AccessoryCategory::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($value)],
                ['label' => ucfirst($value), 'order' => 99]
            );
            $catId = $cat->id;
        }

        $this->attributes['category_id'] = $catId;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $term = trim($search);
                $q->where(function (Builder $sub) use ($term) {
                    AccentInsensitiveSearch::where($sub, 'title', $term);
                    AccentInsensitiveSearch::orWhere($sub, 'description', $term);
                });
            })
            ->when($filters['category'] ?? null, function (Builder $q, string $category) {
                $q->where(function (Builder $sub) use ($category) {
                    if (\Illuminate\Support\Str::isUuid($category)) {
                        $sub->where('category_id', $category);
                    } else {
                        $sub->whereHas('category', function (Builder $catQ) use ($category) {
                            $catQ->whereRaw('LOWER(slug) = ?', [mb_strtolower($category)])
                                ->orWhereRaw('LOWER(label) = ?', [mb_strtolower($category)]);
                        });
                    }
                });
            })
            ->when($filters['stock_status'] ?? null, function (Builder $q, string $stockStatus) {
                match ($stockStatus) {
                    'in_stock' => $q->where('stock', '>', 0),
                    'low_stock' => $q->whereBetween('stock', [1, 3]),
                    'out_of_stock' => $q->where('stock', '<=', 0),
                    default => null,
                };
            })
            ->when($filters['sort'] ?? null, function (Builder $q, string $sort) {
                match ($sort) {
                    'price_asc' => $q->orderBy('price', 'asc'),
                    'price_desc' => $q->orderBy('price', 'desc'),
                    'stock_asc' => $q->orderBy('stock', 'asc'),
                    'stock_desc' => $q->orderBy('stock', 'desc'),
                    'title_asc' => $q->orderBy('title', 'asc'),
                    default => $q->latest(),
                };
            });
    }

    public function getRelated(int $limit = 4)
    {
        $all = static::active()
            ->where('id', '!=', $this->id)
            ->get();

        $scored = $all->map(function (Accessory $other) {
            return [
                'item' => $other,
                'score' => $this->calculateSimilarityWith($other),
            ];
        })
        ->filter(fn ($pair) => $pair['score'] >= 4)
        ->sortByDesc('score')
        ->take($limit)
        ->pluck('item');

        return $scored->values();
    }

    protected function calculateSimilarityWith(Accessory $other): int
    {
        $score = 0;
        $tokensA = $this->extractKeywords($this->title);
        $tokensB = $this->extractKeywords($other->title);

        $sharedTokens = array_intersect($tokensA, $tokensB);

        $highWeightTokens = [
            'dragon', 'dragones', 'mariposa', 'mariposas', 'mini', 'michi', 'michis',
            'gato', 'gatito', 'gatitos', 'romance', 'dark', 'hockey', 'nubes', 'ensueno',
            'alas', 'doradas', 'dorados', 'corazon', 'corazones', 'calaveras', 'vela', 'velas',
            'tote', 'bolsa', 'stickers', 'resaltadores', 'cintas',
        ];

        foreach ($sharedTokens as $token) {
            if (in_array($token, $highWeightTokens, true)) {
                $score += 6;
            } else {
                $score += 3;
            }
        }

        $isAnilloA = in_array('anillo', $tokensA, true) || in_array('sujetador', $tokensA, true);
        $isAnilloB = in_array('anillo', $tokensB, true) || in_array('sujetador', $tokensB, true);
        if ($isAnilloA && $isAnilloB) {
            $score += 5;
        }

        $isSeparadorA = in_array('separador', $tokensA, true) || in_array('separadores', $tokensA, true);
        $isSeparadorB = in_array('separador', $tokensB, true) || in_array('separadores', $tokensB, true);
        if ($isSeparadorA && $isSeparadorB) {
            $score += 3;
        }

        if ($this->category_id === $other->category_id) {
            if ($score > 0) {
                $score += 2;
            } elseif (($this->category?->slug ?? $this->category_slug) === 'SEPARADORES') {
                $score += 2;
            }
        }

        return $score;
    }

    protected function extractKeywords(string $title): array
    {
        $normalized = mb_strtolower($title, 'UTF-8');
        $normalized = strtr($normalized, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
            'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
            'ñ' => 'n',
        ]);
        $normalized = preg_replace('/[^a-z0-9\s]/', ' ', $normalized);
        $words = explode(' ', preg_replace('/\s+/', ' ', trim($normalized)));

        $stopWords = [
            'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas',
            'en', 'para', 'por', 'con', 'sin', 'y', 'e', 'o', 'u', 'a', 'al',
            'es', 'son', 'titulo', 'mas', 'era', 'eras', 'saga', 'que',
        ];

        $tokens = [];
        foreach ($words as $w) {
            if (strlen($w) >= 3 && ! in_array($w, $stopWords, true)) {
                $tokens[] = $w;
            }
        }

        return array_unique($tokens);
    }
}
