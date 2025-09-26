<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Section;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\InstructorSubjectAssignment;
use App\Models\StudentSubjectAssignment;
use App\Models\ParentStudentRelationship;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RealisticSchoolDataSeeder extends Seeder
{
    private $schoolYear = '2024-2025';

    public function run(): void
    {
        $this->command->info('🏫 Creating Realistic School Data with Proper Relationships...');

        // Clear existing problematic data
        $this->command->info('🧹 Cleaning existing test data...');
        $this->cleanExistingData();

        // Create academic structure
        $this->command->info('📚 Setting up academic structure...');
        $this->setupAcademicStructure();

        // Create faculty and staff
        $this->command->info('👨‍🏫 Creating faculty and staff...');
        $faculty = $this->createFaculty();

        // Create students with proper sections
        $this->command->info('👨‍🎓 Creating students with proper section assignments...');
        $students = $this->createStudents();

        // Create parent relationships
        $this->command->info('👨‍👩‍👧‍👦 Creating parent-student relationships...');
        $this->createParentStudentRelationships($students);

        // Create assignments
        $this->command->info('📝 Creating teacher and adviser assignments...');
        $this->createAssignments($faculty, $students);

        // Create grades
        $this->command->info('📊 Creating student grades...');
        $this->createGrades($students);

        // Create honor results
        $this->command->info('🏆 Creating honor results with proper honor types...');
        $this->createHonorResults($students);

        $this->command->info('✅ Realistic school data created successfully!');
        $this->command->info("📈 Summary:");
        $this->command->info("   Students: " . count($students));
        $this->command->info("   Faculty: " . count($faculty));
        $this->command->info("   Sections: " . Section::where('is_active', true)->count());
        $this->command->info("   Honor Results: " . HonorResult::count());
    }

    private function cleanExistingData(): void
    {
        // Remove test students and problematic data
        User::where('name', 'LIKE', '%Test Honor Student%')->delete();
        HonorResult::whereNull('honor_type_id')->delete();

        // Remove students without proper structure
        $studentsWithoutSections = User::where('user_role', 'student')
            ->whereNull('section_id')
            ->get();

        foreach ($studentsWithoutSections as $student) {
            // Only delete if they don't have grades or other important relationships
            if ($student->studentGrades()->count() == 0) {
                $student->delete();
            }
        }
    }

    private function setupAcademicStructure(): void
    {
        // Ensure honor types exist
        $honorTypes = [
            ['key' => 'with_honors', 'name' => 'With Honors', 'scope' => 'basic'],
            ['key' => 'with_high_honors', 'name' => 'With High Honors', 'scope' => 'basic'],
            ['key' => 'with_highest_honors', 'name' => 'With Highest Honors', 'scope' => 'basic'],
        ];

        foreach ($honorTypes as $honorTypeData) {
            HonorType::updateOrCreate(
                ['key' => $honorTypeData['key']],
                ['name' => $honorTypeData['name'], 'scope' => $honorTypeData['scope']]
            );
        }

        // Ensure honor criteria exist
        $this->createHonorCriteria();
    }

    private function createHonorCriteria(): void
    {
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();

        $withHonors = HonorType::where('key', 'with_honors')->first();
        $withHighHonors = HonorType::where('key', 'with_high_honors')->first();
        $withHighestHonors = HonorType::where('key', 'with_highest_honors')->first();

        // Elementary criteria
        if ($elementary && $withHonors) {
            HonorCriterion::updateOrCreate(
                [
                    'academic_level_id' => $elementary->id,
                    'honor_type_id' => $withHonors->id,
                ],
                [
                    'min_gpa' => 90,
                    'max_gpa' => null,
                    'min_grade' => 85,
                    'min_grade_all' => null,
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                ]
            );
        }

        // Junior High criteria
        if ($juniorHigh && $withHonors) {
            HonorCriterion::updateOrCreate(
                [
                    'academic_level_id' => $juniorHigh->id,
                    'honor_type_id' => $withHonors->id,
                ],
                [
                    'min_gpa' => 90,
                    'max_gpa' => null,
                    'min_grade' => 85,
                    'min_grade_all' => null,
                    'min_year' => null,
                    'max_year' => null,
                    'require_consistent_honor' => false,
                ]
            );
        }

        // Senior High criteria - multiple levels
        if ($seniorHigh) {
            if ($withHonors) {
                HonorCriterion::updateOrCreate(
                    [
                        'academic_level_id' => $seniorHigh->id,
                        'honor_type_id' => $withHonors->id,
                    ],
                    [
                        'min_gpa' => 90,
                        'max_gpa' => 94.99,
                        'min_grade' => 85,
                        'min_grade_all' => 85,
                        'min_year' => null,
                        'max_year' => null,
                        'require_consistent_honor' => false,
                    ]
                );
            }
            if ($withHighHonors) {
                HonorCriterion::updateOrCreate(
                    [
                        'academic_level_id' => $seniorHigh->id,
                        'honor_type_id' => $withHighHonors->id,
                    ],
                    [
                        'min_gpa' => 95,
                        'max_gpa' => 97.99,
                        'min_grade' => 90,
                        'min_grade_all' => 90,
                        'min_year' => null,
                        'max_year' => null,
                        'require_consistent_honor' => false,
                    ]
                );
            }
            if ($withHighestHonors) {
                HonorCriterion::updateOrCreate(
                    [
                        'academic_level_id' => $seniorHigh->id,
                        'honor_type_id' => $withHighestHonors->id,
                    ],
                    [
                        'min_gpa' => 98,
                        'max_gpa' => 100,
                        'min_grade' => 93,
                        'min_grade_all' => 93,
                        'min_year' => null,
                        'max_year' => null,
                        'require_consistent_honor' => false,
                    ]
                );
            }
        }
    }

    private function createFaculty(): array
    {
        $departments = [
            'Elementary Department' => 1, // Elementary academic level
            'Junior High School Department' => 2, // Junior high academic level
            'Senior High School Department' => 3, // Senior high academic level
        ];

        $faculty = [];

        foreach ($departments as $deptName => $academicLevelId) {
            $dept = Department::where('academic_level_id', $academicLevelId)->first();
            if (!$dept) continue;

            // Create teachers
            $teachers = [
                ['name' => 'Ms. Sarah Johnson', 'email' => 'sarah.johnson@school.edu', 'role' => 'teacher'],
                ['name' => 'Mr. Michael Brown', 'email' => 'michael.brown@school.edu', 'role' => 'teacher'],
                ['name' => 'Ms. Emily Davis', 'email' => 'emily.davis@school.edu', 'role' => 'teacher'],
            ];

            // Create advisers
            $advisers = [
                ['name' => 'Dr. Patricia Thompson', 'email' => 'patricia.thompson@school.edu', 'role' => 'adviser'],
                ['name' => 'Prof. Robert White', 'email' => 'robert.white@school.edu', 'role' => 'adviser'],
            ];

            $allFaculty = array_merge($teachers, $advisers);

            foreach ($allFaculty as $index => $facultyData) {
                $user = User::updateOrCreate(
                    ['email' => str_replace('@school.edu', "@{$academicLevelId}.school.edu", $facultyData['email'])],
                    [
                        'name' => $facultyData['name'] . " ({$deptName})",
                        'password' => Hash::make('password'),
                        'user_role' => $facultyData['role'],
                        'department_id' => $dept->id,
                        'email_verified_at' => now(),
                    ]
                );
                $faculty[] = $user;
            }
        }

        return $faculty;
    }

    private function createStudents(): array
    {
        $students = [];

        // Elementary Students
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        if ($elementary) {
            $students = array_merge($students, $this->createElementaryStudents($elementary));
        }

        // Junior High Students
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        if ($juniorHigh) {
            $students = array_merge($students, $this->createJuniorHighStudents($juniorHigh));
        }

        return $students;
    }

    private function createElementaryStudents(AcademicLevel $elementary): array
    {
        $students = [];
        $sections = Section::where('academic_level_id', $elementary->id)
            ->where('is_active', true)
            ->get();

        if ($sections->isEmpty()) {
            // Create default sections
            $gradeLevels = ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6'];
            foreach ($gradeLevels as $gradeLevel) {
                Section::updateOrCreate(
                    [
                        'code' => strtoupper(str_replace('_', '', $gradeLevel)) . '-MAIN',
                        'academic_level_id' => $elementary->id,
                    ],
                    [
                        'name' => ucwords(str_replace('_', ' ', $gradeLevel)) . ' - Main Section',
                        'specific_year_level' => $gradeLevel,
                        'is_active' => true,
                        'max_students' => 40,
                        'school_year' => $this->schoolYear,
                    ]
                );
            }
            $sections = Section::where('academic_level_id', $elementary->id)
                ->where('is_active', true)
                ->get();
        }

        $studentNames = [
            ['Isabella Marie Santos', 'isabella.santos@elem.edu', 'grade_6'],
            ['Ethan James Rodriguez', 'ethan.rodriguez@elem.edu', 'grade_5'],
            ['Sophia Grace Dela Cruz', 'sophia.delacruz@elem.edu', 'grade_6'],
            ['Noah Alexander Torres', 'noah.torres@elem.edu', 'grade_4'],
            ['Emma Rose Garcia', 'emma.garcia@elem.edu', 'grade_3'],
            ['Liam David Reyes', 'liam.reyes@elem.edu', 'grade_2'],
            ['Olivia Mae Cruz', 'olivia.cruz@elem.edu', 'grade_1'],
            ['Mason Carl Flores', 'mason.flores@elem.edu', 'grade_5'],
        ];

        foreach ($studentNames as $index => $studentData) {
            $section = $sections->where('specific_year_level', $studentData[2])->first();

            if ($section) {
                $student = User::updateOrCreate(
                    ['email' => $studentData[1]],
                    [
                        'name' => $studentData[0],
                        'password' => Hash::make('password'),
                        'user_role' => 'student',
                        'year_level' => 'elementary',
                        'specific_year_level' => $studentData[2],
                        'section_id' => $section->id,
                        'student_number' => 'ELEM-' . $this->schoolYear . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'email_verified_at' => now(),
                    ]
                );
                $students[] = $student;
            }
        }

        return $students;
    }

    private function createJuniorHighStudents(AcademicLevel $juniorHigh): array
    {
        $students = [];
        $sections = Section::where('academic_level_id', $juniorHigh->id)
            ->where('is_active', true)
            ->get();

        if ($sections->isEmpty()) {
            // Create default sections
            $gradeLevels = ['grade_7', 'grade_8', 'grade_9', 'grade_10'];
            foreach ($gradeLevels as $gradeLevel) {
                Section::updateOrCreate(
                    [
                        'code' => strtoupper(str_replace('_', '', $gradeLevel)) . '-MAIN',
                        'academic_level_id' => $juniorHigh->id,
                    ],
                    [
                        'name' => ucwords(str_replace('_', ' ', $gradeLevel)) . ' - Main Section',
                        'specific_year_level' => $gradeLevel,
                        'is_active' => true,
                        'max_students' => 40,
                        'school_year' => $this->schoolYear,
                    ]
                );
            }
            $sections = Section::where('academic_level_id', $juniorHigh->id)
                ->where('is_active', true)
                ->get();
        }

        $studentNames = [
            ['Alexander David Torres', 'alexander.torres@jhs.edu', 'grade_10'],
            ['Victoria Anne Castillo', 'victoria.castillo@jhs.edu', 'grade_9'],
            ['Daniel Sebastian Cruz', 'daniel.cruz@jhs.edu', 'grade_8'],
            ['Mia Rose Hernandez', 'mia.hernandez@jhs.edu', 'grade_7'],
            ['James Gabriel Lopez', 'james.lopez@jhs.edu', 'grade_10'],
            ['Grace Isabella Martin', 'grace.martin@jhs.edu', 'grade_9'],
        ];

        foreach ($studentNames as $index => $studentData) {
            $section = $sections->where('specific_year_level', $studentData[2])->first();

            if ($section) {
                $student = User::updateOrCreate(
                    ['email' => $studentData[1]],
                    [
                        'name' => $studentData[0],
                        'password' => Hash::make('password'),
                        'user_role' => 'student',
                        'year_level' => 'junior_highschool',
                        'specific_year_level' => $studentData[2],
                        'section_id' => $section->id,
                        'student_number' => 'JHS-' . $this->schoolYear . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'email_verified_at' => now(),
                    ]
                );
                $students[] = $student;
            }
        }

        return $students;
    }

    private function createParentStudentRelationships(array $students): void
    {
        $parents = [
            ['John Santos', 'john.santos@parent.edu'],
            ['Maria Rodriguez', 'maria.rodriguez@parent.edu'],
            ['Robert Dela Cruz', 'robert.delacruz@parent.edu'],
            ['Lisa Torres', 'lisa.torres@parent.edu'],
        ];

        $parentUsers = [];
        foreach ($parents as $parentData) {
            $parent = User::updateOrCreate(
                ['email' => $parentData[1]],
                [
                    'name' => $parentData[0],
                    'password' => Hash::make('password'),
                    'user_role' => 'parent',
                    'email_verified_at' => now(),
                ]
            );
            $parentUsers[] = $parent;
        }

        // Create relationships (assign 1-2 children per parent)
        $studentIndex = 0;
        foreach ($parentUsers as $parent) {
            $numChildren = rand(1, 2);
            for ($i = 0; $i < $numChildren && $studentIndex < count($students); $i++) {
                $student = $students[$studentIndex];

                ParentStudentRelationship::updateOrCreate(
                    [
                        'parent_id' => $parent->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'relationship_type' => $i == 0 ? 'father' : 'mother',
                        'emergency_contact' => 'yes',
                        'notes' => 'Parent-child relationship for ' . $student->name,
                    ]
                );
                $studentIndex++;
            }
        }
    }

    private function createAssignments(array $faculty, array $students): void
    {
        // Get subjects for assignments
        $subjects = Subject::whereIn('academic_level_id', [1, 2, 3])->get(); // Elementary, JHS, SHS
        $sections = Section::where('is_active', true)->get();

        // Assign teachers to subjects
        $teachers = collect($faculty)->where('user_role', 'teacher');
        $teacherIndex = 0;

        foreach ($subjects as $subject) {
            $teacher = $teachers->values()[$teacherIndex % $teachers->count()];

            TeacherSubjectAssignment::updateOrCreate(
                [
                    'teacher_id' => $teacher->id,
                    'subject_id' => $subject->id,
                    'school_year' => $this->schoolYear,
                ],
                [
                    'academic_level_id' => $subject->academic_level_id,
                    'is_active' => true,
                    'assigned_at' => now(),
                    'assigned_by' => 1, // Admin user
                    'notes' => "Assigned to teach {$subject->name}",
                ]
            );
            $teacherIndex++;
        }

        // Assign advisers to sections
        $advisers = collect($faculty)->where('user_role', 'adviser');
        $adviserIndex = 0;

        foreach ($sections as $section) {
            $adviser = $advisers->values()[$adviserIndex % $advisers->count()];

            ClassAdviserAssignment::updateOrCreate(
                [
                    'adviser_id' => $adviser->id,
                    'academic_level_id' => $section->academic_level_id,
                    'grade_level' => $section->specific_year_level,
                    'section' => $section->name,
                    'school_year' => $this->schoolYear,
                ],
                [
                    'is_active' => true,
                    'assigned_at' => now(),
                    'assigned_by' => 1, // Admin user
                    'notes' => "Class adviser for {$section->name}",
                ]
            );
            $adviserIndex++;
        }

        // Create student subject assignments
        foreach ($students as $student) {
            $studentSubjects = Subject::where('academic_level_id', function($query) use ($student) {
                $query->select('id')
                    ->from('academic_levels')
                    ->where('key', $student->year_level)
                    ->limit(1);
            })->get();

            foreach ($studentSubjects as $subject) {
                StudentSubjectAssignment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'is_active' => true,
                        'enrolled_at' => now(),
                        'enrolled_by' => 1, // Admin user
                    ]
                );
            }
        }

        $this->command->info("   ✅ Created assignments:");
        $this->command->info("      - Teacher-Subject assignments: " . TeacherSubjectAssignment::where('school_year', $this->schoolYear)->count());
        $this->command->info("      - Class adviser assignments: " . ClassAdviserAssignment::where('school_year', $this->schoolYear)->count());
        $this->command->info("      - Student-Subject enrollments: " . StudentSubjectAssignment::where('school_year', $this->schoolYear)->count());
    }

    private function createGrades(array $students): void
    {
        foreach ($students as $student) {
            $subjects = Subject::where('academic_level_id', function($query) use ($student) {
                $query->select('id')
                    ->from('academic_levels')
                    ->where('key', $student->year_level)
                    ->limit(1);
            })->take(5)->get();

            foreach ($subjects as $subject) {
                $gradingPeriods = GradingPeriod::where('academic_level_id', function($query) use ($student) {
                    $query->select('id')
                        ->from('academic_levels')
                        ->where('key', $student->year_level)
                        ->limit(1);
                })->get();

                foreach ($gradingPeriods as $period) {
                    // Generate grades that could qualify for honors
                    $baseGrade = rand(88, 98); // High performing students

                    StudentGrade::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'grading_period_id' => $period->id,
                            'school_year' => $this->schoolYear,
                        ],
                        [
                            'grade' => $baseGrade,
                            'academic_level_id' => $subject->academic_level_id,
                        ]
                    );
                }
            }
        }
    }

    private function createHonorResults(array $students): void
    {
        $honorTypes = HonorType::all();

        foreach ($students as $student) {
            // Calculate average grade
            $averageGrade = StudentGrade::where('student_id', $student->id)
                ->where('school_year', $this->schoolYear)
                ->avg('grade');

            if ($averageGrade >= 90) {
                $academicLevel = AcademicLevel::where('key', $student->year_level)->first();

                // Determine honor type based on GPA
                $honorType = null;
                if ($averageGrade >= 98) {
                    $honorType = $honorTypes->where('key', 'with_highest_honors')->first();
                } elseif ($averageGrade >= 95) {
                    $honorType = $honorTypes->where('key', 'with_high_honors')->first();
                } elseif ($averageGrade >= 90) {
                    $honorType = $honorTypes->where('key', 'with_honors')->first();
                }

                if ($honorType && $academicLevel) {
                    HonorResult::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'school_year' => $this->schoolYear,
                        ],
                        [
                            'honor_type_id' => $honorType->id,
                            'academic_level_id' => $academicLevel->id,
                            'gpa' => $averageGrade,
                            'is_approved' => true,
                            'approved_at' => now(),
                            'approved_by' => 1, // Admin user
                        ]
                    );
                }
            }
        }
    }
}