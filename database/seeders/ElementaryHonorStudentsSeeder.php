<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Section;
use App\Models\Subject;
use App\Models\StudentGrade;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use App\Models\StudentSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use Illuminate\Support\Facades\Hash;

class ElementaryHonorStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating 2 additional Elementary honor students and organizing all 7 students under 1 section with 1 adviser...');
        
        $schoolYear = '2024-2025';
        $elemLevel = AcademicLevel::where('key', 'elementary')->first();
        
        if (!$elemLevel) {
            $this->command->error('Elementary academic level not found!');
            return;
        }

        // Get the honors section (Grade 1 - Sunflower) where Maria is already assigned
        $honorsSection = Section::where('code', 'G1-SUNFLOWER')->first();
        
        if (!$honorsSection) {
            $this->command->error('Grade 1 - Sunflower section not found!');
            return;
        }

        // Get existing subjects and grading periods
        $subjects = Subject::where('academic_level_id', $elemLevel->id)->get();
        $gradingPeriods = GradingPeriod::where('academic_level_id', $elemLevel->id)
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4'])
            ->orderBy('sort_order')
            ->get();

        // Create 2 new honor students
        $newStudents = [
            [
                'name' => 'Isabella Chen', 
                'email' => 'isabella.chen@elem.edu',
                'performance' => 'highest_honor' // 98-100 GPA
            ],
            [
                'name' => 'Alexander Kim', 
                'email' => 'alexander.kim@elem.edu',
                'performance' => 'high_honor' // 95-97 GPA
            ]
        ];

        $createdStudents = [];
        $studentIndex = 6; // Continue from existing 5 students

        foreach ($newStudents as $studentData) {
            $student = User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'student',
                    'year_level' => 'elementary',
                    'specific_year_level' => $honorsSection->specific_year_level,
                    'section_id' => $honorsSection->id,
                    'student_number' => 'ELEM-' . date('Y') . '-' . str_pad($studentIndex, 3, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
            
            $student->performance = $studentData['performance'];
            $createdStudents[] = $student;
            $studentIndex++;
            
            $this->command->info("Created honor student: {$student->name} ({$student->student_number}) in {$honorsSection->name}");
        }

        // Move all existing students to the same honors section
        $this->moveAllStudentsToHonorsSection($honorsSection, $elemLevel->id);

        // Ensure all 7 students have the same adviser
        $this->assignClassAdviser($honorsSection, $elemLevel->id, $schoolYear);

        // Create subject assignments for new students
        $this->createStudentSubjectAssignments($createdStudents, $subjects, $schoolYear);

        // Create grades for new students
        $this->createGradesForHonorStudents($createdStudents, $subjects, $gradingPeriods, $elemLevel->id, $schoolYear);

        $this->command->info('Successfully created 2 honor students and organized all 7 students in one section with one adviser!');
    }

    private function moveAllStudentsToHonorsSection($honorsSection, $academicLevelId): void
    {
        $this->command->info("Moving all Elementary students to {$honorsSection->name}...");
        
        $allStudents = User::where('year_level', 'elementary')->get();
        
        foreach ($allStudents as $student) {
            $student->section_id = $honorsSection->id;
            $student->specific_year_level = $honorsSection->specific_year_level;
            $student->save();
            
            $this->command->info("Moved {$student->name} to {$honorsSection->name}");
        }
    }

    private function assignClassAdviser($section, $academicLevelId, $schoolYear): void
    {
        $this->command->info("Assigning class adviser for {$section->name}...");
        
        // Get the first adviser for Elementary
        $adviser = User::where('user_role', 'adviser')
            ->whereHas('department', function($q) use ($academicLevelId) {
                $q->where('academic_level_id', $academicLevelId);
            })
            ->first();

        if (!$adviser) {
            $this->command->warn("No adviser found for Elementary level");
            return;
        }

        // Remove any existing class adviser assignments for this section
        ClassAdviserAssignment::where('academic_level_id', $academicLevelId)
            ->where('grade_level', $section->specific_year_level)
            ->where('school_year', $schoolYear)
            ->delete();

        // Create new class adviser assignment
        ClassAdviserAssignment::create([
            'adviser_id' => $adviser->id,
            'academic_level_id' => $academicLevelId,
            'grade_level' => $section->specific_year_level,
            'section' => $section->name,
            'school_year' => $schoolYear,
            'is_active' => true,
            'assigned_at' => now(),
            'assigned_by' => 1, // Admin user
            'notes' => 'Class adviser for all Elementary honor students in ' . $section->name,
        ]);

        $this->command->info("Assigned {$adviser->name} as class adviser for {$section->name}");
    }

    private function createStudentSubjectAssignments(array $students, $subjects, string $schoolYear): void
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

    private function createGradesForHonorStudents(array $students, $subjects, $gradingPeriods, int $academicLevelId, string $schoolYear): void
    {
        foreach ($students as $student) {
            $performance = $student->performance;
            
            // Set grade ranges based on performance level to ensure honor qualification
            switch ($performance) {
                case 'highest_honor':
                    $baseGrade = 99;
                    $gradeVariation = 1; // 98-100 range
                    $minGrade = 98;
                    break;
                case 'high_honor':
                    $baseGrade = 96;
                    $gradeVariation = 1; // 95-97 range
                    $minGrade = 95;
                    break;
                case 'honor':
                default:
                    $baseGrade = 92;
                    $gradeVariation = 2; // 90-94 range
                    $minGrade = 90;
                    break;
            }

            $this->command->info("Generating honor-level grades for {$student->name} with {$performance} performance (Base: {$baseGrade})");

            foreach ($subjects as $subject) {
                foreach ($gradingPeriods as $period) {
                    // Generate realistic grade variations per subject and quarter
                    $subjectModifier = $this->getSubjectModifier($subject->code);
                    $quarterModifier = $this->getQuarterModifier($period->code);
                    
                    $grade = $baseGrade + $subjectModifier + $quarterModifier + rand(-$gradeVariation, $gradeVariation);
                    
                    // Ensure minimum grade requirement for honor qualification
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

    private function getSubjectModifier(string $subjectCode): int
    {
        // Some subjects are typically easier/harder
        switch ($subjectCode) {
            case 'MATH-ELEM':
            case 'SCI-ELEM':
                return -1; // Math and Science slightly lower
            case 'MAPEH-ELEM':
            case 'ESP-ELEM':
                return 1; // MAPEH and ESP slightly higher
            case 'ENG-ELEM':
            case 'FIL-ELEM':
                return 0; // Language subjects neutral
            default:
                return 0; // Neutral for other subjects
        }
    }

    private function getQuarterModifier(string $quarterCode): int
    {
        // Realistic grade progression through the year
        switch ($quarterCode) {
            case 'Q1':
                return 0; // Starting strong
            case 'Q2':
                return 1; // Students improving
            case 'Q3':
                return -1; // Post-holiday adjustment
            case 'Q4':
                return 1; // Final push, good performance
            default:
                return 0;
        }
    }
}
