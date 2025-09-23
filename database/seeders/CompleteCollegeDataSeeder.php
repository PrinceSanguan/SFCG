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
use App\Models\Course;
use App\Models\InstructorCourseAssignment;
use App\Models\InstructorSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\StudentSubjectAssignment;
use Illuminate\Support\Facades\Hash;

class CompleteCollegeDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating complete College data with instructors, advisers, subjects, and assignments...');
        
        $schoolYear = '2024-2025';
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        
        if (!$collegeLevel) {
            $this->command->error('College academic level not found!');
            return;
        }

        // Get departments and courses
        $departments = Department::where('academic_level_id', 4)->get();
        $courses = Course::whereHas('department', function($query) {
            $query->where('academic_level_id', 4);
        })->get();
        
        // Create sections for each year level and course
        $sections = $this->createSections($collegeLevel->id, $courses);
        
        // Create subjects for College
        $subjects = $this->createSubjects($collegeLevel->id);
        
        // Create grading periods for College
        $gradingPeriods = $this->createGradingPeriods($collegeLevel->id);
        
        // Create instructors for College
        $instructors = $this->createInstructors($departments);
        
        // Create advisers for College
        $advisers = $this->createAdvisers($departments);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create instructor course assignments
        $this->createInstructorCourseAssignments($instructors, $courses, $collegeLevel->id, $schoolYear);
        
        // Create instructor subject assignments
        $this->createInstructorSubjectAssignments($instructors, $subjects, $collegeLevel->id, $schoolYear);
        
        // Create class adviser assignments
        $this->createClassAdviserAssignments($advisers, $sections, $collegeLevel->id, $schoolYear);
        
        // Create student subject assignments
        $this->createStudentSubjectAssignments($students, $subjects, $schoolYear);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $collegeLevel->id, $schoolYear);
        
        $this->command->info('Complete College data created successfully!');
    }

    private function createSections(int $academicLevelId, $courses): array
    {
        $sections = [
            // First Year sections
            ['name' => 'First Year - Computer Science A', 'code' => 'FY-CS-A', 'specific_year_level' => 'first_year', 'course_code' => 'BSCS'],
            ['name' => 'First Year - Computer Science B', 'code' => 'FY-CS-B', 'specific_year_level' => 'first_year', 'course_code' => 'BSCS'],
            ['name' => 'First Year - Information Technology A', 'code' => 'FY-IT-A', 'specific_year_level' => 'first_year', 'course_code' => 'BSIT'],
            ['name' => 'First Year - Information Technology B', 'code' => 'FY-IT-B', 'specific_year_level' => 'first_year', 'course_code' => 'BSIT'],
            ['name' => 'First Year - Business Administration A', 'code' => 'FY-BA-A', 'specific_year_level' => 'first_year', 'course_code' => 'BSBA'],
            ['name' => 'First Year - Elementary Education A', 'code' => 'FY-EE-A', 'specific_year_level' => 'first_year', 'course_code' => 'BEED'],
            
            // Second Year sections
            ['name' => 'Second Year - Computer Science A', 'code' => 'SY-CS-A', 'specific_year_level' => 'second_year', 'course_code' => 'BSCS'],
            ['name' => 'Second Year - Computer Science B', 'code' => 'SY-CS-B', 'specific_year_level' => 'second_year', 'course_code' => 'BSCS'],
            ['name' => 'Second Year - Information Technology A', 'code' => 'SY-IT-A', 'specific_year_level' => 'second_year', 'course_code' => 'BSIT'],
            ['name' => 'Second Year - Information Technology B', 'code' => 'SY-IT-B', 'specific_year_level' => 'second_year', 'course_code' => 'BSIT'],
            ['name' => 'Second Year - Business Administration A', 'code' => 'SY-BA-A', 'specific_year_level' => 'second_year', 'course_code' => 'BSBA'],
            ['name' => 'Second Year - Elementary Education A', 'code' => 'SY-EE-A', 'specific_year_level' => 'second_year', 'course_code' => 'BEED'],
            
            // Third Year sections
            ['name' => 'Third Year - Computer Science A', 'code' => 'TY-CS-A', 'specific_year_level' => 'third_year', 'course_code' => 'BSCS'],
            ['name' => 'Third Year - Computer Science B', 'code' => 'TY-CS-B', 'specific_year_level' => 'third_year', 'course_code' => 'BSCS'],
            ['name' => 'Third Year - Information Technology A', 'code' => 'TY-IT-A', 'specific_year_level' => 'third_year', 'course_code' => 'BSIT'],
            ['name' => 'Third Year - Information Technology B', 'code' => 'TY-IT-B', 'specific_year_level' => 'third_year', 'course_code' => 'BSIT'],
            ['name' => 'Third Year - Business Administration A', 'code' => 'TY-BA-A', 'specific_year_level' => 'third_year', 'course_code' => 'BSBA'],
            ['name' => 'Third Year - Elementary Education A', 'code' => 'TY-EE-A', 'specific_year_level' => 'third_year', 'course_code' => 'BEED'],
            
            // Fourth Year sections
            ['name' => 'Fourth Year - Computer Science A', 'code' => 'FOY-CS-A', 'specific_year_level' => 'fourth_year', 'course_code' => 'BSCS'],
            ['name' => 'Fourth Year - Computer Science B', 'code' => 'FOY-CS-B', 'specific_year_level' => 'fourth_year', 'course_code' => 'BSCS'],
            ['name' => 'Fourth Year - Information Technology A', 'code' => 'FOY-IT-A', 'specific_year_level' => 'fourth_year', 'course_code' => 'BSIT'],
            ['name' => 'Fourth Year - Information Technology B', 'code' => 'FOY-IT-B', 'specific_year_level' => 'fourth_year', 'course_code' => 'BSIT'],
            ['name' => 'Fourth Year - Business Administration A', 'code' => 'FOY-BA-A', 'specific_year_level' => 'fourth_year', 'course_code' => 'BSBA'],
            ['name' => 'Fourth Year - Elementary Education A', 'code' => 'FOY-EE-A', 'specific_year_level' => 'fourth_year', 'course_code' => 'BEED'],
        ];

        $createdSections = [];
        foreach ($sections as $sectionData) {
            $course = collect($courses)->firstWhere('code', $sectionData['course_code']);
            
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
            ['name' => 'Calculus I', 'code' => 'CALC1-COL', 'description' => 'College Calculus I'],
            ['name' => 'Calculus II', 'code' => 'CALC2-COL', 'description' => 'College Calculus II'],
            ['name' => 'English Composition', 'code' => 'ENGCOMP-COL', 'description' => 'College English Composition'],
            ['name' => 'Technical Writing', 'code' => 'TECHWRITE-COL', 'description' => 'Technical Writing'],
            ['name' => 'General Chemistry', 'code' => 'GENCHEM-COL', 'description' => 'College General Chemistry'],
            ['name' => 'Physics I', 'code' => 'PHYS1-COL', 'description' => 'College Physics I'],
            ['name' => 'Introduction to Psychology', 'code' => 'PSYCH-COL', 'description' => 'College Introduction to Psychology'],
            ['name' => 'Sociology', 'code' => 'SOCIO-COL', 'description' => 'College Sociology'],
            ['name' => 'Computer Programming I', 'code' => 'PROG1-COL', 'description' => 'Computer Programming I'],
            ['name' => 'Data Structures and Algorithms', 'code' => 'DSA-COL', 'description' => 'Data Structures and Algorithms'],
            ['name' => 'Database Management Systems', 'code' => 'DBMS-COL', 'description' => 'Database Management Systems'],
            ['name' => 'Software Engineering', 'code' => 'SE-COL', 'description' => 'Software Engineering'],
            ['name' => 'Business Mathematics', 'code' => 'BUSMATH-COL', 'description' => 'Business Mathematics'],
            ['name' => 'Principles of Management', 'code' => 'POM-COL', 'description' => 'Principles of Management'],
            ['name' => 'Principles of Marketing', 'code' => 'POMARK-COL', 'description' => 'Principles of Marketing'],
            ['name' => 'Child Development', 'code' => 'CHILDDEV-COL', 'description' => 'Child Development'],
            ['name' => 'Educational Psychology', 'code' => 'EDPSYCH-COL', 'description' => 'Educational Psychology'],
            ['name' => 'Curriculum Development', 'code' => 'CURRDEV-COL', 'description' => 'Curriculum Development'],
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

    private function createInstructors($departments): array
    {
        $instructors = [
            // Computer Department instructors
            ['name' => 'Dr. Roberto Santos', 'email' => 'roberto.santos@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Prof. Maria Garcia', 'email' => 'maria.garcia@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Dr. Jose Martinez', 'email' => 'jose.martinez@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Prof. Ana Rodriguez', 'email' => 'ana.rodriguez@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Dr. Carlos Lopez', 'email' => 'carlos.lopez@college.edu', 'department_code' => 'COMP'],
            
            // Business Department instructors
            ['name' => 'Dr. Elena Torres', 'email' => 'elena.torres@college.edu', 'department_code' => 'BUS'],
            ['name' => 'Prof. Miguel Flores', 'email' => 'miguel.flores@college.edu', 'department_code' => 'BUS'],
            ['name' => 'Dr. Isabel Cruz', 'email' => 'isabel.cruz@college.edu', 'department_code' => 'BUS'],
            ['name' => 'Prof. Fernando Vega', 'email' => 'fernando.vega@college.edu', 'department_code' => 'BUS'],
            
            // Education Department instructors
            ['name' => 'Dr. Carmen Ramos', 'email' => 'carmen.ramos@college.edu', 'department_code' => 'EDU'],
            ['name' => 'Prof. Antonio Morales', 'email' => 'antonio.morales@college.edu', 'department_code' => 'EDU'],
            ['name' => 'Dr. Rosa Herrera', 'email' => 'rosa.herrera@college.edu', 'department_code' => 'EDU'],
            ['name' => 'Prof. Luis Mendoza', 'email' => 'luis.mendoza@college.edu', 'department_code' => 'EDU'],
        ];

        $createdInstructors = [];
        foreach ($instructors as $instructorData) {
            $department = collect($departments)->firstWhere('code', $instructorData['department_code']);
            
            $instructor = User::updateOrCreate(
                ['email' => $instructorData['email']],
                [
                    'name' => $instructorData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'instructor',
                    'department_id' => $department->id,
                    'email_verified_at' => now(),
                ]
            );
            $createdInstructors[] = $instructor;
        }

        return $createdInstructors;
    }

    private function createAdvisers($departments): array
    {
        $advisers = [
            ['name' => 'Dr. Patricia Aguilar', 'email' => 'patricia.aguilar@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Prof. Manuel Ortiz', 'email' => 'manuel.ortiz@college.edu', 'department_code' => 'COMP'],
            ['name' => 'Dr. Gloria Navarro', 'email' => 'gloria.navarro@college.edu', 'department_code' => 'BUS'],
            ['name' => 'Prof. Nestor Gutierrez', 'email' => 'nestor.gutierrez@college.edu', 'department_code' => 'EDU'],
            ['name' => 'Dr. Soledad Villanueva', 'email' => 'soledad.villanueva@college.edu', 'department_code' => 'EDU'],
        ];

        $createdAdvisers = [];
        foreach ($advisers as $adviserData) {
            $department = collect($departments)->firstWhere('code', $adviserData['department_code']);
            
            $adviser = User::updateOrCreate(
                ['email' => $adviserData['email']],
                [
                    'name' => $adviserData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'adviser',
                    'department_id' => $department->id,
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
            // First Year students
            ['name' => 'Alexander Thompson', 'email' => 'alexander.thompson@college.edu', 'section_code' => 'FY-CS-A'],
            ['name' => 'Bella Rodriguez', 'email' => 'bella.rodriguez@college.edu', 'section_code' => 'FY-CS-A'],
            ['name' => 'Christopher Anderson', 'email' => 'christopher.anderson@college.edu', 'section_code' => 'FY-CS-B'],
            ['name' => 'Diana Martinez', 'email' => 'diana.martinez@college.edu', 'section_code' => 'FY-CS-B'],
            ['name' => 'Ethan Wilson', 'email' => 'ethan.wilson@college.edu', 'section_code' => 'FY-IT-A'],
            ['name' => 'Fiona Davis', 'email' => 'fiona.davis@college.edu', 'section_code' => 'FY-IT-A'],
            ['name' => 'Gabriel Taylor', 'email' => 'gabriel.taylor@college.edu', 'section_code' => 'FY-IT-B'],
            ['name' => 'Hannah Brown', 'email' => 'hannah.brown@college.edu', 'section_code' => 'FY-IT-B'],
            ['name' => 'Isaac Garcia', 'email' => 'isaac.garcia@college.edu', 'section_code' => 'FY-BA-A'],
            ['name' => 'Julia Miller', 'email' => 'julia.miller@college.edu', 'section_code' => 'FY-BA-A'],
            ['name' => 'Kevin Johnson', 'email' => 'kevin.johnson@college.edu', 'section_code' => 'FY-EE-A'],
            ['name' => 'Luna White', 'email' => 'luna.white@college.edu', 'section_code' => 'FY-EE-A'],
            
            // Second Year students
            ['name' => 'Marcus Lee', 'email' => 'marcus.lee@college.edu', 'section_code' => 'SY-CS-A'],
            ['name' => 'Natalie Clark', 'email' => 'natalie.clark@college.edu', 'section_code' => 'SY-CS-A'],
            ['name' => 'Oliver Adams', 'email' => 'oliver.adams@college.edu', 'section_code' => 'SY-CS-B'],
            ['name' => 'Penelope Hall', 'email' => 'penelope.hall@college.edu', 'section_code' => 'SY-CS-B'],
            ['name' => 'Quinn Turner', 'email' => 'quinn.turner@college.edu', 'section_code' => 'SY-IT-A'],
            ['name' => 'Riley Parker', 'email' => 'riley.parker@college.edu', 'section_code' => 'SY-IT-A'],
            ['name' => 'Sophia Evans', 'email' => 'sophia.evans@college.edu', 'section_code' => 'SY-IT-B'],
            ['name' => 'Tyler Reed', 'email' => 'tyler.reed@college.edu', 'section_code' => 'SY-IT-B'],
            ['name' => 'Uma Cook', 'email' => 'uma.cook@college.edu', 'section_code' => 'SY-BA-A'],
            ['name' => 'Vincent Bell', 'email' => 'vincent.bell@college.edu', 'section_code' => 'SY-BA-A'],
            ['name' => 'Willow Murphy', 'email' => 'willow.murphy@college.edu', 'section_code' => 'SY-EE-A'],
            ['name' => 'Xavier Bailey', 'email' => 'xavier.bailey@college.edu', 'section_code' => 'SY-EE-A'],
            
            // Third Year students
            ['name' => 'Yara Rivera', 'email' => 'yara.rivera@college.edu', 'section_code' => 'TY-CS-A'],
            ['name' => 'Zane Cooper', 'email' => 'zane.cooper@college.edu', 'section_code' => 'TY-CS-A'],
            ['name' => 'Aria Richardson', 'email' => 'aria.richardson@college.edu', 'section_code' => 'TY-CS-B'],
            ['name' => 'Blake Cox', 'email' => 'blake.cox@college.edu', 'section_code' => 'TY-CS-B'],
            ['name' => 'Chloe Ward', 'email' => 'chloe.ward@college.edu', 'section_code' => 'TY-IT-A'],
            ['name' => 'Diego Torres', 'email' => 'diego.torres@college.edu', 'section_code' => 'TY-IT-A'],
            ['name' => 'Emma Peterson', 'email' => 'emma.peterson@college.edu', 'section_code' => 'TY-IT-B'],
            ['name' => 'Felix Gray', 'email' => 'felix.gray@college.edu', 'section_code' => 'TY-IT-B'],
            ['name' => 'Grace Williams', 'email' => 'grace.williams@college.edu', 'section_code' => 'TY-BA-A'],
            ['name' => 'Henry Jones', 'email' => 'henry.jones@college.edu', 'section_code' => 'TY-BA-A'],
            ['name' => 'Ivy Smith', 'email' => 'ivy.smith@college.edu', 'section_code' => 'TY-EE-A'],
            ['name' => 'Jack Davis', 'email' => 'jack.davis@college.edu', 'section_code' => 'TY-EE-A'],
            
            // Fourth Year students
            ['name' => 'Kate Brown', 'email' => 'kate.brown@college.edu', 'section_code' => 'FOY-CS-A'],
            ['name' => 'Leo Wilson', 'email' => 'leo.wilson@college.edu', 'section_code' => 'FOY-CS-A'],
            ['name' => 'Maya Moore', 'email' => 'maya.moore@college.edu', 'section_code' => 'FOY-CS-B'],
            ['name' => 'Noah Taylor', 'email' => 'noah.taylor@college.edu', 'section_code' => 'FOY-CS-B'],
            ['name' => 'Olivia Anderson', 'email' => 'olivia.anderson@college.edu', 'section_code' => 'FOY-IT-A'],
            ['name' => 'Peter Thomas', 'email' => 'peter.thomas@college.edu', 'section_code' => 'FOY-IT-A'],
            ['name' => 'Quinn Jackson', 'email' => 'quinn.jackson@college.edu', 'section_code' => 'FOY-IT-B'],
            ['name' => 'Ruby White', 'email' => 'ruby.white@college.edu', 'section_code' => 'FOY-IT-B'],
            ['name' => 'Samuel Harris', 'email' => 'samuel.harris@college.edu', 'section_code' => 'FOY-BA-A'],
            ['name' => 'Tara Martin', 'email' => 'tara.martin@college.edu', 'section_code' => 'FOY-BA-A'],
            ['name' => 'Uriah Thompson', 'email' => 'uriah.thompson@college.edu', 'section_code' => 'FOY-EE-A'],
            ['name' => 'Vera Garcia', 'email' => 'vera.garcia@college.edu', 'section_code' => 'FOY-EE-A'],
        ];

        // Get departments and courses for assignment
        $computerDept = Department::where('code', 'COMP')->first();
        $businessDept = Department::where('code', 'BUS')->first();
        $educationDept = Department::where('code', 'EDU')->first();
        
        $bscsCourse = Course::where('code', 'BSCS')->first();
        $bsitCourse = Course::where('code', 'BSIT')->first();
        $bsbaCourse = Course::where('code', 'BSBA')->first();
        $beedCourse = Course::where('code', 'BEED')->first();

        $createdStudents = [];
        foreach ($students as $index => $studentData) {
            $section = collect($sections)->firstWhere('code', $studentData['section_code']);
            
            // Assign department and course based on section
            $departmentId = null;
            $courseId = null;
            
            if (str_contains($section->name, 'Computer Science')) {
                $departmentId = $computerDept->id;
                $courseId = $bscsCourse->id;
            } elseif (str_contains($section->name, 'Information Technology')) {
                $departmentId = $computerDept->id;
                $courseId = $bsitCourse->id;
            } elseif (str_contains($section->name, 'Business Administration')) {
                $departmentId = $businessDept->id;
                $courseId = $bsbaCourse->id;
            } elseif (str_contains($section->name, 'Elementary Education')) {
                $departmentId = $educationDept->id;
                $courseId = $beedCourse->id;
            }
            
            $student = User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'student',
                    'year_level' => 'college',
                    'specific_year_level' => $section->specific_year_level,
                    'section_id' => $section->id,
                    'department_id' => $departmentId,
                    'course_id' => $courseId,
                    'student_number' => 'CO-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
            $createdStudents[] = $student;
        }

        return $createdStudents;
    }

    private function createInstructorCourseAssignments(array $instructors, $courses, int $academicLevelId, string $schoolYear): void
    {
        // Assign instructors to courses - one instructor per course
        $instructorIndex = 0;
        
        foreach ($courses as $course) {
            $instructor = $instructors[$instructorIndex % count($instructors)];
            
            InstructorCourseAssignment::create([
                'instructor_id' => $instructor->id,
                'course_id' => $course->id,
                'academic_level_id' => $academicLevelId,
                'school_year' => $schoolYear,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => 1, // Admin user
                'notes' => 'Automatically assigned for complete data setup',
            ]);
            
            $instructorIndex++;
        }
    }

    private function createInstructorSubjectAssignments(array $instructors, array $subjects, int $academicLevelId, string $schoolYear): void
    {
        foreach ($subjects as $subject) {
            // Assign an instructor to this subject
            $instructor = $instructors[array_rand($instructors)];
            
            InstructorSubjectAssignment::updateOrCreate(
                [
                    'instructor_id' => $instructor->id,
                    'subject_id' => $subject->id,
                    'academic_level_id' => $academicLevelId,
                    'school_year' => $schoolYear,
                ],
                [
                    'is_active' => true,
                    'assigned_at' => now(),
                    'assigned_by' => 1, // Admin user
                    'notes' => 'Automatically assigned for complete data setup',
                ]
            );
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
            $isHonorsSection = in_array($sectionCode, ['FY-CS-A', 'FY-IT-A', 'SY-CS-A', 'SY-IT-A', 'TY-CS-A', 'TY-IT-A', 'FOY-CS-A', 'FOY-IT-A']);
            
            if ($isHonorsSection) {
                // High Honors students: GPA 95-97, no grade below 90
                $baseGrade = 95;
                $gradeVariation = 3; // 95-97 range
                $minGrade = 90;
            } else {
                // Honors students: GPA 90-94, no grade below 85
                $baseGrade = 92;
                $gradeVariation = 4; // 90-94 range
                $minGrade = 85;
            }

            foreach ($subjects as $subject) {
                foreach ($gradingPeriods as $period) {
                    // Generate grades with some variation but maintaining honor standards
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
