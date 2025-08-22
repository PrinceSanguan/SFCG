<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('class_adviser_assignments')) {
            return;
        }

        Schema::create('class_adviser_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adviser_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->string('grade_level', 50); // e.g., "Grade 1", "Grade 7"
            $table->string('section', 50); // e.g., "A", "B", "Diamond"
            $table->string('school_year', 20); // e.g., "2024-2025"
            $table->boolean('is_active')->default(true);
            $table->timestamp('assigned_at')->useCurrent();
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Prevent duplicate assignments - optimized for MySQL key length
            $table->unique(['adviser_id', 'academic_level_id', 'grade_level', 'section', 'school_year'], 'unique_class_adviser_assignment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_adviser_assignments');
    }
};
