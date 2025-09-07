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
            $table->foreignId('department_id')->nullable()->after('strand_id')->constrained()->onDelete('set null');
            $table->foreignId('course_id')->nullable()->after('department_id')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_subject_assignments', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });
    }
};