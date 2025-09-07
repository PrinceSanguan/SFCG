<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Carbon\Carbon;

class GradingPeriodStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: We'll use updateOrCreate to avoid conflicts with existing data

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        if (!$elementary || !$juniorHigh || !$seniorHigh || !$college) {
            $this->command->error('Academic levels not found. Please run the BasicStructureSeeder first.');
            return;
        }

        // Create quarter-based grading periods for Elementary and Junior High School
        $this->createQuarterBasedPeriods($elementary);
        $this->createQuarterBasedPeriods($juniorHigh);

        // Create semester-based grading periods for Senior High School and College
        $this->createSemesterBasedPeriods($seniorHigh);
        $this->createSemesterBasedPeriods($college);

        $this->command->info('Grading period structure created successfully!');
    }

    private function createQuarterBasedPeriods(AcademicLevel $academicLevel): void
    {
        $quarters = [
            [
                'name' => 'First Quarter',
                'code' => 'Q1',
                'sort_order' => 1,
                'start_date' => Carbon::now()->startOfYear(),
                'end_date' => Carbon::now()->startOfYear()->addMonths(2)->endOfMonth(),
            ],
            [
                'name' => 'Second Quarter',
                'code' => 'Q2',
                'sort_order' => 2,
                'start_date' => Carbon::now()->startOfYear()->addMonths(3),
                'end_date' => Carbon::now()->startOfYear()->addMonths(5)->endOfMonth(),
            ],
            [
                'name' => 'Third Quarter',
                'code' => 'Q3',
                'sort_order' => 3,
                'start_date' => Carbon::now()->startOfYear()->addMonths(6),
                'end_date' => Carbon::now()->startOfYear()->addMonths(8)->endOfMonth(),
            ],
            [
                'name' => 'Fourth Quarter',
                'code' => 'Q4',
                'sort_order' => 4,
                'start_date' => Carbon::now()->startOfYear()->addMonths(9),
                'end_date' => Carbon::now()->startOfYear()->addMonths(11)->endOfMonth(),
            ],
        ];

        foreach ($quarters as $quarter) {
            GradingPeriod::updateOrCreate(
                [
                    'code' => $quarter['code'],
                    'academic_level_id' => $academicLevel->id,
                ],
                [
                    'name' => $quarter['name'],
                    'type' => 'quarter',
                    'period_type' => 'quarter',
                    'weight' => 1.00,
                    'is_calculated' => false,
                    'start_date' => $quarter['start_date'],
                    'end_date' => $quarter['end_date'],
                    'sort_order' => $quarter['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }

    private function createSemesterBasedPeriods(AcademicLevel $academicLevel): void
    {
        // Create First Semester
        $firstSemester = GradingPeriod::updateOrCreate(
            [
                'code' => 'S1',
                'academic_level_id' => $academicLevel->id,
            ],
            [
                'name' => 'First Semester',
                'type' => 'semester',
                'period_type' => 'quarter', // Root semester
                'semester_number' => 1,
                'weight' => 1.00,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear(),
                'end_date' => Carbon::now()->startOfYear()->addMonths(5)->endOfMonth(),
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        // Create sub-periods for First Semester
        $firstSemesterPeriods = [
            [
                'name' => 'Midterm',
                'code' => 'S1-MT',
                'period_type' => 'midterm',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear(),
                'end_date' => Carbon::now()->startOfYear()->addMonths(2)->endOfMonth(),
                'sort_order' => 1,
            ],
            [
                'name' => 'Pre-Final',
                'code' => 'S1-PF',
                'period_type' => 'prefinal',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear()->addMonths(3),
                'end_date' => Carbon::now()->startOfYear()->addMonths(5)->endOfMonth(),
                'sort_order' => 2,
            ],
            [
                'name' => 'Final Average',
                'code' => 'S1-FA',
                'period_type' => 'final',
                'weight' => 1.00,
                'is_calculated' => true, // This is calculated from midterm + prefinal / 2
                'start_date' => Carbon::now()->startOfYear()->addMonths(5)->endOfMonth(),
                'end_date' => Carbon::now()->startOfYear()->addMonths(5)->endOfMonth(),
                'sort_order' => 3,
            ],
        ];

        foreach ($firstSemesterPeriods as $period) {
            GradingPeriod::updateOrCreate(
                [
                    'code' => $period['code'],
                    'academic_level_id' => $academicLevel->id,
                ],
                [
                    'name' => $period['name'],
                    'type' => 'semester',
                    'parent_id' => $firstSemester->id,
                    'period_type' => $period['period_type'],
                    'semester_number' => 1,
                    'weight' => $period['weight'],
                    'is_calculated' => $period['is_calculated'],
                    'start_date' => $period['start_date'],
                    'end_date' => $period['end_date'],
                    'sort_order' => $period['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        // Create Second Semester
        $secondSemester = GradingPeriod::updateOrCreate(
            [
                'code' => 'S2',
                'academic_level_id' => $academicLevel->id,
            ],
            [
                'name' => 'Second Semester',
                'type' => 'semester',
                'period_type' => 'quarter', // Root semester
                'semester_number' => 2,
                'weight' => 1.00,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear()->addMonths(6),
                'end_date' => Carbon::now()->startOfYear()->addMonths(11)->endOfMonth(),
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        // Create sub-periods for Second Semester
        $secondSemesterPeriods = [
            [
                'name' => 'Midterm',
                'code' => 'S2-MT',
                'period_type' => 'midterm',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear()->addMonths(6),
                'end_date' => Carbon::now()->startOfYear()->addMonths(8)->endOfMonth(),
                'sort_order' => 1,
            ],
            [
                'name' => 'Pre-Final',
                'code' => 'S2-PF',
                'period_type' => 'prefinal',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => Carbon::now()->startOfYear()->addMonths(9),
                'end_date' => Carbon::now()->startOfYear()->addMonths(11)->endOfMonth(),
                'sort_order' => 2,
            ],
            [
                'name' => 'Final Average',
                'code' => 'S2-FA',
                'period_type' => 'final',
                'weight' => 1.00,
                'is_calculated' => true, // This is calculated from midterm + prefinal / 2
                'start_date' => Carbon::now()->startOfYear()->addMonths(11)->endOfMonth(),
                'end_date' => Carbon::now()->startOfYear()->addMonths(11)->endOfMonth(),
                'sort_order' => 3,
            ],
        ];

        foreach ($secondSemesterPeriods as $period) {
            GradingPeriod::updateOrCreate(
                [
                    'code' => $period['code'],
                    'academic_level_id' => $academicLevel->id,
                ],
                [
                    'name' => $period['name'],
                    'type' => 'semester',
                    'parent_id' => $secondSemester->id,
                    'period_type' => $period['period_type'],
                    'semester_number' => 2,
                    'weight' => $period['weight'],
                    'is_calculated' => $period['is_calculated'],
                    'start_date' => $period['start_date'],
                    'end_date' => $period['end_date'],
                    'sort_order' => $period['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}