<?php

namespace App\Models;

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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) use ($like) {
                $q->where(function (Builder $sub) use ($search, $like) {
                    $sub->where('title', $like, "%{$search}%")
                        ->orWhere('description', $like, "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, function (Builder $q, string $category) {
                $q->where('category', $category);
            });
    }
}
