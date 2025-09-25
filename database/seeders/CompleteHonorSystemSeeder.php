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
use App\Models\StudentGrade;
use App\Models\ParentStudentRelationship;
use App\Models\GradingPeriod;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\InstructorSubjectAssignment;
use Illuminate\Support\Facades\Hash;

class CompleteHonorSystemSeeder extends Seeder
{
    private $schoolYear = '2024-2025';
    private $students = [];
    private $parents = [];
    private $teachers = [];
    private $advisers = [];
    private $instructors = [];

    public function run(): void
    {
        $this->command->info('Seeding Complete Honor System with Real Data...');

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Create academic structure
        $this->createSubjectsAndGradingPeriods($elementary, $juniorHigh, $seniorHigh, $college);
        
        // Create faculty
        $this->createFaculty($elementary, $juniorHigh, $seniorHigh, $college);
        
        // Create students with complete data
        $this->createStudentsWithCompleteData($elementary, $juniorHigh, $seniorHigh, $college);
        
        // Create parent relationships
        $this->createParentStudentRelationships();
        
        // Create realistic grades and honor results
        $this->createRealisticGradesAndHonors();
        
        
        // Assign faculty to subjects
        $this->assignFacultyToSubjects();

        $this->command->info('✅ Complete Honor System created successfully!');
        $this->command->info('📊 Created ' . count($this->students) . ' students with realistic grades');
        $this->command->info('👨‍🏫 Created ' . count($this->teachers) . ' teachers');
        $this->command->info('👩‍🏫 Created ' . count($this->advisers) . ' advisers');
        $this->command->info('👨‍💼 Created ' . count($this->instructors) . ' instructors');
        $this->command->info('👪 Created ' . count($this->parents) . ' parent accounts');
        
        // Show grade statistics
        $this->showGradeStatistics();
    }

    private function createSubjectsAndGradingPeriods($elementary, $juniorHigh, $seniorHigh, $college)
    {
        // Elementary Subjects (Complete Curriculum)
        $elementarySubjects = [
            ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'units' => 1.0],
            ['name' => 'English', 'code' => 'ENG-ELEM', 'units' => 1.0],
            ['name' => 'Science', 'code' => 'SCI-ELEM', 'units' => 1.0],
            ['name' => 'Filipino', 'code' => 'FIL-ELEM', 'units' => 1.0],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-ELEM', 'units' => 1.0],
            ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP-ELEM', 'units' => 1.0],
            ['name' => 'Music, Arts, Physical Education and Health', 'code' => 'MAPEH-ELEM', 'units' => 1.0],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-ELEM', 'units' => 1.0],
        ];

