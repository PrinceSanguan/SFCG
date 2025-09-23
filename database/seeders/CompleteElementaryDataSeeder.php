<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Section;
use App\Models\Subject;
use App\Models\StudentGrade;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use App\Models\Department;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\StudentSubjectAssignment;
use Illuminate\Support\Facades\Hash;

class CompleteElementaryDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating complete Elementary data with teachers, advisers, subjects, and assignments...');
        
        $schoolYear = '2024-2025';
        $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
        $elementaryDept = Department::where('academic_level_id', 1)->first();
        
        if (!$elementaryLevel) {
            $this->command->error('Elementary academic level not found!');
            return;
        }

        // Create sections for each grade level
        $sections = $this->createSections($elementaryLevel->id);
        
        // Create subjects for Elementary
        $subjects = $this->createSubjects($elementaryLevel->id);
        
        // Create grading periods for Elementary
        $gradingPeriods = $this->createGradingPeriods($elementaryLevel->id);
        
        // Create teachers for Elementary
        $teachers = $this->createTeachers($elementaryDept->id);
        
        // Create advisers for Elementary
        $advisers = $this->createAdvisers($elementaryDept->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create teacher subject assignments
        $this->createTeacherSubjectAssignments($teachers, $subjects, $elementaryLevel->id, $schoolYear);
        
        // Create class adviser assignments
        $this->createClassAdviserAssignments($advisers, $sections, $elementaryLevel->id, $schoolYear);
        
        // Create student subject assignments
        $this->createStudentSubjectAssignments($students, $subjects, $schoolYear);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $elementaryLevel->id, $schoolYear);
        
        $this->command->info('Complete Elementary data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // Grade 1 sections
            ['name' => 'Grade 1 - Einstein', 'code' => 'G1-E', 'specific_year_level' => 'grade_1'],
            ['name' => 'Grade 1 - Newton', 'code' => 'G1-N', 'specific_year_level' => 'grade_1'],
            ['name' => 'Grade 1 - Curie', 'code' => 'G1-C', 'specific_year_level' => 'grade_1'],
            
            // Grade 2 sections
            ['name' => 'Grade 2 - Einstein', 'code' => 'G2-E', 'specific_year_level' => 'grade_2'],
            ['name' => 'Grade 2 - Newton', 'code' => 'G2-N', 'specific_year_level' => 'grade_2'],
            ['name' => 'Grade 2 - Curie', 'code' => 'G2-C', 'specific_year_level' => 'grade_2'],
            
            // Grade 3 sections
            ['name' => 'Grade 3 - Einstein', 'code' => 'G3-E', 'specific_year_level' => 'grade_3'],
            ['name' => 'Grade 3 - Newton', 'code' => 'G3-N', 'specific_year_level' => 'grade_3'],
            ['name' => 'Grade 3 - Curie', 'code' => 'G3-C', 'specific_year_level' => 'grade_3'],
            
            // Grade 4 sections
            ['name' => 'Grade 4 - Einstein', 'code' => 'G4-E', 'specific_year_level' => 'grade_4'],
            ['name' => 'Grade 4 - Newton', 'code' => 'G4-N', 'specific_year_level' => 'grade_4'],
            ['name' => 'Grade 4 - Curie', 'code' => 'G4-C', 'specific_year_level' => 'grade_4'],
            
            // Grade 5 sections
            ['name' => 'Grade 5 - Einstein', 'code' => 'G5-E', 'specific_year_level' => 'grade_5'],
            ['name' => 'Grade 5 - Newton', 'code' => 'G5-N', 'specific_year_level' => 'grade_5'],
            ['name' => 'Grade 5 - Curie', 'code' => 'G5-C', 'specific_year_level' => 'grade_5'],
            
            // Grade 6 sections
            ['name' => 'Grade 6 - Einstein', 'code' => 'G6-E', 'specific_year_level' => 'grade_6'],
            ['name' => 'Grade 6 - Newton', 'code' => 'G6-N', 'specific_year_level' => 'grade_6'],
            ['name' => 'Grade 6 - Curie', 'code' => 'G6-C', 'specific_year_level' => 'grade_6'],
        ];

        $createdSections = [];
        foreach ($sections as $sectionData) {
            $section = Section::updateOrCreate(
                [
                    'code' => $sectionData['code'],
                    'academic_level_id' => $academicLevelId,
                ],
                [
                    'name' => $sectionData['name'],
                    'specific_year_level' => $sectionData['specific_year_level'],
                    'is_active' => true,
                ]
            );
            $createdSections[] = $section;
        }

        return $createdSections;
    }

    private function createSubjects(int $academicLevelId): array
    {
        $subjects = [
            ['name' => 'English', 'code' => 'ENG-ELEM', 'description' => 'Elementary English Language Arts'],
            ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'description' => 'Elementary Mathematics'],
            ['name' => 'Science', 'code' => 'SCI-ELEM', 'description' => 'Elementary Science'],
            ['name' => 'Filipino', 'code' => 'FIL-ELEM', 'description' => 'Elementary Filipino Language'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-ELEM', 'description' => 'Elementary Social Studies'],
            ['name' => 'MAPEH', 'code' => 'MAPEH-ELEM', 'description' => 'Music, Arts, PE, and Health'],
            ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP-ELEM', 'description' => 'Values Education'],
            ['name' => 'Mother Tongue', 'code' => 'MT-ELEM', 'description' => 'Mother Tongue Language'],
        ];

        $createdSubjects = [];
        foreach ($subjects as $subjectData) {
            $subject = Subject::updateOrCreate(
                [
                    'code' => $subjectData['code'],
                    'academic_level_id' => $academicLevelId,
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

    private function createGradingPeriods(int $academicLevelId): array
    {
        $periods = [
            ['name' => 'First Quarter', 'code' => 'Q1', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 1, 'start_date' => '2024-06-01', 'end_date' => '2024-08-31'],
            ['name' => 'Second Quarter', 'code' => 'Q2', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 2, 'start_date' => '2024-09-01', 'end_date' => '2024-11-30'],
            ['name' => 'Third Quarter', 'code' => 'Q3', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 3, 'start_date' => '2024-12-01', 'end_date' => '2025-02-28'],
            ['name' => 'Fourth Quarter', 'code' => 'Q4', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 4, 'start_date' => '2025-03-01', 'end_date' => '2025-05-31'],
        ];

        $createdPeriods = [];
        foreach ($periods as $periodData) {
            $period = GradingPeriod::updateOrCreate(
                [
                    'code' => $periodData['code'],
                    'academic_level_id' => $academicLevelId,
                ],
                [
                    'name' => $periodData['name'],
                    'type' => $periodData['type'],
                    'period_type' => $periodData['period_type'],
                    'sort_order' => $periodData['sort_order'],
                    'start_date' => $periodData['start_date'],
                    'end_date' => $periodData['end_date'],
                    'is_active' => true,
                ]
            );
            $createdPeriods[] = $period;
        }

        return $createdPeriods;
    }

    private function createTeachers(int $departmentId): array
    {
        $teachers = [
            ['name' => 'Maria Santos', 'email' => 'maria.santos@school.edu'],
            ['name' => 'Jose Garcia', 'email' => 'jose.garcia@school.edu'],
            ['name' => 'Ana Rodriguez', 'email' => 'ana.rodriguez@school.edu'],
            ['name' => 'Carlos Lopez', 'email' => 'carlos.lopez@school.edu'],
            ['name' => 'Elena Martinez', 'email' => 'elena.martinez@school.edu'],
            ['name' => 'Miguel Torres', 'email' => 'miguel.torres@school.edu'],
            ['name' => 'Isabel Flores', 'email' => 'isabel.flores@school.edu'],
            ['name' => 'Roberto Cruz', 'email' => 'roberto.cruz@school.edu'],
            ['name' => 'Carmen Vega', 'email' => 'carmen.vega@school.edu'],
            ['name' => 'Antonio Ramos', 'email' => 'antonio.ramos@school.edu'],
        ];

        $createdTeachers = [];
        foreach ($teachers as $teacherData) {
            $teacher = User::updateOrCreate(
                ['email' => $teacherData['email']],
                [
                    'name' => $teacherData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'teacher',
                    'department_id' => $departmentId,
                    'email_verified_at' => now(),
                ]
            );
            $createdTeachers[] = $teacher;
        }

        return $createdTeachers;
    }

    private function createAdvisers(int $departmentId): array
    {
        $advisers = [
            ['name' => 'Dr. Patricia Reyes', 'email' => 'patricia.reyes@school.edu'],
            ['name' => 'Prof. Manuel Dela Cruz', 'email' => 'manuel.delacruz@school.edu'],
            ['name' => 'Ms. Rosa Herrera', 'email' => 'rosa.herrera@school.edu'],
            ['name' => 'Mr. Fernando Mendoza', 'email' => 'fernando.mendoza@school.edu'],
            ['name' => 'Dr. Gloria Aguilar', 'email' => 'gloria.aguilar@school.edu'],
        ];

        $createdAdvisers = [];
        foreach ($advisers as $adviserData) {
            $adviser = User::updateOrCreate(
                ['email' => $adviserData['email']],
                [
                    'name' => $adviserData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'adviser',
                    'department_id' => $departmentId,
                    'email_verified_at' => now(),
                ]
            );
            $createdAdvisers[] = $adviser;
        }

        return $createdAdvisers;
    }

    private function createTestStudents(array $sections): array
    {
        $students = [
            // Grade 1 students
            ['name' => 'Sophia Johnson', 'email' => 'sophia.johnson@student.edu', 'section_code' => 'G1-E'],
            ['name' => 'Liam Williams', 'email' => 'liam.williams@student.edu', 'section_code' => 'G1-E'],
            ['name' => 'Olivia Brown', 'email' => 'olivia.brown@student.edu', 'section_code' => 'G1-N'],
            ['name' => 'Noah Jones', 'email' => 'noah.jones@student.edu', 'section_code' => 'G1-N'],
            ['name' => 'Emma Garcia', 'email' => 'emma.garcia@student.edu', 'section_code' => 'G1-C'],
            ['name' => 'Oliver Miller', 'email' => 'oliver.miller@student.edu', 'section_code' => 'G1-C'],
            
            // Grade 2 students
            ['name' => 'Ava Davis', 'email' => 'ava.davis@student.edu', 'section_code' => 'G2-E'],
            ['name' => 'William Rodriguez', 'email' => 'william.rodriguez@student.edu', 'section_code' => 'G2-E'],
            ['name' => 'Isabella Martinez', 'email' => 'isabella.martinez@student.edu', 'section_code' => 'G2-N'],
            ['name' => 'James Hernandez', 'email' => 'james.hernandez@student.edu', 'section_code' => 'G2-N'],
            ['name' => 'Charlotte Lopez', 'email' => 'charlotte.lopez@student.edu', 'section_code' => 'G2-C'],
            ['name' => 'Benjamin Gonzalez', 'email' => 'benjamin.gonzalez@student.edu', 'section_code' => 'G2-C'],
            
            // Grade 3 students
            ['name' => 'Amelia Wilson', 'email' => 'amelia.wilson@student.edu', 'section_code' => 'G3-E'],
            ['name' => 'Lucas Anderson', 'email' => 'lucas.anderson@student.edu', 'section_code' => 'G3-E'],
            ['name' => 'Mia Thomas', 'email' => 'mia.thomas@student.edu', 'section_code' => 'G3-N'],
            ['name' => 'Henry Taylor', 'email' => 'henry.taylor@student.edu', 'section_code' => 'G3-N'],
            ['name' => 'Harper Moore', 'email' => 'harper.moore@student.edu', 'section_code' => 'G3-C'],
            ['name' => 'Alexander Jackson', 'email' => 'alexander.jackson@student.edu', 'section_code' => 'G3-C'],
            
            // Grade 4 students
            ['name' => 'Evelyn Martin', 'email' => 'evelyn.martin@student.edu', 'section_code' => 'G4-E'],
            ['name' => 'Mason Lee', 'email' => 'mason.lee@student.edu', 'section_code' => 'G4-E'],
            ['name' => 'Abigail Perez', 'email' => 'abigail.perez@student.edu', 'section_code' => 'G4-N'],
            ['name' => 'Ethan Thompson', 'email' => 'ethan.thompson@student.edu', 'section_code' => 'G4-N'],
            ['name' => 'Emily White', 'email' => 'emily.white@student.edu', 'section_code' => 'G4-C'],
            ['name' => 'Sebastian Harris', 'email' => 'sebastian.harris@student.edu', 'section_code' => 'G4-C'],
            
            // Grade 5 students
            ['name' => 'Elizabeth Sanchez', 'email' => 'elizabeth.sanchez@student.edu', 'section_code' => 'G5-E'],
            ['name' => 'Jack Clark', 'email' => 'jack.clark@student.edu', 'section_code' => 'G5-E'],
            ['name' => 'Sofia Ramirez', 'email' => 'sofia.ramirez@student.edu', 'section_code' => 'G5-N'],
            ['name' => 'Owen Lewis', 'email' => 'owen.lewis@student.edu', 'section_code' => 'G5-N'],
            ['name' => 'Avery Robinson', 'email' => 'avery.robinson@student.edu', 'section_code' => 'G5-C'],
            ['name' => 'Theodore Walker', 'email' => 'theodore.walker@student.edu', 'section_code' => 'G5-C'],
            
            // Grade 6 students (honor students)
            ['name' => 'Scarlett Young', 'email' => 'scarlett.young@student.edu', 'section_code' => 'G6-E'],
            ['name' => 'Gabriel Allen', 'email' => 'gabriel.allen@student.edu', 'section_code' => 'G6-E'],
            ['name' => 'Victoria King', 'email' => 'victoria.king@student.edu', 'section_code' => 'G6-N'],
            ['name' => 'Julian Wright', 'email' => 'julian.wright@student.edu', 'section_code' => 'G6-N'],
            ['name' => 'Grace Lopez', 'email' => 'grace.lopez@student.edu', 'section_code' => 'G6-C'],
            ['name' => 'Adrian Hill', 'email' => 'adrian.hill@student.edu', 'section_code' => 'G6-C'],
        ];

        $createdStudents = [];
        foreach ($students as $index => $studentData) {
            $section = collect($sections)->firstWhere('code', $studentData['section_code']);
            
            $student = User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'student',
                    'year_level' => 'elementary',
                    'specific_year_level' => $section->specific_year_level,
                    'section_id' => $section->id,
                    'student_number' => 'ELEM-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
            $createdStudents[] = $student;
        }

        return $createdStudents;
    }

    private function createTeacherSubjectAssignments(array $teachers, array $subjects, int $academicLevelId, string $schoolYear): void
    {
        // Assign teachers to subjects - one teacher per subject for the entire academic level
        $teacherIndex = 0;
        
        foreach ($subjects as $subject) {
            $teacher = $teachers[$teacherIndex % count($teachers)];
            
            TeacherSubjectAssignment::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'academic_level_id' => $academicLevelId,
                'school_year' => $schoolYear,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => 1, // Admin user
                'notes' => 'Automatically assigned for complete data setup',
            ]);
            
            $teacherIndex++;
        }
    }

    private function createClassAdviserAssignments(array $advisers, array $sections, int $academicLevelId, string $schoolYear): void
    {
        $adviserIndex = 0;
        
        foreach ($sections as $section) {
            $adviser = $advisers[$adviserIndex % count($advisers)];
            
            ClassAdviserAssignment::updateOrCreate(
                [
                    'adviser_id' => $adviser->id,
                    'academic_level_id' => $academicLevelId,
                    'grade_level' => $section->specific_year_level,
                    'section' => $section->name,
                    'school_year' => $schoolYear,
                ],
                [
                    'is_active' => true,
                    'assigned_at' => now(),
                    'assigned_by' => 1, // Admin user
                    'notes' => 'Class adviser for ' . $section->name,
                ]
            );
            
            $adviserIndex++;
        }
    }

    private function createStudentSubjectAssignments(array $students, array $subjects, string $schoolYear): void
    {
        foreach ($students as $student) {
            foreach ($subjects as $subject) {
                StudentSubjectAssignment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'is_active' => true,
                        'enrolled_at' => now(),
                        'enrolled_by' => 1, // Admin user
                    ]
                );
            }
        }
    }

    private function createGradesForStudents(array $students, array $subjects, array $gradingPeriods, int $academicLevelId, string $schoolYear): void
    {
        foreach ($students as $student) {
            $sectionCode = $student->section->code;
            
            // Determine grade range based on section and grade level
            $isHonorsSection = str_contains($sectionCode, 'E') || str_contains($sectionCode, '6'); // Einstein sections or Grade 6
            
            if ($isHonorsSection) {
                // Honors students: GPA 90-95, no grade below 85
                $baseGrade = 92;
                $gradeVariation = 5; // 90-95 range
                $minGrade = 85;
            } else {
                // Regular students: GPA 80-89, no grade below 75
                $baseGrade = 84;
                $gradeVariation = 9; // 80-89 range
                $minGrade = 75;
            }

            foreach ($subjects as $subject) {
                foreach ($gradingPeriods as $period) {
                    // Generate grades with some variation but maintaining standards
                    $grade = $baseGrade + rand(-$gradeVariation, $gradeVariation);
                    
                    // Ensure minimum grade requirement
                    if ($grade < $minGrade) {
                        $grade = $minGrade;
                    }
                    
                    // Cap at 100
                    if ($grade > 100) {
                        $grade = 100;
                    }

                    StudentGrade::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'academic_level_id' => $academicLevelId,
                            'grading_period_id' => $period->id,
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
}
