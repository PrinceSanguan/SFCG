<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\Course;
use App\Models\Department;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\User;
use App\Services\CertificateGenerationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CertificateTestDataSeeder extends Seeder
{
    /**
     * Create sample certificate test data with chairperson, students, and honors.
     * This seeder creates minimal focused test data to verify certificate generation with signatories.
     */
    public function run(): void
    {
        $this->command->info('🎓 Creating Certificate Test Data...');
        $this->command->newLine();

        // 1. Get foundation data
        $college = AcademicLevel::where('key', 'college')->first();
        if (!$college) {
            $this->command->error('❌ College academic level not found. Please run DatabaseSeeder first.');
            return;
        }

        // 2. Get or create department
        $department = Department::where('academic_level_id', $college->id)
            ->where('code', 'COMP')
            ->first();

        if (!$department) {
            $department = Department::create([
                'code' => 'COMP',
                'name' => 'Computer Science Department',
                'description' => 'Department of Computer Science and Information Technology',
                'academic_level_id' => $college->id,
                'is_active' => true,
            ]);
            $this->command->info("✅ Created department: {$department->name}");
        } else {
            $this->command->info("📁 Using existing department: {$department->name}");
        }

        // 3. Get or create course
        $course = Course::where('department_id', $department->id)
            ->where('code', 'BSCS')
            ->first();

        if (!$course) {
            $course = Course::create([
                'code' => 'BSCS',
                'name' => 'Bachelor of Science in Computer Science',
                'description' => 'Four-year degree program in Computer Science',
                'department_id' => $department->id,
                'units' => 120,
                'is_active' => true,
            ]);
            $this->command->info("✅ Created course: {$course->name}");
        } else {
            $this->command->info("📚 Using existing course: {$course->name}");
        }

        // 4. Get or create chairperson and assign to department
        $chairperson = User::where('email', 'chairperson@school.edu')->first();

        if (!$chairperson) {
            $chairperson = User::create([
                'name' => 'Dr. Maria Fe Garcia',
                'email' => 'chairperson@school.edu',
                'password' => Hash::make('password'),
                'user_role' => 'chairperson',
                'department_id' => $department->id,
            ]);
            $this->command->info("✅ Created chairperson: {$chairperson->name}");
        } else {
            // Update chairperson's department
            $chairperson->update(['department_id' => $department->id]);
            $this->command->info("✅ Assigned chairperson '{$chairperson->name}' to {$department->name}");
        }

        $this->command->newLine();

        // 5. Get honor types for college
        $honorTypes = HonorType::where('scope', 'college')
            ->whereIn('key', ['deans_list', 'cum_laude', 'magna_cum_laude'])
            ->get();

        if ($honorTypes->isEmpty()) {
            $this->command->error('❌ College honor types not found. Please run HonorTypesSeeder first.');
            return;
        }

        // 6. Create test students with honors
        $studentData = [
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@student.edu',
                'honor_type' => 'magna_cum_laude',
                'gpa' => 3.95,
                'year_level' => 'fourth_year',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@student.edu',
                'honor_type' => 'cum_laude',
                'gpa' => 3.75,
                'year_level' => 'fourth_year',
            ],
            [
                'name' => 'Jose Rizal',
                'email' => 'jose.rizal@student.edu',
                'honor_type' => 'deans_list',
                'gpa' => 3.85,
                'year_level' => 'third_year',
            ],
        ];

        $certificateService = new CertificateGenerationService();
        $successCount = 0;
        $errorCount = 0;

        foreach ($studentData as $index => $data) {
            try {
                // Create student
                $student = User::where('email', $data['email'])->first();

                if (!$student) {
                    $studentNumber = 'C2024-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);

                    $student = User::create([
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'password' => Hash::make('password'),
                        'user_role' => 'student',
                        'year_level' => 'college',
                        'specific_year_level' => $data['year_level'],
                        'student_number' => $studentNumber,
                        'department_id' => $department->id,
                        'course_id' => $course->id,
                    ]);

                    $this->command->info("✅ Created student: {$student->name} ({$studentNumber})");
                } else {
                    // Update existing student
                    $student->update([
                        'department_id' => $department->id,
                        'course_id' => $course->id,
                        'year_level' => 'college',
                        'specific_year_level' => $data['year_level'],
                    ]);
                    $this->command->info("📝 Updated student: {$student->name}");
                }

                // Get honor type
                $honorType = $honorTypes->firstWhere('key', $data['honor_type']);

                if (!$honorType) {
                    $this->command->warn("⚠️  Honor type '{$data['honor_type']}' not found for {$student->name}");
                    $errorCount++;
                    continue;
                }

                // Create approved honor result
                $existingHonor = HonorResult::where([
                    'student_id' => $student->id,
                    'school_year' => '2024-2025',
                ])->first();

                if (!$existingHonor) {
                    $honorResult = HonorResult::create([
                        'student_id' => $student->id,
                        'honor_type_id' => $honorType->id,
                        'academic_level_id' => $college->id,
                        'school_year' => '2024-2025',
                        'gpa' => $data['gpa'],
                        'is_pending_approval' => false,
                        'is_approved' => true,
                        'approved_by' => 1, // Admin user
                        'approved_at' => now(),
                        'is_rejected' => false,
                    ]);

                    $this->command->info("   ✨ Created honor: {$honorType->name} (GPA: {$data['gpa']})");
                } else {
                    $honorResult = $existingHonor;
                    $this->command->info("   📋 Using existing honor result");
                }

                // Generate certificate
                $certificate = $certificateService->generateHonorCertificate($honorResult);

                if ($certificate) {
                    $this->command->info("   🎖️  Generated certificate: {$certificate->serial_number}");
                    $successCount++;
                } else {
                    $this->command->warn("   ⚠️  Certificate generation failed");
                    $errorCount++;
                }

                $this->command->newLine();

            } catch (\Exception $e) {
                $this->command->error("   ❌ Error: {$e->getMessage()}");
                $errorCount++;
                $this->command->newLine();
            }
        }

        // Summary
        $this->command->newLine();
        $this->command->info('📊 Summary:');
        $this->command->info("   ✅ Successfully created: {$successCount} certificates");
        if ($errorCount > 0) {
            $this->command->warn("   ⚠️  Errors encountered: {$errorCount}");
        }
        $this->command->newLine();
        $this->command->info('🎉 Done! You can now view certificates at: /admin/academic/certificates');
        $this->command->info('🔑 Login as: chairperson@school.edu / password');
    }
}
