<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grading_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "First Quarter", "Second Semester"
            $table->string('code')->unique(); // e.g., "Q1", "S2"
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grading_periods');
    }
};
