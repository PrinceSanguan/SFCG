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
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Drop the existing unique constraint
            $table->dropUnique('unique_instructor_course_assignment');
            
            // Add a new, less restrictive unique constraint
            // This allows multiple assignments but prevents exact duplicates
            $table->unique(['instructor_id', 'course_id', 'academic_level_id', 'grading_period_id', 'school_year'], 'unique_instructor_course_assignment_detailed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('unique_instructor_course_assignment_detailed');
            
            // Restore the original constraint
            $table->unique(['instructor_id', 'course_id', 'academic_level_id', 'school_year'], 'unique_instructor_course_assignment');
        });
    }
};
