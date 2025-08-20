<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\AcademicLevel;

class HonorCriteriaSeeder extends Seeder
{
    public function run(): void
    {
        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Get honor types
        $withHonors = HonorType::where('key', 'with_honors')->first();
        $withHighHonors = HonorType::where('key', 'with_high_honors')->first();
        $withHighestHonors = HonorType::where('key', 'with_highest_honors')->first();
        $deansList = HonorType::where('key', 'deans_list')->first();
        $cumLaude = HonorType::where('key', 'cum_laude')->first();
        $magnaCumLaude = HonorType::where('key', 'magna_cum_laude')->first();
        $summaCumLaude = HonorType::where('key', 'summa_cum_laude')->first();
        $collegeHonors = HonorType::where('key', 'college_honors')->first();

        // Basic Education Criteria
        if ($elementary && $withHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHonors->id,
            ], [
                'min_gpa' => 90.0,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($elementary && $withHighHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHighHonors->id,
            ], [
                'min_gpa' => 95.0,
                'max_gpa' => 97.0,
                'min_grade' => 90,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($elementary && $withHighestHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHighestHonors->id,
            ], [
                'min_gpa' => 98.0,
                'max_gpa' => 100.0,
                'min_grade' => 93,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        // Junior High School Criteria (same as elementary)
        if ($juniorHigh && $withHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHonors->id,
            ], [
                'min_gpa' => 90.0,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($juniorHigh && $withHighHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHighHonors->id,
            ], [
                'min_gpa' => 95.0,
                'max_gpa' => 97.0,
                'min_grade' => 90,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($juniorHigh && $withHighestHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHighestHonors->id,
            ], [
                'min_gpa' => 98.0,
                'max_gpa' => 100.0,
                'min_grade' => 93,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        // Senior High School Criteria (same as elementary)
        if ($seniorHigh && $withHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHonors->id,
            ], [
                'min_gpa' => 90.0,
                'max_gpa' => null,
                'min_grade' => null,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($seniorHigh && $withHighHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHighHonors->id,
            ], [
                'min_gpa' => 95.0,
                'max_gpa' => 97.0,
                'min_grade' => 90,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        if ($seniorHigh && $withHighestHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHighestHonors->id,
            ], [
                'min_gpa' => 98.0,
                'max_gpa' => 100.0,
                'min_grade' => 93,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }

        // College Criteria
        if ($college && $deansList) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $college->id,
                'honor_type_id' => $deansList->id,
            ], [
                'min_gpa' => 92.0,
                'max_gpa' => null,
                'min_grade' => 90,
                'min_grade_all' => null,
                'min_year' => 2,
                'max_year' => 3,
                'require_consistent_honor' => true,
            ]);
        }

        if ($college && $cumLaude) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $college->id,
                'honor_type_id' => $cumLaude->id,
            ], [
                'min_gpa' => null,
                'max_gpa' => null,
                'min_grade' => 87,
                'min_grade_all' => null,
                'min_year' => 1,
                'max_year' => 4,
                'require_consistent_honor' => false,
            ]);
        }

        if ($college && $magnaCumLaude) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $college->id,
                'honor_type_id' => $magnaCumLaude->id,
            ], [
                'min_gpa' => null,
                'max_gpa' => null,
                'min_grade' => 93,
                'min_grade_all' => null,
                'min_year' => 1,
                'max_year' => 4,
                'require_consistent_honor' => false,
            ]);
        }

        if ($college && $summaCumLaude) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $college->id,
                'honor_type_id' => $summaCumLaude->id,
            ], [
                'min_gpa' => null,
                'max_gpa' => null,
                'min_grade' => 95,
                'min_grade_all' => null,
                'min_year' => 1,
                'max_year' => 4,
                'require_consistent_honor' => false,
            ]);
        }

        if ($college && $collegeHonors) {
            HonorCriterion::updateOrCreate([
                'academic_level_id' => $college->id,
                'honor_type_id' => $collegeHonors->id,
            ], [
                'min_gpa' => null,
                'max_gpa' => null,
                'min_grade' => 85,
                'min_grade_all' => null,
                'min_year' => null,
                'max_year' => null,
                'require_consistent_honor' => false,
            ]);
        }
    }
}
