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
        // Academic Levels (Elementary, Junior High, Senior High, College)
        Schema::create('academic_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Elementary, Junior High, Senior High, College
            $table->string('code'); // ELEM, JHS, SHS, COL
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Academic Periods (Semesters, Quarters)
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 1st Semester, 2nd Semester, 1st Quarter, etc.
            $table->string('type'); // semester, quarter
            $table->string('school_year'); // 2024-2025
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Academic Strands (for SHS)
        Schema::create('academic_strands', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // STEM, HUMSS, ABM, etc.
            $table->string('code'); // STEM, HUMSS, ABM
            $table->text('description')->nullable();
            $table->foreignId('academic_level_id')->constrained('academic_levels');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code');
            $table->text('description')->nullable();
            $table->integer('units')->default(3);
            $table->foreignId('academic_level_id')->constrained('academic_levels');
            $table->foreignId('academic_strand_id')->nullable()->constrained('academic_strands');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Student Profiles (extended user information)
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('student_id')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('birth_date');
            $table->string('gender');
            $table->text('address');
            $table->string('contact_number')->nullable();
            $table->foreignId('academic_level_id')->constrained('academic_levels');
            $table->foreignId('academic_strand_id')->nullable()->constrained('academic_strands');
            $table->string('grade_level'); // Grade 7, Grade 11, 1st Year, etc.
            $table->string('section')->nullable();
            $table->foreignId('class_adviser_id')->nullable()->constrained('users');
            $table->enum('enrollment_status', ['active', 'inactive', 'graduated', 'dropped'])->default('active');
            $table->timestamps();
        });

        // Parent-Student Relationships
        Schema::create('parent_student_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users');
            $table->foreignId('student_id')->constrained('users');
            $table->enum('relationship', ['father', 'mother', 'guardian']);
            $table->timestamps();
        });

        // Instructor-Subject Assignments
        Schema::create('instructor_subject_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users');
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('academic_period_id')->constrained('academic_periods');
            $table->string('section')->nullable();
            $table->timestamps();
        });

        // Grades
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('instructor_id')->constrained('users');
            $table->foreignId('academic_period_id')->constrained('academic_periods');
            $table->decimal('prelim_grade', 5, 2)->nullable();
            $table->decimal('midterm_grade', 5, 2)->nullable();
            $table->decimal('final_grade', 5, 2)->nullable();
            $table->decimal('overall_grade', 5, 2)->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'finalized'])->default('draft');
            $table->foreignId('submitted_by')->nullable()->constrained('users');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // Honor Criteria
        Schema::create('honor_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_level_id')->constrained('academic_levels');
            $table->string('honor_type'); // with_honors, with_high_honors, with_highest_honors
            $table->decimal('minimum_grade', 5, 2);
            $table->decimal('maximum_grade', 5, 2);
            $table->text('criteria_description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Student Honors
        Schema::create('student_honors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('academic_period_id')->constrained('academic_periods');
            $table->string('honor_type'); // with_honors, with_high_honors, with_highest_honors
            $table->decimal('gpa', 5, 2);
            $table->boolean('is_approved')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        // Certificate Templates
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // honor_roll, graduation, achievement
            $table->text('template_content'); // HTML/JSON content
            $table->text('variables')->nullable(); // Available variables for template
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Generated Certificates
        Schema::create('generated_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('certificate_template_id')->constrained('certificate_templates');
            $table->foreignId('academic_period_id')->nullable()->constrained('academic_periods');
            $table->string('certificate_type'); // honor_roll, graduation, achievement
            $table->text('certificate_data'); // JSON data used for generation
            $table->string('file_path')->nullable(); // Path to generated PDF
            $table->string('certificate_number')->unique();
            $table->foreignId('generated_by')->constrained('users');
            $table->timestamp('generated_at');
            $table->boolean('is_digitally_signed')->default(false);
            $table->timestamps();
        });

        // Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('action'); // created, updated, deleted, approved, etc.
            $table->string('model'); // User, Grade, Honor, etc.
            $table->unsignedBigInteger('model_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('type'); // honor_achievement, grade_submitted, etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional data
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('generated_certificates');
        Schema::dropIfExists('certificate_templates');
        Schema::dropIfExists('student_honors');
        Schema::dropIfExists('honor_criteria');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('instructor_subject_assignments');
        Schema::dropIfExists('parent_student_links');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('academic_strands');
        Schema::dropIfExists('academic_periods');
        Schema::dropIfExists('academic_levels');
    }
}; 