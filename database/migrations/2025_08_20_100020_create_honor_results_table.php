<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('honor_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('honor_type_id')->constrained('honor_types')->onDelete('cascade');
            $table->foreignId('academic_level_id')->constrained()->onDelete('cascade');
            $table->string('school_year')->index();
            $table->decimal('gpa', 5, 2)->nullable();
            $table->boolean('is_overridden')->default(false);
            $table->text('override_reason')->nullable();
            $table->unsignedBigInteger('overridden_by')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'honor_type_id', 'school_year'], 'unique_student_honor_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('honor_results');
    }
};


