<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            // Check if the old unique constraint exists before dropping it
            $indexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'unique_class_adviser_assignment'");

            if (!empty($indexExists)) {
                // Drop the old unique constraint that prevents multiple subjects per adviser/section
                $table->dropUnique('unique_class_adviser_assignment');
            }

            // Check if new constraint doesn't already exist
            $newIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'unique_adviser_subject_section'");

            if (empty($newIndexExists)) {
                // Add new unique constraint that includes subject_id
                // This allows multiple subjects to be assigned to the same adviser/section/year
                $table->unique(
                    ['adviser_id', 'subject_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                    'unique_adviser_subject_section'
                );
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            // Check if the new constraint exists before dropping it
            $newIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'unique_adviser_subject_section'");

            if (!empty($newIndexExists)) {
                // Drop the new constraint
                $table->dropUnique('unique_adviser_subject_section');
            }

            // Check if old constraint doesn't already exist
            $indexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'unique_class_adviser_assignment'");

            if (empty($indexExists)) {
                // Restore the old constraint
                $table->unique(
                    ['adviser_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                    'unique_class_adviser_assignment'
                );
            }
        });
    }
};
