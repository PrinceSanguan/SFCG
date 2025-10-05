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
            // Drop the instructor_id foreign key first (it's using the unique index)
            $table->dropForeign(['instructor_id']);
        });

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Now we can drop the old unique constraint
            $table->dropUnique('unique_instructor_subject_assignment');
        });

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Recreate the instructor_id foreign key (MySQL will create its own index)
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');

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

            // Drop section_id column and its foreign key
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Drop the instructor_id foreign key before adding the unique constraint
            $table->dropForeign(['instructor_id']);
        });

        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Restore the old unique constraint
            $table->unique(
                ['instructor_id', 'subject_id', 'academic_level_id', 'school_year'],
                'unique_instructor_subject_assignment'
            );

            // Recreate the instructor_id foreign key
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
