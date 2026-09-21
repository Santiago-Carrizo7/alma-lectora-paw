<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('promo_quantity')->nullable();
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->string('cover_url')->nullable();
            $table->json('additional_images')->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('combo_books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('combo_id')->constrained('combos')->cascadeOnDelete();
            $table->foreignUuid('book_id')->constrained('books')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->unique(['combo_id', 'book_id']);
        });

        Schema::create('combo_accessories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('combo_id')->constrained('combos')->cascadeOnDelete();
            $table->foreignUuid('accessory_id')->constrained('accessories')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->unique(['combo_id', 'accessory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_accessories');
        Schema::dropIfExists('combo_books');
        Schema::dropIfExists('combos');
    }
};
