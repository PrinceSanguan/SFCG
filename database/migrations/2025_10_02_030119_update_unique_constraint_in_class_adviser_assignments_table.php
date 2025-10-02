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
        // Step 1: Create separate indexes for foreign keys if they don't exist
        // This ensures foreign keys don't rely on the unique constraint we're about to drop
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            $adviserIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'class_adviser_assignments_adviser_id_index'");
            if (empty($adviserIndexExists)) {
                $table->index('adviser_id');
            }

            $academicLevelIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'class_adviser_assignments_academic_level_id_index'");
            if (empty($academicLevelIndexExists)) {
                $table->index('academic_level_id');
            }
        });

        // Step 2: Now safely drop the old unique constraint and add the new one
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
        // Step 1: Drop the new unique constraint and restore the old one
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
                // Restore the old constraint (which will also serve as index for foreign keys)
                $table->unique(
                    ['adviser_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                    'unique_class_adviser_assignment'
                );
            }
        });

        // Step 2: Drop the separate indexes we created (only if they exist and old unique constraint is back)
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            $oldUniqueExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'unique_class_adviser_assignment'");

            if (!empty($oldUniqueExists)) {
                $adviserIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'class_adviser_assignments_adviser_id_index'");
                if (!empty($adviserIndexExists)) {
                    $table->dropIndex('class_adviser_assignments_adviser_id_index');
                }

                $academicLevelIndexExists = DB::select("SHOW INDEX FROM class_adviser_assignments WHERE Key_name = 'class_adviser_assignments_academic_level_id_index'");
                if (!empty($academicLevelIndexExists)) {
                    $table->dropIndex('class_adviser_assignments_academic_level_id_index');
                }
            }
        });
    }
};
