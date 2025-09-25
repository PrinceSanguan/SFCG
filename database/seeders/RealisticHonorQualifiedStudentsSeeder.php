<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Department;
use App\Models\Course;
use App\Models\HonorType;
use App\Models\HonorResult;
use App\Models\Subject;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\ParentStudentRelationship;
use Illuminate\Support\Facades\Hash;

class RealisticHonorQualifiedStudentsSeeder extends Seeder
{
    private $schoolYear = '2024-2025';
    private $students = [];
    private $parents = [];

    public function run(): void
    {
        $this->command->info('Seeding Realistic Honor Qualified Students...');

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Get departments for college
        $computerDept = Department::where('code', 'COMP')->first();
        $businessDept = Department::where('code', 'BUS')->first();

        // Get courses for college
        $bscsCourse = Course::where('code', 'BSCS')->first();
        $bsitCourse = Course::where('code', 'BSIT')->first();
        $bsbaCourse = Course::where('code', 'BSBA')->first();

        // Create students for each level
        $this->createElementaryStudents($elementary);
        $this->createJuniorHighStudents($juniorHigh);
        $this->createSeniorHighStudents($seniorHigh);
        $this->createCollegeStudents($college, $computerDept, $businessDept, $bscsCourse, $bsitCourse, $bsbaCourse);

        // Create parent-student relationships
        $this->createParentStudentRelationships();

        // Create honor results (without detailed grades for now)
        $this->createHonorResults();

        $this->command->info('Created ' . count($this->students) . ' honor-qualified students');
        $this->command->info('Created ' . count($this->parents) . ' parent accounts');
        $this->command->info('All students have pending honors for approval testing');
    }

    private function createElementaryStudents($academicLevel)
    {
        $elementaryData = [
            [
                'name' => 'Isabella Marie Santos',
                'email' => 'isabella.santos@student.sfcg.edu',
                'student_number' => 'EL-2024-001',
                'specific_year_level' => 'grade_6',
                'parent_data' => [
                    'father' => ['name' => 'Roberto Santos', 'email' => 'roberto.santos@email.com'],
                    'mother' => ['name' => 'Carmen Santos', 'email' => 'carmen.santos@email.com']
                ]
            ],
            [
                'name' => 'Ethan James Rodriguez',
                'email' => 'ethan.rodriguez@student.sfcg.edu',
                'student_number' => 'EL-2024-002',
                'specific_year_level' => 'grade_5',
                'parent_data' => [
                    'father' => ['name' => 'Miguel Rodriguez', 'email' => 'miguel.rodriguez@email.com'],
                    'mother' => ['name' => 'Sofia Rodriguez', 'email' => 'sofia.rodriguez@email.com']
                ]
            ],
            [
                'name' => 'Sophia Grace Dela Cruz',
                'email' => 'sophia.delacruz@student.sfcg.edu',
                'student_number' => 'EL-2024-003',
                'specific_year_level' => 'grade_6',
                'parent_data' => [
                    'father' => ['name' => 'Jose Dela Cruz', 'email' => 'jose.delacruz@email.com'],
                    'mother' => ['name' => 'Maria Dela Cruz', 'email' => 'maria.delacruz@email.com']
                ]
            ]
        ];

        foreach ($elementaryData as $data) {
            $student = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('student123'),
                    'user_role' => 'student',
                    'year_level' => 'elementary',
                    'specific_year_level' => $data['specific_year_level'],
                    'student_number' => $data['student_number'],
                    'email_verified_at' => now(),
                ]
            );

