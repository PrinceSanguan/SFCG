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
            $table->string('year_level')->nullable()->after('section');
            $table->unsignedBigInteger('college_course_id')->nullable()->after('year_level');
            $table->string('semester')->nullable()->after('college_course_id');
            
            $table->foreign('college_course_id')->references('id')->on('college_courses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropForeign(['college_course_id']);
            $table->dropColumn(['year_level', 'college_course_id', 'semester']);
        });
    }
};
