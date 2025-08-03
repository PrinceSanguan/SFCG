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
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            if (!Schema::hasColumn('instructor_subject_assignments', 'strand_id')) {
                $table->foreignId('strand_id')->nullable()->constrained('academic_strands')->onDelete('cascade');
            }
            if (!Schema::hasColumn('instructor_subject_assignments', 'year_level')) {
                $table->string('year_level')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            if (Schema::hasColumn('instructor_subject_assignments', 'strand_id')) {
                $table->dropForeign(['strand_id']);
                $table->dropColumn('strand_id');
            }
            if (Schema::hasColumn('instructor_subject_assignments', 'year_level')) {
                $table->dropColumn('year_level');
            }
        });
    }
};