            $this->students[] = [
                'student' => $student,
                'level' => $academicLevel,
                'parent_data' => $data['parent_data'],
                'honor_type' => 'with_highest_honors', // Elementary top performers
                'target_gpa' => rand(95, 98) + (rand(0, 9) / 10), // 95.0 - 98.9
            ];
        }
    }

    private function createJuniorHighStudents($academicLevel)
    {
        $juniorHighData = [
            [
                'name' => 'Alexander David Torres',
                'email' => 'alexander.torres@student.sfcg.edu',
                'student_number' => 'JH-2024-001',
                'specific_year_level' => 'grade_10',
                'parent_data' => [
                    'father' => ['name' => 'Carlos Torres', 'email' => 'carlos.torres@email.com'],
                    'mother' => ['name' => 'Ana Torres', 'email' => 'ana.torres@email.com']
                ]
            ],
            [
                'name' => 'Gabriella Rose Fernandez',
                'email' => 'gabriella.fernandez@student.sfcg.edu',
                'student_number' => 'JH-2024-002',
                'specific_year_level' => 'grade_9',
                'parent_data' => [
                    'father' => ['name' => 'Eduardo Fernandez', 'email' => 'eduardo.fernandez@email.com'],
                    'mother' => ['name' => 'Lucia Fernandez', 'email' => 'lucia.fernandez@email.com']
                ]
            ],
            [
                'name' => 'Nathan Paul Villanueva',
                'email' => 'nathan.villanueva@student.sfcg.edu',
                'student_number' => 'JH-2024-003',
                'specific_year_level' => 'grade_10',
                'parent_data' => [
                    'father' => ['name' => 'Paul Villanueva', 'email' => 'paul.villanueva@email.com'],
                    'mother' => ['name' => 'Rachel Villanueva', 'email' => 'rachel.villanueva@email.com']
                ]
            ]
        ];

        foreach ($juniorHighData as $data) {
            $student = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('student123'),
                    'user_role' => 'student',
                    'year_level' => 'junior_highschool',
                    'specific_year_level' => $data['specific_year_level'],
                    'student_number' => $data['student_number'],
                    'email_verified_at' => now(),
                ]
            );

            $this->students[] = [
                'student' => $student,
                'level' => $academicLevel,
                'parent_data' => $data['parent_data'],
                'honor_type' => 'with_high_honors', // Junior High achievers
                'target_gpa' => rand(93, 96) + (rand(0, 9) / 10), // 93.0 - 96.9
            ];
        }
    }

    private function createSeniorHighStudents($academicLevel)
    {
        $seniorHighData = [
            [
                'name' => 'Victoria Anne Castillo',
                'email' => 'victoria.castillo@student.sfcg.edu',
                'student_number' => 'SH-2024-001',
                'specific_year_level' => 'grade_12',
                'parent_data' => [
                    'father' => ['name' => 'Antonio Castillo', 'email' => 'antonio.castillo@email.com'],
                    'mother' => ['name' => 'Elena Castillo', 'email' => 'elena.castillo@email.com']
                ]
            ],
            [
                'name' => 'Benjamin Carlo Reyes',
                'email' => 'benjamin.reyes@student.sfcg.edu',
                'student_number' => 'SH-2024-002',
                'specific_year_level' => 'grade_11',
                'parent_data' => [
                    'father' => ['name' => 'Francisco Reyes', 'email' => 'francisco.reyes@email.com'],
                    'mother' => ['name' => 'Isabella Reyes', 'email' => 'isabella.reyes@email.com']
                ]
            ],
            [
                'name' => 'Charlotte Faith Morales',
                'email' => 'charlotte.morales@student.sfcg.edu',
                'student_number' => 'SH-2024-003',
                'specific_year_level' => 'grade_12',
                'parent_data' => [
                    'father' => ['name' => 'Gabriel Morales', 'email' => 'gabriel.morales@email.com'],
                    'mother' => ['name' => 'Patricia Morales', 'email' => 'patricia.morales@email.com']
                ]
            ]
        ];

        foreach ($seniorHighData as $data) {
            $student = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('student123'),
                    'user_role' => 'student',
                    'year_level' => 'senior_highschool',
                    'specific_year_level' => $data['specific_year_level'],
                    'student_number' => $data['student_number'],
                    'email_verified_at' => now(),
                ]
            );

            $this->students[] = [
                'student' => $student,
                'level' => $academicLevel,
                'parent_data' => $data['parent_data'],
                'honor_type' => 'with_honors', // Senior High honors
                'target_gpa' => rand(90, 94) + (rand(0, 9) / 10), // 90.0 - 94.9
            ];
        }
    }

    private function createCollegeStudents($academicLevel, $computerDept, $businessDept, $bscsCourse, $bsitCourse, $bsbaCourse)
    {
        $collegeData = [
            [
                'name' => 'Daniel Sebastian Cruz',
                'email' => 'daniel.cruz@student.sfcg.edu',
                'student_number' => 'CO-2024-001',
                'specific_year_level' => 'third_year',
                'course' => $bscsCourse,
                'department' => $computerDept,
                'honor_type' => 'summa_cum_laude',
                'target_gpa' => rand(95, 98) + (rand(0, 9) / 10),
                'parent_data' => [
                    'father' => ['name' => 'Manuel Cruz', 'email' => 'manuel.cruz@email.com'],
                    'mother' => ['name' => 'Carmen Cruz', 'email' => 'carmen.cruz@email.com']
                ]
            ],
            [
                'name' => 'Samantha Nicole Gutierrez',
                'email' => 'samantha.gutierrez@student.sfcg.edu',
                'student_number' => 'CO-2024-002',
                'specific_year_level' => 'second_year',
                'course' => $bsitCourse,
                'department' => $computerDept,
                'honor_type' => 'magna_cum_laude',
                'target_gpa' => rand(92, 95) + (rand(0, 9) / 10),
                'parent_data' => [
                    'father' => ['name' => 'Ricardo Gutierrez', 'email' => 'ricardo.gutierrez@email.com'],
                    'mother' => ['name' => 'Valeria Gutierrez', 'email' => 'valeria.gutierrez@email.com']
                ]
            ],
            [
                'name' => 'Matthew Alexander Herrera',
                'email' => 'matthew.herrera@student.sfcg.edu',
                'student_number' => 'CO-2024-003',
                'specific_year_level' => 'fourth_year',
                'course' => $bsbaCourse,
                'department' => $businessDept,
                'honor_type' => 'cum_laude',
                'target_gpa' => rand(88, 92) + (rand(0, 9) / 10),
                'parent_data' => [
                    'father' => ['name' => 'Alejandro Herrera', 'email' => 'alejandro.herrera@email.com'],
                    'mother' => ['name' => 'Stephanie Herrera', 'email' => 'stephanie.herrera@email.com']
                ]
            ]
        ];

        foreach ($collegeData as $data) {
            $student = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('student123'),
                    'user_role' => 'student',
                    'year_level' => 'college',
                    'specific_year_level' => $data['specific_year_level'],
                    'student_number' => $data['student_number'],
                    'course_id' => $data['course']->id,
                    'department_id' => $data['department']->id,
                    'email_verified_at' => now(),
                ]
            );

            $this->students[] = [
                'student' => $student,
                'level' => $academicLevel,
                'parent_data' => $data['parent_data'],
                'honor_type' => $data['honor_type'],
                'target_gpa' => $data['target_gpa'],
            ];
        }
    }

    private function createParentStudentRelationships()
    {
        foreach ($this->students as $studentData) {
            $student = $studentData['student'];
            $parentData = $studentData['parent_data'];

            // Create father
            if (isset($parentData['father'])) {
                $father = User::updateOrCreate(
                    ['email' => $parentData['father']['email']],
                    [
                        'name' => $parentData['father']['name'],
                        'password' => Hash::make('parent123'),
                        'user_role' => 'parent',
                        'email_verified_at' => now(),
                    ]
                );

                ParentStudentRelationship::updateOrCreate(
                    [
                        'parent_id' => $father->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'relationship_type' => 'father',
                        'emergency_contact' => 'yes',
                        'notes' => 'Father of ' . $student->name,
                    ]
                );

                $this->parents[] = $father;
            }

            // Create mother
            if (isset($parentData['mother'])) {
                $mother = User::updateOrCreate(
                    ['email' => $parentData['mother']['email']],
                    [
                        'name' => $parentData['mother']['name'],
                        'password' => Hash::make('parent123'),
                        'user_role' => 'parent',
                        'email_verified_at' => now(),
                    ]
                );

                ParentStudentRelationship::updateOrCreate(
                    [
                        'parent_id' => $mother->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'relationship_type' => 'mother',
                        'emergency_contact' => 'yes',
                        'notes' => 'Mother of ' . $student->name,
                    ]
                );

                $this->parents[] = $mother;
            }
        }
    }

    private function createHonorResults()
    {
        foreach ($this->students as $studentData) {
            $student = $studentData['student'];
            $level = $studentData['level'];
            $honorType = $studentData['honor_type'];
            $targetGpa = $studentData['target_gpa'];

            // Create honor result (pending approval)
            $honorTypeModel = HonorType::where('key', $honorType)->first();
            
            if ($honorTypeModel) {
                HonorResult::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'honor_type_id' => $honorTypeModel->id,
                        'academic_level_id' => $level->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'gpa' => $targetGpa,
                        'is_overridden' => false,
                        'is_pending_approval' => true,
                        'is_approved' => false,
                        'is_rejected' => false,
                    ]
                );

                $this->command->info("Created honor result for {$student->name} - {$honorTypeModel->name} ({$targetGpa} GPA)");
            } else {
                $this->command->warn("Honor type '{$honorType}' not found for {$student->name}");
            }
        }
    }
}