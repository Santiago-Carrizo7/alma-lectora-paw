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
        if (! Schema::hasTable('store_config')) {
            return;
        }

        $columnsToDrop = [];
        foreach (['shipping_cost', 'free_shipping_min', 'banner_message'] as $col) {
            if (Schema::hasColumn('store_config', $col)) {
                $columnsToDrop[] = $col;
            }
        }

        if (! empty($columnsToDrop)) {
            Schema::table('store_config', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('store_config')) {
            return;
        }

        Schema::table('store_config', function (Blueprint $table) {
            if (! Schema::hasColumn('store_config', 'shipping_cost')) {
                $table->decimal('shipping_cost', 12, 2)->default(0.00);
            }
            if (! Schema::hasColumn('store_config', 'free_shipping_min')) {
                $table->decimal('free_shipping_min', 12, 2)->default(0.00);
            }
            if (! Schema::hasColumn('store_config', 'banner_message')) {
                $table->text('banner_message')->nullable();
            }
        });
    }
};
