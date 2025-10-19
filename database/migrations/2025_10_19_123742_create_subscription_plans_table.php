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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('stripe_price_id')->unique();
            $table->string('stripe_product_id');
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('usd');
            $table->string('interval')->default('month'); // month, year
            $table->integer('trial_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('max_templates')->default(0); // 0 = unlimited
            $table->integer('max_contacts')->default(0); // 0 = unlimited
            $table->integer('max_emails_per_month')->default(0); // 0 = unlimited
            $table->json('features')->nullable(); // Additional features as JSON
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
