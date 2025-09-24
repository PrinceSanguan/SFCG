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
        $driver = DB::getDriverName();

        // Drop existing constraint if present to avoid duplicates
        try {
            DB::statement('ALTER TABLE teacher_subject_assignments DROP CONSTRAINT IF EXISTS teacher_subject_assignments_grade_level_check');
        } catch (\Exception $e) {
            \Log::warning('Could not drop existing grade_level check constraint: ' . $e->getMessage());
        }

        if ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level TYPE VARCHAR(50)");
            DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level DROP NOT NULL");
            try {
                DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
                    CHECK (grade_level IS NULL OR grade_level IN (
                        'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
                        'grade_7', 'grade_8', 'grade_9', 'grade_10',
                        'grade_11', 'grade_12',
                        'first_year', 'second_year', 'third_year', 'fourth_year'
                    ))");
            } catch (\Exception $e) {
                \Log::warning('Could not add check constraint for grade_level (pgsql): ' . $e->getMessage());
            }
        } else {
            // MySQL / MariaDB
            DB::statement("ALTER TABLE teacher_subject_assignments MODIFY COLUMN grade_level VARCHAR(50) NULL");
            try {
                DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
                    CHECK (grade_level IS NULL OR grade_level IN (
                        'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
                        'grade_7', 'grade_8', 'grade_9', 'grade_10',
                        'grade_11', 'grade_12',
                        'first_year', 'second_year', 'third_year', 'fourth_year'
                    ))");
            } catch (\Exception $e) {
                \Log::warning('Could not add check constraint for grade_level (mysql): ' . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        // Drop the broad constraint
        try {
            DB::statement('ALTER TABLE teacher_subject_assignments DROP CONSTRAINT IF EXISTS teacher_subject_assignments_grade_level_check');
        } catch (\Exception $e) {
            \Log::warning('Could not drop check constraint for grade_level: ' . $e->getMessage());
        }

        // Keep column as VARCHAR(50) NULL, but restore a simpler constraint for SHS only
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level TYPE VARCHAR(50)");
            DB::statement("ALTER TABLE teacher_subject_assignments ALTER COLUMN grade_level DROP NOT NULL");
            try {
                DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
                    CHECK (grade_level IS NULL OR grade_level IN ('grade_11', 'grade_12'))");
            } catch (\Exception $e) {
                \Log::warning('Could not add original check constraint for grade_level (pgsql): ' . $e->getMessage());
            }
        } else {
            DB::statement("ALTER TABLE teacher_subject_assignments MODIFY COLUMN grade_level VARCHAR(50) NULL");
            try {
                DB::statement("ALTER TABLE teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_grade_level_check 
                    CHECK (grade_level IS NULL OR grade_level IN ('grade_11', 'grade_12'))");
            } catch (\Exception $e) {
                \Log::warning('Could not add original check constraint for grade_level (mysql): ' . $e->getMessage());
            }
        }
    }
};