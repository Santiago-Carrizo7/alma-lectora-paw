<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accessory_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug', 100)->unique();
            $table->string('label', 100);
            $table->string('emoji', 10)->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('accessories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('promo_quantity')->nullable();
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('category', 100);
            $table->text('cover_url')->nullable();
            $table->json('additional_images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['is_active', 'stock']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accessories');
        Schema::dropIfExists('accessory_categories');
    }
};
