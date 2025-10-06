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
        // Step 1: Drop foreign keys that might be using the unique indexes
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['academic_level_id']);
        });

        // Step 2: Drop the old unique constraints
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Drop unique_instructor_course_assignment_detailed if it exists
            if (Schema::hasColumn('instructor_course_assignments', 'instructor_id')) {
                try {
                    $table->dropUnique('unique_instructor_course_assignment_detailed');
                } catch (\Exception $e) {
                    // Constraint might not exist, continue
                }
            }

            // Drop unique_instructor_course_assignment if it exists
            if (Schema::hasColumn('instructor_course_assignments', 'instructor_id')) {
                try {
                    $table->dropUnique('unique_instructor_course_assignment');
                } catch (\Exception $e) {
                    // Constraint might not exist, continue
                }
            }
        });

        // Step 3: Recreate the foreign keys and add new unique constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');

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
        // Step 1: Drop foreign keys
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['academic_level_id']);
        });

        // Step 2: Drop the new constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_course_subject_assignment');
        });

        // Step 3: Recreate foreign keys and restore old constraints
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');

            // Restore the old constraint
            $table->unique(
                ['instructor_id', 'course_id', 'academic_level_id', 'school_year'],
                'unique_instructor_course_assignment'
            );
        });
    }
};
