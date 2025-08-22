<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StudentGrade;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;

class SampleGradesSeeder extends Seeder
{
    public function run(): void
    {
        // Get some students, subjects, and academic levels
        $students = User::where('user_role', 'student')->take(10)->get();
        $subjects = Subject::take(5)->get();
        $academicLevels = AcademicLevel::all();
        
        if ($students->isEmpty() || $subjects->isEmpty() || $academicLevels->isEmpty()) {
            $this->command->warn('No students, subjects, or academic levels found. Skipping grade seeding.');
            return;
        }

        // Create grading periods for each academic level
        $gradingPeriods = [];
        foreach ($academicLevels as $level) {
            // Check if grading period already exists for this level
            $existingPeriod = GradingPeriod::where('academic_level_id', $level->id)->first();
            
            if ($existingPeriod) {
                $gradingPeriods[$level->id] = $existingPeriod;
            } else {
                // Create unique code for each level
                $code = 'Q1_' . $level->key;
                $gradingPeriods[$level->id] = GradingPeriod::create([
                    'name' => 'First Quarter',
                    'code' => $code,
                    'academic_level_id' => $level->id,
                    'start_date' => now()->startOfYear(),
                    'end_date' => now()->startOfYear()->addMonths(3),
                    'sort_order' => 1,
                    'is_active' => true,
                ]);
            }
        }

        // Sample grades for different school years
        $schoolYears = ['2024-2025', '2023-2024', '2022-2023'];
        
        foreach ($schoolYears as $schoolYear) {
            foreach ($students as $student) {
                foreach ($subjects as $subject) {
                    // Create grades for all subjects, using the subject's academic level
                    // We'll assign students to different academic levels based on their year_level
                    $studentAcademicLevelId = $this->getStudentAcademicLevelId($student->year_level);
                    
                    if ($studentAcademicLevelId && $subject->academic_level_id == $studentAcademicLevelId) {
                        StudentGrade::create([
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'academic_level_id' => $subject->academic_level_id,
                            'grading_period_id' => $gradingPeriods[$subject->academic_level_id]->id,
                            'school_year' => $schoolYear,
                            'grade' => rand(75, 100), // Random grade between 75-100
                            'year_of_study' => 1, // First year for all students
                        ]);
                    }
                }
            }
        }

        $this->command->info('Sample grades created successfully!');
        $this->command->info('Total grades created: ' . StudentGrade::count());
    }

    private function getStudentAcademicLevelId(?string $yearLevel): ?int
    {
        // Map year_level string to academic_level_id
        $mapping = [
            'elementary' => 1,
            'junior_highschool' => 2,
            'senior_highschool' => 3,
            'college' => 4,
        ];
        
        return $mapping[$yearLevel] ?? null;
    }
}
