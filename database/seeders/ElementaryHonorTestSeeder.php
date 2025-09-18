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
use App\Models\Section;
use App\Models\ClassAdviserAssignment;
use App\Models\TeacherSubjectAssignment;
use App\Models\StudentSubjectAssignment;
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

        // Create teachers/advisers
        $teachers = $this->createTeachers($elementary);
        
        // Create advisers (users with adviser role)
        $advisers = $this->createAdvisers($elementary);

        // Create sections
        $sections = $this->createSections($elementary, $schoolYear);

        // Assign teachers to subjects
        $this->assignTeachersToSubjects($teachers, $subjects, $elementary, $schoolYear);

        // Create test students with different grade scenarios
        $students = $this->createTestStudents($elementary, $quarters, $subjects, $schoolYear, $sections);

        // Assign students to sections and subjects
        $this->assignStudentsToSectionsAndSubjects($students, $sections, $subjects, $elementary, $schoolYear);

        // Assign class advisers
        $this->assignClassAdvisers($advisers, $sections, $elementary, $schoolYear);

        $this->command->info('✅ Elementary Honor Test Data created successfully!');
        $this->command->info('📊 Test Data Created:');
        $this->command->info('   👨‍🏫 Teachers: ' . count($teachers));
        $this->command->info('   👨‍💼 Advisers: ' . count($advisers));
        $this->command->info('   🏫 Sections: ' . count($sections));
        $this->command->info('   👨‍🎓 Students: ' . count($students));
        $this->command->info('   📚 Subject Assignments: ' . $subjects->count() . ' subjects per teacher');
        $this->command->info('   🎯 Class Adviser Assignments: ' . count($advisers) . ' advisers assigned to sections');
        $this->command->info('');
        $this->command->info('📊 Test Students:');
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

    private function createTeachers($academicLevel): array
    {
        $teachers = [
            [
                'name' => 'Ms. Sarah Johnson',
                'email' => 'sarah.johnson@elementary.teacher',
                'user_role' => 'teacher',
                'year_level' => 'elementary',
                'employee_number' => 'TCH-ELEM-HONOR-001',
            ],
            [
                'name' => 'Mr. Michael Rodriguez',
                'email' => 'michael.rodriguez@elementary.teacher',
                'user_role' => 'teacher',
                'year_level' => 'elementary',
                'employee_number' => 'TCH-ELEM-HONOR-002',
            ],
            [
                'name' => 'Ms. Jennifer Lee',
                'email' => 'jennifer.lee@elementary.teacher',
                'user_role' => 'teacher',
                'year_level' => 'elementary',
                'employee_number' => 'TCH-ELEM-HONOR-003',
            ],
            [
                'name' => 'Mr. David Chen',
                'email' => 'david.chen@elementary.teacher',
                'user_role' => 'teacher',
                'year_level' => 'elementary',
                'employee_number' => 'TCH-ELEM-HONOR-004',
            ],
        ];

        $createdTeachers = [];
        foreach ($teachers as $teacherData) {
            $teacher = User::updateOrCreate(
                ['email' => $teacherData['email']],
                [
                    'name' => $teacherData['name'],
                    'email' => $teacherData['email'],
                    'password' => Hash::make('password'),
                    'user_role' => $teacherData['user_role'],
                    'year_level' => $teacherData['year_level'],
                    'student_number' => $teacherData['employee_number'],
                    'email_verified_at' => now(),
                ]
            );
            $createdTeachers[] = $teacher;
        }

        return $createdTeachers;
    }

    private function createAdvisers($academicLevel): array
    {
        $advisers = [
            [
                'name' => 'Ms. Patricia Williams',
                'email' => 'patricia.williams@elementary.adviser',
                'user_role' => 'adviser',
                'year_level' => 'elementary',
                'employee_number' => 'ADV-ELEM-001',
            ],
            [
                'name' => 'Mr. Robert Martinez',
                'email' => 'robert.martinez@elementary.adviser',
                'user_role' => 'adviser',
                'year_level' => 'elementary',
                'employee_number' => 'ADV-ELEM-002',
            ],
            [
                'name' => 'Ms. Lisa Thompson',
                'email' => 'lisa.thompson@elementary.adviser',
                'user_role' => 'adviser',
                'year_level' => 'elementary',
                'employee_number' => 'ADV-ELEM-003',
            ],
            [
                'name' => 'Mr. James Wilson',
                'email' => 'james.wilson@elementary.adviser',
                'user_role' => 'adviser',
                'year_level' => 'elementary',
                'employee_number' => 'ADV-ELEM-004',
            ],
        ];

        $createdAdvisers = [];
        foreach ($advisers as $adviserData) {
            $adviser = User::updateOrCreate(
                ['email' => $adviserData['email']],
                [
                    'name' => $adviserData['name'],
                    'email' => $adviserData['email'],
                    'password' => Hash::make('password'),
                    'user_role' => $adviserData['user_role'],
                    'year_level' => $adviserData['year_level'],
                    'student_number' => $adviserData['employee_number'],
                    'email_verified_at' => now(),
                ]
            );
            $createdAdvisers[] = $adviser;
        }

        return $createdAdvisers;
    }

    private function createSections($academicLevel, $schoolYear): array
    {
        $sections = [
            [
                'name' => 'Grade 6 - Einstein',
                'code' => 'G6-EINSTEIN',
                'specific_year_level' => 'grade_6',
                'max_students' => 30,
            ],
            [
                'name' => 'Grade 6 - Newton',
                'code' => 'G6-NEWTON',
                'specific_year_level' => 'grade_6',
                'max_students' => 30,
            ],
            [
                'name' => 'Grade 5 - Curie',
                'code' => 'G5-CURIE',
                'specific_year_level' => 'grade_5',
                'max_students' => 30,
            ],
            [
                'name' => 'Grade 5 - Darwin',
                'code' => 'G5-DARWIN',
                'specific_year_level' => 'grade_5',
                'max_students' => 30,
            ],
        ];

        $createdSections = [];
        foreach ($sections as $sectionData) {
            $section = Section::updateOrCreate(
                [
                    'code' => $sectionData['code'],
                    'academic_level_id' => $academicLevel->id,
                    'school_year' => $schoolYear,
                ],
                [
                    'name' => $sectionData['name'],
                    'academic_level_id' => $academicLevel->id,
                    'specific_year_level' => $sectionData['specific_year_level'],
                    'max_students' => $sectionData['max_students'],
                    'school_year' => $schoolYear,
                    'is_active' => true,
                ]
            );
            $createdSections[] = $section;
        }

        return $createdSections;
    }

    private function assignTeachersToSubjects($teachers, $subjects, $academicLevel, $schoolYear): void
    {
        // Assign each teacher to multiple subjects
        $subjectAssignments = [
            0 => [15, 16, 17], // Ms. Sarah Johnson - Math, English, Science
            1 => [18, 19, 20], // Mr. Michael Rodriguez - Filipino, AP, MAPEH
            2 => [21, 22],     // Ms. Jennifer Lee - ESP, Computer
            3 => [15, 16, 17], // Mr. David Chen - Math, English, Science (backup)
        ];

        foreach ($teachers as $index => $teacher) {
            $assignedSubjects = $subjectAssignments[$index] ?? [];
            
            foreach ($assignedSubjects as $subjectId) {
                $subject = $subjects->find($subjectId);
                if ($subject) {
                    TeacherSubjectAssignment::updateOrCreate(
                        [
                            'teacher_id' => $teacher->id,
                            'subject_id' => $subject->id,
                            'academic_level_id' => $academicLevel->id,
                            'school_year' => $schoolYear,
                        ],
                        [
                            'assigned_by' => 1, // Admin user
                            'is_active' => true,
                            'assigned_at' => now(),
                        ]
                    );
                }
            }
        }
    }

    private function createTestStudents($academicLevel, $quarters, $subjects, $schoolYear, $sections): array
    {
        $students = [];
        
        // Student 1: With Honors (Average: 92.5) - Grade 6 Einstein
        $student1 = User::updateOrCreate(
            ['email' => 'maria.santos@elementary.test'],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-001',
                'section_id' => $sections[0]->id, // Grade 6 - Einstein
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student1, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [92, 90, 95, 88, 94], // Average: 91.8
            'Q2' => [89, 93, 91, 87, 92], // Average: 90.4
            'Q3' => [94, 96, 88, 95, 93], // Average: 93.2
            'Q4' => [91, 89, 94, 92, 96], // Average: 92.4
        ]);
        $students[] = $student1;

        // Student 2: With High Honors (Average: 95.8) - Grade 6 Newton
        $student2 = User::updateOrCreate(
            ['email' => 'juan.delacruz@elementary.test'],
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-002',
                'section_id' => $sections[1]->id, // Grade 6 - Newton
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student2, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [96, 94, 97, 95, 96], // Average: 95.6
            'Q2' => [95, 96, 94, 97, 95], // Average: 95.4
            'Q3' => [97, 95, 96, 94, 98], // Average: 96.0
            'Q4' => [96, 97, 95, 96, 95], // Average: 95.8
        ]);
        $students[] = $student2;

        // Student 3: With Highest Honors (Average: 98.2) - Grade 5 Curie
        $student3 = User::updateOrCreate(
            ['email' => 'ana.rodriguez@elementary.test'],
            [
                'name' => 'Ana Rodriguez',
                'email' => 'ana.rodriguez@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-003',
                'section_id' => $sections[2]->id, // Grade 5 - Curie
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student3, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [98, 97, 99, 96, 98], // Average: 97.6
            'Q2' => [97, 98, 96, 99, 97], // Average: 97.4
            'Q3' => [99, 97, 98, 97, 99], // Average: 98.0
            'Q4' => [98, 99, 97, 98, 100], // Average: 98.4
        ]);
        $students[] = $student3;

        // Student 4: No Honors (Average: 87.3) - Grade 5 Darwin
        $student4 = User::updateOrCreate(
            ['email' => 'carlos.mendoza@elementary.test'],
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-004',
                'section_id' => $sections[3]->id, // Grade 5 - Darwin
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student4, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [88, 85, 90, 82, 87], // Average: 86.4
            'Q2' => [86, 88, 84, 89, 85], // Average: 86.4
            'Q3' => [89, 87, 88, 86, 90], // Average: 88.0
            'Q4' => [87, 89, 85, 88, 86], // Average: 87.0
        ]);
        $students[] = $student4;

        // Student 5: No Honors (Average: 82.1) - Grade 6 Einstein
        $student5 = User::updateOrCreate(
            ['email' => 'sofia.garcia@elementary.test'],
            [
                'name' => 'Sofia Garcia',
                'email' => 'sofia.garcia@elementary.test',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-TEST-005',
                'section_id' => $sections[0]->id, // Grade 6 - Einstein
                'email_verified_at' => now(),
            ]
        );
        $this->createStudentGrades($student5, $academicLevel, $quarters, $subjects, $schoolYear, [
            'Q1' => [82, 80, 85, 78, 83], // Average: 81.6
            'Q2' => [81, 83, 79, 84, 80], // Average: 81.4
            'Q3' => [84, 82, 83, 81, 85], // Average: 83.0
            'Q4' => [82, 84, 80, 83, 81], // Average: 82.0
        ]);
        $students[] = $student5;

        return $students;
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

    private function assignStudentsToSectionsAndSubjects($students, $sections, $subjects, $academicLevel, $schoolYear): void
    {
        foreach ($students as $student) {
            // Assign student to all subjects
            foreach ($subjects as $subject) {
                StudentSubjectAssignment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'enrolled_by' => 1, // Admin user
                        'is_active' => true,
                        'enrolled_at' => now(),
                        'notes' => 'Enrolled for honor test data',
                    ]
                );
            }
        }
    }

    private function assignClassAdvisers($advisers, $sections, $academicLevel, $schoolYear): void
    {
        // Assign advisers to sections
        $adviserAssignments = [
            0 => 0, // Ms. Patricia Williams -> Grade 6 Einstein
            1 => 1, // Mr. Robert Martinez -> Grade 6 Newton
            2 => 2, // Ms. Lisa Thompson -> Grade 5 Curie
            3 => 3, // Mr. James Wilson -> Grade 5 Darwin
        ];

        // Get a subject for the adviser assignment (we'll use the first elementary subject)
        $subject = Subject::where('academic_level_id', $academicLevel->id)->first();

        foreach ($adviserAssignments as $adviserIndex => $sectionIndex) {
            if (isset($advisers[$adviserIndex]) && isset($sections[$sectionIndex]) && $subject) {
                $adviser = $advisers[$adviserIndex];
                $section = $sections[$sectionIndex];
                
                ClassAdviserAssignment::updateOrCreate(
                    [
                        'adviser_id' => $adviser->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $academicLevel->id,
                        'grade_level' => $section->specific_year_level,
                        'section' => $section->name,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'assigned_by' => 1, // Admin user
                        'is_active' => true,
                        'assigned_at' => now(),
                        'notes' => "Class adviser for {$section->name}",
                    ]
                );
            }
        }
    }
}
