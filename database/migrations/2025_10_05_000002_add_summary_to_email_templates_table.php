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
        Schema::table('email_templates', function (Blueprint $table) {
            $table->unsignedBigInteger('total_processed')->default(0)->after('thumbnail');
            $table->unsignedBigInteger('total_sent')->default(0)->after('total_processed');
            $table->unsignedBigInteger('total_failed')->default(0)->after('total_sent');
            $table->timestamp('last_import_summary_at')->nullable()->after('total_failed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn(['total_processed', 'total_sent', 'total_failed', 'last_import_summary_at']);
        });
    }
};
