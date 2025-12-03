<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\Section;
use App\Models\User;
use App\Services\CertificateGenerationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BasicEducationCertificateTestDataSeeder extends Seeder
{
    /**
     * Create sample certificate test data for Basic Education (Elementary, JHS, SHS).
     */
    public function run(): void
    {
        $this->command->info('🎓 Creating Basic Education Certificate Test Data...');
        $this->command->newLine();

        $certificateService = new CertificateGenerationService();

        // Process each basic education level
        $levels = [
            [
                'key' => 'elementary',
                'grade' => 'Grade 6',
                'specific_year' => 'grade_6',
                'student_prefix' => 'E',
            ],
            [
                'key' => 'junior_highschool',
                'grade' => 'Grade 10',
                'specific_year' => 'grade_10',
                'student_prefix' => 'J',
            ],
            [
                'key' => 'senior_highschool',
                'grade' => 'Grade 12',
                'specific_year' => 'grade_12',
                'student_prefix' => 'S',
            ],
        ];

        $totalSuccess = 0;
        $totalErrors = 0;

        foreach ($levels as $levelData) {
            $this->command->info("📚 Processing {$levelData['key']}...");

            // Get academic level
            $academicLevel = AcademicLevel::where('key', $levelData['key'])->first();
            if (!$academicLevel) {
                $this->command->error("❌ Academic level {$levelData['key']} not found");
                continue;
            }

            // Get or create section
            $section = Section::where('academic_level_id', $academicLevel->id)
                ->where('specific_year_level', $levelData['specific_year'])
                ->first();

            if (!$section) {
                $section = Section::create([
                    'code' => strtoupper($levelData['student_prefix']) . '-A',
                    'name' => "{$levelData['grade']} - Section A",
                    'academic_level_id' => $academicLevel->id,
                    'specific_year_level' => $levelData['specific_year'],
                    'max_students' => 40,
                    'school_year' => '2024-2025',
                    'is_active' => true,
                ]);
                $this->command->info("  ✅ Created section: {$section->name}");
            } else {
                $this->command->info("  📁 Using existing section: {$section->name}");
            }

            // Get or create adviser
            $adviserEmail = "adviser.{$levelData['key']}@school.edu";
            $adviser = User::where('email', $adviserEmail)->first();

            if (!$adviser) {
                $adviser = User::create([
                    'name' => ucfirst(str_replace('_', ' ', $levelData['key'])) . ' Adviser',
                    'email' => $adviserEmail,
                    'password' => Hash::make('password'),
                    'user_role' => 'adviser',
                    'section_id' => $section->id,
                ]);
                $this->command->info("  ✅ Created adviser: {$adviser->name}");
            } else {
                $adviser->update(['section_id' => $section->id]);
                $this->command->info("  ✅ Assigned adviser: {$adviser->name}");
            }

            // Get honor types for this level
            $honorTypes = HonorType::where('scope', 'basic')
                ->whereIn('key', ['with_honors', 'with_high_honors', 'with_highest_honors'])
                ->get();

            if ($honorTypes->isEmpty()) {
                $this->command->error("  ❌ Honor types not found for basic education");
                continue;
            }

            // Create test students
            $studentData = [
                [
                    'name' => 'Pedro Penduko',
                    'honor_type' => 'with_highest_honors',
                    'grade' => 96.5,
                ],
                [
                    'name' => 'Anna Luna',
                    'honor_type' => 'with_high_honors',
                    'grade' => 93.5,
                ],
                [
                    'name' => 'Carlos Garcia',
                    'honor_type' => 'with_honors',
                    'grade' => 90.5,
                ],
            ];

            foreach ($studentData as $index => $data) {
                try {
                    $studentNumber = $levelData['student_prefix'] . '2024-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);
                    $email = strtolower(str_replace(' ', '.', $data['name'])) . ".{$levelData['key']}@student.edu";

                    // Create student
                    $student = User::where('email', $email)->first();
                    if (!$student) {
                        $student = User::create([
                            'name' => $data['name'],
                            'email' => $email,
                            'password' => Hash::make('password'),
                            'user_role' => 'student',
                            'year_level' => $levelData['key'],
                            'specific_year_level' => $levelData['specific_year'],
                            'student_number' => $studentNumber,
                            'section_id' => $section->id,
                        ]);
                        $this->command->info("  ✅ Created student: {$student->name} ({$studentNumber})");
                    } else {
                        $student->update([
                            'section_id' => $section->id,
                            'year_level' => $levelData['key'],
                            'specific_year_level' => $levelData['specific_year'],
                        ]);
                        $this->command->info("  📝 Updated student: {$student->name}");
                    }

                    // Get honor type
                    $honorType = $honorTypes->firstWhere('key', $data['honor_type']);
                    if (!$honorType) {
                        $this->command->warn("    ⚠️  Honor type '{$data['honor_type']}' not found");
                        $totalErrors++;
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
                            'academic_level_id' => $academicLevel->id,
                            'school_year' => '2024-2025',
                            'gpa' => $data['grade'],
                            'is_pending_approval' => false,
                            'is_approved' => true,
                            'approved_by' => 1,
                            'approved_at' => now(),
                            'is_rejected' => false,
                        ]);
                        $this->command->info("    ✨ Created honor: {$honorType->name} (Grade: {$data['grade']})");
                    } else {
                        $honorResult = $existingHonor;
                        $this->command->info("    📋 Using existing honor result");
                    }

                    // Generate certificate
                    $certificate = $certificateService->generateHonorCertificate($honorResult);
                    if ($certificate) {
                        $this->command->info("    🎖️  Generated certificate: {$certificate->serial_number}");
                        $totalSuccess++;
                    } else {
                        $this->command->warn("    ⚠️  Certificate generation failed");
                        $totalErrors++;
                    }

                } catch (\Exception $e) {
                    $this->command->error("    ❌ Error: {$e->getMessage()}");
                    $totalErrors++;
                }
            }

            $this->command->newLine();
        }

        // Summary
        $this->command->info('📊 Summary:');
        $this->command->info("   ✅ Successfully created: {$totalSuccess} certificates");
        if ($totalErrors > 0) {
            $this->command->warn("   ⚠️  Errors encountered: {$totalErrors}");
        }
        $this->command->newLine();
        $this->command->info('🎉 Done! You can now view certificates at: /admin/academic/certificates');
    }
}
