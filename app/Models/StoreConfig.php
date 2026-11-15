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
        'is_store_open',
    ];

    protected $casts = [
        'is_store_open' => 'boolean',
    ];

    protected $appends = [
        'whatsappPhone',
        'instagramUrl',
        'isStoreOpen',
    ];

    public function getWhatsappPhoneAttribute(): ?string
    {
        return $this->attributes['whatsapp_phone'] ?? null;
    }

    public function getInstagramUrlAttribute(): ?string
    {
        return $this->attributes['instagram_url'] ?? null;
    }

    public function getIsStoreOpenAttribute(): bool
    {
        return (bool) ($this->attributes['is_store_open'] ?? true);
    }
}
