<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreConfig extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'store_config';

    protected $fillable = [
        'whatsapp_phone',
        'instagram_url',
        'shipping_cost',
        'free_shipping_min',
        'banner_message',
        'is_store_open',
    ];

    protected $casts = [
        'shipping_cost' => 'decimal:2',
        'free_shipping_min' => 'decimal:2',
        'is_store_open' => 'boolean',
    ];
}
