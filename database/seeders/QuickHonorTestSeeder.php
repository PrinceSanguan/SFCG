<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\Certificate;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\User;
use App\Services\CertificateGenerationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class QuickHonorTestSeeder extends Seeder
{
    /**
     * Run the seeder to create quick test honor students and their certificates.
     */
    public function run(): void
    {
        $this->command->info('Creating quick honor test data...');

        $schoolYear = '2024-2025';

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Get honor types
        $withHonors = HonorType::where('name', 'With Honors')->first();
        $withHighHonors = HonorType::where('name', 'With High Honors')->first();
        $collegeHonors = HonorType::where('name', 'College Honors')->first();

        // Create test students for each level
        $students = [
            // Elementary
            [
                'name' => 'Emma Davis',
                'email' => 'emma.davis@elementary.test',
                'student_number' => 'EL-2024-001',
                'year_level' => 'elementary',
                'specific_year_level' => 'Grade 6',
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHighHonors->id,
                'gpa' => 95.5,
            ],
            [
                'name' => 'Liam Garcia',
                'email' => 'liam.garcia@elementary.test',
                'student_number' => 'EL-2024-002',
                'year_level' => 'elementary',
                'specific_year_level' => 'Grade 6',
                'academic_level_id' => $elementary->id,
                'honor_type_id' => $withHonors->id,
                'gpa' => 92.0,
            ],

            // Junior High School
            [
                'name' => 'Sophia Martinez',
                'email' => 'sophia.martinez@juniorhigh.test',
                'student_number' => 'JHS-2024-001',
                'year_level' => 'junior_highschool',
                'specific_year_level' => 'Grade 10',
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHighHonors->id,
                'gpa' => 94.8,
            ],
            [
                'name' => 'Noah Wilson',
                'email' => 'noah.wilson@juniorhigh.test',
                'student_number' => 'JHS-2024-002',
                'year_level' => 'junior_highschool',
                'specific_year_level' => 'Grade 10',
                'academic_level_id' => $juniorHigh->id,
                'honor_type_id' => $withHonors->id,
                'gpa' => 91.5,
            ],

            // Senior High School
            [
                'name' => 'Isabella Taylor',
                'email' => 'isabella.taylor@seniorhigh.test',
                'student_number' => 'SHS-2024-001',
                'year_level' => 'senior_highschool',
                'specific_year_level' => 'Grade 12',
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHighHonors->id,
                'gpa' => 96.2,
            ],
            [
                'name' => 'Mason Brown',
                'email' => 'mason.brown@seniorhigh.test',
                'student_number' => 'SHS-2024-002',
                'year_level' => 'senior_highschool',
                'specific_year_level' => 'Grade 12',
                'academic_level_id' => $seniorHigh->id,
                'honor_type_id' => $withHonors->id,
                'gpa' => 93.0,
            ],

            // College
            [
                'name' => 'Hansel Cauete',
                'email' => 'hansel.cauete@college.test',
                'student_number' => 'CO-2025-0001',
                'year_level' => 'college',
                'specific_year_level' => 'Third Year',
                'academic_level_id' => $college->id,
                'honor_type_id' => $collegeHonors->id,
                'gpa' => 1.5,
            ],
            [
                'name' => 'Ava Anderson',
                'email' => 'ava.anderson@college.test',
                'student_number' => 'CO-2025-0002',
                'year_level' => 'college',
                'specific_year_level' => 'Third Year',
                'academic_level_id' => $college->id,
                'honor_type_id' => $collegeHonors->id,
                'gpa' => 1.8,
            ],
        ];

        $certificateService = new CertificateGenerationService();

        foreach ($students as $studentData) {
            // Create or update student
            $student = User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'user_role' => 'student',
                    'year_level' => $studentData['year_level'],
                    'specific_year_level' => $studentData['specific_year_level'],
                    'student_number' => $studentData['student_number'],
                    'email_verified_at' => now(),
                ]
            );

            $this->command->info("Created/Updated student: {$student->name} ({$student->email})");

            // Create or update honor result
            $honorResult = HonorResult::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_level_id' => $studentData['academic_level_id'],
                    'school_year' => $schoolYear,
                ],
                [
                    'honor_type_id' => $studentData['honor_type_id'],
                    'gpa' => $studentData['gpa'],
                    'is_pending_approval' => false,
                    'is_approved' => true,
                    'approved_at' => now(),
                    'approved_by' => 1, // Assuming admin user ID is 1
                    'is_rejected' => false,
                ]
            );

            $this->command->info("Created/Updated honor result for {$student->name}");

            // Delete existing certificate if any (to regenerate with new template)
            Certificate::where('student_id', $student->id)
                ->where('school_year', $schoolYear)
                ->delete();

            // Generate certificate
            $certificate = $certificateService->generateHonorCertificate($honorResult);

            if ($certificate) {
                $this->command->info("Generated certificate: {$certificate->serial_number}");
            } else {
                $this->command->error("Failed to generate certificate for {$student->name}");
            }
        }

        $this->command->info('Quick honor test data created successfully!');
        $this->command->info('You can now view and download certificates in the admin portal.');
    }
}
