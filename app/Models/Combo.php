<?php

namespace App\Models;

use App\Support\AccentInsensitiveSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Combo extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'combos';

    protected $fillable = [
        'title',
        'description',
        'price',
        'promo_quantity',
        'promo_price',
        'cover_url',
        'additional_images',
        'stock',
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

    public function books(): HasMany
    {
        return $this->hasMany(ComboBook::class, 'combo_id');
    }

    public function accessories(): HasMany
    {
        return $this->hasMany(ComboAccessory::class, 'combo_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function (Builder $q, string $search) {
            $term = trim($search);
            $q->where(function (Builder $sub) use ($term) {
                AccentInsensitiveSearch::where($sub, 'title', $term);
                AccentInsensitiveSearch::orWhere($sub, 'description', $term);
                $sub->orWhereHas('books.book', function (Builder $bookQ) use ($term) {
                    AccentInsensitiveSearch::where($bookQ, 'title', $term);
                    $bookQ->orWhereHas('authors', function (Builder $authorQ) use ($term) {
                        AccentInsensitiveSearch::where($authorQ, 'name', $term);
                    });
                })
                    ->orWhereHas('accessories.accessory', function (Builder $accQ) use ($term) {
                        AccentInsensitiveSearch::where($accQ, 'title', $term);
                    });
            });
        });

        $query->when($filters['stock_status'] ?? null, function (Builder $q, string $stockStatus) {
            match ($stockStatus) {
                'in_stock' => $q->where('stock', '>', 0),
                'low_stock' => $q->whereBetween('stock', [1, 3]),
                'out_of_stock' => $q->where('stock', '<=', 0),
                default => null,
            };
        });

        $query->when($filters['sort'] ?? null, function (Builder $q, string $sort) {
            match ($sort) {
                'price_asc' => $q->orderBy('price', 'asc'),
                'price_desc' => $q->orderBy('price', 'desc'),
                'stock_asc' => $q->orderBy('stock', 'asc'),
                'stock_desc' => $q->orderBy('stock', 'desc'),
                'title_asc' => $q->orderBy('title', 'asc'),
                default => $q->latest(),
            };
        });

        return $query;
    }
}
