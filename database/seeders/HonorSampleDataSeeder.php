<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\Subject;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use Illuminate\Support\Facades\Hash;

class HonorSampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Honor Sample Data...');

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Get honor types
        $withHonors = HonorType::where('key', 'with_honors')->first();
        $withHighHonors = HonorType::where('key', 'with_high_honors')->first();
        $withHighestHonors = HonorType::where('key', 'with_highest_honors')->first();
        $deansList = HonorType::where('key', 'deans_list')->first();
        $collegeHonors = HonorType::where('key', 'college_honors')->first();
        $cumLaude = HonorType::where('key', 'cum_laude')->first();
        $magnaCumLaude = HonorType::where('key', 'magna_cum_laude')->first();
        $summaCumLaude = HonorType::where('key', 'summa_cum_laude')->first();

        // Get or create subjects for different levels
        $this->createSubjects();
        $subjects = Subject::all();
        $gradingPeriods = GradingPeriod::all();

        $schoolYear = '2024-2025';

        // Create sample students with qualifying grades
        $this->createElementaryStudent($elementary, $withHonors, $subjects, $gradingPeriods, $schoolYear);
        $this->createJuniorHighStudent($juniorHigh, $withHighHonors, $subjects, $gradingPeriods, $schoolYear);
        $this->createSeniorHighStudent($seniorHigh, $withHighestHonors, $subjects, $gradingPeriods, $schoolYear);
        $this->createCollegeStudents($college, $deansList, $collegeHonors, $cumLaude, $magnaCumLaude, $summaCumLaude, $subjects, $gradingPeriods, $schoolYear);

        $this->command->info('Honor Sample Data seeded successfully!');
    }

    private function createSubjects()
    {
        $subjects = [
            // Elementary subjects
            ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'academic_level_id' => 1],
            ['name' => 'English', 'code' => 'ENG-ELEM', 'academic_level_id' => 1],
            ['name' => 'Science', 'code' => 'SCI-ELEM', 'academic_level_id' => 1],
            ['name' => 'Social Studies', 'code' => 'SOC-ELEM', 'academic_level_id' => 1],
            ['name' => 'Filipino', 'code' => 'FIL-ELEM', 'academic_level_id' => 1],
            
            // Junior High subjects
            ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'academic_level_id' => 2],
            ['name' => 'English', 'code' => 'ENG-JHS', 'academic_level_id' => 2],
            ['name' => 'Science', 'code' => 'SCI-JHS', 'academic_level_id' => 2],
            ['name' => 'Social Studies', 'code' => 'SOC-JHS', 'academic_level_id' => 2],
            ['name' => 'Filipino', 'code' => 'FIL-JHS', 'academic_level_id' => 2],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-JHS', 'academic_level_id' => 2],
            
            // Senior High subjects
            ['name' => 'General Mathematics', 'code' => 'GENMATH-SHS', 'academic_level_id' => 3],
            ['name' => 'English for Academic and Professional Purposes', 'code' => 'EAPP-SHS', 'academic_level_id' => 3],
            ['name' => 'Earth and Life Science', 'code' => 'ELS-SHS', 'academic_level_id' => 3],
            ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP-SHS', 'academic_level_id' => 3],
            ['name' => 'Personal Development', 'code' => 'PD-SHS', 'academic_level_id' => 3],
            
            // College subjects
            ['name' => 'Calculus I', 'code' => 'CALC1-COL', 'academic_level_id' => 4],
            ['name' => 'English Composition', 'code' => 'ENGCOMP-COL', 'academic_level_id' => 4],
            ['name' => 'General Chemistry', 'code' => 'GENCHEM-COL', 'academic_level_id' => 4],
            ['name' => 'Introduction to Psychology', 'code' => 'PSYCH-COL', 'academic_level_id' => 4],
            ['name' => 'Computer Programming', 'code' => 'PROG-COL', 'academic_level_id' => 4],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }

    private function createElementaryStudent($level, $honorType, $subjects, $gradingPeriods, $schoolYear)
    {
        // Create student with GPA ≥ 90 (With Honors)
        $student = User::updateOrCreate(
            ['email' => 'elementary.honor@school.edu'],
            [
                'name' => 'Maria Santos',
                'email' => 'elementary.honor@school.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'elementary',
                'student_number' => 'EL-2024-001',
                'email_verified_at' => now(),
            ]
        );

        // Add grades that result in GPA ≥ 90
        $elementarySubjects = $subjects->where('academic_level_id', $level->id);
        foreach ($elementarySubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(90, 95), // Grades 90-95 for With Honors
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        // Create honor result
        $this->createHonorResult($student, $honorType, $level, $schoolYear, 92.5);
    }

    private function createJuniorHighStudent($level, $honorType, $subjects, $gradingPeriods, $schoolYear)
    {
        // Create student with GPA 95-97, no grade below 90 (With High Honors)
        $student = User::updateOrCreate(
            ['email' => 'junior.high.honor@school.edu'],
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'junior.high.honor@school.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'junior_highschool',
                'student_number' => 'JH-2024-001',
                'email_verified_at' => now(),
            ]
        );

        // Add grades that result in GPA 95-97, no grade below 90
        $juniorHighSubjects = $subjects->where('academic_level_id', $level->id);
        foreach ($juniorHighSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(90, 97), // Grades 90-97 for With High Honors
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        // Create honor result
        $this->createHonorResult($student, $honorType, $level, $schoolYear, 95.8);
    }

    private function createSeniorHighStudent($level, $honorType, $subjects, $gradingPeriods, $schoolYear)
    {
        // Create student with GPA 98-100, no grade below 93 (With Highest Honors)
        $student = User::updateOrCreate(
            ['email' => 'senior.high.honor@school.edu'],
            [
                'name' => 'Ana Rodriguez',
                'email' => 'senior.high.honor@school.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'senior_highschool',
                'student_number' => 'SH-2024-001',
                'email_verified_at' => now(),
            ]
        );

        // Add grades that result in GPA 98-100, no grade below 93
        $seniorHighSubjects = $subjects->where('academic_level_id', $level->id);
        foreach ($seniorHighSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(93, 100), // Grades 93-100 for With Highest Honors
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        // Create honor result
        $this->createHonorResult($student, $honorType, $level, $schoolYear, 98.2);
    }

    private function createCollegeStudents($level, $deansList, $collegeHonors, $cumLaude, $magnaCumLaude, $summaCumLaude, $subjects, $gradingPeriods, $schoolYear)
    {
        // 1. Dean's List Student (2nd year, GPA ≥ 92, no grade below 90)
        $deansListStudent = User::updateOrCreate(
            ['email' => 'deans.list@college.edu'],
            [
                'name' => 'Carlos Mendoza',
                'email' => 'deans.list@college.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'college',
                'student_number' => 'CO-2024-001',
                'email_verified_at' => now(),
            ]
        );

        $collegeSubjects = $subjects->where('academic_level_id', $level->id);
        foreach ($collegeSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $deansListStudent->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(90, 95), // Grades 90-95 for Dean's List
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        $this->createHonorResult($deansListStudent, $deansList, $level, $schoolYear, 93.5);

        // 2. College Honors Student (no grade below 85)
        $collegeHonorsStudent = User::updateOrCreate(
            ['email' => 'college.honors@college.edu'],
            [
                'name' => 'Sofia Garcia',
                'email' => 'college.honors@college.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'college',
                'student_number' => 'CO-2024-002',
                'email_verified_at' => now(),
            ]
        );

        foreach ($collegeSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $collegeHonorsStudent->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(85, 92), // Grades 85-92 for College Honors
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        $this->createHonorResult($collegeHonorsStudent, $collegeHonors, $level, $schoolYear, 88.7);

        // 3. Cum Laude Student (no grade below 87)
        $cumLaudeStudent = User::updateOrCreate(
            ['email' => 'cum.laude@college.edu'],
            [
                'name' => 'Miguel Torres',
                'email' => 'cum.laude@college.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'college',
                'student_number' => 'CO-2024-003',
                'email_verified_at' => now(),
            ]
        );

        foreach ($collegeSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $cumLaudeStudent->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(87, 94), // Grades 87-94 for Cum Laude
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        $this->createHonorResult($cumLaudeStudent, $cumLaude, $level, $schoolYear, 90.3);

        // 4. Magna Cum Laude Student (no grade below 93)
        $magnaCumLaudeStudent = User::updateOrCreate(
            ['email' => 'magna.cum.laude@college.edu'],
            [
                'name' => 'Isabella Reyes',
                'email' => 'magna.cum.laude@college.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'college',
                'student_number' => 'CO-2024-004',
                'email_verified_at' => now(),
            ]
        );

        foreach ($collegeSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $magnaCumLaudeStudent->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(93, 98), // Grades 93-98 for Magna Cum Laude
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        $this->createHonorResult($magnaCumLaudeStudent, $magnaCumLaude, $level, $schoolYear, 95.8);

        // 5. Summa Cum Laude Student (no grade below 95)
        $summaCumLaudeStudent = User::updateOrCreate(
            ['email' => 'summa.cum.laude@college.edu'],
            [
                'name' => 'Diego Silva',
                'email' => 'summa.cum.laude@college.edu',
                'password' => Hash::make('password'),
                'user_role' => 'student',
                'year_level' => 'college',
                'student_number' => 'CO-2024-005',
                'email_verified_at' => now(),
            ]
        );

        foreach ($collegeSubjects as $subject) {
            foreach ($gradingPeriods as $period) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $summaCumLaudeStudent->id,
                        'subject_id' => $subject->id,
                        'academic_level_id' => $level->id,
                        'grading_period_id' => $period->id,
                        'school_year' => $schoolYear,
                    ],
                    [
                        'grade' => rand(95, 100), // Grades 95-100 for Summa Cum Laude
                        'units' => 1.0,
                        'is_final' => true,
                    ]
                );
            }
        }

        $this->createHonorResult($summaCumLaudeStudent, $summaCumLaude, $level, $schoolYear, 97.9);
    }

    private function createHonorResult($student, $honorType, $academicLevel, $schoolYear, $gpa)
    {
        HonorResult::updateOrCreate(
            [
                'student_id' => $student->id,
                'honor_type_id' => $honorType->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ],
            [
                'gpa' => $gpa,
                'is_overridden' => false,
            ]
        );
    }
}
