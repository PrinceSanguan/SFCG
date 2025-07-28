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
        Schema::table('student_profiles', function (Blueprint $table) {
            // Make academic_level_id nullable since college students might not need traditional academic levels
            $table->foreignId('academic_level_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Revert academic_level_id to not nullable
            // Note: This might fail if there are null values in the database
            $table->foreignId('academic_level_id')->nullable(false)->change();
        });
    }
};
