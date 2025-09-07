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
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('year_level')->constrained()->onDelete('set null');
            $table->foreignId('subject_id')->nullable()->after('course_id')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['subject_id']);
            $table->dropColumn(['department_id', 'subject_id']);
        });
    }
};
