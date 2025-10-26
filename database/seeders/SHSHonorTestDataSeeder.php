<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentGrade;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\Section;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * SHS Honor Test Data Seeder
 *
 * Creates 4 test students with different honor qualification scenarios:
 *
 * Scenario 1: "Perfect Honor Student" - Qualifies ALL 4 periods
 * - All grades 90+, no grade below 85
 * - Expected: 4 honor results (one per period)
 *
 * Scenario 2: "Early Failure Student" - Grade <85 in Period 1
 * - Period 1: Has grade 84 → No honor
 * - Period 2-4: All 85+, avg 92+ → No honor (Period 1 has <85)
 * - Expected: 0 honor results
 *
 * Scenario 3: "Mid-Year Failure Student" - Qualified Period 1, but grade <85 in Period 2
 * - Period 1: All 85+, avg 92 → Honor
 * - Period 2: Has grade 83 → No honor
 * - Period 3-4: All 85+, avg 93+ → No honor (Period 2 has <85)
 * - Expected: 1 honor result (Period 1 only)
 *
 * Scenario 4: "Varying Honors Student" - Different honor levels per period
 * - Period 1: All 85+, avg 98 → With Highest Honors
 * - Period 2: All 85+, avg 91 → With Honors
 * - Period 3: All 85+, avg 96 → With High Honors
 * - Period 4: All 85+, avg 99 → With Highest Honors
 * - Expected: 4 honor results with different levels
 */
