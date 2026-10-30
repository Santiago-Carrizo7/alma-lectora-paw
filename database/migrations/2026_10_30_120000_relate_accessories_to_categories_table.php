<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Agregar columna category_id como clave foránea nullable
        Schema::table('accessories', function (Blueprint $table) {
            $table->foreignUuid('category_id')
                ->nullable()
                ->after('stock')
                ->constrained('accessory_categories')
                ->restrictOnDelete();
        });

        // 2. Sincronizar category_id haciendo match con las categorías existentes por slug o label
        DB::statement('
            UPDATE accessories
            SET category_id = accessory_categories.id
            FROM accessory_categories
            WHERE LOWER(accessories.category) = LOWER(accessory_categories.slug)
               OR LOWER(accessories.category) = LOWER(accessory_categories.label)
        ');

        // Fallback de seguridad: si algún accesorio no matcheó, asignarle la primera categoría existente
        $fallbackCatId = DB::table('accessory_categories')->orderBy('order')->value('id');
        if ($fallbackCatId) {
            DB::table('accessories')
                ->whereNull('category_id')
                ->update(['category_id' => $fallbackCatId]);
        }

        // 3. Forzar NOT NULL en category_id y eliminar la columna desnormalizada redundante 'category'
        Schema::table('accessories', function (Blueprint $table) {
            $table->uuid('category_id')->nullable(false)->change();
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        // 1. Restaurar columna category
        Schema::table('accessories', function (Blueprint $table) {
            $table->string('category', 100)->nullable()->after('stock');
        });

        // 2. Repoblar category con el slug de la relación
        DB::statement('
            UPDATE accessories
            SET category = accessory_categories.slug
            FROM accessory_categories
            WHERE accessories.category_id = accessory_categories.id
        ');

        // 3. Eliminar la restricción de clave foránea y la columna category_id
        Schema::table('accessories', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
