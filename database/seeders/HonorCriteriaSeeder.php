<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HonorCriterion;
use App\Models\AcademicLevel;
use App\Models\HonorType;

class HonorCriteriaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing criteria
        HonorCriterion::truncate();

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();

        // Get honor types
        $withHonors = HonorType::where('key', 'with_honors')->first();

        // Create criteria for Elementary, Junior High School, and Senior High School only
        // Each level gets only 1 criteria: "With Honors"
        
        if ($elementary && $withHonors) {
            HonorCriterion::create([
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHonors->id,
                'min_gpa' => 90,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
                'additional_rules' => null,
            ]);
        }

        if ($juniorHigh && $withHonors) {
            HonorCriterion::create([
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHonors->id,
                'min_gpa' => 90,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
                'additional_rules' => null,
            ]);
        }

        if ($seniorHigh && $withHonors) {
            HonorCriterion::create([
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHonors->id,
                'min_gpa' => 90,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
                'additional_rules' => null,
            ]);
        }

        $this->command->info('Honor criteria seeded successfully!');
        $this->command->info('Created 1 criteria per level for Elementary, Junior High School, and Senior High School only.');
    }
}
