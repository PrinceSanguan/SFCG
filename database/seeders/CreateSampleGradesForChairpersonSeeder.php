<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StudentGrade;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;

class CreateSampleGradesForChairpersonSeeder extends Seeder
{
    public function run(): void
    {
        // Get Computer Department courses and subjects
        $computerDept = \App\Models\Department::where('name', 'Computer Department')->first();
        
        if (!$computerDept) {
            $this->command->warn('Computer Department not found.');
            return;
        }
        
        $courses = $computerDept->courses;
        $subjects = Subject::whereIn('course_id', $courses->pluck('id'))->get();
        
        if ($subjects->isEmpty()) {
            $this->command->warn('No subjects found in Computer Department.');
            return;
        }
        
        // Get college students
        $students = User::where('user_role', 'student')
            ->where('year_level', 'college')
            ->take(5)
            ->get();
        
        if ($students->isEmpty()) {
            $this->command->warn('No college students found.');
            return;
        }
        
        // Get academic level and grading period
        $academicLevel = AcademicLevel::where('key', 'college')->first();
        $gradingPeriod = GradingPeriod::where('academic_level_id', $academicLevel->id)->first();
        
        $createdCount = 0;
        
        foreach ($students as $student) {
            foreach ($subjects->take(2) as $subject) {
                // Create a grade that's submitted for validation
                $grade = StudentGrade::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevel->id,
                    'grading_period_id' => $gradingPeriod ? $gradingPeriod->id : null,
                    'school_year' => '2024-2025',
                    'year_of_study' => 1,
                    'grade' => rand(75, 100), // Random grade between 75-100
                    'is_submitted_for_validation' => true,
                    'submitted_at' => now(),
                ]);
                
                $createdCount++;
            }
        }
        
        $this->command->info("Created {$createdCount} sample grades submitted for validation in Computer Department.");
    }
}
