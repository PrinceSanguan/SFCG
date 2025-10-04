<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Change min_grade and min_grade_all from unsignedSmallInteger to decimal
     * to support SHS grading scale (1.0-5.0)
     */
    public function up(): void
    {
        Schema::table('honor_criteria', function (Blueprint $table) {
            $table->decimal('min_grade', 5, 2)->nullable()->change();
            $table->decimal('min_grade_all', 5, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('honor_criteria', function (Blueprint $table) {
            $table->unsignedSmallInteger('min_grade')->nullable()->change();
            $table->unsignedSmallInteger('min_grade_all')->nullable()->change();
        });
    }
};
