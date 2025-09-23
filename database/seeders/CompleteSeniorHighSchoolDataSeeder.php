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
use App\Models\Track;
use App\Models\Strand;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\StudentSubjectAssignment;
use Illuminate\Support\Facades\Hash;

class CompleteSeniorHighSchoolDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating complete Senior High School data with teachers, advisers, subjects, and assignments...');
        
        $schoolYear = '2024-2025';
        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        $shsDept = Department::where('academic_level_id', 3)->first();
        
        if (!$shsLevel) {
            $this->command->error('Senior High School academic level not found!');
            return;
        }

        // Create tracks and strands
        $tracks = $this->createTracks();
        $strands = $this->createStrands($tracks);
        
        // Create sections for each grade level and strand
        $sections = $this->createSections($shsLevel->id, $strands);
        
        // Create subjects for Senior High School
        $subjects = $this->createSubjects($shsLevel->id);
        
        // Create grading periods for Senior High School
        $gradingPeriods = $this->createGradingPeriods($shsLevel->id);
        
        // Create teachers for Senior High School
        $teachers = $this->createTeachers($shsDept->id);
        
        // Create advisers for Senior High School
        $advisers = $this->createAdvisers($shsDept->id);
        
        // Create test students
        $students = $this->createTestStudents($sections);
        
        // Create teacher subject assignments
        $this->createTeacherSubjectAssignments($teachers, $subjects, $shsLevel->id, $schoolYear, $strands);
        
        // Create class adviser assignments
        $this->createClassAdviserAssignments($advisers, $sections, $shsLevel->id, $schoolYear);
        
        // Create student subject assignments
        $this->createStudentSubjectAssignments($students, $subjects, $schoolYear);
        
        // Create grades for students
        $this->createGradesForStudents($students, $subjects, $gradingPeriods, $shsLevel->id, $schoolYear);
        
        $this->command->info('Complete Senior High School data created successfully!');
    }

    private function createTracks(): array
    {
        $tracks = [
            ['name' => 'Academic Track', 'code' => 'ACAD', 'description' => 'Academic Track for College Preparation'],
            ['name' => 'Technical-Vocational-Livelihood Track', 'code' => 'TVL', 'description' => 'Technical-Vocational-Livelihood Track'],
            ['name' => 'Sports Track', 'code' => 'SPORTS', 'description' => 'Sports Track'],
            ['name' => 'Arts and Design Track', 'code' => 'ARTS', 'description' => 'Arts and Design Track'],
        ];

        $createdTracks = [];
        foreach ($tracks as $trackData) {
            $track = Track::updateOrCreate(
                ['code' => $trackData['code']],
                $trackData
            );
            $createdTracks[] = $track;
        }

        return $createdTracks;
    }

    private function createStrands(array $tracks): array
    {
        $strands = [
            // Academic Track
            ['name' => 'Science, Technology, Engineering, and Mathematics', 'code' => 'STEM', 'track_id' => $tracks[0]->id, 'description' => 'STEM Strand'],
            ['name' => 'Humanities and Social Sciences', 'code' => 'HUMSS', 'track_id' => $tracks[0]->id, 'description' => 'HUMSS Strand'],
            ['name' => 'Accountancy, Business and Management', 'code' => 'ABM', 'track_id' => $tracks[0]->id, 'description' => 'ABM Strand'],
            ['name' => 'General Academic Strand', 'code' => 'GAS', 'track_id' => $tracks[0]->id, 'description' => 'GAS Strand'],
            
            // TVL Track
            ['name' => 'Information and Communications Technology', 'code' => 'ICT', 'track_id' => $tracks[1]->id, 'description' => 'ICT Strand'],
            ['name' => 'Home Economics', 'code' => 'HE', 'track_id' => $tracks[1]->id, 'description' => 'Home Economics Strand'],
        ];

        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        
        $createdStrands = [];
        foreach ($strands as $strandData) {
            $strand = Strand::updateOrCreate(
                ['code' => $strandData['code']],
                array_merge($strandData, ['academic_level_id' => $shsLevel->id])
            );
            $createdStrands[] = $strand;
        }

        return $createdStrands;
    }

    private function createSections(int $academicLevelId, array $strands): array
    {
        $sections = [
            // Grade 11 sections
            ['name' => 'Grade 11 - STEM A', 'code' => 'G11-STEM-A', 'specific_year_level' => 'grade_11', 'strand_code' => 'STEM'],
            ['name' => 'Grade 11 - STEM B', 'code' => 'G11-STEM-B', 'specific_year_level' => 'grade_11', 'strand_code' => 'STEM'],
            ['name' => 'Grade 11 - HUMSS A', 'code' => 'G11-HUMSS-A', 'specific_year_level' => 'grade_11', 'strand_code' => 'HUMSS'],
            ['name' => 'Grade 11 - HUMSS B', 'code' => 'G11-HUMSS-B', 'specific_year_level' => 'grade_11', 'strand_code' => 'HUMSS'],
            ['name' => 'Grade 11 - ABM A', 'code' => 'G11-ABM-A', 'specific_year_level' => 'grade_11', 'strand_code' => 'ABM'],
            ['name' => 'Grade 11 - GAS A', 'code' => 'G11-GAS-A', 'specific_year_level' => 'grade_11', 'strand_code' => 'GAS'],
            
            // Grade 12 sections
            ['name' => 'Grade 12 - STEM A', 'code' => 'G12-STEM-A', 'specific_year_level' => 'grade_12', 'strand_code' => 'STEM'],
            ['name' => 'Grade 12 - STEM B', 'code' => 'G12-STEM-B', 'specific_year_level' => 'grade_12', 'strand_code' => 'STEM'],
            ['name' => 'Grade 12 - HUMSS A', 'code' => 'G12-HUMSS-A', 'specific_year_level' => 'grade_12', 'strand_code' => 'HUMSS'],
            ['name' => 'Grade 12 - HUMSS B', 'code' => 'G12-HUMSS-B', 'specific_year_level' => 'grade_12', 'strand_code' => 'HUMSS'],
            ['name' => 'Grade 12 - ABM A', 'code' => 'G12-ABM-A', 'specific_year_level' => 'grade_12', 'strand_code' => 'ABM'],
            ['name' => 'Grade 12 - GAS A', 'code' => 'G12-GAS-A', 'specific_year_level' => 'grade_12', 'strand_code' => 'GAS'],
        ];

        $createdSections = [];
        foreach ($sections as $sectionData) {
            $strand = collect($strands)->firstWhere('code', $sectionData['strand_code']);
            
            $section = Section::updateOrCreate(
                [
                    'code' => $sectionData['code'],
                    'academic_level_id' => $academicLevelId,
                ],
                [
                    'name' => $sectionData['name'],
                    'specific_year_level' => $sectionData['specific_year_level'],
                    'strand_id' => $strand ? $strand->id : null,
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
            ['name' => 'Oral Communication', 'code' => 'ORAL-COMM-SHS', 'description' => 'Oral Communication'],
            ['name' => 'Reading and Writing', 'code' => 'READ-WRITE-SHS', 'description' => 'Reading and Writing Skills'],
            ['name' => 'General Mathematics', 'code' => 'GEN-MATH-SHS', 'description' => 'General Mathematics'],
            ['name' => 'Statistics and Probability', 'code' => 'STAT-PROB-SHS', 'description' => 'Statistics and Probability'],
            ['name' => 'Earth and Life Science', 'code' => 'ELS-SHS', 'description' => 'Earth and Life Science'],
            ['name' => 'Physical Science', 'code' => 'PHYS-SCI-SHS', 'description' => 'Physical Science'],
            ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP-SHS', 'description' => 'Understanding Culture, Society and Politics'],
            ['name' => 'Personal Development', 'code' => 'PERS-DEV-SHS', 'description' => 'Personal Development'],
            ['name' => 'Physical Education and Health', 'code' => 'PEH-SHS', 'description' => 'Physical Education and Health'],
            ['name' => 'Komunikasyon at Pananaliksik', 'code' => 'KOM-PAN-SHS', 'description' => 'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino'],
            ['name' => 'Pagbasa at Pagsusuri', 'code' => 'PAG-PAG-SHS', 'description' => 'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto Tungo sa Pananaliksik'],
            ['name' => 'Contemporary Philippine Arts', 'code' => 'CPA-SHS', 'description' => 'Contemporary Philippine Arts from the Regions'],
            ['name' => 'Media and Information Literacy', 'code' => 'MIL-SHS', 'description' => 'Media and Information Literacy'],
            ['name' => 'Introduction to Philosophy', 'code' => 'PHILO-SHS', 'description' => 'Introduction to Philosophy of the Human Person'],
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
            ['name' => 'Dr. Aurora Santiago', 'email' => 'aurora.santiago@school.edu'],
            ['name' => 'Prof. Celestino Morales', 'email' => 'celestino.morales@school.edu'],
            ['name' => 'Ms. Estrella Villanueva', 'email' => 'estrella.villanueva@school.edu'],
            ['name' => 'Mr. Feliciano Santos', 'email' => 'feliciano.santos@school.edu'],
            ['name' => 'Dr. Graciela Fernandez', 'email' => 'graciela.fernandez@school.edu'],
            ['name' => 'Prof. Herminio Reyes', 'email' => 'herminio.reyes@school.edu'],
            ['name' => 'Ms. Imelda Dela Cruz', 'email' => 'imelda.delacruz@school.edu'],
            ['name' => 'Mr. Jacinto Castillo', 'email' => 'jacinto.castillo@school.edu'],
            ['name' => 'Dr. Katrina Herrera', 'email' => 'katrina.herrera@school.edu'],
            ['name' => 'Prof. Leonardo Mendoza', 'email' => 'leonardo.mendoza@school.edu'],
            ['name' => 'Ms. Maricel Aguilar', 'email' => 'maricel.aguilar@school.edu'],
            ['name' => 'Mr. Nestor Ortiz', 'email' => 'nestor.ortiz@school.edu'],
            ['name' => 'Dr. Ofelia Navarro', 'email' => 'ofelia.navarro@school.edu'],
            ['name' => 'Prof. Pacifico Ramos', 'email' => 'pacifico.ramos@school.edu'],
            ['name' => 'Ms. Quintina Gutierrez', 'email' => 'quintina.gutierrez@school.edu'],
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
            ['name' => 'Dr. Rosario Vega', 'email' => 'rosario.vega@school.edu'],
            ['name' => 'Prof. Salvador Morales', 'email' => 'salvador.morales@school.edu'],
            ['name' => 'Ms. Trinidad Villanueva', 'email' => 'trinidad.villanueva@school.edu'],
            ['name' => 'Mr. Ulises Santos', 'email' => 'ulises.santos@school.edu'],
            ['name' => 'Dr. Victoria Fernandez', 'email' => 'victoria.fernandez@school.edu'],
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
            // Grade 11 students
            ['name' => 'Alexander Thompson', 'email' => 'alexander.thompson@shs.edu', 'section_code' => 'G11-STEM-A'],
            ['name' => 'Bella Rodriguez', 'email' => 'bella.rodriguez@shs.edu', 'section_code' => 'G11-STEM-A'],
            ['name' => 'Christopher Anderson', 'email' => 'christopher.anderson@shs.edu', 'section_code' => 'G11-STEM-B'],
            ['name' => 'Diana Martinez', 'email' => 'diana.martinez@shs.edu', 'section_code' => 'G11-STEM-B'],
            ['name' => 'Ethan Wilson', 'email' => 'ethan.wilson@shs.edu', 'section_code' => 'G11-HUMSS-A'],
            ['name' => 'Fiona Davis', 'email' => 'fiona.davis@shs.edu', 'section_code' => 'G11-HUMSS-A'],
            ['name' => 'Gabriel Taylor', 'email' => 'gabriel.taylor@shs.edu', 'section_code' => 'G11-HUMSS-B'],
            ['name' => 'Hannah Brown', 'email' => 'hannah.brown@shs.edu', 'section_code' => 'G11-HUMSS-B'],
            ['name' => 'Isaac Garcia', 'email' => 'isaac.garcia@shs.edu', 'section_code' => 'G11-ABM-A'],
            ['name' => 'Julia Miller', 'email' => 'julia.miller@shs.edu', 'section_code' => 'G11-ABM-A'],
            ['name' => 'Kevin Johnson', 'email' => 'kevin.johnson@shs.edu', 'section_code' => 'G11-GAS-A'],
            ['name' => 'Luna White', 'email' => 'luna.white@shs.edu', 'section_code' => 'G11-GAS-A'],
            
            // Grade 12 students
            ['name' => 'Marcus Lee', 'email' => 'marcus.lee@shs.edu', 'section_code' => 'G12-STEM-A'],
            ['name' => 'Natalie Clark', 'email' => 'natalie.clark@shs.edu', 'section_code' => 'G12-STEM-A'],
            ['name' => 'Oliver Adams', 'email' => 'oliver.adams@shs.edu', 'section_code' => 'G12-STEM-B'],
            ['name' => 'Penelope Hall', 'email' => 'penelope.hall@shs.edu', 'section_code' => 'G12-STEM-B'],
            ['name' => 'Quinn Turner', 'email' => 'quinn.turner@shs.edu', 'section_code' => 'G12-HUMSS-A'],
            ['name' => 'Riley Parker', 'email' => 'riley.parker@shs.edu', 'section_code' => 'G12-HUMSS-A'],
            ['name' => 'Sophia Evans', 'email' => 'sophia.evans@shs.edu', 'section_code' => 'G12-HUMSS-B'],
            ['name' => 'Tyler Reed', 'email' => 'tyler.reed@shs.edu', 'section_code' => 'G12-HUMSS-B'],
            ['name' => 'Uma Cook', 'email' => 'uma.cook@shs.edu', 'section_code' => 'G12-ABM-A'],
            ['name' => 'Vincent Bell', 'email' => 'vincent.bell@shs.edu', 'section_code' => 'G12-ABM-A'],
            ['name' => 'Willow Murphy', 'email' => 'willow.murphy@shs.edu', 'section_code' => 'G12-GAS-A'],
            ['name' => 'Xavier Bailey', 'email' => 'xavier.bailey@shs.edu', 'section_code' => 'G12-GAS-A'],
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
                    'strand_id' => $section->strand_id,
                    'student_number' => 'SHS-' . date('Y') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
            $createdStudents[] = $student;
        }

        return $createdStudents;
    }

    private function createTeacherSubjectAssignments(array $teachers, array $subjects, int $academicLevelId, string $schoolYear, array $strands): void
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
            $isHonorsSection = str_contains($sectionCode, 'STEM') || str_contains($sectionCode, 'A'); // STEM sections or A sections
            
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
