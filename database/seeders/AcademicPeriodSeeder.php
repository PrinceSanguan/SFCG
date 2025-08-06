<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\AcademicPeriod;

class AcademicPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Academic Levels if they don't exist
        $elementary = AcademicLevel::firstOrCreate(
            ['code' => 'ELEM'],
            [
                'name' => 'Elementary',
                'description' => 'Elementary Education (Grades 1-6)',
                'is_active' => true,
            ]
        );

        $juniorHigh = AcademicLevel::firstOrCreate(
            ['code' => 'JHS'],
            [
                'name' => 'Junior High School',
                'description' => 'Junior High School (Grades 7-10)',
                'is_active' => true,
            ]
        );

        $seniorHigh = AcademicLevel::firstOrCreate(
            ['code' => 'SHS'],
            [
                'name' => 'Senior High School',
                'description' => 'Senior High School (Grades 11-12)',
                'is_active' => true,
            ]
        );

        $college = AcademicLevel::firstOrCreate(
            ['code' => 'COL'],
            [
                'name' => 'College',
                'description' => 'College/University Education',
                'is_active' => true,
            ]
        );

        // Create sample periods for Elementary (Quarters)
        $elementaryPeriods = [
            [
                'name' => '1st Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-06-01',
                'end_date' => '2024-08-31',
                'academic_level_id' => $elementary->id,
                'is_active' => true,
            ],
            [
                'name' => '2nd Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-09-01',
                'end_date' => '2024-11-30',
                'academic_level_id' => $elementary->id,
                'is_active' => true,
            ],
            [
                'name' => '3rd Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-12-01',
                'end_date' => '2025-02-28',
                'academic_level_id' => $elementary->id,
                'is_active' => true,
            ],
            [
                'name' => '4th Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2025-03-01',
                'end_date' => '2025-05-31',
                'academic_level_id' => $elementary->id,
                'is_active' => true,
            ],
        ];

        // Create sample periods for Junior High School (Quarters)
        $juniorHighPeriods = [
            [
                'name' => '1st Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-06-01',
                'end_date' => '2024-08-31',
                'academic_level_id' => $juniorHigh->id,
                'is_active' => true,
            ],
            [
                'name' => '2nd Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-09-01',
                'end_date' => '2024-11-30',
                'academic_level_id' => $juniorHigh->id,
                'is_active' => true,
            ],
            [
                'name' => '3rd Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-12-01',
                'end_date' => '2025-02-28',
                'academic_level_id' => $juniorHigh->id,
                'is_active' => true,
            ],
            [
                'name' => '4th Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2025-03-01',
                'end_date' => '2025-05-31',
                'academic_level_id' => $juniorHigh->id,
                'is_active' => true,
            ],
        ];

        // Create sample periods for Senior High School (Semesters)
        $seniorHighPeriods = [
            [
                'name' => '1st Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2024-06-01',
                'end_date' => '2024-10-31',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ],
            [
                'name' => '2nd Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2024-11-01',
                'end_date' => '2025-03-31',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ],
        ];

        // Create sample periods for College (Semesters)
        $collegePeriods = [
            [
                'name' => '1st Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2024-06-01',
                'end_date' => '2024-10-31',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ],
            [
                'name' => '2nd Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2024-11-01',
                'end_date' => '2025-03-31',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ],
            [
                'name' => 'Summer',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2025-04-01',
                'end_date' => '2025-05-31',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ],
        ];

        // Insert periods for each level
        foreach ($elementaryPeriods as $period) {
            AcademicPeriod::firstOrCreate(
                [
                    'name' => $period['name'],
                    'school_year' => $period['school_year'],
                    'academic_level_id' => $period['academic_level_id'],
                ],
                $period
            );
        }

        foreach ($juniorHighPeriods as $period) {
            AcademicPeriod::firstOrCreate(
                [
                    'name' => $period['name'],
                    'school_year' => $period['school_year'],
                    'academic_level_id' => $period['academic_level_id'],
                ],
                $period
            );
        }

        foreach ($seniorHighPeriods as $period) {
            AcademicPeriod::firstOrCreate(
                [
                    'name' => $period['name'],
                    'school_year' => $period['school_year'],
                    'academic_level_id' => $period['academic_level_id'],
                ],
                $period
            );
        }

        foreach ($collegePeriods as $period) {
            AcademicPeriod::firstOrCreate(
                [
                    'name' => $period['name'],
                    'school_year' => $period['school_year'],
                    'academic_level_id' => $period['academic_level_id'],
                ],
                $period
            );
        }

        $this->command->info('Academic levels and periods seeded successfully!');
    }
}
