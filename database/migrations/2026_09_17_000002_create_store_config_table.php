<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_config', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('whatsapp_phone', 50)->default('5493875708557');
            $table->string('instagram_url', 255)->default('https://www.instagram.com/alma.lectora.al/?hl=es-la');
            $table->decimal('shipping_cost', 12, 2)->default(0.00);
            $table->decimal('free_shipping_min', 12, 2)->default(0.00);
            $table->text('banner_message')->nullable();
            $table->boolean('is_store_open')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_config');
    }
};
