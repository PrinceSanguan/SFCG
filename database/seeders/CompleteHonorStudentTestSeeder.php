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
use App\Models\TeacherSubjectAssignment;
use App\Models\StudentSubjectAssignment;
use App\Models\ParentStudentRelationship;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class CompleteHonorStudentTestSeeder extends Seeder
{
    private $schoolYear = '2024-2025';
    private $parentEmail = 'jshgencianeo11@gmail.com';

    public function run(): void
    {
        $this->command->info('🎓 Creating Complete Honor Student Test Scenario...');

        // Get elementary level
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        if (!$elementary) {
            $this->command->error('Elementary academic level not found!');
            return;
        }

        // 1. Create complete academic structure
        $this->command->info('📚 Setting up complete elementary academic structure...');
        $gradingPeriods = $this->createGradingPeriods($elementary);
        $subjects = $this->createSubjects($elementary);

        // 2. Create Emerald section if it doesn't exist
        $this->command->info('🏫 Creating/updating Emerald section...');
        $emeraldSection = $this->createEmeraldSection($elementary);

        // 3. Create teachers for subjects
        $this->command->info('👨‍🏫 Creating teachers...');
        $teachers = $this->createTeachers($elementary);

        // 4. Create parent with specified email
        $this->command->info('👨‍👩‍👧‍👦 Creating parent...');
        $parent = $this->createParent();

        // 5. Create honor student
        $this->command->info('🌟 Creating honor student...');
        $student = $this->createHonorStudent($emeraldSection);

        // 6. Create parent-student relationship
        $this->createParentStudentRelationship($parent, $student);

        // 7. Create teacher assignments
        $this->command->info('📝 Creating teacher assignments...');
        $this->createTeacherAssignments($teachers, $subjects, $elementary);

        // 8. Create student subject enrollments
        $this->createStudentSubjectAssignments($student, $subjects);

        // 9. Generate realistic honor-worthy grades
        $this->command->info('📊 Generating realistic honor-level grades...');
        $this->generateHonorGrades($student, $subjects, $gradingPeriods, $elementary);

        // 10. Calculate and create honor result
        $this->command->info('🏆 Processing honor qualification...');
        $this->processHonorQualification($student, $elementary);

        $this->command->info('✅ Complete Honor Student Test Scenario Created Successfully!');
        $this->command->info('📈 Summary:');
        $this->command->info("   Student: {$student->name} (ID: {$student->id})");
        $this->command->info("   Section: {$emeraldSection->name}");
        $this->command->info("   Parent: {$parent->name} ({$parent->email})");
        $this->command->info("   Subjects: " . count($subjects));
        $this->command->info("   Grading Periods: " . count($gradingPeriods));
        $this->command->info("   Teachers: " . count($teachers));

        // Show access information
        $this->command->info('🔗 Test Access Information:');
        $this->command->info("   Parent Login: {$this->parentEmail} / password");
        $this->command->info("   Student Login: {$student->email} / password");
        $this->command->info("   Admin View: /admin/academic/honors/elementary");
        $this->command->info("   Grading: /admin/academic/grading");
    }

    private function createGradingPeriods(AcademicLevel $elementary): array
    {
        $periods = [
            [
                'name' => '1st Quarter',
                'code' => 'Q1',
                'type' => 'quarter',
                'period_type' => 'quarter',
                'sort_order' => 1,
                'start_date' => '2024-06-03',
                'end_date' => '2024-08-30',
                'weight' => 25.0
            ],
            [
                'name' => '2nd Quarter',
                'code' => 'Q2',
                'type' => 'quarter',
                'period_type' => 'quarter',
                'sort_order' => 2,
                'start_date' => '2024-09-02',
                'end_date' => '2024-11-29',
                'weight' => 25.0
            ],
            [
                'name' => '3rd Quarter',
                'code' => 'Q3',
                'type' => 'quarter',
                'period_type' => 'quarter',
                'sort_order' => 3,
                'start_date' => '2024-12-02',
                'end_date' => '2025-03-07',
                'weight' => 25.0
            ],
            [
                'name' => '4th Quarter',
                'code' => 'Q4',
                'type' => 'quarter',
                'period_type' => 'quarter',
                'sort_order' => 4,
                'start_date' => '2025-03-10',
                'end_date' => '2025-05-30',
                'weight' => 25.0
            ]
        ];

        $createdPeriods = [];
        foreach ($periods as $periodData) {
            $period = GradingPeriod::updateOrCreate(
                [
                    'code' => $periodData['code'],
                    'academic_level_id' => $elementary->id,
                ],
                array_merge($periodData, [
                    'academic_level_id' => $elementary->id,
                    'is_active' => true,
                ])
            );
            $createdPeriods[] = $period;
        }

        return $createdPeriods;
    }

    private function createSubjects(AcademicLevel $elementary): array
    {
        $subjects = [
            ['name' => 'English', 'code' => 'ENG-6', 'description' => 'English Language and Literature'],
            ['name' => 'Mathematics', 'code' => 'MATH-6', 'description' => 'Mathematics'],
            ['name' => 'Science', 'code' => 'SCI-6', 'description' => 'Science and Technology'],
            ['name' => 'Filipino', 'code' => 'FIL-6', 'description' => 'Filipino Language'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-6', 'description' => 'Social Studies'],
            ['name' => 'MAPEH', 'code' => 'MAPEH-6', 'description' => 'Music, Arts, Physical Education, and Health'],
            ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP-6', 'description' => 'Values Education'],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-6', 'description' => 'Practical Life Skills'],
        ];

        $createdSubjects = [];
        foreach ($subjects as $subjectData) {
            $subject = Subject::updateOrCreate(
                [
                    'code' => $subjectData['code'],
                    'academic_level_id' => $elementary->id,
                ],
                [
                    'name' => $subjectData['name'],
                    'description' => $subjectData['description'],
                    'units' => 1.0,
                    'is_active' => true,
                ]
            );
            $createdSubjects[] = $subject;
        }

        return $createdSubjects;
    }

    private function createEmeraldSection(AcademicLevel $elementary): Section
    {
        return Section::updateOrCreate(
            [
                'code' => 'EMERALD-G6',
                'academic_level_id' => $elementary->id,
            ],
            [
                'name' => 'Emerald',
                'specific_year_level' => 'grade_6',
                'max_students' => 35,
                'school_year' => $this->schoolYear,
                'is_active' => true,
            ]
        );
    }

    private function createTeachers(AcademicLevel $elementary): array
    {
        $department = Department::where('academic_level_id', $elementary->id)->first();

        $teachers = [
            ['name' => 'Ms. Maria Teresa Santos', 'email' => 'maria.santos@elem.school.edu', 'specialization' => 'Mathematics'],
            ['name' => 'Mr. Jose Miguel Rivera', 'email' => 'jose.rivera@elem.school.edu', 'specialization' => 'English'],
            ['name' => 'Ms. Ana Lucia Garcia', 'email' => 'ana.garcia@elem.school.edu', 'specialization' => 'Science'],
            ['name' => 'Mr. Carlos Eduardo Cruz', 'email' => 'carlos.cruz@elem.school.edu', 'specialization' => 'Filipino'],
            ['name' => 'Ms. Rosa Marie Flores', 'email' => 'rosa.flores@elem.school.edu', 'specialization' => 'Social Studies'],
            ['name' => 'Mr. Ramon Antonio Lopez', 'email' => 'ramon.lopez@elem.school.edu', 'specialization' => 'MAPEH'],
        ];

        $createdTeachers = [];
        foreach ($teachers as $teacherData) {
            $teacher = User::updateOrCreate(
                ['email' => $teacherData['email']],
                [
                    'name' => $teacherData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'teacher',
                    'department_id' => $department ? $department->id : null,
                    'email_verified_at' => now(),
                ]
            );
            $createdTeachers[] = $teacher;
        }

        return $createdTeachers;
    }

    private function createParent(): User
    {
        return User::updateOrCreate(
            ['email' => $this->parentEmail],
            [
                'name' => 'Joshua Gencianeo',
                'password' => Hash::make('password'),
                'user_role' => 'parent',
                'phone_number' => '+63 912 345 6789',
                'address' => '123 Emerald Street, Quezon City',
                'email_verified_at' => now(),
            ]
        );
    }

    private function createHonorStudent(Section $section): User
    {
        return User::updateOrCreate(
            ['email' => 'sophia.emerald@student.school.edu'],
            [
                'name' => 'Sophia Mae Gencianeo',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'specific_year_level' => 'grade_6',
                'section_id' => $section->id,
                'student_number' => 'ELEM-2024-EMERALD-001',
                'birth_date' => '2012-03-15',
                'gender' => 'female',
                'address' => '123 Emerald Street, Quezon City',
                'city' => 'Quezon City',
                'province' => 'Metro Manila',
                'nationality' => 'Filipino',
                'emergency_contact_name' => 'Joshua Gencianeo',
                'emergency_contact_phone' => '+63 912 345 6789',
                'emergency_contact_relationship' => 'Father',
                'email_verified_at' => now(),
            ]
        );
    }

    private function createParentStudentRelationship(User $parent, User $student): void
    {
        ParentStudentRelationship::updateOrCreate(
            [
                'parent_id' => $parent->id,
                'student_id' => $student->id,
            ],
            [
                'relationship_type' => 'father',
                'emergency_contact' => 'yes',
                'notes' => 'Primary guardian and emergency contact',
            ]
        );
    }

    private function createTeacherAssignments(array $teachers, array $subjects, AcademicLevel $elementary): void
    {
        $assignments = [
            0 => [0, 2], // Ms. Maria (Math teacher) -> Math, Science
            1 => [1, 3], // Mr. Jose (English teacher) -> English, Filipino
            2 => [4, 6], // Ms. Ana -> Social Studies, Values Education
            3 => [5, 7], // Mr. Carlos -> MAPEH, TLE
        ];

        foreach ($assignments as $teacherIndex => $subjectIndices) {
            if (isset($teachers[$teacherIndex])) {
                foreach ($subjectIndices as $subjectIndex) {
                    if (isset($subjects[$subjectIndex])) {
                        TeacherSubjectAssignment::updateOrCreate(
                            [
                                'teacher_id' => $teachers[$teacherIndex]->id,
                                'subject_id' => $subjects[$subjectIndex]->id,
                                'school_year' => $this->schoolYear,
                            ],
                            [
                                'academic_level_id' => $elementary->id,
                                'is_active' => true,
                                'assigned_at' => now(),
                                'assigned_by' => 1, // Admin
                                'notes' => "Teaching {$subjects[$subjectIndex]->name} for Grade 6 Emerald",
                            ]
                        );
                    }
                }
            }
        }
    }

    private function createStudentSubjectAssignments(User $student, array $subjects): void
    {
        foreach ($subjects as $subject) {
            StudentSubjectAssignment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'school_year' => $this->schoolYear,
                ],
                [
                    'is_active' => true,
                    'enrolled_at' => now(),
                    'enrolled_by' => 1, // Admin
                ]
            );
        }
    }

    private function generateHonorGrades(User $student, array $subjects, array $gradingPeriods, AcademicLevel $elementary): void
    {
        // Generate honor-level grades (90-98 range)
        $gradeRanges = [
            'excellent' => [95, 98], // Top performer range
            'very_good' => [92, 94], // Consistent good grades
            'good' => [90, 91], // Still honor level
        ];

        foreach ($subjects as $subject) {
            // Determine grade level for this subject (mostly excellent with some variation)
            $performanceLevel = rand(1, 10) <= 7 ? 'excellent' : (rand(1, 10) <= 8 ? 'very_good' : 'good');
            [$minGrade, $maxGrade] = $gradeRanges[$performanceLevel];

            foreach ($gradingPeriods as $period) {
                $grade = rand($minGrade, $maxGrade);

                // Add some realistic variation
                if ($subject->name === 'Mathematics' || $subject->name === 'Science') {
                    // Slightly higher in STEM subjects
                    $grade = min(98, $grade + rand(0, 2));
                }

                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'grade' => $grade,
                        'academic_level_id' => $elementary->id,
                        'created_at' => now()->subDays(rand(1, 30)), // Vary creation dates
                    ]
                );
            }
        }

        $this->command->info("   Generated grades with average GPA targeting 94-96 range");
    }

    private function getGradeRemarks(int $grade): string
    {
        if ($grade >= 97) return 'Outstanding performance';
        if ($grade >= 95) return 'Excellent work';
        if ($grade >= 93) return 'Very good';
        if ($grade >= 90) return 'Good performance';
        return 'Satisfactory';
    }

    private function processHonorQualification(User $student, AcademicLevel $elementary): void
    {
        // Calculate average grade
        $averageGrade = StudentGrade::where('student_id', $student->id)
            ->where('school_year', $this->schoolYear)
            ->avg('grade');

        $this->command->info("   Calculated GPA: {$averageGrade}");

        if ($averageGrade >= 90) {
            $honorTypes = HonorType::all();

            // Determine honor type based on GPA
            $honorType = null;
            if ($averageGrade >= 97) {
                $honorType = $honorTypes->where('key', 'with_highest_honors')->first();
            } elseif ($averageGrade >= 95) {
                $honorType = $honorTypes->where('key', 'with_high_honors')->first();
            } elseif ($averageGrade >= 90) {
                $honorType = $honorTypes->where('key', 'with_honors')->first();
            }

            if ($honorType) {
                HonorResult::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'school_year' => $this->schoolYear,
                    ],
                    [
                        'honor_type_id' => $honorType->id,
                        'academic_level_id' => $elementary->id,
                        'gpa' => round($averageGrade, 2),
                        'is_pending_approval' => true,
                        'is_approved' => false,
                        'created_at' => now(),
                    ]
                );

                $this->command->info("   🏆 Honor qualification created: {$honorType->name}");
                $this->command->info("   📋 Status: Pending Approval (ready for admin review)");
            }
        }
    }
}