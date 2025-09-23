<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Section;
use App\Models\Subject;
use App\Models\StudentGrade;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use Illuminate\Support\Facades\Hash;

class CollegeHonorTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating College honor test data...');
        
        $schoolYear = '2024-2025';
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        
        if (!$collegeLevel) {
            $this->command->error('College academic level not found!');
            return;
        }

        // Create sections for each year level
        $sections = $this->createSections($collegeLevel->id);
        
        // Create subjects for College
        $subjects = $this->createSubjects($collegeLevel->id);
        
        // Create grading periods for College
        $gradingPeriods = $this->createGradingPeriods($collegeLevel->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $collegeLevel->id, $schoolYear);
        
        $this->command->info('College honor test data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // First Year sections
            ['name' => 'First Year - Computer Science A', 'code' => 'FY-CS-A', 'specific_year_level' => 'first_year'],
            ['name' => 'First Year - Computer Science B', 'code' => 'FY-CS-B', 'specific_year_level' => 'first_year'],
            ['name' => 'First Year - Information Technology A', 'code' => 'FY-IT-A', 'specific_year_level' => 'first_year'],
            ['name' => 'First Year - Information Technology B', 'code' => 'FY-IT-B', 'specific_year_level' => 'first_year'],
            ['name' => 'First Year - Business Administration A', 'code' => 'FY-BA-A', 'specific_year_level' => 'first_year'],
            ['name' => 'First Year - Elementary Education A', 'code' => 'FY-EE-A', 'specific_year_level' => 'first_year'],
            
            // Second Year sections
            ['name' => 'Second Year - Computer Science A', 'code' => 'SY-CS-A', 'specific_year_level' => 'second_year'],
            ['name' => 'Second Year - Computer Science B', 'code' => 'SY-CS-B', 'specific_year_level' => 'second_year'],
            ['name' => 'Second Year - Information Technology A', 'code' => 'SY-IT-A', 'specific_year_level' => 'second_year'],
            ['name' => 'Second Year - Information Technology B', 'code' => 'SY-IT-B', 'specific_year_level' => 'second_year'],
            ['name' => 'Second Year - Business Administration A', 'code' => 'SY-BA-A', 'specific_year_level' => 'second_year'],
            ['name' => 'Second Year - Elementary Education A', 'code' => 'SY-EE-A', 'specific_year_level' => 'second_year'],
            
            // Third Year sections
            ['name' => 'Third Year - Computer Science A', 'code' => 'TY-CS-A', 'specific_year_level' => 'third_year'],
            ['name' => 'Third Year - Computer Science B', 'code' => 'TY-CS-B', 'specific_year_level' => 'third_year'],
            ['name' => 'Third Year - Information Technology A', 'code' => 'TY-IT-A', 'specific_year_level' => 'third_year'],
            ['name' => 'Third Year - Information Technology B', 'code' => 'TY-IT-B', 'specific_year_level' => 'third_year'],
            ['name' => 'Third Year - Business Administration A', 'code' => 'TY-BA-A', 'specific_year_level' => 'third_year'],
            ['name' => 'Third Year - Elementary Education A', 'code' => 'TY-EE-A', 'specific_year_level' => 'third_year'],
            
            // Fourth Year sections
            ['name' => 'Fourth Year - Computer Science A', 'code' => 'FOY-CS-A', 'specific_year_level' => 'fourth_year'],
            ['name' => 'Fourth Year - Computer Science B', 'code' => 'FOY-CS-B', 'specific_year_level' => 'fourth_year'],
            ['name' => 'Fourth Year - Information Technology A', 'code' => 'FOY-IT-A', 'specific_year_level' => 'fourth_year'],
            ['name' => 'Fourth Year - Information Technology B', 'code' => 'FOY-IT-B', 'specific_year_level' => 'fourth_year'],
            ['name' => 'Fourth Year - Business Administration A', 'code' => 'FOY-BA-A', 'specific_year_level' => 'fourth_year'],
            ['name' => 'Fourth Year - Elementary Education A', 'code' => 'FOY-EE-A', 'specific_year_level' => 'fourth_year'],
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
            ['name' => 'Calculus I', 'code' => 'CALC1-COL', 'description' => 'College Calculus I'],
            ['name' => 'English Composition', 'code' => 'ENGCOMP-COL', 'description' => 'College English Composition'],
            ['name' => 'General Chemistry', 'code' => 'GENCHEM-COL', 'description' => 'College General Chemistry'],
            ['name' => 'Introduction to Psychology', 'code' => 'PSYCH-COL', 'description' => 'College Introduction to Psychology'],
            ['name' => 'Computer Programming', 'code' => 'PROG-COL', 'description' => 'College Computer Programming'],
            ['name' => 'Data Structures and Algorithms', 'code' => 'DSA-COL', 'description' => 'College Data Structures and Algorithms'],
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

    private function createTestStudents(array $sections): array
    {
        $students = [
            // First Year - Computer Science A (High Honors students)
            ['name' => 'Alexander Thompson', 'email' => 'alexander.thompson@college.edu', 'section_code' => 'FY-CS-A'],
            ['name' => 'Bella Rodriguez', 'email' => 'bella.rodriguez@college.edu', 'section_code' => 'FY-CS-A'],
            
            // First Year - Computer Science B (Honors students)
            ['name' => 'Christopher Anderson', 'email' => 'christopher.anderson@college.edu', 'section_code' => 'FY-CS-B'],
            ['name' => 'Diana Martinez', 'email' => 'diana.martinez@college.edu', 'section_code' => 'FY-CS-B'],
            
            // First Year - Information Technology A (High Honors students)
            ['name' => 'Ethan Wilson', 'email' => 'ethan.wilson@college.edu', 'section_code' => 'FY-IT-A'],
            ['name' => 'Fiona Davis', 'email' => 'fiona.davis@college.edu', 'section_code' => 'FY-IT-A'],
            
            // First Year - Information Technology B (Honors students)
            ['name' => 'Gabriel Taylor', 'email' => 'gabriel.taylor@college.edu', 'section_code' => 'FY-IT-B'],
            ['name' => 'Hannah Brown', 'email' => 'hannah.brown@college.edu', 'section_code' => 'FY-IT-B'],
            
            // Second Year - Computer Science A (High Honors students)
            ['name' => 'Isaac Garcia', 'email' => 'isaac.garcia@college.edu', 'section_code' => 'SY-CS-A'],
            ['name' => 'Julia Miller', 'email' => 'julia.miller@college.edu', 'section_code' => 'SY-CS-A'],
            
            // Second Year - Computer Science B (Honors students)
            ['name' => 'Kevin Johnson', 'email' => 'kevin.johnson@college.edu', 'section_code' => 'SY-CS-B'],
            ['name' => 'Luna White', 'email' => 'luna.white@college.edu', 'section_code' => 'SY-CS-B'],
            
            // Second Year - Information Technology A (High Honors students)
            ['name' => 'Marcus Lee', 'email' => 'marcus.lee@college.edu', 'section_code' => 'SY-IT-A'],
            ['name' => 'Natalie Clark', 'email' => 'natalie.clark@college.edu', 'section_code' => 'SY-IT-A'],
            
            // Second Year - Information Technology B (Honors students)
            ['name' => 'Oliver Adams', 'email' => 'oliver.adams@college.edu', 'section_code' => 'SY-IT-B'],
            ['name' => 'Penelope Hall', 'email' => 'penelope.hall@college.edu', 'section_code' => 'SY-IT-B'],
            
            // Third Year - Computer Science A (High Honors students)
            ['name' => 'Quinn Turner', 'email' => 'quinn.turner@college.edu', 'section_code' => 'TY-CS-A'],
            ['name' => 'Riley Parker', 'email' => 'riley.parker@college.edu', 'section_code' => 'TY-CS-A'],
            
            // Third Year - Computer Science B (Honors students)
            ['name' => 'Sophia Evans', 'email' => 'sophia.evans@college.edu', 'section_code' => 'TY-CS-B'],
            ['name' => 'Tyler Reed', 'email' => 'tyler.reed@college.edu', 'section_code' => 'TY-CS-B'],
            
            // Third Year - Information Technology A (High Honors students)
            ['name' => 'Uma Cook', 'email' => 'uma.cook@college.edu', 'section_code' => 'TY-IT-A'],
            ['name' => 'Vincent Bell', 'email' => 'vincent.bell@college.edu', 'section_code' => 'TY-IT-A'],
            
            // Third Year - Information Technology B (Honors students)
            ['name' => 'Willow Murphy', 'email' => 'willow.murphy@college.edu', 'section_code' => 'TY-IT-B'],
            ['name' => 'Xavier Bailey', 'email' => 'xavier.bailey@college.edu', 'section_code' => 'TY-IT-B'],
            
            // Fourth Year - Computer Science A (High Honors students)
            ['name' => 'Yara Rivera', 'email' => 'yara.rivera@college.edu', 'section_code' => 'FOY-CS-A'],
            ['name' => 'Zane Cooper', 'email' => 'zane.cooper@college.edu', 'section_code' => 'FOY-CS-A'],
            
            // Fourth Year - Computer Science B (Honors students)
            ['name' => 'Aria Richardson', 'email' => 'aria.richardson@college.edu', 'section_code' => 'FOY-CS-B'],
            ['name' => 'Blake Cox', 'email' => 'blake.cox@college.edu', 'section_code' => 'FOY-CS-B'],
            
            // Fourth Year - Information Technology A (High Honors students)
            ['name' => 'Chloe Ward', 'email' => 'chloe.ward@college.edu', 'section_code' => 'FOY-IT-A'],
            ['name' => 'Diego Torres', 'email' => 'diego.torres@college.edu', 'section_code' => 'FOY-IT-A'],
            
            // Fourth Year - Information Technology B (Honors students)
            ['name' => 'Emma Peterson', 'email' => 'emma.peterson@college.edu', 'section_code' => 'FOY-IT-B'],
            ['name' => 'Felix Gray', 'email' => 'felix.gray@college.edu', 'section_code' => 'FOY-IT-B'],
            
            // Business Administration students
            ['name' => 'Grace Williams', 'email' => 'grace.williams@college.edu', 'section_code' => 'FY-BA-A'],
            ['name' => 'Henry Jones', 'email' => 'henry.jones@college.edu', 'section_code' => 'FY-BA-A'],
            ['name' => 'Ivy Smith', 'email' => 'ivy.smith@college.edu', 'section_code' => 'SY-BA-A'],
            ['name' => 'Jack Davis', 'email' => 'jack.davis@college.edu', 'section_code' => 'SY-BA-A'],
            ['name' => 'Kate Brown', 'email' => 'kate.brown@college.edu', 'section_code' => 'TY-BA-A'],
            ['name' => 'Leo Wilson', 'email' => 'leo.wilson@college.edu', 'section_code' => 'TY-BA-A'],
            ['name' => 'Maya Moore', 'email' => 'maya.moore@college.edu', 'section_code' => 'FOY-BA-A'],
            ['name' => 'Noah Taylor', 'email' => 'noah.taylor@college.edu', 'section_code' => 'FOY-BA-A'],
            
            // Elementary Education students
            ['name' => 'Olivia Anderson', 'email' => 'olivia.anderson@college.edu', 'section_code' => 'FY-EE-A'],
            ['name' => 'Peter Thomas', 'email' => 'peter.thomas@college.edu', 'section_code' => 'FY-EE-A'],
            ['name' => 'Quinn Jackson', 'email' => 'quinn.jackson@college.edu', 'section_code' => 'SY-EE-A'],
            ['name' => 'Ruby White', 'email' => 'ruby.white@college.edu', 'section_code' => 'SY-EE-A'],
            ['name' => 'Samuel Harris', 'email' => 'samuel.harris@college.edu', 'section_code' => 'TY-EE-A'],
            ['name' => 'Tara Martin', 'email' => 'tara.martin@college.edu', 'section_code' => 'TY-EE-A'],
            ['name' => 'Uriah Thompson', 'email' => 'uriah.thompson@college.edu', 'section_code' => 'FOY-EE-A'],
            ['name' => 'Vera Garcia', 'email' => 'vera.garcia@college.edu', 'section_code' => 'FOY-EE-A'],
        ];

        // Get departments and courses for assignment
        $computerDept = \App\Models\Department::where('code', 'COMP')->first();
        $businessDept = \App\Models\Department::where('code', 'BUS')->first();
        $educationDept = \App\Models\Department::where('code', 'EDU')->first();
        
        $bscsCourse = \App\Models\Course::where('code', 'BSCS')->first();
        $bsitCourse = \App\Models\Course::where('code', 'BSIT')->first();
        $bsbaCourse = \App\Models\Course::where('code', 'BSBA')->first();
        $beedCourse = \App\Models\Course::where('code', 'BEED')->first();

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

    private function createGradesForStudents(array $students, array $subjects, array $gradingPeriods, int $academicLevelId, string $schoolYear): void
    {
        foreach ($students as $student) {
            $sectionCode = $student->section->code;
            
            // Determine grade range based on section
            $isHighHonorsSection = in_array($sectionCode, ['FY-CS-A', 'FY-IT-A', 'SY-CS-A', 'SY-IT-A', 'TY-CS-A', 'TY-IT-A', 'FOY-CS-A', 'FOY-IT-A']);
            
            if ($isHighHonorsSection) {
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
