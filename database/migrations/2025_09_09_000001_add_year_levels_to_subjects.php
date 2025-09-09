<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            // Senior High year level: grade_11 or grade_12 (store as string keys like 'grade_11','grade_12')
            $table->string('shs_year_level')->nullable()->after('course_id');
            // Junior High year level: first_year..fourth_year
            $table->string('jhs_year_level')->nullable()->after('shs_year_level');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['shs_year_level', 'jhs_year_level']);
        });
    }
};


