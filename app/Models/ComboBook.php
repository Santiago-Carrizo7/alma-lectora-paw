<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComboBook extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'combo_books';

    protected $fillable = [
        'combo_id',
        'book_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function combo(): BelongsTo
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
