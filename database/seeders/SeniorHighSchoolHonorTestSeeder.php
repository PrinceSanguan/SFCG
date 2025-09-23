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

class SeniorHighSchoolHonorTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Senior High School honor test data...');
        
        $schoolYear = '2024-2025';
        $seniorHighSchoolLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        
        if (!$seniorHighSchoolLevel) {
            $this->command->error('Senior High School academic level not found!');
            return;
        }

        // Create sections for each grade level
        $sections = $this->createSections($seniorHighSchoolLevel->id);
        
        // Create subjects for Senior High School
        $subjects = $this->createSubjects($seniorHighSchoolLevel->id);
        
        // Create grading periods for Senior High School
        $gradingPeriods = $this->createGradingPeriods($seniorHighSchoolLevel->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $seniorHighSchoolLevel->id, $schoolYear);
        
        $this->command->info('Senior High School honor test data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // Grade 11 sections
            ['name' => 'Grade 11 - STEM Einstein', 'code' => 'G11-STEM-EINSTEIN', 'specific_year_level' => 'grade_11'],
            ['name' => 'Grade 11 - STEM Hawking', 'code' => 'G11-STEM-HAWKING', 'specific_year_level' => 'grade_11'],
            ['name' => 'Grade 11 - HUMSS Socrates', 'code' => 'G11-HUMSS-SOCRATES', 'specific_year_level' => 'grade_11'],
            ['name' => 'Grade 11 - HUMSS Plato', 'code' => 'G11-HUMSS-PLATO', 'specific_year_level' => 'grade_11'],
            
            // Grade 12 sections
            ['name' => 'Grade 12 - STEM Newton', 'code' => 'G12-STEM-NEWTON', 'specific_year_level' => 'grade_12'],
            ['name' => 'Grade 12 - STEM Curie', 'code' => 'G12-STEM-CURIE', 'specific_year_level' => 'grade_12'],
            ['name' => 'Grade 12 - HUMSS Aristotle', 'code' => 'G12-HUMSS-ARISTOTLE', 'specific_year_level' => 'grade_12'],
            ['name' => 'Grade 12 - HUMSS Confucius', 'code' => 'G12-HUMSS-CONFUCIUS', 'specific_year_level' => 'grade_12'],
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
            ['name' => 'General Mathematics', 'code' => 'GENMATH-SHS', 'description' => 'Senior High School General Mathematics'],
            ['name' => 'English for Academic and Professional Purposes', 'code' => 'EAPP-SHS', 'description' => 'Senior High School EAPP'],
            ['name' => 'Earth and Life Science', 'code' => 'ELS-SHS', 'description' => 'Senior High School Earth and Life Science'],
            ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP-SHS', 'description' => 'Senior High School UCSP'],
            ['name' => 'Personal Development', 'code' => 'PD-SHS', 'description' => 'Senior High School Personal Development'],
            ['name' => 'Media and Information Literacy', 'code' => 'MIL-SHS', 'description' => 'Senior High School MIL'],
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
            // Grade 11 - STEM Einstein (High Honors students)
            ['name' => 'Aria Thompson', 'email' => 'aria.thompson@shs.edu', 'section_code' => 'G11-STEM-EINSTEIN'],
            ['name' => 'Blake Rodriguez', 'email' => 'blake.rodriguez@shs.edu', 'section_code' => 'G11-STEM-EINSTEIN'],
            
            // Grade 11 - STEM Hawking (Honors students)
            ['name' => 'Chloe Anderson', 'email' => 'chloe.anderson@shs.edu', 'section_code' => 'G11-STEM-HAWKING'],
            ['name' => 'Dylan Martinez', 'email' => 'dylan.martinez@shs.edu', 'section_code' => 'G11-STEM-HAWKING'],
            
            // Grade 11 - HUMSS Socrates (High Honors students)
            ['name' => 'Emma Wilson', 'email' => 'emma.wilson@shs.edu', 'section_code' => 'G11-HUMSS-SOCRATES'],
            ['name' => 'Finn Davis', 'email' => 'finn.davis@shs.edu', 'section_code' => 'G11-HUMSS-SOCRATES'],
            
            // Grade 11 - HUMSS Plato (Honors students)
            ['name' => 'Grace Taylor', 'email' => 'grace.taylor@shs.edu', 'section_code' => 'G11-HUMSS-PLATO'],
            ['name' => 'Henry Brown', 'email' => 'henry.brown@shs.edu', 'section_code' => 'G11-HUMSS-PLATO'],
            
            // Grade 12 - STEM Newton (High Honors students)
            ['name' => 'Ivy Garcia', 'email' => 'ivy.garcia@shs.edu', 'section_code' => 'G12-STEM-NEWTON'],
            ['name' => 'Jake Miller', 'email' => 'jake.miller@shs.edu', 'section_code' => 'G12-STEM-NEWTON'],
            
            // Grade 12 - STEM Curie (Honors students)
            ['name' => 'Kate Johnson', 'email' => 'kate.johnson@shs.edu', 'section_code' => 'G12-STEM-CURIE'],
            ['name' => 'Liam White', 'email' => 'liam.white@shs.edu', 'section_code' => 'G12-STEM-CURIE'],
            
            // Grade 12 - HUMSS Aristotle (High Honors students)
            ['name' => 'Maya Lee', 'email' => 'maya.lee@shs.edu', 'section_code' => 'G12-HUMSS-ARISTOTLE'],
            ['name' => 'Noah Clark', 'email' => 'noah.clark@shs.edu', 'section_code' => 'G12-HUMSS-ARISTOTLE'],
            
            // Grade 12 - HUMSS Confucius (Honors students)
            ['name' => 'Olivia Adams', 'email' => 'olivia.adams@shs.edu', 'section_code' => 'G12-HUMSS-CONFUCIUS'],
            ['name' => 'Preston Hall', 'email' => 'preston.hall@shs.edu', 'section_code' => 'G12-HUMSS-CONFUCIUS'],
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
                    'year_level' => 'senior_highschool',
                    'specific_year_level' => $section->specific_year_level,
                    'section_id' => $section->id,
                    'student_number' => 'SH-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
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
            $isHighHonorsSection = in_array($sectionCode, ['G11-STEM-EINSTEIN', 'G11-HUMSS-SOCRATES', 'G12-STEM-NEWTON', 'G12-HUMSS-ARISTOTLE']);
            
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
