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
        Schema::create('college_courses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Bachelor of Science in Computer Science
            $table->string('code')->unique(); // e.g., BSCS, BSIT, BSBA
            $table->string('description')->nullable();
            $table->enum('degree_type', ['bachelor', 'master', 'doctorate', 'diploma', 'certificate'])
                  ->default('bachelor');
            $table->integer('years_duration')->default(4); // Duration in years
            $table->string('department')->nullable(); // e.g., College of Engineering, College of Business
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Update subjects table to support college courses
        Schema::table('subjects', function (Blueprint $table) {
            $table->foreignId('college_course_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('year_level')->nullable(); // 1st year, 2nd year, etc. for college
            $table->enum('semester', ['1st', '2nd', 'summer'])->nullable(); // For college subjects
        });

        // Update student_profiles table to support college courses
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->foreignId('college_course_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('year_level')->nullable(); // For college students
            $table->enum('semester', ['1st', '2nd', 'summer'])->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropForeign(['college_course_id']);
            $table->dropColumn(['college_course_id', 'year_level', 'semester']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropForeign(['college_course_id']);
            $table->dropColumn(['college_course_id', 'year_level', 'semester']);
        });

        Schema::dropIfExists('college_courses');
    }
}; 