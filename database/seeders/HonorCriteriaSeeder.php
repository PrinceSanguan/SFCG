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
        $deansList = HonorType::where('key', 'deans_list')->first();
        $collegeHonors = HonorType::where('key', 'college_honors')->first();

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
        // Based on SFCG-NOI Handbook Revised 2025
        // Conversion: 1.1=97-98%, 1.2=95-96%, 1.3=93-94%, 1.4=91-92%, 1.5=90%, 1.8=87%, 2.0=85%, 3.0=75%
        // We use max_gpa (lower number = better grade in 1.0-5.0 scale)
        if ($college) {
            \Log::info('[HONOR CRITERIA FIX] Setting up college criteria based on SFCG-NOI Handbook');

            // Baccalaureate Honors (Graduation Honors)
            if ($cumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $cumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.3,  // GPA ≥ 93% (handbook: GPA ≥ 93%, all subjects ≥ 90%)
                    'min_grade' => null,
                    'min_grade_all' => 1.5,  // All subjects ≥ 90%
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'handbook_requirement' => 'GPA ≥ 93%, all subjects ≥ 90%',
                        'max_gpa_percentage' => '93-94% (1.3)',
                        'min_grade_all_percentage' => '90% (1.5)',
                    ]),
                ]);
                \Log::info('[HONOR CRITERIA FIX] Cum Laude created: max_gpa=1.3 (93%), min_grade_all=1.5 (90%)');
            }

            if ($magnaCumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $magnaCumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.2,  // GPA ≥ 95% (handbook: GPA ≥ 95%, all subjects ≥ 93%)
                    'min_grade' => null,
                    'min_grade_all' => 1.3,  // All subjects ≥ 93%
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'handbook_requirement' => 'GPA ≥ 95%, all subjects ≥ 93%',
                        'max_gpa_percentage' => '95-96% (1.2)',
                        'min_grade_all_percentage' => '93-94% (1.3)',
                    ]),
                ]);
                \Log::info('[HONOR CRITERIA FIX] Magna Cum Laude created: max_gpa=1.2 (95%), min_grade_all=1.3 (93%)');
            }

            if ($summaCumLaude) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $summaCumLaude->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.1,  // GPA ≥ 97% (handbook: GPA ≥ 97%, all subjects ≥ 95%)
                    'min_grade' => null,
                    'min_grade_all' => 1.2,  // All subjects ≥ 95%
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'handbook_requirement' => 'GPA ≥ 97%, all subjects ≥ 95%',
                        'max_gpa_percentage' => '97-98% (1.1)',
                        'min_grade_all_percentage' => '95-96% (1.2)',
                    ]),
                ]);
                \Log::info('[HONOR CRITERIA FIX] Summa Cum Laude created: max_gpa=1.1 (97%), min_grade_all=1.2 (95%)');
            }

            // Semester Honors
            if ($deansList) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $deansList->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => 1.4,  // GPA = 92% (handbook: GPA of 92.00, no grade below 90.00)
                    'min_grade' => null,
                    'min_grade_all' => 1.5,  // No grade below 90%
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'handbook_requirement' => 'GPA of 92.00, no grade below 90.00',
                        'max_gpa_percentage' => '91-92% (1.4)',
                        'min_grade_all_percentage' => '90% (1.5)',
                        'semester_award' => true,
                    ]),
                ]);
                \Log::info('[HONOR CRITERIA FIX] Dean\'s List created: max_gpa=1.4 (92%), min_grade_all=1.5 (90%)');
            }

            if ($collegeHonors) {
                HonorCriterion::updateOrCreate([
                    'academic_level_id' => $college->id,
                    'honor_type_id' => $collegeHonors->id,
                ], [
                    'min_gpa' => null,
                    'max_gpa' => null,  // No GPA requirement
                    'min_grade' => null,
                    'min_grade_all' => 1.8,  // All subjects ≥ 87% (handbook: grades no lower than 87.00)
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                    'additional_rules' => json_encode([
                        'scale' => '1.0-5.0 (lower is better)',
                        'handbook_requirement' => 'Grades no lower than 87.00 in all subjects',
                        'min_grade_all_percentage' => '87% (1.8)',
                        'semester_award' => true,
                    ]),
                ]);
                \Log::info('[HONOR CRITERIA FIX] College Honors created: min_grade_all=1.8 (87%)');
            }

            \Log::info('[HONOR CRITERIA FIX] All college criteria updated based on SFCG-NOI Handbook Revised 2025');
        }

        $this->command->info('Honor criteria seeded/updated successfully!');
    }
}
