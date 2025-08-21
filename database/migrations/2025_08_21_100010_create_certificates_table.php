<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('certificate_templates')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('academic_level_id')->constrained('academic_levels')->cascadeOnDelete();
            $table->string('school_year');
            $table->string('serial_number')->unique();
            $table->string('status')->default('generated'); // generated, downloaded, printed, void
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('printed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};




