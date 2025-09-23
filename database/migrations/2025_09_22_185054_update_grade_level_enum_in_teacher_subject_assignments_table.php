<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to drop and recreate the constraint
        DB::statement('ALTER TABLE teacher_subject_assignments DROP CONSTRAINT IF EXISTS teacher_subject_assignments_grade_level_check');
        
        // Update the column to allow all grade levels
        DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level TYPE VARCHAR(50)");
        
        // Add a new check constraint for all valid grade levels
        DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
            CHECK (grade_level IS NULL OR grade_level IN (
                'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
                'grade_7', 'grade_8', 'grade_9', 'grade_10',
                'grade_11', 'grade_12',
                'first_year', 'second_year', 'third_year', 'fourth_year'
            ))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the original constraint
        DB::statement('ALTER TABLE teacher_subject_assignments DROP CONSTRAINT IF EXISTS teacher_subject_assignments_grade_level_check');
        DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level TYPE VARCHAR(50)");
        DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
            CHECK (grade_level IS NULL OR grade_level IN ('grade_11', 'grade_12'))");
    }
};