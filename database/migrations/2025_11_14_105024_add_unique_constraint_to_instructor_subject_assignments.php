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
        // First, remove any existing duplicates before adding the constraint (PostgreSQL syntax)
        \DB::statement('
            DELETE FROM instructor_subject_assignments
            WHERE id IN (
                SELECT id FROM (
                    SELECT id,
                        ROW_NUMBER() OVER (
                            PARTITION BY instructor_id, subject_id, section_id,
                                       academic_level_id, grading_period_id, school_year
                            ORDER BY id
                        ) as row_num
                    FROM instructor_subject_assignments
                ) t
                WHERE t.row_num > 1
            )
        ');

        \Log::info('[MIGRATION] Removed duplicate instructor_subject_assignments before adding unique constraint');

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->unique(
                [
                    'instructor_id',
                    'subject_id',
                    'section_id',
                    'academic_level_id',
                    'grading_period_id',
                    'school_year'
                ],
                'unique_instructor_subject_assignment'
            );
        });

        \Log::info('[MIGRATION] Added unique constraint to instructor_subject_assignments table');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_subject_assignment');
        });

        \Log::info('[MIGRATION] Dropped unique constraint from instructor_subject_assignments table');
    }
};