class SHSHonorTestDataSeeder extends Seeder
{
    public function run(): void
    {
        Log::info('[SHS HONOR TEST] === STARTING SHS HONOR TEST DATA SEEDER ===');

        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();

        if (!$shsLevel) {
            $this->command->error('Senior High School academic level not found!');
            Log::error('[SHS HONOR TEST] SHS academic level not found');
            return;
        }

        // Get all SHS grading periods (should be 4: m1, Pre-final, m2, pre-final2 or Q1-Q4)
        $periods = GradingPeriod::where('academic_level_id', $shsLevel->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        if ($periods->count() < 4) {
            $this->command->error('Not enough grading periods found! Need 4, found ' . $periods->count());
            Log::error('[SHS HONOR TEST] Insufficient grading periods', ['found' => $periods->count()]);
            return;
        }

        Log::info('[SHS HONOR TEST] Found grading periods', [
            'count' => $periods->count(),
            'periods' => $periods->pluck('name', 'code')->toArray()
        ]);

        // Get or create subjects
        $subjects = $this->createSubjects($shsLevel->id);
        Log::info('[SHS HONOR TEST] Created/Found ' . count($subjects) . ' subjects');

        // Get or create section
        $section = $this->createSection($shsLevel->id);
        Log::info('[SHS HONOR TEST] Created/Found section: ' . $section->name);

        // Create test students
        $students = [
            $this->createScenario1Student($section),
            $this->createScenario2Student($section),
            $this->createScenario3Student($section),
            $this->createScenario4Student($section),
        ];

        // Create grades for each student
        $schoolYear = '2024-2025';

        $this->createScenario1Grades($students[0], $subjects, $periods, $shsLevel->id, $schoolYear);
        $this->createScenario2Grades($students[1], $subjects, $periods, $shsLevel->id, $schoolYear);
        $this->createScenario3Grades($students[2], $subjects, $periods, $shsLevel->id, $schoolYear);
        $this->createScenario4Grades($students[3], $subjects, $periods, $shsLevel->id, $schoolYear);

        Log::info('[SHS HONOR TEST] === SEEDER COMPLETED SUCCESSFULLY ===');
        $this->command->info('✅ SHS Honor Test Data created successfully!');
        $this->command->info('Test students:');
        $this->command->info('1. ' . $students[0]->name . ' (Perfect Honor - should qualify all 4 periods)');
        $this->command->info('2. ' . $students[1]->name . ' (Early Failure - grade <85 in Period 1)');
        $this->command->info('3. ' . $students[2]->name . ' (Mid-Year Failure - qualified P1, failed P2)');
        $this->command->info('4. ' . $students[3]->name . ' (Varying Honors - different levels each period)');
    }

    private function createSubjects(int $academicLevelId): array
    {
        $subjectNames = [
            'Mathematics',
            'Science',
            'English',
            'Filipino',
            'Social Studies',
            'Physical Education'
        ];

        $subjects = [];
        foreach ($subjectNames as $name) {
            $subject = Subject::firstOrCreate([
                'name' => $name . ' (SHS Test)',
                'academic_level_id' => $academicLevelId
            ], [
                'code' => strtoupper(substr($name, 0, 3)) . '-TEST',
                'description' => 'Test subject for SHS honor calculation',
                'units' => 3
            ]);
            $subjects[] = $subject;
        }

        return $subjects;
    }

    private function createSection(int $academicLevelId): Section
    {
        return Section::firstOrCreate([
            'name' => 'SHS Test Section',
            'code' => 'SHS-TEST',
            'academic_level_id' => $academicLevelId
        ], [
            'specific_year_level' => 'grade_11',
            'school_year' => '2024-2025'
        ]);
    }

    private function createScenario1Student(Section $section): User
    {
        return User::firstOrCreate([
            'email' => 'shs.perfect.honor@test.edu'
        ], [
            'name' => 'Perfect Honor Student',
            'password' => Hash::make('password'),
            'user_role' => 'student',
            'year_level' => 'senior_highschool',
            'specific_year_level' => 'grade_11',
            'section_id' => $section->id,
            'student_number' => 'SHS-TEST-001',
            'email_verified_at' => now(),
        ]);
    }

    private function createScenario2Student(Section $section): User
    {
        return User::firstOrCreate([
            'email' => 'shs.early.failure@test.edu'
        ], [
            'name' => 'Early Failure Student',
            'password' => Hash::make('password'),
            'user_role' => 'student',
            'year_level' => 'senior_highschool',
            'specific_year_level' => 'grade_11',
            'section_id' => $section->id,
            'student_number' => 'SHS-TEST-002',
            'email_verified_at' => now(),
        ]);
    }

    private function createScenario3Student(Section $section): User
    {
        return User::firstOrCreate([
            'email' => 'shs.midyear.failure@test.edu'
        ], [
            'name' => 'Mid-Year Failure Student',
            'password' => Hash::make('password'),
            'user_role' => 'student',
            'year_level' => 'senior_highschool',
            'specific_year_level' => 'grade_11',
            'section_id' => $section->id,
            'student_number' => 'SHS-TEST-003',
            'email_verified_at' => now(),
        ]);
    }

    private function createScenario4Student(Section $section): User
    {
        return User::firstOrCreate([
            'email' => 'shs.varying.honors@test.edu'
        ], [
            'name' => 'Varying Honors Student',
            'password' => Hash::make('password'),
            'user_role' => 'student',
            'year_level' => 'senior_highschool',
            'specific_year_level' => 'grade_11',
            'section_id' => $section->id,
            'student_number' => 'SHS-TEST-004',
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Scenario 1: Perfect Honor Student
     * All grades 90+, no grade below 85
     * Expected: Qualifies for all 4 periods
     */
    private function createScenario1Grades($student, array $subjects, $periods, int $academicLevelId, string $schoolYear): void
    {
        Log::info('[SHS HONOR TEST] Creating Scenario 1 grades (Perfect Honor)');

        foreach ($periods as $period) {
            foreach ($subjects as $subject) {
                // All grades between 90-95 (honors range)
                $grade = 90 + rand(0, 5);

                StudentGrade::updateOrCreate([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevelId,
                    'grading_period_id' => $period->id,
                    'school_year' => $schoolYear,
                ], [
                    'grade' => $grade,
                ]);
            }
        }

        Log::info('[SHS HONOR TEST] Scenario 1 grades created - All 90+');
    }

    /**
     * Scenario 2: Early Failure Student
     * Period 1: Has one grade 84 (below 85)
     * Period 2-4: All 85+, avg 92+
     * Expected: 0 honor results (disqualified from all periods due to P1 failure)
     */
    private function createScenario2Grades($student, array $subjects, $periods, int $academicLevelId, string $schoolYear): void
    {
        Log::info('[SHS HONOR TEST] Creating Scenario 2 grades (Early Failure)');

        foreach ($periods as $index => $period) {
            foreach ($subjects as $subjectIndex => $subject) {
                if ($index === 0 && $subjectIndex === 0) {
                    // First subject in Period 1: grade 84 (FAIL)
                    $grade = 84;
                    Log::info('[SHS HONOR TEST] Scenario 2 - Setting failing grade', [
                        'period' => $period->name,
                        'subject' => $subject->name,
                        'grade' => $grade
                    ]);
                } else {
                    // All other grades: 88-95 (good but can't qualify due to P1 failure)
                    $grade = 88 + rand(0, 7);
                }

                StudentGrade::updateOrCreate([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevelId,
                    'grading_period_id' => $period->id,
                    'school_year' => $schoolYear,
                ], [
                    'grade' => $grade,
                ]);
            }
        }

        Log::info('[SHS HONOR TEST] Scenario 2 grades created - Has 84 in P1');
    }

    /**
     * Scenario 3: Mid-Year Failure Student
     * Period 1: All 85+, avg 92
     * Period 2: Has one grade 83 (below 85)
     * Period 3-4: All 85+, avg 93+
     * Expected: 1 honor result (Period 1 only)
     */
    private function createScenario3Grades($student, array $subjects, $periods, int $academicLevelId, string $schoolYear): void
    {
        Log::info('[SHS HONOR TEST] Creating Scenario 3 grades (Mid-Year Failure)');

        foreach ($periods as $index => $period) {
            foreach ($subjects as $subjectIndex => $subject) {
                if ($index === 0) {
                    // Period 1: All grades 90-94 (qualifies for With Honors)
                    $grade = 90 + rand(0, 4);
                } elseif ($index === 1 && $subjectIndex === 0) {
                    // Period 2, first subject: grade 83 (FAIL)
                    $grade = 83;
                    Log::info('[SHS HONOR TEST] Scenario 3 - Setting failing grade in P2', [
                        'period' => $period->name,
                        'subject' => $subject->name,
                        'grade' => $grade
                    ]);
                } else {
                    // Period 2-4 other grades: 89-95 (good but can't qualify due to P2 failure)
                    $grade = 89 + rand(0, 6);
                }

                StudentGrade::updateOrCreate([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevelId,
                    'grading_period_id' => $period->id,
                    'school_year' => $schoolYear,
                ], [
                    'grade' => $grade,
                ]);
            }
        }

        Log::info('[SHS HONOR TEST] Scenario 3 grades created - Qualifies P1, fails P2');
    }

    /**
     * Scenario 4: Varying Honors Student
     * Period 1: All 85+, avg 98 (With Highest Honors)
     * Period 2: All 85+, avg 91 (With Honors)
     * Period 3: All 85+, avg 96 (With High Honors)
     * Period 4: All 85+, avg 99 (With Highest Honors)
     * Expected: 4 honor results with different levels
     */
    private function createScenario4Grades($student, array $subjects, $periods, int $academicLevelId, string $schoolYear): void
    {
        Log::info('[SHS HONOR TEST] Creating Scenario 4 grades (Varying Honors)');

        $targetAverages = [98, 91, 96, 99]; // Different honor levels per period

        foreach ($periods as $index => $period) {
            // Only process first 4 periods
            if ($index >= 4) {
                break;
            }

            $targetAvg = $targetAverages[$index];

            foreach ($subjects as $subjectIndex => $subject) {
                // Generate grades around target average (±2)
                $grade = $targetAvg + rand(-2, 2);

                // Ensure no grade below 85
                if ($grade < 85) {
                    $grade = 85;
                }

                // Ensure no grade above 100
                if ($grade > 100) {
                    $grade = 100;
                }

                StudentGrade::updateOrCreate([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevelId,
                    'grading_period_id' => $period->id,
                    'school_year' => $schoolYear,
                ], [
                    'grade' => $grade,
                ]);
            }

            Log::info('[SHS HONOR TEST] Scenario 4 - Created grades for period', [
                'period' => $period->name,
                'target_avg' => $targetAvg
            ]);
        }

        Log::info('[SHS HONOR TEST] Scenario 4 grades created - Varying honor levels');
    }
}
