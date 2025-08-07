<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HonorCriterion;
use App\Models\AcademicLevel;

class HonorSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get academic levels
        $elementary = AcademicLevel::where('name', 'Elementary')->first();
        $juniorHigh = AcademicLevel::where('name', 'Junior High School')->first();
        $seniorHigh = AcademicLevel::where('name', 'Senior High School')->first();
        $college = AcademicLevel::where('name', 'College')->first();

        // Basic Education Honor Criteria (Elementary to Senior High School)
        $basicEducationLevels = [$elementary, $juniorHigh, $seniorHigh];
        
        foreach ($basicEducationLevels as $level) {
            if ($level) {
                // With Honors: GPA is 90 or above
                HonorCriterion::create([
                    'honor_type' => 'with_honors',
                    'minimum_grade' => 90.0,
                    'maximum_grade' => 100.0,
                    'criteria_description' => 'GPA is 90 or above.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);

                // With High Honors: GPA is between 95 and 97, and no grade is below 90
                HonorCriterion::create([
                    'honor_type' => 'with_high_honors',
                    'minimum_grade' => 95.0,
                    'maximum_grade' => 97.0,
                    'criteria_description' => 'GPA is between 95 and 97, and no grade is below 90.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);

                // With Highest Honors: GPA is between 98 and 100, and no grade is below 93
                HonorCriterion::create([
                    'honor_type' => 'with_highest_honors',
                    'minimum_grade' => 98.0,
                    'maximum_grade' => 100.0,
                    'criteria_description' => 'GPA is between 98 and 100, and no grade is below 93.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);
            }
        }

        // College Honor Criteria
        if ($college) {
            // College Honors: No grade is below 87 from 1st to 2nd semester
            HonorCriterion::create([
                'honor_type' => 'college_honors',
                'minimum_grade' => 0.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'College Honors: No grade is below 87 from 1st to 2nd semester.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // Cum Laude: No grade is below 87 in any subject from 1st to 4th year
            HonorCriterion::create([
                'honor_type' => 'cum_laude',
                'minimum_grade' => 0.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Cum Laude: No grade is below 87 in any subject from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // Magna Cum Laude: No grade is below 93 in any subject from 1st to 4th year
            HonorCriterion::create([
                'honor_type' => 'magna_cum_laude',
                'minimum_grade' => 0.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Magna Cum Laude: No grade is below 93 in any subject from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // Summa Cum Laude: No grade is below 95 in all subjects from 1st to 4th year
            HonorCriterion::create([
                'honor_type' => 'summa_cum_laude',
                'minimum_grade' => 0.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Summa Cum Laude: No grade is below 95 in all subjects from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // Dean's List: Student must be in 2nd or 3rd year, GPA must be 92 or above, no grade below 90, must have consistent honor status
            HonorCriterion::create([
                'honor_type' => 'deans_list',
                'minimum_grade' => 92.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Dean\'s List: Student must be in 2nd or 3rd year. GPA must be 92 or above. No grade below 90. Must have consistent honor status.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);
        }
    }
} 