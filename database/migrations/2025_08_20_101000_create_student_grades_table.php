<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('student_grades')) {
            return;
        }

        Schema::create('student_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('grading_period_id')->nullable()->constrained('grading_periods')->nullOnDelete();
            $table->string('school_year', 20); // e.g., "2024-2025"
            $table->unsignedTinyInteger('year_of_study')->nullable(); // 1..4 for college, optional for basic
            $table->decimal('grade', 5, 2);
            $table->timestamps();
            $table->index(['student_id', 'school_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_grades');
    }
};


