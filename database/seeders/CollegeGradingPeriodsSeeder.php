<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Carbon\Carbon;

class CollegeGradingPeriodsSeeder extends Seeder
{
    /**
     * Seed college grading periods: First and Second Semester,
     * each with Midterm, Pre-Final, and Final Average (calculated).
     */
    public function run(): void
    {
        $college = AcademicLevel::where('key', 'college')->first();
        if (!$college) {
            $this->command->error('College academic level not found. Run BasicStructureSeeder first.');
            return;
        }

        // Use a fixed school year window for deterministic seeds
        $yearStart = Carbon::create((int) date('Y'), 8, 1)->startOfDay();
        $firstSemStart = (clone $yearStart); // Aug 1 - Jan 31
        $firstSemEnd = (clone $yearStart)->addMonths(5)->endOfMonth();

        $secondSemStart = (clone $yearStart)->addMonths(6); // Feb 1 - Jul 31
        $secondSemEnd = (clone $yearStart)->addMonths(11)->endOfMonth();

        // Root semesters
        $firstSemester = GradingPeriod::updateOrCreate(
            [
                'code' => 'COL_S1',
                'academic_level_id' => $college->id,
            ],
            [
                'name' => 'First Semester',
                'type' => 'semester',
                // For root semester rows, schema expects a 'quarter'-like period_type
                'period_type' => 'quarter',
                'semester_number' => 1,
                'weight' => 1.00,
                'is_calculated' => false,
                'start_date' => $firstSemStart,
                'end_date' => $firstSemEnd,
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $secondSemester = GradingPeriod::updateOrCreate(
            [
                'code' => 'COL_S2',
                'academic_level_id' => $college->id,
            ],
            [
                'name' => 'Second Semester',
                'type' => 'semester',
                // Root semester uses the same allowed period_type as top-level grouping
                'period_type' => 'quarter',
                'semester_number' => 2,
                'weight' => 1.00,
                'is_calculated' => false,
                'start_date' => $secondSemStart,
                'end_date' => $secondSemEnd,
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        // Children per semester
        $this->seedSemesterChildren(
            parent: $firstSemester,
            levelId: $college->id,
            semesterNumber: 1,
            start: $firstSemStart,
            end: $firstSemEnd
        );

        $this->seedSemesterChildren(
            parent: $secondSemester,
            levelId: $college->id,
            semesterNumber: 2,
            start: $secondSemStart,
            end: $secondSemEnd
        );

        $this->command->info('College grading periods seeded (S1/S2 with Midterm, Pre-Final, Final Average).');
    }

    private function seedSemesterChildren(GradingPeriod $parent, int $levelId, int $semesterNumber, Carbon $start, Carbon $end): void
    {
        $children = [
            [
                'name' => 'Midterm',
                'code' => $semesterNumber === 1 ? 'COL_S1_MT' : 'COL_S2_MT',
                'period_type' => 'midterm',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => (clone $start),
                'end_date' => (clone $start)->addMonths(2)->endOfMonth(),
                'sort_order' => 1,
            ],
            [
                'name' => 'Pre-Final',
                'code' => $semesterNumber === 1 ? 'COL_S1_PF' : 'COL_S2_PF',
                'period_type' => 'prefinal',
                'weight' => 0.50,
                'is_calculated' => false,
                'start_date' => (clone $start)->addMonths(3),
                'end_date' => (clone $end)->subMonths(1)->endOfMonth(),
                'sort_order' => 2,
            ],
            [
                'name' => 'Final Average',
                'code' => $semesterNumber === 1 ? 'COL_S1_FA' : 'COL_S2_FA',
                'period_type' => 'final',
                'weight' => 1.00,
                'is_calculated' => true, // calculated from midterm + prefinal / 2
                'start_date' => (clone $end)->endOfMonth(),
                'end_date' => (clone $end)->endOfMonth(),
                'sort_order' => 3,
            ],
        ];

        foreach ($children as $child) {
            GradingPeriod::updateOrCreate(
                [
                    'code' => $child['code'],
                    'academic_level_id' => $levelId,
                ],
                [
                    'name' => $child['name'],
                    'type' => 'semester',
                    'parent_id' => $parent->id,
                    'period_type' => $child['period_type'],
                    'semester_number' => $semesterNumber,
                    'weight' => $child['weight'],
                    'is_calculated' => $child['is_calculated'],
                    'start_date' => $child['start_date'],
                    'end_date' => $child['end_date'],
                    'sort_order' => $child['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}


