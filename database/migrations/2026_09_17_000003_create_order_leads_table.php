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
        Schema::create('order_leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('customer_name', 150);
            $table->string('customer_phone', 50);
            $table->string('customer_email', 255);
            $table->string('customer_dni', 20);
            $table->string('postal_code', 20)->nullable();
            $table->text('address')->nullable();
            $table->jsonb('items');
            $table->decimal('total_amount', 12, 2);
            $table->string('status', 30)->default('PENDING_WHATSAPP');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_leads');
    }
};
