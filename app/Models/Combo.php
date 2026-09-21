<?php

namespace App\Models;

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
}
