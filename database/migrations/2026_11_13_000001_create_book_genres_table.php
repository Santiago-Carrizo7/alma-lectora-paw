<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_genres', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100)->unique();
            $table->timestamps();
        });

        if (Schema::hasTable('books')) {
            $existingGenres = DB::table('books')
                ->whereNotNull('genre')
                ->where('genre', '!=', '')
                ->distinct()
                ->pluck('genre');

            $now = now();
            foreach ($existingGenres as $genre) {
                $trimmed = trim((string) $genre);
                if ($trimmed !== '') {
                    DB::table('book_genres')->insertOrIgnore([
                        'id' => (string) Str::uuid(),
                        'name' => $trimmed,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_genres');
    }
};
