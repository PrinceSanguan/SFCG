<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\AcademicLevel;
use App\Models\AcademicPeriod;
use App\Models\Subject;
use App\Models\Grade;
use App\Models\CollegeCourse;
use App\Services\HonorCalculationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComprehensiveHonorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎓 Creating comprehensive honor system data...');

        DB::beginTransaction();
        
        try {
            // 1. Setup academic structure
            $academicData = $this->setupAcademicStructure();
            
            // 2. Create subjects
            $subjects = $this->createSubjects($academicData);
            
            // 3. Create students with realistic data
            $students = $this->createStudents($academicData);
            
            // 4. Create grades for each student
            $this->createGrades($students, $subjects, $academicData['currentPeriod']);
            
            // 5. Calculate honors using the actual service
            $this->calculateHonors($academicData['currentPeriod']);
            
            // 6. Display results
            $this->displayResults($academicData['currentPeriod']);
            
            DB::commit();
            $this->command->info('✅ Honor system seeding completed successfully!');
            
        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('❌ Error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function setupAcademicStructure()
    {
        $this->command->info('📚 Setting up academic structure...');

        // Create academic levels
        $elementary = AcademicLevel::firstOrCreate(
            ['code' => 'ELEM'],
            ['name' => 'Elementary', 'description' => 'Elementary Education', 'is_active' => true]
        );
        
        $college = AcademicLevel::firstOrCreate(
            ['code' => 'COL'],
            ['name' => 'College', 'description' => 'College Education', 'is_active' => true]
        );

        // Create current academic period
        $currentPeriod = AcademicPeriod::firstOrCreate(
            ['school_year' => '2024-2025', 'name' => '1st Semester'],
            [
                'type' => 'semester',
                'start_date' => '2024-08-01',
                'end_date' => '2024-12-20',
                'is_active' => true
            ]
        );

        // Create college course
        $collegeCourse = CollegeCourse::firstOrCreate(
            ['code' => 'BSIT'],
            [
                'name' => 'Bachelor of Science in Information Technology',
                'description' => 'BSIT Program',
                'academic_level_id' => $college->id,
                'years' => 4,
                'is_active' => true
            ]
        );

        return [
            'elementary' => $elementary,
            'college' => $college,
            'currentPeriod' => $currentPeriod,
            'collegeCourse' => $collegeCourse
        ];
    }

    private function createSubjects($academicData)
    {
        $this->command->info('📖 Creating subjects...');

        $subjects = [];

        // Elementary subjects
        $elementarySubjects = [
            ['name' => 'Mathematics', 'code' => 'MATH1'],
            ['name' => 'English', 'code' => 'ENG1'],
            ['name' => 'Science', 'code' => 'SCI1']
        ];

        foreach ($elementarySubjects as $subjectData) {
            $subjects['elementary'][] = Subject::firstOrCreate([
                'code' => $subjectData['code'],
                'academic_level_id' => $academicData['elementary']->id,
            ], [
                'name' => $subjectData['name'],
                'description' => $subjectData['name'] . ' for Elementary',
                'units' => 1,
                'is_active' => true,
            ]);
        }

        // College subjects
        $collegeSubjects = [
            ['name' => 'Programming', 'code' => 'PROG101'],
            ['name' => 'Database', 'code' => 'DBMS301'],
            ['name' => 'Web Development', 'code' => 'WEBDEV302']
        ];

        foreach ($collegeSubjects as $subjectData) {
            $subjects['college'][] = Subject::firstOrCreate([
                'code' => $subjectData['code'],
                'academic_level_id' => $academicData['college']->id,
            ], [
                'name' => $subjectData['name'],
                'description' => $subjectData['name'] . ' for College',
                'units' => 3,
                'is_active' => true,
            ]);
        }

        return $subjects;
    }

    private function createStudents($academicData)
    {
        $this->command->info('👨‍🎓 Creating students...');

        $students = [];

        // Define student scenarios for each honor type
        $studentScenarios = [
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@student.sfcg.edu.ph',
                'academic_level' => $academicData['elementary'],
                'grade_level' => 'Grade 6',
                'expected_honor' => 'With Highest Honors',
                'target_grades' => [98, 99, 97] // GPA: 98.0, no grade < 93
            ],
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@student.sfcg.edu.ph',
                'academic_level' => $academicData['college'],
                'grade_level' => '4th Year',
                'expected_honor' => 'Summa Cum Laude',
                'target_grades' => [97, 98, 96] // All grades ≥ 95
            ],
            [
                'name' => 'Sofia Garcia',
                'email' => 'sofia.garcia@student.sfcg.edu.ph',
                'academic_level' => $academicData['college'],
                'grade_level' => '4th Year',
                'expected_honor' => 'Magna Cum Laude',
                'target_grades' => [94, 95, 93] // All grades ≥ 93, some < 95
            ],
            [
                'name' => 'Miguel Torres',
                'email' => 'miguel.torres@student.sfcg.edu.ph',
                'academic_level' => $academicData['college'],
                'grade_level' => '3rd Year',
                'expected_honor' => "Dean's List",
                'target_grades' => [92, 94, 91] // GPA: 92.3, no grade < 90, 3rd year
            ],
            [
                'name' => 'Elena Castillo',
                'email' => 'elena.castillo@student.sfcg.edu.ph',
                'academic_level' => $academicData['college'],
                'grade_level' => '4th Year',
                'expected_honor' => 'Cum Laude',
                'target_grades' => [89, 90, 87] // All grades ≥ 87, some < 93
            ]
        ];

        foreach ($studentScenarios as $scenario) {
            // Create user
            $user = User::create([
                'name' => $scenario['name'],
                'email' => $scenario['email'],
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ]);

            // Create student profile
            $nameParts = explode(' ', $scenario['name']);
            $profile = StudentProfile::create([
                'user_id' => $user->id,
                'student_id' => 'STU' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'first_name' => $nameParts[0],
                'last_name' => $nameParts[1] ?? '',
                'birth_date' => Carbon::now()->subYears(20)->format('Y-m-d'),
                'gender' => 'Male',
                'address' => 'Sample Address',
                'academic_level_id' => $scenario['academic_level']->id,
                'grade_level' => $scenario['grade_level'],
                'enrollment_status' => 'active',
                'college_course_id' => $scenario['academic_level']->name === 'College' ? $academicData['collegeCourse']->id : null,
            ]);

            $students[] = [
                'user' => $user,
                'profile' => $profile,
                'scenario' => $scenario,
            ];
        }

        return $students;
    }

    private function createGrades($students, $subjects, $academicPeriod)
    {
        $this->command->info('📊 Creating grades...');

        // Get admin user to be the instructor
        $adminUser = User::where('user_role', 'admin')->first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => 'admin@sfcg.edu.ph',
                'password' => Hash::make('password123'),
                'user_role' => 'admin',
            ]);
        }

        foreach ($students as $studentData) {
            $user = $studentData['user'];
            $scenario = $studentData['scenario'];
            $academicLevel = $scenario['academic_level'];

            // Get subjects for this academic level
            $levelSubjects = [];
            if ($academicLevel->name === 'Elementary') {
                $levelSubjects = $subjects['elementary'];
            } elseif ($academicLevel->name === 'College') {
                $levelSubjects = $subjects['college'];
            }

            // Create grades for each subject
            foreach ($levelSubjects as $index => $subject) {
                $targetGrade = $scenario['target_grades'][$index] ?? 85;
                
                Grade::create([
                    'student_id' => $user->id,
                    'subject_id' => $subject->id,
                    'instructor_id' => $adminUser->id,
                    'academic_period_id' => $academicPeriod->id,
                    'final_grade' => $targetGrade,
                    'overall_grade' => $targetGrade,
                    'status' => 'finalized',
                ]);
            }
        }
    }

    private function calculateHonors($academicPeriod)
    {
        $this->command->info('🏆 Calculating honors...');
        
        $honorService = new HonorCalculationService();
        $results = $honorService->calculateAllStudentHonors($academicPeriod);
        
        $this->command->info('Honor calculation completed for ' . count($results) . ' students.');
    }

    private function displayResults($academicPeriod)
    {
        $this->command->info("\n🎯 HONOR SYSTEM RESULTS");
        $this->command->info("=====================================\n");

        // Get all student honors for this period
        $studentHonors = DB::table('student_honors')
            ->join('users', 'student_honors.student_id', '=', 'users.id')
            ->join('student_profiles', 'users.id', '=', 'student_profiles.user_id')
            ->join('academic_levels', 'student_profiles.academic_level_id', '=', 'academic_levels.id')
            ->where('student_honors.academic_period_id', $academicPeriod->id)
            ->select(
                'users.name',
                'student_profiles.grade_level',
                'academic_levels.name as academic_level',
                'student_honors.honor_type',
                'student_honors.gpa',
                'student_honors.certificate_title'
            )
            ->orderBy('academic_levels.name')
            ->orderBy('student_honors.gpa', 'desc')
            ->get();

        foreach ($studentHonors as $honor) {
            $honorDisplayName = $this->getHonorDisplayName($honor->honor_type);
            $fullName = $honor->name;
            
            $this->command->line(sprintf(
                "📚 %-20s (%s %s) - GPA: %.1f - Honor: %s%s",
                $fullName,
                $honor->academic_level,
                $honor->grade_level,
                $honor->gpa,
                $honorDisplayName,
                $honor->certificate_title ? ' 🏆' : ''
            ));

            if ($honor->certificate_title) {
                $this->command->line("    Certificate: " . $honor->certificate_title);
            }
        }

        $this->command->info("\n✅ Seeding completed! Students with honors created.");
    }

    private function getHonorDisplayName($honorType)
    {
        return match($honorType) {
            'with_honors' => 'With Honors',
            'with_high_honors' => 'With High Honors',
            'with_highest_honors' => 'With Highest Honors',
            'deans_list' => "Dean's List",
            'cum_laude' => 'Cum Laude',
            'magna_cum_laude' => 'Magna Cum Laude',
            'summa_cum_laude' => 'Summa Cum Laude',
            'college_honors' => 'College Honors',
            default => 'No Honors'
        };
    }
}
