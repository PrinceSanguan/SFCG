<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_course_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('grading_period_id')->nullable()->constrained()->onDelete('set null');
            $table->string('school_year');
            $table->boolean('is_active')->default(true);
            $table->timestamp('assigned_at')->useCurrent();
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Prevent duplicate assignments
            $table->unique(['instructor_id', 'course_id', 'academic_level_id', 'school_year'], 'unique_instructor_course_assignment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_course_assignments');
    }
};
