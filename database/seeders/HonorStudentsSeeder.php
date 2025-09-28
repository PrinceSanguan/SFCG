<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\AcademicLevel;
use Illuminate\Database\Seeder;

class HonorStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $academicLevels = AcademicLevel::all()->keyBy('key');
        $honorTypes = HonorType::all()->keyBy('key');
        $schoolYear = '2024-2025';

        // Create honor students for different academic levels
        $this->createElementaryHonors($academicLevels['elementary'], $honorTypes, $schoolYear);
        $this->createJuniorHighHonors($academicLevels['junior_highschool'], $honorTypes, $schoolYear);
        $this->createSeniorHighHonors($academicLevels['senior_highschool'], $honorTypes, $schoolYear);
        $this->createCollegeHonors($academicLevels['college'], $honorTypes, $schoolYear);
    }

    private function createElementaryHonors($academicLevel, $honorTypes, $schoolYear)
    {
        // Create additional elementary students if needed
        $students = [
            ['name' => 'Alice Johnson', 'student_number' => 'ELEM2024001', 'year_level' => 'elementary'],
            ['name' => 'Bob Smith', 'student_number' => 'ELEM2024002', 'year_level' => 'elementary'],
            ['name' => 'Carol Williams', 'student_number' => 'ELEM2024003', 'year_level' => 'elementary'],
        ];

        foreach ($students as $index => $studentData) {
            $student = User::updateOrCreate(
                ['student_number' => $studentData['student_number']],
                array_merge($studentData, [
                    'user_role' => 'student',
                    'email' => strtolower(str_replace(' ', '.', $studentData['name'])) . '@student.edu',
                    'password' => bcrypt('password'),
                ])
            );

            // Create honor result
            $honorType = $index === 0 ? $honorTypes['with_highest_honors'] :
                        ($index === 1 ? $honorTypes['with_high_honors'] : $honorTypes['with_honors']);

            HonorResult::updateOrCreate([
                'student_id' => $student->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'honor_type_id' => $honorType->id,
                'gpa' => $index === 0 ? 98.5 : ($index === 1 ? 95.2 : 92.8),
                'is_approved' => true,
                'approved_at' => now(),
                'approved_by' => 1,
            ]);
        }
    }

    private function createJuniorHighHonors($academicLevel, $honorTypes, $schoolYear)
    {
        $students = [
            ['name' => 'David Brown', 'student_number' => 'JHS2024001', 'year_level' => 'junior_highschool'],
            ['name' => 'Emma Davis', 'student_number' => 'JHS2024002', 'year_level' => 'junior_highschool'],
        ];

        foreach ($students as $index => $studentData) {
            $student = User::updateOrCreate(
                ['student_number' => $studentData['student_number']],
                array_merge($studentData, [
                    'user_role' => 'student',
                    'email' => strtolower(str_replace(' ', '.', $studentData['name'])) . '@student.edu',
                    'password' => bcrypt('password'),
                ])
            );

            $honorType = $index === 0 ? $honorTypes['with_high_honors'] : $honorTypes['with_honors'];

            HonorResult::updateOrCreate([
                'student_id' => $student->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'honor_type_id' => $honorType->id,
                'gpa' => $index === 0 ? 96.1 : 91.5,
                'is_approved' => true,
                'approved_at' => now(),
                'approved_by' => 1,
            ]);
        }
    }

    private function createSeniorHighHonors($academicLevel, $honorTypes, $schoolYear)
    {
        $students = [
            ['name' => 'Frank Wilson', 'student_number' => 'SHS2024001', 'year_level' => 'senior_highschool'],
            ['name' => 'Grace Miller', 'student_number' => 'SHS2024002', 'year_level' => 'senior_highschool'],
            ['name' => 'Henry Taylor', 'student_number' => 'SHS2024003', 'year_level' => 'senior_highschool'],
        ];

        foreach ($students as $index => $studentData) {
            $student = User::updateOrCreate(
                ['student_number' => $studentData['student_number']],
                array_merge($studentData, [
                    'user_role' => 'student',
                    'email' => strtolower(str_replace(' ', '.', $studentData['name'])) . '@student.edu',
                    'password' => bcrypt('password'),
                ])
            );

            $honorType = $index === 0 ? $honorTypes['with_highest_honors'] :
                        ($index === 1 ? $honorTypes['with_high_honors'] : $honorTypes['with_honors']);

            HonorResult::updateOrCreate([
                'student_id' => $student->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'honor_type_id' => $honorType->id,
                'gpa' => $index === 0 ? 99.1 : ($index === 1 ? 96.8 : 93.2),
                'is_approved' => true,
                'approved_at' => now(),
                'approved_by' => 1,
            ]);
        }
    }

    private function createCollegeHonors($academicLevel, $honorTypes, $schoolYear)
    {
        $students = [
            ['name' => 'Isabella Garcia', 'student_number' => 'COL2024001', 'year_level' => 'college'],
            ['name' => 'Jack Martinez', 'student_number' => 'COL2024002', 'year_level' => 'college'],
            ['name' => 'Katherine Lopez', 'student_number' => 'COL2024003', 'year_level' => 'college'],
        ];

        foreach ($students as $index => $studentData) {
            $student = User::updateOrCreate(
                ['student_number' => $studentData['student_number']],
                array_merge($studentData, [
                    'user_role' => 'student',
                    'email' => strtolower(str_replace(' ', '.', $studentData['name'])) . '@student.edu',
                    'password' => bcrypt('password'),
                ])
            );

            $honorType = $index === 0 ? $honorTypes['summa_cum_laude'] :
                        ($index === 1 ? $honorTypes['magna_cum_laude'] : $honorTypes['deans_list']);

            HonorResult::updateOrCreate([
                'student_id' => $student->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'honor_type_id' => $honorType->id,
                'gpa' => $index === 0 ? 3.95 : ($index === 1 ? 3.75 : 3.50),
                'is_approved' => true,
                'approved_at' => now(),
                'approved_by' => 1,
            ]);
        }
    }
}