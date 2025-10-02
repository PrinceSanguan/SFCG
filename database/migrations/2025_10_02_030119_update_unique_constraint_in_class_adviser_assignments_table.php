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
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            // Drop the old unique constraint that prevents multiple subjects per adviser/section
            $table->dropUnique('unique_class_adviser_assignment');

            // Add new unique constraint that includes subject_id
            // This allows multiple subjects to be assigned to the same adviser/section/year
            $table->unique(
                ['adviser_id', 'subject_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                'unique_adviser_subject_section'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('unique_adviser_subject_section');

            // Restore the old constraint
            $table->unique(
                ['adviser_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                'unique_class_adviser_assignment'
            );
        });
    }
};
