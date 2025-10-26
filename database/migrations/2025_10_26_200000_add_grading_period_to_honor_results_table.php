<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

        $driver = DB::connection()->getDriverName();

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

        if ($driver === 'mysql') {
            // For MySQL: Create separate indexes for foreign key columns first
            // This ensures foreign keys have indexes after we drop the unique constraint
            Schema::table('honor_results', function (Blueprint $table) {
                $table->index('student_id', 'idx_student_id');
                $table->index('honor_type_id', 'idx_honor_type_id');
                $table->index('academic_level_id', 'idx_academic_level_id');
                \Log::info('[SHS HONOR MIGRATION] Created individual indexes for foreign key columns (MySQL)');
            });

            // Drop the old unique constraint that doesn't include grading_period_id
            Schema::table('honor_results', function (Blueprint $table) {
                $table->dropUnique('unique_student_honor_year');
                \Log::info('[SHS HONOR MIGRATION] Dropped old unique constraint: unique_student_honor_year');
            });

            // Add new unique constraint that includes grading_period_id
            Schema::table('honor_results', function (Blueprint $table) {
                $table->unique(
                    ['student_id', 'honor_type_id', 'school_year', 'grading_period_id'],
                    'unique_student_honor_year_period'
                );
                \Log::info('[SHS HONOR MIGRATION] Added new unique constraint: unique_student_honor_year_period');
            });
        } else {
            // For PostgreSQL and other databases: simpler approach
            Schema::table('honor_results', function (Blueprint $table) {
                $table->dropUnique('unique_student_honor_year');
                \Log::info('[SHS HONOR MIGRATION] Dropped old unique constraint: unique_student_honor_year');

                $table->unique(
                    ['student_id', 'honor_type_id', 'school_year', 'grading_period_id'],
                    'unique_student_honor_year_period'
                );
                \Log::info('[SHS HONOR MIGRATION] Added new unique constraint: unique_student_honor_year_period');
            });
        }

        \Log::info('[SHS HONOR MIGRATION] === MIGRATION COMPLETED SUCCESSFULLY ===');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Log::info('[SHS HONOR MIGRATION] === ROLLING BACK MIGRATION: Remove grading_period_id from honor_results ===');

        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
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

            // Drop the individual indexes we created
            Schema::table('honor_results', function (Blueprint $table) {
                $table->dropIndex('idx_student_id');
                $table->dropIndex('idx_honor_type_id');
                $table->dropIndex('idx_academic_level_id');
                \Log::info('[SHS HONOR MIGRATION] Dropped individual indexes for foreign key columns (MySQL)');
            });
        } else {
            // For PostgreSQL and other databases
            Schema::table('honor_results', function (Blueprint $table) {
                $table->dropUnique('unique_student_honor_year_period');
                \Log::info('[SHS HONOR MIGRATION] Dropped unique constraint: unique_student_honor_year_period');

                $table->unique(['student_id', 'honor_type_id', 'school_year'], 'unique_student_honor_year');
                \Log::info('[SHS HONOR MIGRATION] Restored old unique constraint: unique_student_honor_year');
            });
        }

        // Drop grading_period_id column (same for all databases)
        Schema::table('honor_results', function (Blueprint $table) {
            $table->dropIndex('idx_honor_results_period');
            $table->dropForeign(['grading_period_id']);
            $table->dropColumn('grading_period_id');
            \Log::info('[SHS HONOR MIGRATION] Removed grading_period_id column');
        });

        \Log::info('[SHS HONOR MIGRATION] === ROLLBACK COMPLETED SUCCESSFULLY ===');
    }
};
