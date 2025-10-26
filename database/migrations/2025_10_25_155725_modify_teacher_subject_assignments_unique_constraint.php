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
        Schema::table('teacher_subject_assignments', function (Blueprint $table) {
            // Drop the old unique constraint that doesn't include grading_period_id
            $table->dropUnique('unique_teacher_subject_assignment');

            // Add new unique constraint that includes grading_period_id
            // This allows teachers to have multiple assignments for the same subject with different grading periods
            $table->unique(
                ['teacher_id', 'subject_id', 'academic_level_id', 'school_year', 'grading_period_id'],
                'unique_teacher_subject_grading_period'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_subject_assignments', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('unique_teacher_subject_grading_period');

            // Restore the old constraint
            $table->unique(
                ['teacher_id', 'subject_id', 'academic_level_id', 'school_year'],
                'unique_teacher_subject_assignment'
            );
        });
    }
};
