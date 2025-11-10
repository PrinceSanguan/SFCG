<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration creates the student_section_enrollments table to track
     * student enrollments in sections for specific school years.
     *
     * This allows:
     * - Historical tracking of student enrollments across school years
     * - Preventing duplicate enrollments (same student + section + school year)
     * - Better data integrity for academic records
     */
    public function up(): void
    {
        Schema::create('student_section_enrollments', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table (student)
            $table->foreignId('student_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Foreign key to sections table
            $table->foreignId('section_id')
                ->constrained('sections')
                ->onDelete('cascade');

            // School year in format: '2024-2025'
            $table->string('school_year', 20);

            // When the student was enrolled
            $table->timestamp('enrolled_at')->useCurrent();

            // Timestamps
            $table->timestamps();

            // Unique constraint to prevent duplicate enrollments
            $table->unique(
                ['student_id', 'section_id', 'school_year'],
                'unique_student_section_year'
            );

            // Indexes for faster queries
            $table->index('student_id', 'idx_enrollments_student');
            $table->index('section_id', 'idx_enrollments_section');
            $table->index('school_year', 'idx_enrollments_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_section_enrollments');
    }
};
