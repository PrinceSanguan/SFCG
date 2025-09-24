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
        $elemLevel = AcademicLevel::where('key', 'elementary')->first();
        $elemDept = Department::where('academic_level_id', 1)->first();
        
        if (!$elemLevel) {
            $this->command->error('Elementary academic level not found!');
            return;
        }

        // Create sections for each grade level
        $sections = $this->createSections($elemLevel->id);
        
        // Create subjects for Elementary
        $subjects = $this->createSubjects($elemLevel->id);
        
        // Create grading periods for Elementary
        $gradingPeriods = $this->createGradingPeriods($elemLevel->id);
        
        // Create teachers for Elementary
        $teachers = $this->createTeachers($elemDept->id);
        
        // Create advisers for Elementary
        $advisers = $this->createAdvisers($elemDept->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create teacher subject assignments
        $this->createTeacherSubjectAssignments($teachers, $subjects, $elemLevel->id, $schoolYear);
        
        // Create class adviser assignments
        $this->createClassAdviserAssignments($advisers, $sections, $elemLevel->id, $schoolYear);
        
        // Create student subject assignments
        $this->createStudentSubjectAssignments($students, $subjects, $schoolYear);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $elemLevel->id, $schoolYear);
        
        $this->command->info('Complete Elementary data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // Grade 1 sections
            ['name' => 'Grade 1 - Sunflower', 'code' => 'G1-SUNFLOWER', 'specific_year_level' => 'grade_1'],
            ['name' => 'Grade 1 - Rose', 'code' => 'G1-ROSE', 'specific_year_level' => 'grade_1'],
            ['name' => 'Grade 1 - Tulip', 'code' => 'G1-TULIP', 'specific_year_level' => 'grade_1'],
            
            // Grade 2 sections
            ['name' => 'Grade 2 - Daisy', 'code' => 'G2-DAISY', 'specific_year_level' => 'grade_2'],
            ['name' => 'Grade 2 - Lily', 'code' => 'G2-LILY', 'specific_year_level' => 'grade_2'],
            ['name' => 'Grade 2 - Orchid', 'code' => 'G2-ORCHID', 'specific_year_level' => 'grade_2'],
            
            // Grade 3 sections
            ['name' => 'Grade 3 - Jasmine', 'code' => 'G3-JASMINE', 'specific_year_level' => 'grade_3'],
            ['name' => 'Grade 3 - Violet', 'code' => 'G3-VIOLET', 'specific_year_level' => 'grade_3'],
            ['name' => 'Grade 3 - Marigold', 'code' => 'G3-MARIGOLD', 'specific_year_level' => 'grade_3'],
            
            // Grade 4 sections
            ['name' => 'Grade 4 - Carnation', 'code' => 'G4-CARNATION', 'specific_year_level' => 'grade_4'],
            ['name' => 'Grade 4 - Peony', 'code' => 'G4-PEONY', 'specific_year_level' => 'grade_4'],
            ['name' => 'Grade 4 - Chrysanthemum', 'code' => 'G4-CHRYSANTHEMUM', 'specific_year_level' => 'grade_4'],
            
            // Grade 5 sections
            ['name' => 'Grade 5 - Hibiscus', 'code' => 'G5-HIBISCUS', 'specific_year_level' => 'grade_5'],
            ['name' => 'Grade 5 - Lavender', 'code' => 'G5-LAVENDER', 'specific_year_level' => 'grade_5'],
            ['name' => 'Grade 5 - Magnolia', 'code' => 'G5-MAGNOLIA', 'specific_year_level' => 'grade_5'],
            
            // Grade 6 sections
            ['name' => 'Grade 6 - Lotus', 'code' => 'G6-LOTUS', 'specific_year_level' => 'grade_6'],
            ['name' => 'Grade 6 - Cherry Blossom', 'code' => 'G6-CHERRY', 'specific_year_level' => 'grade_6'],
            ['name' => 'Grade 6 - Plumeria', 'code' => 'G6-PLUMERIA', 'specific_year_level' => 'grade_6'],
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
            ['name' => 'English', 'code' => 'ENG-ELEM', 'description' => 'English Language Arts'],
            ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'description' => 'Mathematics'],
            ['name' => 'Science', 'code' => 'SCI-ELEM', 'description' => 'Science'],
            ['name' => 'Filipino', 'code' => 'FIL-ELEM', 'description' => 'Filipino'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP-ELEM', 'description' => 'Araling Panlipunan'],
            ['name' => 'MAPEH', 'code' => 'MAPEH-ELEM', 'description' => 'Music, Arts, Physical Education, and Health'],
            ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP-ELEM', 'description' => 'Edukasyon sa Pagpapakatao'],
            ['name' => 'Mother Tongue', 'code' => 'MT-ELEM', 'description' => 'Mother Tongue'],
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
            ['name' => 'Ms. Sarah Johnson', 'email' => 'sarah.johnson@elem.edu'],
            ['name' => 'Mr. Michael Brown', 'email' => 'michael.brown@elem.edu'],
            ['name' => 'Ms. Emily Davis', 'email' => 'emily.davis@elem.edu'],
            ['name' => 'Mr. James Wilson', 'email' => 'james.wilson@elem.edu'],
            ['name' => 'Ms. Jessica Miller', 'email' => 'jessica.miller@elem.edu'],
            ['name' => 'Mr. Christopher Garcia', 'email' => 'christopher.garcia@elem.edu'],
            ['name' => 'Ms. Amanda Martinez', 'email' => 'amanda.martinez@elem.edu'],
            ['name' => 'Mr. Daniel Rodriguez', 'email' => 'daniel.rodriguez@elem.edu'],
            ['name' => 'Ms. Jennifer Anderson', 'email' => 'jennifer.anderson@elem.edu'],
            ['name' => 'Mr. Matthew Taylor', 'email' => 'matthew.taylor@elem.edu'],
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
            ['name' => 'Dr. Patricia Thompson', 'email' => 'patricia.thompson@elem.edu'],
            ['name' => 'Prof. Robert White', 'email' => 'robert.white@elem.edu'],
            ['name' => 'Ms. Linda Harris', 'email' => 'linda.harris@elem.edu'],
            ['name' => 'Mr. Thomas Clark', 'email' => 'thomas.clark@elem.edu'],
            ['name' => 'Dr. Susan Lewis', 'email' => 'susan.lewis@elem.edu'],
            ['name' => 'Prof. Charles Walker', 'email' => 'charles.walker@elem.edu'],
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
            ['name' => 'Alice Johnson', 'email' => 'alice.johnson@elem.edu', 'section_code' => 'G1-SUNFLOWER'],
            ['name' => 'Bob Smith', 'email' => 'bob.smith@elem.edu', 'section_code' => 'G1-SUNFLOWER'],
            ['name' => 'Charlie Brown', 'email' => 'charlie.brown@elem.edu', 'section_code' => 'G1-ROSE'],
            ['name' => 'Diana Prince', 'email' => 'diana.prince@elem.edu', 'section_code' => 'G1-ROSE'],
            ['name' => 'Ethan Hunt', 'email' => 'ethan.hunt@elem.edu', 'section_code' => 'G1-TULIP'],
            ['name' => 'Fiona Green', 'email' => 'fiona.green@elem.edu', 'section_code' => 'G1-TULIP'],
            
            // Grade 2 students
            ['name' => 'George Wilson', 'email' => 'george.wilson@elem.edu', 'section_code' => 'G2-DAISY'],
            ['name' => 'Hannah Davis', 'email' => 'hannah.davis@elem.edu', 'section_code' => 'G2-DAISY'],
            ['name' => 'Ivan Rodriguez', 'email' => 'ivan.rodriguez@elem.edu', 'section_code' => 'G2-LILY'],
            ['name' => 'Julia Martinez', 'email' => 'julia.martinez@elem.edu', 'section_code' => 'G2-LILY'],
            ['name' => 'Kevin Anderson', 'email' => 'kevin.anderson@elem.edu', 'section_code' => 'G2-ORCHID'],
            ['name' => 'Luna Taylor', 'email' => 'luna.taylor@elem.edu', 'section_code' => 'G2-ORCHID'],
            
            // Grade 3 students
            ['name' => 'Marcus Thomas', 'email' => 'marcus.thomas@elem.edu', 'section_code' => 'G3-JASMINE'],
            ['name' => 'Nina Jackson', 'email' => 'nina.jackson@elem.edu', 'section_code' => 'G3-JASMINE'],
            ['name' => 'Oscar White', 'email' => 'oscar.white@elem.edu', 'section_code' => 'G3-VIOLET'],
            ['name' => 'Penny Harris', 'email' => 'penny.harris@elem.edu', 'section_code' => 'G3-VIOLET'],
            ['name' => 'Quinn Martin', 'email' => 'quinn.martin@elem.edu', 'section_code' => 'G3-MARIGOLD'],
            ['name' => 'Ruby Thompson', 'email' => 'ruby.thompson@elem.edu', 'section_code' => 'G3-MARIGOLD'],
            
            // Grade 4 students
            ['name' => 'Sam Garcia', 'email' => 'sam.garcia@elem.edu', 'section_code' => 'G4-CARNATION'],
            ['name' => 'Tina Martinez', 'email' => 'tina.martinez@elem.edu', 'section_code' => 'G4-CARNATION'],
            ['name' => 'Ulysses Robinson', 'email' => 'ulysses.robinson@elem.edu', 'section_code' => 'G4-PEONY'],
            ['name' => 'Victoria Clark', 'email' => 'victoria.clark@elem.edu', 'section_code' => 'G4-PEONY'],
            ['name' => 'William Rodriguez', 'email' => 'william.rodriguez@elem.edu', 'section_code' => 'G4-CHRYSANTHEMUM'],
            ['name' => 'Xara Lewis', 'email' => 'xara.lewis@elem.edu', 'section_code' => 'G4-CHRYSANTHEMUM'],
            
            // Grade 5 students
            ['name' => 'Yara Walker', 'email' => 'yara.walker@elem.edu', 'section_code' => 'G5-HIBISCUS'],
            ['name' => 'Zoe Hall', 'email' => 'zoe.hall@elem.edu', 'section_code' => 'G5-HIBISCUS'],
            ['name' => 'Aaron Allen', 'email' => 'aaron.allen@elem.edu', 'section_code' => 'G5-LAVENDER'],
            ['name' => 'Bella Young', 'email' => 'bella.young@elem.edu', 'section_code' => 'G5-LAVENDER'],
            ['name' => 'Caleb King', 'email' => 'caleb.king@elem.edu', 'section_code' => 'G5-MAGNOLIA'],
            ['name' => 'Destiny Wright', 'email' => 'destiny.wright@elem.edu', 'section_code' => 'G5-MAGNOLIA'],
            
            // Grade 6 students
            ['name' => 'Elijah Lopez', 'email' => 'elijah.lopez@elem.edu', 'section_code' => 'G6-LOTUS'],
            ['name' => 'Faith Hill', 'email' => 'faith.hill@elem.edu', 'section_code' => 'G6-LOTUS'],
            ['name' => 'Gabriel Scott', 'email' => 'gabriel.scott@elem.edu', 'section_code' => 'G6-CHERRY'],
            ['name' => 'Hannah Green', 'email' => 'hannah.green@elem.edu', 'section_code' => 'G6-CHERRY'],
            ['name' => 'Isaac Adams', 'email' => 'isaac.adams@elem.edu', 'section_code' => 'G6-PLUMERIA'],
            ['name' => 'Jasmine Baker', 'email' => 'jasmine.baker@elem.edu', 'section_code' => 'G6-PLUMERIA'],
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
            
            // Determine grade range based on section
            $isHonorsSection = str_contains($sectionCode, 'Sunflower') || str_contains($sectionCode, 'Lotus'); // Sunflower and Lotus sections
            
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