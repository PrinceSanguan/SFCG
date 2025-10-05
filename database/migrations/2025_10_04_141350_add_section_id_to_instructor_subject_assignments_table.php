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
            // Drop the old unique constraint FIRST (before adding foreign keys)
            $table->dropUnique('unique_instructor_subject_assignment');
        });

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Add section_id column with foreign key
            $table->foreignId('section_id')->nullable()->after('subject_id')->constrained()->onDelete('cascade');

            // Add new unique constraint including section_id
            $table->unique(
                ['instructor_id', 'subject_id', 'academic_level_id', 'section_id', 'school_year'],
                'unique_instructor_subject_section_assignment'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('unique_instructor_subject_section_assignment');

            // Restore the old unique constraint
            $table->unique(
                ['instructor_id', 'subject_id', 'academic_level_id', 'school_year'],
                'unique_instructor_subject_assignment'
            );

            // Drop section_id column
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });
    }
};
