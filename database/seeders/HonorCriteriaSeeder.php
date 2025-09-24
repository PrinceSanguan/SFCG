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
        // Ensure honor types exist (idempotent)
        $withHonors = HonorType::updateOrCreate(['key' => 'with_honors'], [
            'name' => 'With Honors',
            'scope' => 'basic',
        ]);
        $withHighHonors = HonorType::updateOrCreate(['key' => 'with_high_honors'], [
            'name' => 'With High Honors',
            'scope' => 'basic',
        ]);
        $withHighestHonors = HonorType::updateOrCreate(['key' => 'with_highest_honors'], [
            'name' => 'With Highest Honors',
            'scope' => 'basic',
        ]);

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();

        // Get honor types (created/ensured above)
        $withHonors = HonorType::where('key', 'with_honors')->first();
        $withHighHonors = HonorType::where('key', 'with_high_honors')->first();
        $withHighestHonors = HonorType::where('key', 'with_highest_honors')->first();

        // Create criteria for Elementary, Junior High School, and Senior High School
        // SHS gets three tiers (With Honors, With High Honors, With Highest Honors)
        
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

        if ($seniorHigh) {
            if ($withHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHonors->id,
                ], [
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
            if ($withHighHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHighHonors->id,
                ], [
                    'min_gpa' => 95,
                    'max_gpa' => null,
                    'min_grade' => 90,
                    'min_grade_all' => 90,
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => null,
                ]);
            }
            if ($withHighestHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHighestHonors->id,
                ], [
                    'min_gpa' => 98,
                    'max_gpa' => 100,
                    'min_grade' => 93,
                    'min_grade_all' => 93,
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => null,
                ]);
            }
        }

        $this->command->info('Honor criteria seeded/updated successfully!');
    }
}
