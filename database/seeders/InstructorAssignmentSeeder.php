<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\InstructorSubjectAssignment;
use App\Models\GradingPeriod;

class InstructorAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Instructor Assignments...');

        // Get the instructor user
        $instructor = User::where('user_role', 'instructor')->first();
        
        if (!$instructor) {
            $this->command->error('No instructor user found. Please run UserSeeder first.');
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

        // Create assignments for each academic level
        foreach ($academicLevels as $level) {
            $levelSubjects = $subjects->where('academic_level_id', $level->id);
            
            foreach ($levelSubjects->take(3) as $subject) { // Assign up to 3 subjects per level
                $gradingPeriod = $gradingPeriods->where('academic_level_id', $level->id)->first();
                
                // Check if assignment already exists
                $existingAssignment = InstructorSubjectAssignment::where([
                    'instructor_id' => $instructor->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $level->id,
                    'school_year' => $schoolYear,
                ])->first();

                if (!$existingAssignment) {
                    InstructorSubjectAssignment::create([
                        'instructor_id' => $instructor->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $gradingPeriod ? $gradingPeriod->id : null,
                        'school_year' => $schoolYear,
                        'is_active' => true,
                        'assigned_by' => $adminUser->id,
                        'notes' => 'Auto-assigned for testing purposes',
                    ]);

                    $this->command->info("Assigned subject '{$subject->name}' to instructor for {$level->name}");
                }
            }
        }

        $this->command->info('Instructor assignments completed successfully!');
    }
}
