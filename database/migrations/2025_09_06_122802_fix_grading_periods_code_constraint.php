<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grading_periods', function (Blueprint $table) {
            // Drop the existing unique constraint on code
            $table->dropUnique(['code']);
            
            // Add a composite unique constraint on code and academic_level_id
            $table->unique(['code', 'academic_level_id'], 'grading_periods_code_level_unique');
        });
    }

    public function down(): void
    {
        Schema::table('grading_periods', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('grading_periods_code_level_unique');
            
            // Restore the original unique constraint on code
            $table->unique('code');
        });
    }
};