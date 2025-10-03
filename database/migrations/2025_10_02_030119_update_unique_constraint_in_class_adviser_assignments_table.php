<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check if an index exists (works for both MySQL and PostgreSQL)
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $result = DB::select(
                "SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );
        } else {
            // MySQL
            $result = DB::select(
                "SHOW INDEX FROM {$table} WHERE Key_name = ?",
                [$indexName]
            );
        }

        return !empty($result);
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Create separate indexes for foreign keys if they don't exist
        // This ensures foreign keys don't rely on the unique constraint we're about to drop
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            if (!$this->indexExists('class_adviser_assignments', 'class_adviser_assignments_adviser_id_index')) {
                $table->index('adviser_id');
            }

            if (!$this->indexExists('class_adviser_assignments', 'class_adviser_assignments_academic_level_id_index')) {
                $table->index('academic_level_id');
            }
        });

        // Step 2: Now safely drop the old unique constraint and add the new one
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            // Drop the old unique constraint if it exists
            try {
                if ($this->indexExists('class_adviser_assignments', 'unique_class_adviser_assignment')) {
                    $table->dropUnique('unique_class_adviser_assignment');
                }
            } catch (\Exception $e) {
                // Index might not exist, continue
            }

            // Add new unique constraint if it doesn't exist
            if (!$this->indexExists('class_adviser_assignments', 'unique_adviser_subject_section')) {
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
            // Drop the new constraint if it exists
            try {
                if ($this->indexExists('class_adviser_assignments', 'unique_adviser_subject_section')) {
                    $table->dropUnique('unique_adviser_subject_section');
                }
            } catch (\Exception $e) {
                // Index might not exist, continue
            }

            // Restore the old constraint if it doesn't exist
            if (!$this->indexExists('class_adviser_assignments', 'unique_class_adviser_assignment')) {
                $table->unique(
                    ['adviser_id', 'academic_level_id', 'grade_level', 'section', 'school_year'],
                    'unique_class_adviser_assignment'
                );
            }
        });

        // Step 2: Drop the separate indexes we created
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            if ($this->indexExists('class_adviser_assignments', 'unique_class_adviser_assignment')) {
                try {
                    if ($this->indexExists('class_adviser_assignments', 'class_adviser_assignments_adviser_id_index')) {
                        $table->dropIndex('class_adviser_assignments_adviser_id_index');
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }

                try {
                    if ($this->indexExists('class_adviser_assignments', 'class_adviser_assignments_academic_level_id_index')) {
                        $table->dropIndex('class_adviser_assignments_academic_level_id_index');
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            }
        });
    }
};
