<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'books';

    protected $fillable = [
        'isbn',
        'title',
        'original_title',
        'google_books_id',
        'published_date',
        'language',
        'synopsis',
        'cover_url',
        'additional_images',
        'price',
        'promo_quantity',
        'promo_price',
        'stock',
        'badge',
        'genre',
        'is_active',
    ];

    protected $casts = [
        'additional_images' => 'array',
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'stock' => 'integer',
        'promo_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'coverUrl',
        'originalTitle',
        'promoQuantity',
        'promoPrice',
        'isActive',
    ];

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class, 'book_authors', 'book_id', 'author_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $query->when($filters['search'] ?? null, function (Builder $q, string $search) use ($like) {
            $term = trim($search);
            $q->where(function (Builder $sub) use ($term, $like) {
                $sub->where('title', $like, "%{$term}%")
                    ->orWhere('original_title', $like, "%{$term}%")
                    ->orWhere('isbn', 'like', "%{$term}%")
                    ->orWhereHas('authors', function (Builder $authorQ) use ($term, $like) {
                        $authorQ->where('name', $like, "%{$term}%");
                    });
            });
        });

        $query->when($filters['genre'] ?? null, function (Builder $q, string $genre) use ($like) {
            $q->where('genre', $like, $genre);
        });

        $query->when($filters['badge'] ?? null, function (Builder $q, string $badge) use ($like) {
            $q->where('badge', $like, $badge);
        });

        return $query;
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->attributes['cover_url'] ?? null;
    }

    public function getOriginalTitleAttribute(): ?string
    {
        return $this->attributes['original_title'] ?? null;
    }

    public function getPromoQuantityAttribute(): ?int
    {
        return isset($this->attributes['promo_quantity']) ? (int) $this->attributes['promo_quantity'] : null;
    }

    public function getPromoPriceAttribute(): ?string
    {
        return $this->attributes['promo_price'] ?? null;
    }

    public function getIsActiveAttribute(): bool
    {
        return (bool) ($this->attributes['is_active'] ?? true);
    }
}
