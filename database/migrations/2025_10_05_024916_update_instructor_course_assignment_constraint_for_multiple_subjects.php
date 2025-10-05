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
        // Drop the old constraints that prevent multiple subject assignments
        // Using raw SQL for PostgreSQL to handle constraints that may not exist
        DB::statement('ALTER TABLE instructor_course_assignments DROP CONSTRAINT IF EXISTS unique_instructor_course_assignment');
        DB::statement('ALTER TABLE instructor_course_assignments DROP CONSTRAINT IF EXISTS unique_instructor_course_assignment_detailed');

        // Add new unique constraint that includes subject_id to allow multiple subjects
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // New constraint allows same instructor/course/year but different subjects
            $table->unique(
                ['instructor_id', 'course_id', 'academic_level_id', 'subject_id', 'school_year'],
                'unique_instructor_course_subject_assignment'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the old constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('unique_instructor_course_subject_assignment');

            // Restore the old constraint
            $table->unique(
                ['instructor_id', 'course_id', 'academic_level_id', 'school_year'],
                'unique_instructor_course_assignment'
            );
        });
    }
};
