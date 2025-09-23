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

class JuniorHighSchoolHonorTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Junior High School honor test data...');
        
        $schoolYear = '2024-2025';
        $juniorHighSchoolLevel = AcademicLevel::where('key', 'junior_highschool')->first();
        
        if (!$juniorHighSchoolLevel) {
            $this->command->error('Junior High School academic level not found!');
            return;
        }

        // Create sections for each grade level
        $sections = $this->createSections($juniorHighSchoolLevel->id);
        
        // Create subjects for Junior High School
        $subjects = $this->createSubjects($juniorHighSchoolLevel->id);
        
        // Create grading periods for Junior High School
        $gradingPeriods = $this->createGradingPeriods($juniorHighSchoolLevel->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $juniorHighSchoolLevel->id, $schoolYear);
        
        $this->command->info('Junior High School honor test data created successfully!');
    }

    private function createSections(int $academicLevelId): array
    {
        $sections = [
            // Grade 7 sections
            ['name' => 'Grade 7 - Archimedes', 'code' => 'G7-ARCHIMEDES', 'specific_year_level' => 'grade_7'],
            ['name' => 'Grade 7 - Galileo', 'code' => 'G7-GALILEO', 'specific_year_level' => 'grade_7'],
            
            // Grade 8 sections
            ['name' => 'Grade 8 - Kepler', 'code' => 'G8-KEPLER', 'specific_year_level' => 'grade_8'],
            ['name' => 'Grade 8 - Copernicus', 'code' => 'G8-COPERNICUS', 'specific_year_level' => 'grade_8'],
            
            // Grade 9 sections
            ['name' => 'Grade 9 - Tesla', 'code' => 'G9-TESLA', 'specific_year_level' => 'grade_9'],
            ['name' => 'Grade 9 - Edison', 'code' => 'G9-EDISON', 'specific_year_level' => 'grade_9'],
            
            // Grade 10 sections
            ['name' => 'Grade 10 - Franklin', 'code' => 'G10-FRANKLIN', 'specific_year_level' => 'grade_10'],
            ['name' => 'Grade 10 - Volta', 'code' => 'G10-VOLTA', 'specific_year_level' => 'grade_10'],
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
            ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'description' => 'Junior High School Mathematics'],
            ['name' => 'English', 'code' => 'ENG-JHS', 'description' => 'Junior High School English'],
            ['name' => 'Science', 'code' => 'SCI-JHS', 'description' => 'Junior High School Science'],
            ['name' => 'Social Studies', 'code' => 'SOC-JHS', 'description' => 'Junior High School Social Studies'],
            ['name' => 'Filipino', 'code' => 'FIL-JHS', 'description' => 'Junior High School Filipino'],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-JHS', 'description' => 'Junior High School TLE'],
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
            ['name' => 'First Quarter', 'code' => 'Q1', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 1],
            ['name' => 'Second Quarter', 'code' => 'Q2', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 2],
            ['name' => 'Third Quarter', 'code' => 'Q3', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 3],
            ['name' => 'Fourth Quarter', 'code' => 'Q4', 'type' => 'quarter', 'period_type' => 'quarter', 'sort_order' => 4],
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
            // Grade 7 - Archimedes (High Honors students)
            ['name' => 'Alexandra Rodriguez', 'email' => 'alexandra.rodriguez@jhs.edu', 'section_code' => 'G7-ARCHIMEDES'],
            ['name' => 'Benjamin Kim', 'email' => 'benjamin.kim@jhs.edu', 'section_code' => 'G7-ARCHIMEDES'],
            
            // Grade 7 - Galileo (Honors students)
            ['name' => 'Catherine Lee', 'email' => 'catherine.lee@jhs.edu', 'section_code' => 'G7-GALILEO'],
            ['name' => 'Daniel Park', 'email' => 'daniel.park@jhs.edu', 'section_code' => 'G7-GALILEO'],
            
            // Grade 8 - Kepler (High Honors students)
            ['name' => 'Elena Martinez', 'email' => 'elena.martinez@jhs.edu', 'section_code' => 'G8-KEPLER'],
            ['name' => 'Felix Chen', 'email' => 'felix.chen@jhs.edu', 'section_code' => 'G8-KEPLER'],
            
            // Grade 8 - Copernicus (Honors students)
            ['name' => 'Gabriela Santos', 'email' => 'gabriela.santos@jhs.edu', 'section_code' => 'G8-COPERNICUS'],
            ['name' => 'Hector Torres', 'email' => 'hector.torres@jhs.edu', 'section_code' => 'G8-COPERNICUS'],
            
            // Grade 9 - Tesla (High Honors students)
            ['name' => 'Isabella Cruz', 'email' => 'isabella.cruz@jhs.edu', 'section_code' => 'G9-TESLA'],
            ['name' => 'Javier Ramos', 'email' => 'javier.ramos@jhs.edu', 'section_code' => 'G9-TESLA'],
            
            // Grade 9 - Edison (Honors students)
            ['name' => 'Katherine Wong', 'email' => 'katherine.wong@jhs.edu', 'section_code' => 'G9-EDISON'],
            ['name' => 'Liam O\'Connor', 'email' => 'liam.oconnor@jhs.edu', 'section_code' => 'G9-EDISON'],
            
            // Grade 10 - Franklin (High Honors students)
            ['name' => 'Maya Patel', 'email' => 'maya.patel@jhs.edu', 'section_code' => 'G10-FRANKLIN'],
            ['name' => 'Nathaniel Davis', 'email' => 'nathaniel.davis@jhs.edu', 'section_code' => 'G10-FRANKLIN'],
            
            // Grade 10 - Volta (Honors students)
            ['name' => 'Olivia Thompson', 'email' => 'olivia.thompson@jhs.edu', 'section_code' => 'G10-VOLTA'],
            ['name' => 'Preston Wilson', 'email' => 'preston.wilson@jhs.edu', 'section_code' => 'G10-VOLTA'],
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
                    'student_number' => 'JH-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
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
            $isHighHonorsSection = in_array($sectionCode, ['G7-ARCHIMEDES', 'G8-KEPLER', 'G9-TESLA', 'G10-FRANKLIN']);
            
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
