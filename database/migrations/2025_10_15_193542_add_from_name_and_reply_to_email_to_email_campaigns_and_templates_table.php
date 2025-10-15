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
        // Add columns to email_campaigns table
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->string('from_name')->nullable()->after('subject');
            $table->string('reply_to_email')->nullable()->after('from_name');
        });

        // Add columns to email_templates table
        Schema::table('email_templates', function (Blueprint $table) {
            $table->string('from_name')->nullable()->after('email_subject');
            $table->string('reply_to_email')->nullable()->after('from_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove columns from email_campaigns table
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn(['from_name', 'reply_to_email']);
        });

        // Remove columns from email_templates table
        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn(['from_name', 'reply_to_email']);
        });
    }
};
