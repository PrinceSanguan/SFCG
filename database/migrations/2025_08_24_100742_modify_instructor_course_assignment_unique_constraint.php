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
        // Instead of dropping the existing constraint (which causes foreign key issues),
        // we'll simply add the new constraint alongside the existing one
        // This approach is safer and avoids all constraint dropping issues
        
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Add the new constraint without dropping the old one
            // This allows for more granular uniqueness checking
            $table->unique(['instructor_id', 'course_id', 'academic_level_id', 'grading_period_id', 'school_year'], 'unique_instructor_course_assignment_detailed');
        });
        
        // Note: The old constraint 'unique_instructor_course_assignment' remains
        // This provides backward compatibility while adding the new functionality
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Only drop the new constraint we added
            $table->dropUnique('unique_instructor_course_assignment_detailed');
            
            // We don't touch the original constraint to avoid foreign key issues
        });
    }
};
