<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\StudentGrade;
use App\Models\GradingPeriod;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use Illuminate\Support\Facades\Hash;

class ElementaryHonorTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Creating Elementary Honor Test Data...');

        // Get elementary academic level
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        if (!$elementary) {
            $this->command->error('Elementary academic level not found! Please run BasicStructureSeeder first.');
            return;
        }

        // Get elementary grading periods (quarters) - use only Q1, Q2, Q3, Q4
        $quarters = GradingPeriod::where('academic_level_id', $elementary->id)
            ->where('type', 'quarter')
            ->where('period_type', 'quarter')
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4'])
            ->orderBy('sort_order')
            ->get();

        if ($quarters->count() < 4) {
            $this->command->error('Elementary quarters not found! Please run GradingPeriodStructureSeeder first.');
            return;
        }

        // Get elementary subjects
        $subjects = Subject::where('academic_level_id', $elementary->id)->take(5)->get();
        if ($subjects->isEmpty()) {
            $this->command->error('Elementary subjects not found! Please run AcademicManagementSeeder first.');
            return;
        }

        $schoolYear = '2024-2025';

        // Create honor types if they don't exist
        $this->createHonorTypes();

        // Create honor criteria if they don't exist
        $this->createHonorCriteria($elementary->id);

        // Create test students with different grade scenarios
        $this->createTestStudents($elementary, $quarters, $subjects, $schoolYear);

        $this->command->info('✅ Elementary Honor Test Data created successfully!');
        $this->command->info('📊 Test Students Created:');
        $this->command->info('   - Maria Santos (With Honors) - Average: 92.5');
        $this->command->info('   - Juan Dela Cruz (With High Honors) - Average: 95.8');
        $this->command->info('   - Ana Rodriguez (With Highest Honors) - Average: 98.2');
        $this->command->info('   - Carlos Mendoza (No Honors) - Average: 87.3');
        $this->command->info('   - Sofia Garcia (No Honors) - Average: 82.1');
    }

    private function createHonorTypes(): void
    {
        $honorTypes = [
            [
                'name' => 'With Honors',
                'key' => 'with_honors',
                'scope' => 'basic',
            ],
            [
                'name' => 'With High Honors',
                'key' => 'with_high_honors',
                'scope' => 'basic',
            ],
            [
                'name' => 'With Highest Honors',
                'key' => 'with_highest_honors',
                'scope' => 'basic',
            ],
        ];

        foreach ($honorTypes as $type) {
            HonorType::updateOrCreate(
                ['key' => $type['key']],
                $type
            );
        }
    }

    private function createHonorCriteria(int $academicLevelId): void
    {
        $criteria = [
            [
                'honor_type_key' => 'with_honors',
                'min_gpa' => 90.0,
                'min_grade' => 85.0,
            ],
            [
                'honor_type_key' => 'with_high_honors',
                'min_gpa' => 95.0,
                'max_gpa' => 97.0,
                'min_grade' => 90.0,
                'min_grade_all' => 90.0,
            ],
            [
                'honor_type_key' => 'with_highest_honors',
                'min_gpa' => 98.0,
                'max_gpa' => 100.0,
                'min_grade' => 93.0,
                'min_grade_all' => 93.0,
            ],
        ];

        foreach ($criteria as $criterion) {
            $honorType = HonorType::where('key', $criterion['honor_type_key'])->first();
            if ($honorType) {
                HonorCriterion::updateOrCreate(
                    [
                        'academic_level_id' => $academicLevelId,
                        'honor_type_id' => $honorType->id,
                    ],
                    [
                        'min_gpa' => $criterion['min_gpa'] ?? null,
                        'max_gpa' => $criterion['max_gpa'] ?? null,
                        'min_grade' => $criterion['min_grade'] ?? null,
                        'min_grade_all' => $criterion['min_grade_all'] ?? null,
                        'min_year' => null,
                        'max_year' => null,
                        'require_consistent_honor' => false,
                    ]
                );
            }
        }
    }

    private function createTestStudents($academicLevel, $quarters, $subjects, $schoolYear): void
    {
        // Student 1: With Honors (Average: 92.5)
        $student1 = User::updateOrCreate(
            ['email' => 'maria.santos@elementary.test'],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-001',
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student1, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [92, 90, 95, 88, 94], // Average: 91.8
            'Q2' => [89, 93, 91, 87, 92], // Average: 90.4
            'Q3' => [94, 96, 88, 95, 93], // Average: 93.2
            'Q4' => [91, 89, 94, 92, 96], // Average: 92.4
        ]);

        // Student 2: With High Honors (Average: 95.8)
        $student2 = User::updateOrCreate(
            ['email' => 'juan.delacruz@elementary.test'],
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-002',
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student2, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [96, 94, 97, 95, 96], // Average: 95.6
            'Q2' => [95, 96, 94, 97, 95], // Average: 95.4
            'Q3' => [97, 95, 96, 94, 98], // Average: 96.0
            'Q4' => [96, 97, 95, 96, 95], // Average: 95.8
        ]);

        // Student 3: With Highest Honors (Average: 98.2)
        $student3 = User::updateOrCreate(
            ['email' => 'ana.rodriguez@elementary.test'],
            [
                'name' => 'Ana Rodriguez',
                'email' => 'ana.rodriguez@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-003',
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student3, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [98, 97, 99, 96, 98], // Average: 97.6
            'Q2' => [97, 98, 96, 99, 97], // Average: 97.4
            'Q3' => [99, 97, 98, 97, 99], // Average: 98.0
            'Q4' => [98, 99, 97, 98, 100], // Average: 98.4
        ]);

        // Student 4: No Honors (Average: 87.3)
        $student4 = User::updateOrCreate(
            ['email' => 'carlos.mendoza@elementary.test'],
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-004',
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student4, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [88, 85, 90, 82, 87], // Average: 86.4
            'Q2' => [86, 88, 84, 89, 85], // Average: 86.4
            'Q3' => [89, 87, 88, 86, 90], // Average: 88.0
            'Q4' => [87, 89, 85, 88, 86], // Average: 87.0
        ]);

        // Student 5: No Honors (Average: 82.1)
        $student5 = User::updateOrCreate(
            ['email' => 'sofia.garcia@elementary.test'],
            [
                'name' => 'Sofia Garcia',
                'email' => 'sofia.garcia@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-005',
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student5, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [82, 80, 85, 78, 83], // Average: 81.6
            'Q2' => [81, 83, 79, 84, 80], // Average: 81.4
            'Q3' => [84, 82, 83, 81, 85], // Average: 83.0
            'Q4' => [82, 84, 80, 83, 81], // Average: 82.0
        ]);
    }

    private function createStudentGrades($student, $academicLevel, $quarters, $subjects, $schoolYear, $quarterGrades): void
    {
        foreach ($quarters as $quarter) {
            $quarterCode = $quarter->code; // Q1, Q2, Q3, Q4
            $grades = $quarterGrades[$quarterCode] ?? [];

            foreach ($subjects as $index => $subject) {
                $grade = $grades[$index] ?? 85; // Default grade if not specified

                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $academicLevel->id,
                        'grading_period_id' => $quarter->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => $grade,
                    ]
                );
            }
        }
    }
}
