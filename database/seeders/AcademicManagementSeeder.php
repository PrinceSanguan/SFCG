<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use App\Models\Subject;
use App\Models\Department;
use App\Models\Strand;
use App\Models\Course;

class AcademicManagementSeeder extends Seeder
{
    public function run(): void
    {
        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Create Grading Periods
        if ($elementary) {
            // Elementary - Quarters
            GradingPeriod::create([
                'name' => 'First Quarter',
                'code' => 'ELEM_Q1',
                'academic_level_id' => $elementary->id,
                'start_date' => '2024-06-01',
                'end_date' => '2024-08-31',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Second Quarter',
                'code' => 'ELEM_Q2',
                'academic_level_id' => $elementary->id,
                'start_date' => '2024-09-01',
                'end_date' => '2024-11-30',
                'sort_order' => 2,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Third Quarter',
                'code' => 'ELEM_Q3',
                'academic_level_id' => $elementary->id,
                'start_date' => '2024-12-01',
                'end_date' => '2025-02-28',
                'sort_order' => 3,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Fourth Quarter',
                'code' => 'ELEM_Q4',
                'academic_level_id' => $elementary->id,
                'start_date' => '2025-03-01',
                'end_date' => '2025-05-31',
                'sort_order' => 4,
                'is_active' => true,
            ]);
        }

        if ($juniorHigh) {
            // Junior High - Quarters
            GradingPeriod::create([
                'name' => 'First Quarter',
                'code' => 'JHS_Q1',
                'academic_level_id' => $juniorHigh->id,
                'start_date' => '2024-06-01',
                'end_date' => '2024-08-31',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Second Quarter',
                'code' => 'JHS_Q2',
                'academic_level_id' => $juniorHigh->id,
                'start_date' => '2024-09-01',
                'end_date' => '2024-11-30',
                'sort_order' => 2,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Third Quarter',
                'code' => 'JHS_Q3',
                'academic_level_id' => $juniorHigh->id,
                'start_date' => '2024-12-01',
                'end_date' => '2025-02-28',
                'sort_order' => 3,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Fourth Quarter',
                'code' => 'JHS_Q4',
                'academic_level_id' => $juniorHigh->id,
                'start_date' => '2025-03-01',
                'end_date' => '2025-05-31',
                'sort_order' => 4,
                'is_active' => true,
            ]);
        }

        if ($seniorHigh) {
            // Senior High - Semesters
            GradingPeriod::create([
                'name' => 'First Semester',
                'code' => 'SHS_S1',
                'academic_level_id' => $seniorHigh->id,
                'start_date' => '2024-06-01',
                'end_date' => '2024-11-30',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Second Semester',
                'code' => 'SHS_S2',
                'academic_level_id' => $seniorHigh->id,
                'start_date' => '2024-12-01',
                'end_date' => '2025-05-31',
                'sort_order' => 2,
                'is_active' => true,
            ]);
        }

        if ($college) {
            // College - Semesters
            GradingPeriod::create([
                'name' => 'First Semester',
                'code' => 'COL_S1',
                'academic_level_id' => $college->id,
                'start_date' => '2024-06-01',
                'end_date' => '2024-11-30',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Second Semester',
                'code' => 'COL_S2',
                'academic_level_id' => $college->id,
                'start_date' => '2024-12-01',
                'end_date' => '2025-05-31',
                'sort_order' => 2,
                'is_active' => true,
            ]);

            GradingPeriod::create([
                'name' => 'Summer Term',
                'code' => 'COL_SUM',
                'academic_level_id' => $college->id,
                'start_date' => '2025-06-01',
                'end_date' => '2025-07-31',
                'sort_order' => 3,
                'is_active' => true,
            ]);
        }

        // Create Subjects
        if ($elementary) {
            // Elementary Subjects
            Subject::create([
                'name' => 'Mathematics',
                'code' => 'ELEM_MATH',
                'description' => 'Basic mathematics for elementary students',
                'academic_level_id' => $elementary->id,
                'units' => 1,
                'hours_per_week' => 5,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Science',
                'code' => 'ELEM_SCI',
                'description' => 'Basic science for elementary students',
                'academic_level_id' => $elementary->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'English',
                'code' => 'ELEM_ENG',
                'description' => 'English language and reading',
                'academic_level_id' => $elementary->id,
                'units' => 1,
                'hours_per_week' => 5,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Filipino',
                'code' => 'ELEM_FIL',
                'description' => 'Filipino language and reading',
                'academic_level_id' => $elementary->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);
        }

        if ($juniorHigh) {
            // Junior High Subjects
            Subject::create([
                'name' => 'Mathematics',
                'code' => 'JHS_MATH',
                'description' => 'Mathematics for junior high students',
                'academic_level_id' => $juniorHigh->id,
                'units' => 1,
                'hours_per_week' => 5,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Science',
                'code' => 'JHS_SCI',
                'description' => 'Science for junior high students',
                'academic_level_id' => $juniorHigh->id,
                'units' => 1,
                'hours_per_week' => 4,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'English',
                'code' => 'JHS_ENG',
                'description' => 'English language and literature',
                'academic_level_id' => $juniorHigh->id,
                'units' => 1,
                'hours_per_week' => 4,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Filipino',
                'code' => 'JHS_FIL',
                'description' => 'Filipino language and literature',
                'academic_level_id' => $juniorHigh->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Social Studies',
                'code' => 'JHS_SS',
                'description' => 'Social studies and history',
                'academic_level_id' => $juniorHigh->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);
        }

        if ($seniorHigh) {
            // Senior High Subjects
            Subject::create([
                'name' => 'General Mathematics',
                'code' => 'SHS_GENMATH',
                'description' => 'General mathematics for senior high',
                'academic_level_id' => $seniorHigh->id,
                'units' => 1,
                'hours_per_week' => 5,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Earth and Life Science',
                'code' => 'SHS_ELS',
                'description' => 'Earth and life science',
                'academic_level_id' => $seniorHigh->id,
                'units' => 1,
                'hours_per_week' => 4,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Oral Communication',
                'code' => 'SHS_ORAL',
                'description' => 'Oral communication in context',
                'academic_level_id' => $seniorHigh->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Komunikasyon at Pananaliksik',
                'code' => 'SHS_KOM',
                'description' => 'Komunikasyon at pananaliksik sa wika',
                'academic_level_id' => $seniorHigh->id,
                'units' => 1,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);
        }

        if ($college) {
            // College Subjects
            Subject::create([
                'name' => 'College Algebra',
                'code' => 'COL_ALG',
                'description' => 'College algebra and trigonometry',
                'academic_level_id' => $college->id,
                'units' => 3,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'General Chemistry',
                'code' => 'COL_CHEM',
                'description' => 'General chemistry for non-majors',
                'academic_level_id' => $college->id,
                'units' => 4,
                'hours_per_week' => 4,
                'is_core' => false,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'College English',
                'code' => 'COL_ENG',
                'description' => 'College composition and rhetoric',
                'academic_level_id' => $college->id,
                'units' => 3,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);

            Subject::create([
                'name' => 'Philippine History',
                'code' => 'COL_HIST',
                'description' => 'Philippine history and culture',
                'academic_level_id' => $college->id,
                'units' => 3,
                'hours_per_week' => 3,
                'is_core' => true,
                'is_active' => true,
            ]);
        }

        $this->command->info('Academic Management data seeded successfully!');
    }
}
