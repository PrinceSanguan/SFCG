<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all existing course assignments
        $courseAssignments = DB::table('instructor_course_assignments')->get();
        
        foreach ($courseAssignments as $assignment) {
            // Get all subjects for this course and academic level
            $subjects = DB::table('subjects')
                ->where('course_id', $assignment->course_id)
                ->where('academic_level_id', $assignment->academic_level_id)
                ->get();
            
            foreach ($subjects as $subject) {
                // Check if subject assignment already exists
                $exists = DB::table('instructor_subject_assignments')
                    ->where('instructor_id', $assignment->instructor_id)
                    ->where('subject_id', $subject->id)
                    ->where('academic_level_id', $assignment->academic_level_id)
                    ->where('school_year', $assignment->school_year)
                    ->exists();
                
                if (!$exists) {
                    // Create new subject assignment
                    DB::table('instructor_subject_assignments')->insert([
                        'instructor_id' => $assignment->instructor_id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $assignment->academic_level_id,
                        'grading_period_id' => $assignment->grading_period_id,
                        'school_year' => $assignment->school_year,
                        'is_active' => $assignment->is_active,
                        'assigned_at' => $assignment->assigned_at,
                        'assigned_by' => $assignment->assigned_by,
                        'notes' => $assignment->notes,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                
                // Note: Student enrollments are now managed manually through the interface
                // This provides better control over which students are enrolled in which subjects
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove all converted assignments
        DB::table('instructor_subject_assignments')->truncate();
    }
};
