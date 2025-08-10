<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\CollegeCourse;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
            // Core accounts
        $this->call(AccountSeeder::class);

        // Foundational academic data (levels and periods)
        $this->call(AcademicPeriodSeeder::class);

        // Subjects, strands, courses, educators and assignments
        $this->call(EducatorsAndSubjectsSeeder::class);

        // Honor criteria per level
        $this->call(HonorSystemSeeder::class);

        // Realistic honor scenarios with students and grades
        $this->call(ComprehensiveHonorSeeder::class);

        // Optional: demo-only console output for honors (no DB writes)
        // $this->call(HonorSystemDemoSeeder::class);
    }
    
    public function seedAcademicLevels()
    {
        $levels = [
            ['name' => 'Elementary', 'code' => 'ELEM', 'description' => 'Elementary Education (Grades 1-6)'],
            ['name' => 'Junior High School', 'code' => 'JHS', 'description' => 'Junior High School (Grades 7-10)'],
            ['name' => 'Senior High School', 'code' => 'SHS', 'description' => 'Senior High School (Grades 11-12)'],
            ['name' => 'College', 'code' => 'COL', 'description' => 'College Education'],
        ];
        
        foreach ($levels as $level) {
            AcademicLevel::firstOrCreate(
                ['code' => $level['code']],
                $level
            );
        }
    }
    
    public function seedTestStudents()
    {
        // Create a college course if it doesn't exist
        $collegeCourse = CollegeCourse::firstOrCreate(
            ['code' => 'BSIT'],
            [
                'name' => 'Bachelor of Science in Information Technology',
                'code' => 'BSIT',
                'description' => 'Information Technology Program'
            ]
        );
        
        // Get academic levels
        $elementary = AcademicLevel::where('code', 'ELEM')->first();
        $juniorHigh = AcademicLevel::where('code', 'JHS')->first();
        $seniorHigh = AcademicLevel::where('code', 'SHS')->first();
        $college = AcademicLevel::where('code', 'COL')->first();
        
        // Create test students for each level
        $testStudents = [
            // Elementary Student
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.elementary@test.com',
                'student_id' => 'ELEM-2024-001',
                'academic_level_id' => $elementary->id,
                'grade_level' => 'Grade 5',
                'section' => 'A'
            ],
            // Junior High Student
            [
                'name' => 'Maria Santos',
                'email' => 'maria.jhs@test.com',
                'student_id' => 'JHS-2024-001',
                'academic_level_id' => $juniorHigh->id,
                'grade_level' => 'Grade 8',
                'section' => 'B'
            ],
            // Senior High Student
            [
                'name' => 'Pedro Reyes',
                'email' => 'pedro.shs@test.com',
                'student_id' => 'SHS-2024-001',
                'academic_level_id' => $seniorHigh->id,
                'grade_level' => 'Grade 11',
                'section' => 'STEM-A'
            ],
            // College Student
            [
                'name' => 'Ana Garcia',
                'email' => 'ana.college@test.com',
                'student_id' => 'COL-2024-001',
                'college_course_id' => $collegeCourse->id,
                'grade_level' => '2nd Year',
                'year_level' => 2,
                'semester' => '1st'
            ]
        ];
        
        foreach ($testStudents as $studentData) {
            // Check if student already exists
            $existingStudent = User::where('email', $studentData['email'])->first();
            if ($existingStudent) continue;
            
            // Create user
            $user = User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ]);
            
            // Create student profile
            $profileData = [
                'user_id' => $user->id,
                'student_id' => $studentData['student_id'],
                'first_name' => explode(' ', $studentData['name'])[0],
                'last_name' => explode(' ', $studentData['name'])[1] ?? explode(' ', $studentData['name'])[0],
                'birth_date' => '2000-01-01',
                'gender' => 'Male',
                'address' => 'Test Address',
                'grade_level' => $studentData['grade_level'],
                'section' => $studentData['section'] ?? null,
                'enrollment_status' => 'active',
            ];
            
            // Set level-specific fields
            if (isset($studentData['college_course_id'])) {
                // College student
                $profileData['college_course_id'] = $studentData['college_course_id'];
                $profileData['academic_level_id'] = $college->id;
                $profileData['year_level'] = $studentData['year_level'];
                $profileData['semester'] = $studentData['semester'];
            } else {
                // K-12 student
                $profileData['academic_level_id'] = $studentData['academic_level_id'];
                $profileData['year_level'] = 1;
            }
            
            StudentProfile::create($profileData);
        }
    }
}
