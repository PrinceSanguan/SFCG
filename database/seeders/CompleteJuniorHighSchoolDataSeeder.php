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

class CompleteJuniorHighSchoolDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating complete Junior High School data with teachers, advisers, subjects, and assignments...');
        
        $schoolYear = '2024-2025';
        $jhsLevel = AcademicLevel::where('key', 'junior_highschool')->first();
        $jhsDept = Department::where('academic_level_id', 2)->first();
        
        if (!$jhsLevel) {
            $this->command->error('Junior High School academic level not found!');
            return;
        }

        // Create sections for each grade level
        $sections = $this->createSections($jhsLevel->id);
        
        // Create subjects for Junior High School
        $subjects = $this->createSubjects($jhsLevel->id);
        
        // Create grading periods for Junior High School
        $gradingPeriods = $this->createGradingPeriods($jhsLevel->id);
        
        // Create teachers for Junior High School
        $teachers = $this->createTeachers($jhsDept->id);
        
        // Create advisers for Junior High School
        $advisers = $this->createAdvisers($jhsDept->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create teacher subject assignments
        $this->createTeacherSubjectAssignments($teachers, $subjects, $jhsLevel->id, $schoolYear);
        
        // Create class adviser assignments
        $this->createClassAdviserAssignments($advisers, $sections, $jhsLevel->id, $schoolYear);
        
        // Create student subject assignments
        $this->createStudentSubjectAssignments($students, $subjects, $schoolYear);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $jhsLevel->id, $schoolYear);
        
        $this->command->info('Complete Junior High School data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // Grade 7 sections
            ['name' => 'Grade 7 - Einstein', 'code' => 'G7-E', 'specific_year_level' => 'grade_7'],
            ['name' => 'Grade 7 - Newton', 'code' => 'G7-N', 'specific_year_level' => 'grade_7'],
            ['name' => 'Grade 7 - Curie', 'code' => 'G7-C', 'specific_year_level' => 'grade_7'],
            
            // Grade 8 sections
            ['name' => 'Grade 8 - Einstein', 'code' => 'G8-E', 'specific_year_level' => 'grade_8'],
            ['name' => 'Grade 8 - Newton', 'code' => 'G8-N', 'specific_year_level' => 'grade_8'],
            ['name' => 'Grade 8 - Curie', 'code' => 'G8-C', 'specific_year_level' => 'grade_8'],
            
            // Grade 9 sections
            ['name' => 'Grade 9 - Einstein', 'code' => 'G9-E', 'specific_year_level' => 'grade_9'],
            ['name' => 'Grade 9 - Newton', 'code' => 'G9-N', 'specific_year_level' => 'grade_9'],
            ['name' => 'Grade 9 - Curie', 'code' => 'G9-C', 'specific_year_level' => 'grade_9'],
            
            // Grade 10 sections
            ['name' => 'Grade 10 - Einstein', 'code' => 'G10-E', 'specific_year_level' => 'grade_10'],
            ['name' => 'Grade 10 - Newton', 'code' => 'G10-N', 'specific_year_level' => 'grade_10'],
            ['name' => 'Grade 10 - Curie', 'code' => 'G10-C', 'specific_year_level' => 'grade_10'],
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
            ['name' => 'English', 'code' => 'ENG-JHS', 'description' => 'Junior High School English'],
            ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'description' => 'Junior High School Mathematics'],
            ['name' => 'Science', 'code' => 'SCI-JHS', 'description' => 'Junior High School Science'],
            ['name' => 'Filipino', 'code' => 'FIL-JHS', 'description' => 'Junior High School Filipino'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-JHS', 'description' => 'Junior High School Social Studies'],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-JHS', 'description' => 'Technology and Livelihood Education'],
            ['name' => 'MAPEH', 'code' => 'MAPEH-JHS', 'description' => 'Music, Arts, PE, and Health'],
            ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP-JHS', 'description' => 'Values Education'],
            ['name' => 'Computer Education', 'code' => 'COMP-JHS', 'description' => 'Computer Education'],
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
            ['name' => 'Prof. Ricardo Morales', 'email' => 'ricardo.morales@school.edu'],
            ['name' => 'Ms. Teresa Villanueva', 'email' => 'teresa.villanueva@school.edu'],
            ['name' => 'Mr. Eduardo Santos', 'email' => 'eduardo.santos@school.edu'],
            ['name' => 'Dr. Luz Fernandez', 'email' => 'luz.fernandez@school.edu'],
            ['name' => 'Prof. Arturo Reyes', 'email' => 'arturo.reyes@school.edu'],
            ['name' => 'Ms. Consuelo Dela Cruz', 'email' => 'consuelo.delacruz@school.edu'],
            ['name' => 'Mr. Armando Castillo', 'email' => 'armando.castillo@school.edu'],
            ['name' => 'Dr. Remedios Herrera', 'email' => 'remedios.herrera@school.edu'],
            ['name' => 'Prof. Nestor Mendoza', 'email' => 'nestor.mendoza@school.edu'],
            ['name' => 'Ms. Lourdes Aguilar', 'email' => 'lourdes.aguilar@school.edu'],
            ['name' => 'Mr. Reynaldo Ortiz', 'email' => 'reynaldo.ortiz@school.edu'],
            ['name' => 'Dr. Esperanza Navarro', 'email' => 'esperanza.navarro@school.edu'],
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
            ['name' => 'Dr. Concepcion Ramos', 'email' => 'concepcion.ramos@school.edu'],
            ['name' => 'Prof. Vicente Gutierrez', 'email' => 'vicente.gutierrez@school.edu'],
            ['name' => 'Ms. Socorro Vega', 'email' => 'socorro.vega@school.edu'],
            ['name' => 'Mr. Fortunato Morales', 'email' => 'fortunato.morales@school.edu'],
            ['name' => 'Dr. Soledad Villanueva', 'email' => 'soledad.villanueva@school.edu'],
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
            // Grade 7 students
            ['name' => 'Alexander Thompson', 'email' => 'alexander.thompson@jhs.edu', 'section_code' => 'G7-E'],
            ['name' => 'Bella Rodriguez', 'email' => 'bella.rodriguez@jhs.edu', 'section_code' => 'G7-E'],
            ['name' => 'Christopher Anderson', 'email' => 'christopher.anderson@jhs.edu', 'section_code' => 'G7-N'],
            ['name' => 'Diana Martinez', 'email' => 'diana.martinez@jhs.edu', 'section_code' => 'G7-N'],
            ['name' => 'Ethan Wilson', 'email' => 'ethan.wilson@jhs.edu', 'section_code' => 'G7-C'],
            ['name' => 'Fiona Davis', 'email' => 'fiona.davis@jhs.edu', 'section_code' => 'G7-C'],
            
            // Grade 8 students
            ['name' => 'Gabriel Taylor', 'email' => 'gabriel.taylor@jhs.edu', 'section_code' => 'G8-E'],
            ['name' => 'Hannah Brown', 'email' => 'hannah.brown@jhs.edu', 'section_code' => 'G8-E'],
            ['name' => 'Isaac Garcia', 'email' => 'isaac.garcia@jhs.edu', 'section_code' => 'G8-N'],
            ['name' => 'Julia Miller', 'email' => 'julia.miller@jhs.edu', 'section_code' => 'G8-N'],
            ['name' => 'Kevin Johnson', 'email' => 'kevin.johnson@jhs.edu', 'section_code' => 'G8-C'],
            ['name' => 'Luna White', 'email' => 'luna.white@jhs.edu', 'section_code' => 'G8-C'],
            
            // Grade 9 students
            ['name' => 'Marcus Lee', 'email' => 'marcus.lee@jhs.edu', 'section_code' => 'G9-E'],
            ['name' => 'Natalie Clark', 'email' => 'natalie.clark@jhs.edu', 'section_code' => 'G9-E'],
            ['name' => 'Oliver Adams', 'email' => 'oliver.adams@jhs.edu', 'section_code' => 'G9-N'],
            ['name' => 'Penelope Hall', 'email' => 'penelope.hall@jhs.edu', 'section_code' => 'G9-N'],
            ['name' => 'Quinn Turner', 'email' => 'quinn.turner@jhs.edu', 'section_code' => 'G9-C'],
            ['name' => 'Riley Parker', 'email' => 'riley.parker@jhs.edu', 'section_code' => 'G9-C'],
            
            // Grade 10 students
            ['name' => 'Sophia Evans', 'email' => 'sophia.evans@jhs.edu', 'section_code' => 'G10-E'],
            ['name' => 'Tyler Reed', 'email' => 'tyler.reed@jhs.edu', 'section_code' => 'G10-E'],
            ['name' => 'Uma Cook', 'email' => 'uma.cook@jhs.edu', 'section_code' => 'G10-N'],
            ['name' => 'Vincent Bell', 'email' => 'vincent.bell@jhs.edu', 'section_code' => 'G10-N'],
            ['name' => 'Willow Murphy', 'email' => 'willow.murphy@jhs.edu', 'section_code' => 'G10-C'],
            ['name' => 'Xavier Bailey', 'email' => 'xavier.bailey@jhs.edu', 'section_code' => 'G10-C'],
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
                    'year_level' => 'junior_highschool',
                    'specific_year_level' => $section->specific_year_level,
                    'section_id' => $section->id,
                    'student_number' => 'JHS-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
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
            
            // Determine grade range based on section
            $isHonorsSection = str_contains($sectionCode, 'E'); // Einstein sections
            
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
