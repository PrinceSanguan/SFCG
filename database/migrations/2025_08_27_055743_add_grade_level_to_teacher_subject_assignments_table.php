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
        Schema::table('teacher_subject_assignments', function (Blueprint $table) {
            $table->enum('grade_level', ['grade_11', 'grade_12'])->after('academic_level_id')->nullable();
            $table->foreignId('strand_id')->nullable()->after('grade_level')->constrained('strands')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_subject_assignments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('strand_id');
            $table->dropColumn('grade_level');
        });
    }
};
