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
use Illuminate\Support\Facades\Hash;

class AdditionalElementaryStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating 5 additional Elementary students with real grade data...');
        
        $schoolYear = '2024-2025';
        $elemLevel = AcademicLevel::where('key', 'elementary')->first();
        
        if (!$elemLevel) {
            $this->command->error('Elementary academic level not found!');
            return;
        }

        // Get existing sections
        $sections = Section::where('academic_level_id', $elemLevel->id)->get();
        
        // Get existing subjects  
        $subjects = Subject::where('academic_level_id', $elemLevel->id)->get();
        
        // Get existing grading periods
        $gradingPeriods = GradingPeriod::where('academic_level_id', $elemLevel->id)
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4'])
            ->orderBy('sort_order')
            ->get();

        if ($sections->isEmpty() || $subjects->isEmpty() || $gradingPeriods->isEmpty()) {
            $this->command->error('Missing sections, subjects, or grading periods!');
            return;
        }

        // Create 5 students in different sections with varied performance levels
        $students = [
            [
                'name' => 'Maria Santos', 
                'email' => 'maria.santos@elem.edu', 
                'section_code' => 'G1-SUNFLOWER', // Honors section
                'performance' => 'high_honor' // 95-98 GPA
            ],
            [
                'name' => 'Juan Dela Cruz', 
                'email' => 'juan.delacruz@elem.edu', 
                'section_code' => 'G3-VIOLET', // Regular section
                'performance' => 'honor' // 90-94 GPA
            ],
            [
                'name' => 'Ana Rodriguez', 
                'email' => 'ana.rodriguez@elem.edu', 
                'section_code' => 'G5-LAVENDER', // Regular section
                'performance' => 'regular' // 80-89 GPA
            ],
            [
                'name' => 'Carlos Martinez', 
                'email' => 'carlos.martinez@elem.edu', 
                'section_code' => 'G6-LOTUS', // Honors section
                'performance' => 'highest_honor' // 98-100 GPA
            ],
            [
                'name' => 'Sofia Garcia', 
                'email' => 'sofia.garcia@elem.edu', 
                'section_code' => 'G4-PEONY', // Regular section
                'performance' => 'honor' // 90-94 GPA
            ],
        ];

        $createdStudents = [];
        $studentIndex = 37; // Continue from existing 36 students
        
        foreach ($students as $studentData) {
            $section = $sections->firstWhere('code', $studentData['section_code']);
            
            if (!$section) {
                $this->command->warn("Section {$studentData['section_code']} not found, skipping {$studentData['name']}");
                continue;
            }
            
            $student = User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'student',
                    'year_level' => 'elementary',
                    'specific_year_level' => $section->specific_year_level,
                    'section_id' => $section->id,
                    'student_number' => 'ELEM-' . date('Y') . '-' . str_pad($studentIndex, 3, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
            
            $student->performance = $studentData['performance']; // Store for grade generation
            $createdStudents[] = $student;
            $studentIndex++;
            
            $this->command->info("Created student: {$student->name} ({$student->student_number}) in {$section->name}");
        }

        // Create student subject assignments
        $this->createStudentSubjectAssignments($createdStudents, $subjects, $schoolYear);
        
        // Create grades for the new students
        $this->createGradesForStudents($createdStudents, $subjects, $gradingPeriods, $elemLevel->id, $schoolYear);
        
        $this->command->info('Successfully created 5 additional Elementary students with real grade data!');
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

    private function createGradesForStudents(array $students, $subjects, $gradingPeriods, int $academicLevelId, string $schoolYear): void
    {
        foreach ($students as $student) {
            $performance = $student->performance;
            
            // Set grade ranges based on performance level
            switch ($performance) {
                case 'highest_honor':
                    $baseGrade = 98;
                    $gradeVariation = 2; // 98-100 range
                    $minGrade = 96;
                    break;
                case 'high_honor':
                    $baseGrade = 96;
                    $gradeVariation = 2; // 95-98 range
                    $minGrade = 93;
                    break;
                case 'honor':
                    $baseGrade = 92;
                    $gradeVariation = 3; // 90-94 range
                    $minGrade = 88;
                    break;
                case 'regular':
                default:
                    $baseGrade = 84;
                    $gradeVariation = 6; // 80-89 range
                    $minGrade = 78;
                    break;
            }

            $this->command->info("Generating grades for {$student->name} with {$performance} performance (Base: {$baseGrade})");

            foreach ($subjects as $subject) {
                foreach ($gradingPeriods as $period) {
                    // Generate realistic grade variations per subject and quarter
                    $subjectModifier = $this->getSubjectModifier($subject->code);
                    $quarterModifier = $this->getQuarterModifier($period->code);
                    
                    $grade = $baseGrade + $subjectModifier + $quarterModifier + rand(-$gradeVariation, $gradeVariation);
                    
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

    private function getSubjectModifier(string $subjectCode): int
    {
        // Some subjects are typically easier/harder
        switch ($subjectCode) {
            case 'MATH-ELEM':
            case 'SCI-ELEM':
                return -2; // Math and Science tend to be slightly lower
            case 'MAPEH-ELEM':
            case 'ESP-ELEM':
                return 3; // MAPEH and ESP tend to be higher
            case 'ENG-ELEM':
            case 'FIL-ELEM':
                return 1; // Language subjects slightly above average
            default:
                return 0; // Neutral for other subjects
        }
    }

    private function getQuarterModifier(string $quarterCode): int
    {
        // Realistic grade progression through the year
        switch ($quarterCode) {
            case 'Q1':
                return -1; // Students still adjusting
            case 'Q2':
                return 1; // Students improving
            case 'Q3':
                return -1; // Post-holiday adjustment
            case 'Q4':
                return 2; // Final push, best performance
            default:
                return 0;
        }
    }
}
