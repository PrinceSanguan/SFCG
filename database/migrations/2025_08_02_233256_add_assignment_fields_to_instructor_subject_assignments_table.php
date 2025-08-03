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
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('instructor_subject_assignments', 'college_course_id')) {
                $table->unsignedBigInteger('college_course_id')->nullable()->after('year_level');
                $table->foreign('college_course_id')->references('id')->on('college_courses')->onDelete('set null');
            }
            if (!Schema::hasColumn('instructor_subject_assignments', 'semester')) {
                $table->string('semester')->nullable()->after('college_course_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            if (Schema::hasColumn('instructor_subject_assignments', 'college_course_id')) {
                $table->dropForeign(['college_course_id']);
                $table->dropColumn(['college_course_id']);
            }
            if (Schema::hasColumn('instructor_subject_assignments', 'semester')) {
                $table->dropColumn(['semester']);
            }
        });
    }
};
