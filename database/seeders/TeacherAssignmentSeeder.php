<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\TeacherSubjectAssignment;
use App\Models\GradingPeriod;

class TeacherAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Teacher Assignments...');

        // Get the teacher users
        $teachers = User::where('user_role', 'teacher')->take(3)->get();
        
        if ($teachers->isEmpty()) {
            $this->command->error('No teacher users found. Please run UserSeeder first.');
            return;
        }

        // Get academic levels
        $academicLevels = AcademicLevel::all();
        
        // Get subjects for each academic level
        $subjects = Subject::with('academicLevel')->get();
        
        // Get grading periods
        $gradingPeriods = GradingPeriod::all();
        
        $schoolYear = '2024-2025';
        $adminUser = User::where('user_role', 'admin')->first();

        if (!$adminUser) {
            $this->command->error('No admin user found for assignment creation.');
            return;
        }

        $assignmentCount = 0;

        foreach ($teachers as $teacher) {
            // Assign 2-4 subjects per teacher
            $subjectsForTeacher = $subjects->random(rand(2, 4));
            
            foreach ($subjectsForTeacher as $subject) {
                $gradingPeriod = $gradingPeriods->where('academic_level_id', $subject->academic_level_id)->first();
                
                // Check if assignment already exists
                $existingAssignment = TeacherSubjectAssignment::where([
                    'teacher_id' => $teacher->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $subject->academic_level_id,
                    'school_year' => $schoolYear,
                ])->first();

                if (!$existingAssignment) {
                    TeacherSubjectAssignment::create([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $subject->academic_level_id,
                        'grade_level' => 'grade_11', // Default for Senior High
                        'grading_period_id' => $gradingPeriod ? $gradingPeriod->id : null,
                        'school_year' => $schoolYear,
                        'is_active' => true,
                        'assigned_by' => $adminUser->id,
                        'notes' => 'Auto-assigned for testing purposes',
                    ]);

                    $assignmentCount++;
                    $this->command->info("Assigned subject '{$subject->name}' to teacher '{$teacher->name}' for {$subject->academicLevel->name}");
                }
            }
        }

        $this->command->info("Teacher assignments completed successfully! Created {$assignmentCount} assignments.");
    }
}
