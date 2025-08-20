<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('honor_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('honor_type_id')->constrained('honor_types')->onDelete('cascade');
            $table->decimal('min_gpa', 5, 2)->nullable();
            $table->decimal('max_gpa', 5, 2)->nullable();
            $table->unsignedSmallInteger('min_grade')->nullable();
            $table->unsignedSmallInteger('min_grade_all')->nullable();
            $table->unsignedSmallInteger('min_year')->nullable();
            $table->unsignedSmallInteger('max_year')->nullable();
            $table->boolean('require_consistent_honor')->default(false);
            $table->json('additional_rules')->nullable();
            $table->timestamps();
            $table->unique(['academic_level_id', 'honor_type_id'], 'unique_level_honor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('honor_criteria');
    }
};


