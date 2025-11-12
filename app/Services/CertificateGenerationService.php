<?php

namespace App\Services;

use App\Models\AcademicLevel;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\HonorResult;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CertificateGenerationService
{
    /**
     * Automatically generate a certificate for a student who qualifies for honors
     */
    public function generateHonorCertificate(HonorResult $honorResult): ?Certificate
    {
        try {
            $student = $honorResult->student;
            $academicLevel = $honorResult->academicLevel;

            // Get the appropriate certificate template
            $template = $this->getCertificateTemplate($academicLevel);
            if (!$template) {
                $message = "CRITICAL: No certificate template found for academic level: {$academicLevel->key}. Please run: php artisan db:seed --class=CertificateTemplateSeeder";
                Log::error($message, [
                    'academic_level_id' => $academicLevel->id,
                    'academic_level_key' => $academicLevel->key,
                    'student_id' => $student->id,
                    'honor_result_id' => $honorResult->id,
                    'school_year' => $honorResult->school_year,
                ]);
                throw new \Exception($message);
            }

            // Check if certificate already exists for this student, honor type, and school year
            $existingCertificate = Certificate::where([
                'student_id' => $student->id,
                'template_id' => $template->id,
                'school_year' => $honorResult->school_year,
            ])->first();

            if ($existingCertificate) {
                Log::info("Certificate already exists for student {$student->id} for {$honorResult->school_year}");
                return $existingCertificate;
            }

            // Generate certificate payload based on academic level
            $payload = $this->generateCertificatePayload($student, $academicLevel, $honorResult);

            Log::info('[CERTIFICATE] Generating certificate with payload', [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'honor_type' => $honorResult->honorType->name,
                'school_year' => $honorResult->school_year,
                'logo_embedded' => true,
                'template_uses_logo_helper' => 'CertificateLogoHelper::getCenteredLogoHtml()'
            ]);

            // Create the certificate
            $certificate = Certificate::create([
                'template_id' => $template->id,
                'student_id' => $student->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $honorResult->school_year,
                'serial_number' => $this->generateSerialNumber($honorResult->school_year),
                'status' => 'generated',
                'generated_at' => now(),
                'generated_by' => null, // System generated
                'payload' => $payload,
            ]);

            Log::info("Certificate generated successfully for student {$student->id}: {$certificate->serial_number}");

            return $certificate;

        } catch (\Exception $e) {
            Log::error("Failed to generate certificate for honor result {$honorResult->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get the appropriate certificate template for an academic level
     */
    private function getCertificateTemplate(AcademicLevel $academicLevel): ?CertificateTemplate
    {
        $templateKey = match ($academicLevel->key) {
            'elementary' => 'elementary_honor_certificate',
            'junior_highschool' => 'junior_high_honor_certificate',
            'senior_highschool' => 'senior_high_honor_certificate',
            'college' => 'college_honor_certificate',
            default => null,
        };

        if (!$templateKey) {
            return null;
        }

        return CertificateTemplate::where('key', $templateKey)
            ->where('academic_level_id', $academicLevel->id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Generate certificate payload with all necessary data
     */
    private function generateCertificatePayload(User $student, AcademicLevel $academicLevel, HonorResult $honorResult): array
    {
        $payload = [
            'student_name' => $student->name,
            'student_number' => $student->student_number,
            'honor_type' => $honorResult->honorType->name,
            'school_year' => $honorResult->school_year,
            'date_issued' => now()->format('F j, Y'),
            'logo_url' => asset('image/logo.jpg'),
        ];

        // Add academic level specific data
        switch ($academicLevel->key) {
            case 'elementary':
            case 'junior_highschool':
                $payload['grade_level'] = $this->getGradeLevel($student);
                $payload['average_grade'] = $this->formatGrade($honorResult->gpa);
                break;

            case 'senior_highschool':
                $payload['grade_level'] = $this->getGradeLevel($student);
                $payload['strand_name'] = $student->strand?->name ?? 'General Academic Strand';
                $payload['average_grade'] = $this->formatGrade($honorResult->gpa);
                break;

            case 'college':
                $payload['course_name'] = $student->course?->name ?? 'Undecided';
                $payload['department_name'] = $student->course?->department?->name ?? 'Undecided';
                $payload['year_level'] = $this->getYearLevel($student);
                $payload['gpa'] = $this->formatGPA($honorResult->gpa);
                break;
        }

        return $payload;
    }

    /**
     * Get grade level for basic education students
     */
    private function getGradeLevel(User $student): string
    {
        $specificYear = $student->specific_year_level;
        if ($specificYear) {
            return $specificYear;
        }

        // Fallback to year_level if specific_year_level is not set
        $yearLevel = $student->year_level;
        return match ($yearLevel) {
            'elementary' => 'Grade ' . ($student->specific_year_level ?? '1-6'),
            'junior_highschool' => 'Grade ' . ($student->specific_year_level ?? '7-10'),
            'senior_highschool' => 'Grade ' . ($student->specific_year_level ?? '11-12'),
            default => 'Grade ' . ($student->specific_year_level ?? 'N/A'),
        };
    }

    /**
     * Get year level for college students
     */
    private function getYearLevel(User $student): string
    {
        $specificYear = $student->specific_year_level;
        if ($specificYear) {
            return $specificYear;
        }

        return 'Year ' . ($student->specific_year_level ?? '1-4');
    }

    /**
     * Format grade for display (basic education)
     */
    private function formatGrade(?float $grade): string
    {
        if ($grade === null) {
            return 'N/A';
        }

        return number_format($grade, 1);
    }

    /**
     * Format GPA for display (college)
     */
    private function formatGPA(?float $gpa): string
    {
        if ($gpa === null) {
            return 'N/A';
        }

        return number_format($gpa, 2);
    }

    /**
     * Generate unique serial number for certificate
     */
    private function generateSerialNumber(string $schoolYear): string
    {
        $year = str_replace('-', '', $schoolYear);
        $prefix = "CERT-{$year}-";
        $suffix = strtoupper(Str::random(8));
        
        return $prefix . $suffix;
    }

    /**
     * Generate certificates for all students who qualified for honors in a specific school year
     */
    public function generateCertificatesForSchoolYear(string $schoolYear): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'already_exists' => 0,
            'errors' => [],
        ];

        $honorResults = HonorResult::with(['student', 'academicLevel', 'honorType'])
            ->where('school_year', $schoolYear)
            ->get();

        foreach ($honorResults as $honorResult) {
            try {
                $certificate = $this->generateHonorCertificate($honorResult);
                
                if ($certificate) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_id' => $honorResult->student_id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info("Certificate generation completed for school year {$schoolYear}", $results);
        return $results;
    }

    /**
     * Generate certificates for a specific academic level and school year
     */
    public function generateCertificatesForLevel(string $academicLevelKey, string $schoolYear): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'already_exists' => 0,
            'errors' => [],
        ];

        $academicLevel = AcademicLevel::where('key', $academicLevelKey)->first();
        if (!$academicLevel) {
            $results['errors'][] = "Academic level '{$academicLevelKey}' not found";
            return $results;
        }

        $honorResults = HonorResult::with(['student', 'academicLevel', 'honorType'])
            ->where('academic_level_id', $academicLevel->id)
            ->where('school_year', $schoolYear)
            ->get();

        foreach ($honorResults as $honorResult) {
            try {
                $certificate = $this->generateHonorCertificate($honorResult);
                
                if ($certificate) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_id' => $honorResult->student_id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info("Certificate generation completed for level {$academicLevelKey} school year {$schoolYear}", $results);
        return $results;
    }
}

