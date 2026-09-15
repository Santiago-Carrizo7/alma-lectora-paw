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
        Schema::create('authors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255)->unique();
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('isbn', 20)->unique();
            $table->string('title', 255);
            $table->string('original_title', 255)->nullable();
            $table->string('google_books_id', 100)->unique()->nullable();
            $table->string('published_date', 50)->nullable();
            $table->string('language', 10)->nullable();
            $table->text('synopsis')->nullable();
            $table->text('cover_url')->nullable();
            $table->jsonb('additional_images')->default('[]');
            $table->decimal('price', 12, 2);
            $table->integer('promo_quantity')->nullable();
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('badge', 50)->nullable();
            $table->string('genre', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'stock']);
            $table->index('genre');
            $table->index('badge');
        });

        Schema::create('book_authors', function (Blueprint $table) {
            $table->uuid('book_id');
            $table->uuid('author_id');

            $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('authors')->onDelete('cascade');

            $table->primary(['book_id', 'author_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_authors');
        Schema::dropIfExists('books');
        Schema::dropIfExists('authors');
    }
};
