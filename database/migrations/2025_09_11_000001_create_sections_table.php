<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->foreignId('academic_level_id')->constrained()->cascadeOnDelete();
            // For elementary and junior high: G1-6, G7-10
            $table->string('specific_year_level')->nullable();
            // For SHS
            $table->foreignId('track_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('strand_id')->nullable()->constrained()->nullOnDelete();
            // For College
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('max_students')->nullable();
            $table->string('school_year')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};


