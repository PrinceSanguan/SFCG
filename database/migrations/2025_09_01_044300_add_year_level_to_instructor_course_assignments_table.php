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
            $table->string('year_level', 50)->nullable()->after('academic_level_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropColumn('year_level');
        });
    }
};
