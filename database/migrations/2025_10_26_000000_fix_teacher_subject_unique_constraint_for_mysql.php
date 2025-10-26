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
        // For MySQL, we need to handle this carefully because dropping a unique index
        // that's being used by foreign keys requires us to ensure alternative indexes exist first

        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // First, ensure we have indexes on the foreign key columns
            // This is necessary because MySQL requires indexes on FK columns
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                // These indexes will be used by the foreign keys after we drop the unique constraint
                $table->index('teacher_id', 'idx_teacher_id');
                $table->index('subject_id', 'idx_subject_id');
                $table->index('academic_level_id', 'idx_academic_level_id');
            });

            // Now we can safely drop the old unique constraint
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->dropUnique('unique_teacher_subject_assignment');
            });

            // Add the new unique constraint that includes grading_period_id
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->unique(
                    ['teacher_id', 'subject_id', 'academic_level_id', 'school_year', 'grading_period_id'],
                    'unique_teacher_subject_grading_period'
                );
            });
        } else {
            // For other databases (SQLite, PostgreSQL, etc.), we can do it directly
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->dropUnique('unique_teacher_subject_assignment');
                $table->unique(
                    ['teacher_id', 'subject_id', 'academic_level_id', 'school_year', 'grading_period_id'],
                    'unique_teacher_subject_grading_period'
                );
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // Drop the new constraint
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->dropUnique('unique_teacher_subject_grading_period');
            });

            // Restore the old constraint
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->unique(
                    ['teacher_id', 'subject_id', 'academic_level_id', 'school_year'],
                    'unique_teacher_subject_assignment'
                );
            });

            // Drop the individual indexes we created
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->dropIndex('idx_teacher_id');
                $table->dropIndex('idx_subject_id');
                $table->dropIndex('idx_academic_level_id');
            });
        } else {
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->dropUnique('unique_teacher_subject_grading_period');
                $table->unique(
                    ['teacher_id', 'subject_id', 'academic_level_id', 'school_year'],
                    'unique_teacher_subject_assignment'
                );
            });
        }
    }
};
