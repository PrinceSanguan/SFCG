<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds grading_period_id to honor_results table to support
     * per-period honor tracking for Senior High School students.
     *
     * Background: SHS has 4 grading periods per year (2 semesters × 2 periods each).
     * Students can qualify for honors in each period independently, but must maintain
     * no grades below 85 across ALL previous and current periods to qualify.
     */
    public function up(): void
    {
        \Log::info('[SHS HONOR MIGRATION] === STARTING MIGRATION: Add grading_period_id to honor_results ===');

        Schema::table('honor_results', function (Blueprint $table) {
            // Add grading_period_id column (nullable for backwards compatibility)
            $table->foreignId('grading_period_id')
                ->nullable()
                ->after('academic_level_id')
                ->constrained('grading_periods')
                ->onDelete('cascade');

            // Add index for faster period-based queries
            $table->index('grading_period_id', 'idx_honor_results_period');

            \Log::info('[SHS HONOR MIGRATION] Added grading_period_id column with foreign key and index');
        });

        // Drop the old unique constraint that doesn't include grading_period_id
        Schema::table('honor_results', function (Blueprint $table) {
            $table->dropUnique('unique_student_honor_year');
            \Log::info('[SHS HONOR MIGRATION] Dropped old unique constraint: unique_student_honor_year');
        });

        // Add new unique constraint that includes grading_period_id
        // This allows same student to have multiple honors in the same year (one per period)
        Schema::table('honor_results', function (Blueprint $table) {
            $table->unique(
                ['student_id', 'honor_type_id', 'school_year', 'grading_period_id'],
                'unique_student_honor_year_period'
            );
            \Log::info('[SHS HONOR MIGRATION] Added new unique constraint: unique_student_honor_year_period');
        });

        \Log::info('[SHS HONOR MIGRATION] === MIGRATION COMPLETED SUCCESSFULLY ===');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Log::info('[SHS HONOR MIGRATION] === ROLLING BACK MIGRATION: Remove grading_period_id from honor_results ===');

        // Drop new unique constraint
        Schema::table('honor_results', function (Blueprint $table) {
            $table->dropUnique('unique_student_honor_year_period');
            \Log::info('[SHS HONOR MIGRATION] Dropped unique constraint: unique_student_honor_year_period');
        });

        // Restore old unique constraint
        Schema::table('honor_results', function (Blueprint $table) {
            $table->unique(['student_id', 'honor_type_id', 'school_year'], 'unique_student_honor_year');
            \Log::info('[SHS HONOR MIGRATION] Restored old unique constraint: unique_student_honor_year');
        });

        // Drop grading_period_id column
        Schema::table('honor_results', function (Blueprint $table) {
            $table->dropIndex('idx_honor_results_period');
            $table->dropForeign(['grading_period_id']);
            $table->dropColumn('grading_period_id');
            \Log::info('[SHS HONOR MIGRATION] Removed grading_period_id column');
        });

        \Log::info('[SHS HONOR MIGRATION] === ROLLBACK COMPLETED SUCCESSFULLY ===');
    }
};
