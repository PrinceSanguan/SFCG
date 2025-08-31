<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HonorResult;
use App\Models\User;
use App\Models\HonorType;
use App\Models\AcademicLevel;

class CreateSampleHonorsForChairpersonSeeder extends Seeder
{
    public function run(): void
    {
        // Get Computer Department
        $computerDept = \App\Models\Department::where('name', 'Computer Department')->first();
        
        if (!$computerDept) {
            $this->command->warn('Computer Department not found.');
            return;
        }
        
        // Get college students in Computer Department
        $students = User::where('user_role', 'student')
            ->where('year_level', 'college')
            ->whereHas('course', function ($query) use ($computerDept) {
                $query->where('department_id', $computerDept->id);
            })
            ->take(3)
            ->get();
        
        if ($students->isEmpty()) {
            $this->command->warn('No college students found in Computer Department.');
            return;
        }
        
        // Get honor types
        $honorTypes = HonorType::where('scope', 'college')->take(2)->get();
        
        if ($honorTypes->isEmpty()) {
            $this->command->warn('No honor types found.');
            return;
        }
        
        // Get academic level
        $academicLevel = AcademicLevel::where('key', 'college')->first();
        
        $createdCount = 0;
        
        foreach ($students as $student) {
            foreach ($honorTypes as $honorType) {
                // Create an honor result that's pending approval
                $honor = HonorResult::create([
                    'student_id' => $student->id,
                    'honor_type_id' => $honorType->id,
                    'academic_level_id' => $academicLevel->id,
                    'school_year' => '2024-2025',
                    'gpa' => rand(350, 400) / 100, // Random GPA between 3.50-4.00
                    'is_pending_approval' => true,
                ]);
                
                $createdCount++;
            }
        }
        
        $this->command->info("Created {$createdCount} sample honor results pending approval in Computer Department.");
    }
}
