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
        Schema::table('certificate_templates', function (Blueprint $table) {
            // Remove image_placeholders column
            $table->dropColumn('image_placeholders');
            
            // Add education_level column
            $table->enum('education_level', ['elementary', 'junior_high', 'senior_high', 'college'])->nullable()->after('image_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            // Add back image_placeholders column
            $table->json('image_placeholders')->nullable()->after('image_description');
            
            // Remove education_level column
            $table->dropColumn('education_level');
        });
    }
};
