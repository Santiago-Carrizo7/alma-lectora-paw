<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderLead extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_leads';

    protected $fillable = [
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_dni',
        'postal_code',
        'address',
        'items',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
    ];
}
