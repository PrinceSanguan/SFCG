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
            // Add section_id column
            $table->foreignId('section_id')->nullable()->after('course_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Drop section_id column
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });
    }
};
