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
        Schema::create('class_adviser_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adviser_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_level_id')->constrained('academic_levels')->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->string('year_level'); // Grade 1, Grade 2, etc.
            $table->string('section')->nullable(); // Section A, B, C, etc.
            $table->foreignId('strand_id')->nullable()->constrained('academic_strands')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure unique assignments per adviser, level, period, year, and section
            $table->unique(['adviser_id', 'academic_level_id', 'academic_period_id', 'year_level', 'section'], 'unique_adviser_assignment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_adviser_assignments');
    }
};
