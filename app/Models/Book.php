<?php

namespace App\Models;

use App\Support\AccentInsensitiveSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

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

        $query->when($filters['search'] ?? null, function (Builder $q, string $search) {
            $term = trim($search);
            $q->where(function (Builder $sub) use ($term) {
                AccentInsensitiveSearch::where($sub, 'title', $term);
                AccentInsensitiveSearch::orWhere($sub, 'original_title', $term);
                $sub->orWhere('isbn', 'like', AccentInsensitiveSearch::containsPattern($sub, $term))
                    ->orWhereHas('authors', function (Builder $authorQ) use ($term) {
                        AccentInsensitiveSearch::where($authorQ, 'name', $term);
                    });
            });
        });

        $query->when($filters['genre'] ?? null, function (Builder $q, string $genre) use ($like) {
            $q->where('genre', $like, $genre);
        });

        $query->when($filters['author'] ?? null, function (Builder $q, string $author) use ($like) {
            $term = trim($author);
            $q->whereHas('authors', function (Builder $authorQ) use ($term, $like) {
                $authorQ->where('name', $like, $term);
            });
        });

        $query->when($filters['badge'] ?? null, function (Builder $q, string $badge) use ($like) {
            $normalized = mb_strtolower(trim($badge));
            if ($normalized === 'más vendido' || $normalized === 'mas vendido') {
                $topIds = self::getTopSellingBookIds(15);
                if (! empty($topIds)) {
                    $q->where(function (Builder $sub) use ($topIds, $like) {
                        $sub->whereIn('id', $topIds)
                            ->orWhere('badge', $like, 'Más vendido');
                    });
                } else {
                    $q->where('badge', $like, 'Más vendido');
                }
            } else {
                $q->where('badge', $like, $badge);
            }
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

    /**
     * Return top selling book UUIDs ordered by confirmed units sold descending.
     *
     * @return array<int, string>
     */
    public static function getTopSellingBookIds(int $limit = 15): array
    {
        $orders = OrderLead::where('status', 'CONFIRMED')->get(['items']);
        $salesByBook = [];

        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : [];
            foreach ($items as $item) {
                if (($item['type'] ?? '') === 'BOOK' && ! empty($item['id'])) {
                    $bookId = (string) $item['id'];
                    $qty = (int) ($item['quantity'] ?? 0);
                    if ($qty > 0) {
                        $salesByBook[$bookId] = ($salesByBook[$bookId] ?? 0) + $qty;
                    }
                }
            }
        }

        $salesByBook = array_filter($salesByBook, fn (int $units) => $units > 0);
        arsort($salesByBook);

        return array_slice(array_keys($salesByBook), 0, $limit);
    }

    /**
     * Return dynamic best sellers ordered by confirmed sales, falling back to 'Más vendido' badge.
     */
    public static function getDynamicBestSellers(int $limit = 12): Collection
    {
        $topIds = self::getTopSellingBookIds($limit);

        $books = ! empty($topIds)
            ? self::active()
                ->with('authors')
                ->whereIn('id', $topIds)
                ->get()
                ->sortBy(fn (self $book) => array_search($book->id, $topIds, true))
                ->values()
            : collect();

        if ($books->count() < $limit) {
            $like = self::query()->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $foundIds = $books->pluck('id')->all();

            $fallback = self::active()
                ->with('authors')
                ->where('badge', $like, '%vendido%')
                ->whereNotIn('id', $foundIds)
                ->take($limit - count($foundIds))
                ->get();

            $books = $books->concat($fallback)->values();
        }

        foreach ($books as $book) {
            $book->setAttribute('badge', 'Más vendido');
        }

        return $books;
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
