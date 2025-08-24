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
        Schema::create('student_subject_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('school_year', 20); // e.g., "2024-2025"
            $table->string('semester', 20)->nullable(); // e.g., "1st Semester", "2nd Semester"
            $table->boolean('is_active')->default(true);
            $table->timestamp('enrolled_at')->useCurrent();
            $table->foreignId('enrolled_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['student_id', 'subject_id', 'school_year', 'semester'], 'unique_student_subject_enrollment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subject_assignments');
    }
};
