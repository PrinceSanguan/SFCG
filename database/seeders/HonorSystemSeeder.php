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
                // 7.1.1 With Honors (GPA ≥ 90)
                HonorCriterion::create([
                    'honor_type' => 'with_honors',
                    'minimum_grade' => 90.0,
                    'maximum_grade' => 94.99,
                    'criteria_description' => 'GPA ≥ 90. No grade below 85 in any subject.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);

                // 7.1.2 With High Honors (GPA 95–97, no grade below 90)
                HonorCriterion::create([
                    'honor_type' => 'with_high_honors',
                    'minimum_grade' => 95.0,
                    'maximum_grade' => 97.99,
                    'criteria_description' => 'GPA 95-97. No grade below 90 in any subject.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);

                // 7.1.3 With Highest Honors (GPA 98–100, no grade below 93)
                HonorCriterion::create([
                    'honor_type' => 'with_highest_honors',
                    'minimum_grade' => 98.0,
                    'maximum_grade' => 100.0,
                    'criteria_description' => 'GPA 98-100. No grade below 93 in any subject.',
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]);
            }
        }

        // College Honor Criteria
        if ($college) {
            // 7.2.1 Dean's List (2nd and 3rd year students, GPA ≥ 92, no grade below 90)
            HonorCriterion::create([
                'honor_type' => 'deans_list',
                'minimum_grade' => 92.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Dean\'s List: Exclusive to 2nd and 3rd year students. GPA ≥ 92, no grade below 90, consistent honor student standing.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // 7.2.2 Cum Laude (no grade below 87 in any subject from 1st to 4th year)
            HonorCriterion::create([
                'honor_type' => 'cum_laude',
                'minimum_grade' => 87.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Cum Laude: No grade below 87 in any subject from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // 7.2.3 Magna Cum Laude (no grade below 93 from 1st to 4th year)
            HonorCriterion::create([
                'honor_type' => 'magna_cum_laude',
                'minimum_grade' => 93.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Magna Cum Laude: No grade below 93 from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // 7.2.4 Summa Cum Laude (no grade below 95 in all subjects from 1st to 4th year)
            HonorCriterion::create([
                'honor_type' => 'summa_cum_laude',
                'minimum_grade' => 95.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'Summa Cum Laude: No grade below 95 in all subjects from 1st to 4th year.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);

            // 7.2.5 College Honors (no grade below 85 from 1st semester to 2nd semester)
            HonorCriterion::create([
                'honor_type' => 'college_honors',
                'minimum_grade' => 85.0,
                'maximum_grade' => 100.0,
                'criteria_description' => 'College Honors: No grade below 85 from 1st semester to 2nd semester.',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);
        }
    }
} 