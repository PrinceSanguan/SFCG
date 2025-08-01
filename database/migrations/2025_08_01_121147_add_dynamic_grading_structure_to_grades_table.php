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
        Schema::table('grades', function (Blueprint $table) {
            // Add new grading structure fields
            $table->json('semester_grades')->nullable()->after('quarterly_grades');
            $table->json('college_grades')->nullable()->after('semester_grades');
            $table->enum('student_type', ['elementary', 'junior_high', 'senior_high', 'college'])->nullable()->after('college_grades');
            
            // Add specific grade fields for different structures
            $table->decimal('1st_grading', 5, 2)->nullable()->after('student_type');
            $table->decimal('2nd_grading', 5, 2)->nullable()->after('1st_grading');
            $table->decimal('3rd_grading', 5, 2)->nullable()->after('2nd_grading');
            $table->decimal('4th_grading', 5, 2)->nullable()->after('3rd_grading');
            
            // Semester grades for Senior High and College
            $table->decimal('1st_semester_midterm', 5, 2)->nullable()->after('4th_grading');
            $table->decimal('1st_semester_pre_final', 5, 2)->nullable()->after('1st_semester_midterm');
            $table->decimal('1st_semester_final', 5, 2)->nullable()->after('1st_semester_pre_final');
            $table->decimal('2nd_semester_midterm', 5, 2)->nullable()->after('1st_semester_final');
            $table->decimal('2nd_semester_pre_final', 5, 2)->nullable()->after('2nd_semester_midterm');
            $table->decimal('2nd_semester_final', 5, 2)->nullable()->after('2nd_semester_pre_final');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            // Remove all added columns
            $table->dropColumn([
                'semester_grades',
                'college_grades', 
                'student_type',
                '1st_grading',
                '2nd_grading',
                '3rd_grading',
                '4th_grading',
                '1st_semester_midterm',
                '1st_semester_pre_final',
                '1st_semester_final',
                '2nd_semester_midterm',
                '2nd_semester_pre_final',
                '2nd_semester_final',
            ]);
        });
    }
};
