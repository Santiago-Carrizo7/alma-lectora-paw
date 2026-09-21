<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComboAccessory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'combo_accessories';

    protected $fillable = [
        'combo_id',
        'accessory_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function combo(): BelongsTo
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }

    public function accessory(): BelongsTo
    {
        return $this->belongsTo(Accessory::class, 'accessory_id');
    }
}