        foreach ($elementarySubjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                array_merge($subject, ['academic_level_id' => $elementary->id, 'is_active' => true])
            );
        }

        // Elementary Grading Periods (Complete Academic Year)
        $elementaryPeriods = [
            ['name' => 'First Quarter', 'code' => 'ELEM_Q1', 'sort_order' => 1, 'period_type' => 'quarter'],
            ['name' => 'Second Quarter', 'code' => 'ELEM_Q2', 'sort_order' => 2, 'period_type' => 'quarter'],
            ['name' => 'Third Quarter', 'code' => 'ELEM_Q3', 'sort_order' => 3, 'period_type' => 'quarter'],
            ['name' => 'Fourth Quarter', 'code' => 'ELEM_Q4', 'sort_order' => 4, 'period_type' => 'quarter'],
        ];

        foreach ($elementaryPeriods as $period) {
            GradingPeriod::updateOrCreate(
                ['code' => $period['code']],
                array_merge($period, [
                    'academic_level_id' => $elementary->id,
                    'start_date' => now()->addMonths($period['sort_order'] - 1),
                    'end_date' => now()->addMonths($period['sort_order']),
                    'is_active' => true,
                    'type' => 'quarter',
                    'weight' => 1.0
                ])
            );
        }

        // Junior High Subjects
        $juniorHighSubjects = [
            ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'units' => 1.0],
            ['name' => 'English', 'code' => 'ENG-JHS', 'units' => 1.0],
            ['name' => 'Science', 'code' => 'SCI-JHS', 'units' => 1.0],
            ['name' => 'Filipino', 'code' => 'FIL-JHS', 'units' => 1.0],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-JHS', 'units' => 1.0],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-JHS', 'units' => 1.0],
            ['name' => 'MAPEH', 'code' => 'MAPEH-JHS', 'units' => 1.0],
        ];

        foreach ($juniorHighSubjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                array_merge($subject, ['academic_level_id' => $juniorHigh->id, 'is_active' => true])
            );
        }

        // Junior High Grading Periods
        $juniorHighPeriods = [
            ['name' => 'First Quarter', 'code' => 'JHS_Q1', 'sort_order' => 1, 'period_type' => 'quarter'],
            ['name' => 'Second Quarter', 'code' => 'JHS_Q2', 'sort_order' => 2, 'period_type' => 'quarter'],
            ['name' => 'Third Quarter', 'code' => 'JHS_Q3', 'sort_order' => 3, 'period_type' => 'quarter'],
            ['name' => 'Fourth Quarter', 'code' => 'JHS_Q4', 'sort_order' => 4, 'period_type' => 'quarter'],
        ];

        foreach ($juniorHighPeriods as $period) {
            GradingPeriod::updateOrCreate(
                ['code' => $period['code']],
                array_merge($period, [
                    'academic_level_id' => $juniorHigh->id,
                    'start_date' => now()->addMonths($period['sort_order'] - 1),
                    'end_date' => now()->addMonths($period['sort_order']),
                    'is_active' => true,
                    'type' => 'quarter',
                    'weight' => 1.0
                ])
            );
        }

        // Senior High Subjects
        $seniorHighSubjects = [
            ['name' => 'General Mathematics', 'code' => 'GENMATH-SHS', 'units' => 1.0],
            ['name' => 'English for Academic and Professional Purposes', 'code' => 'EAPP-SHS', 'units' => 1.0],
            ['name' => 'Earth and Life Science', 'code' => 'ELS-SHS', 'units' => 1.0],
            ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP-SHS', 'units' => 1.0],
            ['name' => 'Personal Development', 'code' => 'PD-SHS', 'units' => 1.0],
            ['name' => 'Physical Education and Health', 'code' => 'PEH-SHS', 'units' => 1.0],
            ['name' => 'Research', 'code' => 'RESEARCH-SHS', 'units' => 1.0],
        ];

        foreach ($seniorHighSubjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                array_merge($subject, ['academic_level_id' => $seniorHigh->id, 'is_active' => true])
            );
        }

        // Senior High Grading Periods (using quarters like other levels)
        $seniorHighPeriods = [
            ['name' => 'First Quarter', 'code' => 'SHS_Q1', 'sort_order' => 1, 'period_type' => 'quarter'],
            ['name' => 'Second Quarter', 'code' => 'SHS_Q2', 'sort_order' => 2, 'period_type' => 'quarter'],
            ['name' => 'Third Quarter', 'code' => 'SHS_Q3', 'sort_order' => 3, 'period_type' => 'quarter'],
            ['name' => 'Fourth Quarter', 'code' => 'SHS_Q4', 'sort_order' => 4, 'period_type' => 'quarter'],
        ];

        foreach ($seniorHighPeriods as $period) {
            GradingPeriod::updateOrCreate(
                ['code' => $period['code']],
                array_merge($period, [
                    'academic_level_id' => $seniorHigh->id,
                    'start_date' => now()->addMonths($period['sort_order'] - 1),
                    'end_date' => now()->addMonths($period['sort_order']),
                    'is_active' => true,
                    'type' => 'quarter',
                    'weight' => 1.0
                ])
            );
        }
    }

    private function createFaculty($elementary, $juniorHigh, $seniorHigh, $college)
    {
        // Teachers (4 total across all levels)
        $teachers = [
            ['name' => 'Ms. Sarah Johnson', 'email' => 'sarah.johnson@sfcg.edu', 'level' => $elementary],
            ['name' => 'Mr. Robert Martinez', 'email' => 'robert.martinez@sfcg.edu', 'level' => $juniorHigh],
            ['name' => 'Dr. Patricia Wilson', 'email' => 'patricia.wilson@sfcg.edu', 'level' => $seniorHigh],
            ['name' => 'Ms. Jennifer Lee', 'email' => 'jennifer.lee@sfcg.edu', 'level' => $college],
        ];

        foreach ($teachers as $teacher) {
            $user = User::updateOrCreate(
                ['email' => $teacher['email']],
                [
                    'name' => $teacher['name'],
                    'password' => Hash::make('teacher123'),
                    'user_role' => 'teacher',
                    'year_level' => $teacher['level']->key,
                    'email_verified_at' => now(),
                ]
            );
            $this->teachers[] = ['user' => $user, 'level' => $teacher['level']];
        }

        // Advisers for each level
        $advisers = [
            ['name' => 'Mrs. Grace Elementary Adviser', 'email' => 'grace.elem.adviser@sfcg.edu', 'level' => $elementary],
            ['name' => 'Mr. Paul JHS Adviser', 'email' => 'paul.jhs.adviser@sfcg.edu', 'level' => $juniorHigh],
            ['name' => 'Ms. Helen SHS Adviser', 'email' => 'helen.shs.adviser@sfcg.edu', 'level' => $seniorHigh],
        ];

        foreach ($advisers as $adviser) {
            $user = User::updateOrCreate(
                ['email' => $adviser['email']],
                [
                    'name' => $adviser['name'],
                    'password' => Hash::make('adviser123'),
                    'user_role' => 'adviser',
                    'email_verified_at' => now(),
                ]
            );
            $this->advisers[] = ['user' => $user, 'level' => $adviser['level']];
        }

        // College Instructors
        $collegeInstructors = [
            ['name' => 'Prof. Alexandra Computer Science', 'email' => 'alexandra.cs@sfcg.edu', 'dept' => 'COMP'],
            ['name' => 'Dr. Benjamin Information Tech', 'email' => 'benjamin.it@sfcg.edu', 'dept' => 'COMP'],
            ['name' => 'Prof. Catherine Business Admin', 'email' => 'catherine.ba@sfcg.edu', 'dept' => 'BUS'],
        ];

        foreach ($collegeInstructors as $instructor) {
            $dept = Department::where('code', $instructor['dept'])->first();
            $user = User::updateOrCreate(
                ['email' => $instructor['email']],
                [
                    'name' => $instructor['name'],
                    'password' => Hash::make('instructor123'),
                    'user_role' => 'instructor',
                    'department_id' => $dept->id ?? null,
                    'year_level' => 'college',
                    'email_verified_at' => now(),
                ]
            );
            $this->instructors[] = ['user' => $user, 'level' => $college, 'department' => $dept];
        }
    }





    private function assignFacultyToSubjects()
    {
        // Assign teachers to their respective subjects
        foreach ($this->teachers as $teacherData) {
            $teacher = $teacherData['user'];
            $level = $teacherData['level'];
            
            $subjects = Subject::where('academic_level_id', $level->id)->limit(2)->get();
            
            foreach ($subjects as $subject) {
                TeacherSubjectAssignment::updateOrCreate(
                    [
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'is_active' => true,
                        'assigned_at' => now(),
                        'assigned_by' => 1, // Admin
                        'notes' => 'Assigned by seeder'
                    ]
                );
            }
        }

        // Assign advisers to classes
        foreach ($this->advisers as $adviserData) {
            $adviser = $adviserData['user'];
            $level = $adviserData['level'];
            
            ClassAdviserAssignment::updateOrCreate(
                [
                    'adviser_id' => $adviser->id,
                    'academic_level_id' => $level->id,
                    'school_year' => $this->schoolYear,
                    'grade_level' => 'Grade ' . ($level->sort_order ?? 1),
                    'section' => 'A',
                ],
                [
                    'is_active' => true,
                    'assigned_at' => now(),
                    'assigned_by' => 1, // Admin
                    'notes' => 'Class adviser assigned by seeder'
                ]
            );
        }

        // Assign instructors to college subjects
        foreach ($this->instructors as $instructorData) {
            $instructor = $instructorData['user'];
            $level = $instructorData['level'];
            $department = $instructorData['department'];
            
            $subjects = Subject::where('academic_level_id', $level->id)->limit(2)->get();
            
            foreach ($subjects as $subject) {
                InstructorSubjectAssignment::updateOrCreate(
                    [
                        'instructor_id' => $instructor->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'is_active' => true,
                        'assigned_at' => now(),
                        'assigned_by' => 1, // Admin
                        'notes' => 'Instructor assigned by seeder'
                    ]
                );
            }
        }
    }

    private function createStudentsWithCompleteData($elementary, $juniorHigh, $seniorHigh, $college)
    {
        // Elementary Students (4 students - all honor qualified)
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
            ],
            [
                'name' => 'Noah Alexander Torres',
                'email' => 'noah.torres@student.sfcg.edu',
                'student_number' => 'EL-2024-004',
                'specific_year_level' => 'grade_4',
                'parent_data' => [
                    'father' => ['name' => 'Carlos Torres', 'email' => 'carlos.torres@email.com'],
                    'mother' => ['name' => 'Ana Torres', 'email' => 'ana.torres@email.com']
                ]
            ]
        ];

        foreach ($elementaryData as $index => $data) {
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

            // Assign different honor levels for variety (all honor qualified)
            $honorTypes = ['with_highest_honors', 'with_high_honors', 'with_highest_honors', 'with_high_honors'];
            $honorType = $honorTypes[$index % count($honorTypes)];
            
            // Set target GPA based on honor type
            $targetGpa = match($honorType) {
                'with_highest_honors' => rand(95, 98) + (rand(0, 9) / 10),
                'with_high_honors' => rand(93, 95) + (rand(0, 9) / 10),
                default => rand(95, 98) + (rand(0, 9) / 10)
            };

            $this->students[] = [
                'student' => $student,
                'level' => $elementary,
                'parent_data' => $data['parent_data'],
                'honor_type' => $honorType,
                'target_gpa' => $targetGpa,
            ];
        }

        // Junior High Students (1 student)
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
                'level' => $juniorHigh,
                'parent_data' => $data['parent_data'],
                'honor_type' => 'with_high_honors',
                'target_gpa' => rand(93, 96) + (rand(0, 9) / 10),
            ];
        }

        // Senior High Students (1 student)
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
                'level' => $seniorHigh,
                'parent_data' => $data['parent_data'],
                'honor_type' => 'with_honors',
                'target_gpa' => rand(90, 94) + (rand(0, 9) / 10),
            ];
        }

        // College Students (1 student)
        $computerDept = Department::where('code', 'COMP')->first();
        $businessDept = Department::where('code', 'BUS')->first();
        $bscsCourse = Course::where('code', 'BSCS')->first();
        $bsitCourse = Course::where('code', 'BSIT')->first();
        $bsbaCourse = Course::where('code', 'BSBA')->first();

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
                'level' => $college,
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

    private function createRealisticGradesAndHonors()
    {
        foreach ($this->students as $studentData) {
            $student = $studentData['student'];
            $level = $studentData['level'];
            $honorType = $studentData['honor_type'];
            $targetGpa = $studentData['target_gpa'];

            // Get subjects for this academic level
            $subjects = Subject::where('academic_level_id', $level->id)->get();
            
            // Get grading periods for this academic level
            $gradingPeriods = GradingPeriod::where('academic_level_id', $level->id)
                ->where('is_active', true)
                ->get();

            if ($subjects->isEmpty() || $gradingPeriods->isEmpty()) {
                $this->command->warn("No subjects or grading periods found for {$level->name}");
                continue;
            }

            // Create realistic grades that achieve the target GPA
            $this->createQualifyingGrades($student, $subjects, $gradingPeriods, $level, $targetGpa);

            // Create honor result (pending approval)
            $honorTypeModel = HonorType::where('key', $honorType)->first();
            
            if ($honorTypeModel) {
                // Calculate actual GPA from grades
                $actualGpa = $this->calculateActualGPA($student, $subjects, $gradingPeriods);
                
                HonorResult::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'honor_type_id' => $honorTypeModel->id,
                        'academic_level_id' => $level->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'gpa' => $actualGpa,
                        'is_overridden' => false,
                        'is_pending_approval' => true,
                        'is_approved' => false,
                        'is_rejected' => false,
                    ]
                );

                // Verify complete grade coverage
                $totalGrades = StudentGrade::where('student_id', $student->id)->count();
                $expectedGrades = $subjects->count() * $gradingPeriods->count();
                
                $this->command->info("✅ {$student->name} - {$honorTypeModel->name} (GPA: {$actualGpa})");
                $this->command->info("   📊 Complete grades: {$totalGrades}/{$expectedGrades} across {$subjects->count()} subjects and {$gradingPeriods->count()} periods");
            }
        }
    }

    private function createQualifyingGrades($student, $subjects, $gradingPeriods, $level, $targetGpa)
    {
        foreach ($subjects as $subject) {
            foreach ($gradingPeriods as $period) {
                // Generate grade based on target GPA with variation to make it realistic
                $baseGrade = $targetGpa;
                $variation = rand(-2, 1); // Reduced variation for more consistent high grades
                $grade = max(75, min(100, $baseGrade + $variation));

                // Ensure honor qualification grades with stricter requirements
                if ($level->key === 'elementary' && $targetGpa >= 95) {
                    $grade = max(92, $grade); // Highest honors - no grade below 92
                } elseif ($level->key === 'elementary' && $targetGpa >= 93) {
                    $grade = max(90, $grade); // High honors - no grade below 90
                } elseif ($level->key === 'junior_highschool' && $targetGpa >= 93) {
                    $grade = max(88, $grade); // High honors - no grade below 88
                } elseif ($level->key === 'senior_highschool' && $targetGpa >= 90) {
                    $grade = max(85, $grade); // With honors - no grade below 85
                } elseif ($level->key === 'college' && $targetGpa >= 95) {
                    $grade = max(90, $grade); // Summa cum laude - no grade below 90
                } elseif ($level->key === 'college' && $targetGpa >= 92) {
                    $grade = max(87, $grade); // Magna cum laude - no grade below 87
                } elseif ($level->key === 'college' && $targetGpa >= 88) {
                    $grade = max(83, $grade); // Cum laude - no grade below 83
                }

                // Round to 2 decimal places for cleaner grades
                $grade = round($grade, 2);

                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'grade' => $grade,
                    ]
                );
            }
        }
    }

    private function calculateActualGPA($student, $subjects, $gradingPeriods)
    {
        $totalGrade = 0;
        $totalUnits = 0;
        
        foreach ($subjects as $subject) {
            $subjectGradeSum = 0;
            $periodCount = 0;
            
            foreach ($gradingPeriods as $period) {
                $grade = StudentGrade::where([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'grading_period_id' => $period->id,
                ])->first();
                
                if ($grade) {
                    $subjectGradeSum += $grade->grade;
                    $periodCount++;
                }
            }
            
            if ($periodCount > 0) {
                $subjectAverage = $subjectGradeSum / $periodCount;
                $totalGrade += $subjectAverage * $subject->units;
                $totalUnits += $subject->units;
            }
        }
        
        return $totalUnits > 0 ? round($totalGrade / $totalUnits, 2) : 0;
    }

    private function showGradeStatistics()
    {
        $this->command->info('');
        $this->command->info('📈 GRADE STATISTICS:');
        $this->command->info('════════════════════════════════════════');
        
        $totalGrades = StudentGrade::count();
        $totalHonorResults = HonorResult::count();
        
        $this->command->info("📊 Total Grades Created: {$totalGrades}");
        $this->command->info("🏆 Total Honor Results: {$totalHonorResults}");
        
        // Show breakdown by academic level
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        if ($elementary) {
            $elemGrades = StudentGrade::where('academic_level_id', $elementary->id)->count();
            $elemSubjects = Subject::where('academic_level_id', $elementary->id)->count();
            $elemPeriods = GradingPeriod::where('academic_level_id', $elementary->id)->count();
            $this->command->info("🎓 Elementary: {$elemGrades} grades ({$elemSubjects} subjects × {$elemPeriods} periods)");
        }
        
        $this->command->info('════════════════════════════════════════');
    }
}
