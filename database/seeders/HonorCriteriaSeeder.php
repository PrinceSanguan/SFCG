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
        $college = AcademicLevel::where('key', 'college')->first();

        // Get honor types (created/ensured above)
        $withHonors = HonorType::where('key', 'with_honors')->first();
        $withHighHonors = HonorType::where('key', 'with_high_honors')->first();
        $withHighestHonors = HonorType::where('key', 'with_highest_honors')->first();

        // Get college-specific honor types (Latin honors)
        $cumLaude = HonorType::where('key', 'cum_laude')->first();
        $magnaCumLaude = HonorType::where('key', 'magna_cum_laude')->first();
        $summaCumLaude = HonorType::where('key', 'summa_cum_laude')->first();

        // Create criteria for Elementary, Junior High School, and Senior High School
        // SHS gets three tiers (With Honors, With High Honors, With Highest Honors)
        
        if ($elementary && $withHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $elementary->id,
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

        if ($juniorHigh && $withHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $juniorHigh->id,
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

        // Senior High School uses 75-100 percentage grading scale
        // Honor criteria based on period average:
        // - With Honors: 90-94 average
        // - With High Honors: 95-97 average
        // - With Highest Honors: 98-100 average
        // Note: Actual logic is in SeniorHighSchoolHonorCalculationService
        if ($seniorHigh) {
            if ($withHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHonors->id,
                ], [
                    'min_gpa' => 90.00,  // Minimum 90% average
                    'max_gpa' => 94.99,  // Maximum 94.99% (below 95)
                    'min_grade' => 85,   // All individual grades must be 85 or above
                    'min_grade_all' => 85,  // ALL grades must be 85 or above
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '75-100 percentage',
                        'range' => '90-94',
                        'min_all_grades' => 85
                    ]),
                ]);
            }
            if ($withHighHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHighHonors->id,
                ], [
                    'min_gpa' => 95.00,  // Minimum 95% average
                    'max_gpa' => 97.99,  // Maximum 97.99% (below 98)
                    'min_grade' => 85,
                    'min_grade_all' => 85,  // ALL grades must be 85 or above
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '75-100 percentage',
                        'range' => '95-97',
                        'min_all_grades' => 85
                    ]),
                ]);
            }
            if ($withHighestHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $seniorHigh->id,
                    'honor_type_id' => $withHighestHonors->id,
                ], [
                    'min_gpa' => 98.00,  // Minimum 98% average
                    'max_gpa' => 100.00,  // Maximum 100%
                    'min_grade' => 85,
                    'min_grade_all' => 85,  // ALL grades must be 85 or above
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '75-100 percentage',
                        'range' => '98-100',
                        'min_all_grades' => 85
                    ]),
                ]);
            }
        }

        // College uses 1.0-5.0 grading scale (1.0 is highest, 3.0 is passing)
        // With percentage equivalents: 1.1=97-98%, 1.5=90%, 2.0=85%, 3.0=75%, 5.0=Below 70%
        // College uses Latin honors: Cum Laude, Magna Cum Laude, Summa Cum Laude
        // We use max_gpa instead of min_gpa (lower number = better grade)
        if ($college) {
            if ($cumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $cumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 2.0,  // GPA must be 2.0 or lower (85% - Good standing)
                    'min_grade' => null,
                    'min_grade_all' => null,
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'max_gpa_percentage' => '85% equivalent'
                    ]),
                ]);
            }
            if ($magnaCumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $magnaCumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.75,  // GPA must be 1.75 or lower (~88% - Very Good)
                    'min_grade' => null,
                    'min_grade_all' => 2.0,  // No grade higher than 2.0 (all grades 85% or better)
                    'min_year' => 2,  // Must be 2nd year or above
                    'max_year' => 3,  // Up to 3rd year
                    'require_consistent_honor' => true,  // Must have consistent honor standing
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'max_gpa_percentage' => '~88% equivalent',
                        'min_grade_all_percentage' => '85% all subjects'
                    ]),
                ]);
            }
            if ($summaCumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $summaCumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.5,  // GPA must be 1.5 or lower (Excellent)
                    'min_grade' => null,
                    'min_grade_all' => 1.75,  // No grade higher than 1.75 (all grades must be 1.75 or lower)
                    'min_year' => 1,  // From 1st year
                    'max_year' => 4,  // All 4 years
                    'require_consistent_honor' => true,  // Must have consistent honor standing
                    'additional_rules' => null,
                ]);
            }
        }

        $this->command->info('Honor criteria seeded/updated successfully!');
    }
}
