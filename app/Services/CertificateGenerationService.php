<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentHonor;
use App\Models\CertificateTemplate;
use App\Models\GeneratedCertificate;
use App\Models\AcademicPeriod;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Mail\CertificateGeneratedEmail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateGenerationService
{
    /**
     * Generate certificate for a student honor
     */
    public function generateHonorCertificate(StudentHonor $honor, CertificateTemplate $template, User $generatedBy)
    {
        try {
            // Prepare certificate data
            $certificateData = $this->prepareCertificateData($honor);
            
            // Render template with data
            $renderedContent = $template->renderTemplate($certificateData);
            
            // Generate PDF
            $pdfPath = $this->generatePDF($renderedContent, $honor->student, $template->type);
            
            // Create certificate record
            $certificate = GeneratedCertificate::create([
                'student_id' => $honor->student_id,
                'certificate_template_id' => $template->id,
                'academic_period_id' => $honor->academic_period_id,
                'certificate_type' => $template->type,
                'certificate_data' => $certificateData,
                'file_path' => $pdfPath,
                'generated_by' => $generatedBy->id,
                'generated_at' => now(),
                'is_digitally_signed' => false,
            ]);

            // Log activity
            ActivityLog::logActivity(
                $generatedBy,
                'created',
                'GeneratedCertificate',
                $certificate->id,
                null,
                $certificate->toArray()
            );

            // Send notification
            $this->sendCertificateNotification($certificate);

            Log::info('Certificate generated successfully', [
                'certificate_id' => $certificate->id,
                'student_id' => $honor->student_id,
                'template_id' => $template->id
            ]);

            return $certificate;

        } catch (\Exception $e) {
            Log::error('Certificate generation failed', [
                'honor_id' => $honor->id,
                'template_id' => $template->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate certificates in bulk for multiple honors
     */
    public function generateBulkCertificates(array $honorIds, CertificateTemplate $template, User $generatedBy)
    {
        $honors = StudentHonor::whereIn('id', $honorIds)
            ->with(['student.studentProfile', 'academicPeriod'])
            ->get();

        $certificates = [];
        $errors = [];

        foreach ($honors as $honor) {
            try {
                $certificate = $this->generateHonorCertificate($honor, $template, $generatedBy);
                $certificates[] = $certificate;
            } catch (\Exception $e) {
                $errors[] = [
                    'honor_id' => $honor->id,
                    'student_name' => $honor->student->name,
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'certificates' => $certificates,
            'errors' => $errors,
            'success_count' => count($certificates),
            'error_count' => count($errors)
        ];
    }

    /**
     * Generate certificates for all approved honors in a period
     */
    public function generateCertificatesForPeriod(AcademicPeriod $period, CertificateTemplate $template, User $generatedBy, $academicLevelId = null)
    {
        $query = StudentHonor::where('academic_period_id', $period->id)
            ->where('is_approved', true)
            ->with(['student.studentProfile', 'academicPeriod']);

        if ($academicLevelId) {
            $query->whereHas('student.studentProfile', function ($q) use ($academicLevelId) {
                $q->where('academic_level_id', $academicLevelId);
            });
        }

        // Only generate for honors that don't have certificates yet
        $query->whereDoesntHave('student.certificates', function ($q) use ($period, $template) {
            $q->where('academic_period_id', $period->id)
                ->where('certificate_template_id', $template->id);
        });

        $honors = $query->get();
        $honorIds = $honors->pluck('id')->toArray();

        return $this->generateBulkCertificates($honorIds, $template, $generatedBy);
    }

    /**
     * Regenerate certificate (for updates or corrections)
     */
    public function regenerateCertificate(GeneratedCertificate $certificate, User $regeneratedBy)
    {
        $honor = StudentHonor::where('student_id', $certificate->student_id)
            ->where('academic_period_id', $certificate->academic_period_id)
            ->first();

        if (!$honor) {
            throw new \Exception('Associated honor record not found');
        }

        $template = $certificate->certificateTemplate;

        // Delete old file
        if ($certificate->file_path && Storage::exists($certificate->file_path)) {
            Storage::delete($certificate->file_path);
        }

        // Generate new certificate
        $certificateData = $this->prepareCertificateData($honor);
        $renderedContent = $template->renderTemplate($certificateData);
        $pdfPath = $this->generatePDF($renderedContent, $honor->student, $template->type);

        // Update certificate record
        $certificate->update([
            'certificate_data' => $certificateData,
            'file_path' => $pdfPath,
            'generated_by' => $regeneratedBy->id,
            'generated_at' => now(),
            'is_digitally_signed' => false, // Reset digital signature
        ]);

        // Log activity
        ActivityLog::logActivity(
            $regeneratedBy,
            'updated',
            'GeneratedCertificate',
            $certificate->id
        );

        return $certificate;
    }

    /**
     * Apply digital signature to certificate
     */
    public function signCertificate(GeneratedCertificate $certificate, User $signedBy)
    {
        if (!$certificate->hasFile()) {
            throw new \Exception('Certificate file not found');
        }

        // In a real implementation, you would use a digital signature library
        // For now, we'll just mark it as signed and add a signature overlay
        
        try {
            // Add digital signature overlay (simplified implementation)
            $this->addSignatureOverlay($certificate, $signedBy);
            
            $certificate->update([
                'is_digitally_signed' => true,
            ]);

            // Log activity
            ActivityLog::logActivity(
                $signedBy,
                'signed',
                'GeneratedCertificate',
                $certificate->id
            );

            Log::info('Certificate digitally signed', [
                'certificate_id' => $certificate->id,
                'signed_by' => $signedBy->id
            ]);

            return $certificate;

        } catch (\Exception $e) {
            Log::error('Certificate signing failed', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get certificate download URL
     */
    public function getCertificateDownloadUrl(GeneratedCertificate $certificate)
    {
        if (!$certificate->hasFile()) {
            return null;
        }

        return route('certificates.download', $certificate->id);
    }

    /**
     * Prepare certificate data from honor record
     */
    private function prepareCertificateData(StudentHonor $honor)
    {
        $student = $honor->student;
        $studentProfile = $student->studentProfile;
        $period = $honor->academicPeriod;

        return [
            'student_name' => $studentProfile ? $studentProfile->full_name : $student->name,
            'student_id' => $studentProfile ? $studentProfile->student_id : $student->id,
            'honor_type' => $honor->getHonorDisplayName(),
            'gpa' => number_format($honor->gpa, 2),
            'school_year' => $period->school_year,
            'period_name' => $period->name,
            'date' => now()->format('F j, Y'),
            'academic_level' => $studentProfile ? $studentProfile->academicLevel->name : '',
            'section' => $studentProfile ? $studentProfile->section : '',
            'certificate_number' => '', // Will be auto-generated
            'generated_date' => now()->format('F j, Y'),
        ];
    }

    /**
     * Generate PDF from HTML content
     */
    private function generatePDF(string $htmlContent, User $student, string $certificateType)
    {
        // Create PDF
        $pdf = Pdf::loadHTML($htmlContent);
        $pdf->setPaper('A4', 'landscape'); // Certificates are usually landscape

        // Generate unique filename
        $filename = $this->generateCertificateFilename($student, $certificateType);
        $filePath = "certificates/{$filename}";

        // Save PDF to storage
        Storage::put($filePath, $pdf->output());

        return $filePath;
    }

    /**
     * Generate unique certificate filename
     */
    private function generateCertificateFilename(User $student, string $certificateType)
    {
        $studentProfile = $student->studentProfile;
        $studentId = $studentProfile ? $studentProfile->student_id : $student->id;
        $timestamp = now()->format('Y-m-d_His');
        
        return "certificate_{$certificateType}_{$studentId}_{$timestamp}.pdf";
    }

    /**
     * Add digital signature overlay to PDF
     */
    private function addSignatureOverlay(GeneratedCertificate $certificate, User $signedBy)
    {
        // This is a simplified implementation
        // In production, you would use proper digital signature libraries
        
        // For now, we'll just add signature information to the certificate data
        $signatureData = [
            'signed_by' => $signedBy->name,
            'signed_at' => now()->toISOString(),
            'signature_hash' => hash('sha256', $certificate->id . $signedBy->id . now()->timestamp),
        ];

        $certificateData = $certificate->certificate_data;
        $certificateData['digital_signature'] = $signatureData;

        $certificate->update([
            'certificate_data' => $certificateData
        ]);
    }

    /**
     * Send certificate notification to student and parents
     */
    private function sendCertificateNotification(GeneratedCertificate $certificate)
    {
        $student = $certificate->student;
        $period = $certificate->academicPeriod;

        // Create in-app notification for student
        Notification::createForUser(
            $student->id,
            'certificate_generated',
            'Certificate Generated',
            "Your {$certificate->getTypeDisplayName()} for {$period->name} has been generated and is ready for download.",
            [
                'certificate_id' => $certificate->id,
                'certificate_type' => $certificate->certificate_type,
                'period' => $period->name,
                'download_url' => $this->getCertificateDownloadUrl($certificate),
            ]
        );

        // Send email to student
        if ($student->email) {
            Mail::to($student->email)->queue(
                new CertificateGeneratedEmail($student, $certificate, false)
            );
        }

        // Notify linked parents
        foreach ($student->linkedParents as $parent) {
            // Create in-app notification
            Notification::createForUser(
                $parent->id,
                'certificate_generated',
                'Student Certificate Generated',
                "A {$certificate->getTypeDisplayName()} has been generated for your child {$student->name} for {$period->name}.",
                [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'certificate_id' => $certificate->id,
                    'certificate_type' => $certificate->certificate_type,
                    'period' => $period->name,
                ]
            );

            // Send email to parent
            if ($parent->email) {
                Mail::to($parent->email)->queue(
                    new CertificateGeneratedEmail($student, $certificate, true)
                );
            }
        }
    }

    /**
     * Get certificate statistics
     */
    public function getCertificateStatistics(?AcademicPeriod $period = null, $academicLevelId = null)
    {
        $query = GeneratedCertificate::query();

        if ($period) {
            $query->where('academic_period_id', $period->id);
        }

        if ($academicLevelId) {
            $query->whereHas('student.studentProfile', function ($q) use ($academicLevelId) {
                $q->where('academic_level_id', $academicLevelId);
            });
        }

        $certificates = $query->get();

        return [
            'total_certificates' => $certificates->count(),
            'honor_roll_certificates' => $certificates->where('certificate_type', 'honor_roll')->count(),
            'graduation_certificates' => $certificates->where('certificate_type', 'graduation')->count(),
            'achievement_certificates' => $certificates->where('certificate_type', 'achievement')->count(),
            'digitally_signed' => $certificates->where('is_digitally_signed', true)->count(),
            'pending_signature' => $certificates->where('is_digitally_signed', false)->count(),
        ];
    }

    /**
     * Generate certificate for a student (general method)
     */
    public function generateCertificate(User $student, CertificateTemplate $template, string $certificateType, $academicPeriodId = null)
    {
        try {
            // Find or create honor record if it's a honor certificate
            if ($certificateType === 'honor_roll') {
                $honor = StudentHonor::where('student_id', $student->id)
                    ->where('academic_period_id', $academicPeriodId)
                    ->where('is_approved', true)
                    ->first();

                if (!$honor) {
                    throw new \Exception('No approved honor record found for this student and period');
                }

                return $this->generateHonorCertificate($honor, $template, Auth::user() ?? User::first());
            }

            // For non-honor certificates, prepare generic data
            $certificateData = $this->prepareGenericCertificateData($student, $certificateType, $academicPeriodId);
            
            // Render template with data
            $renderedContent = $template->renderTemplate($certificateData);
            
            // Generate PDF
            $pdfPath = $this->generatePDF($renderedContent, $student, $certificateType);
            
            // Create certificate record
            $certificate = GeneratedCertificate::create([
                'student_id' => $student->id,
                'certificate_template_id' => $template->id,
                'academic_period_id' => $academicPeriodId,
                'certificate_type' => $certificateType,
                'certificate_data' => $certificateData,
                'file_path' => $pdfPath,
                'generated_by' => Auth::id() ?? 1,
                'generated_at' => now(),
                'is_digitally_signed' => false,
            ]);

            // Log activity
            ActivityLog::logActivity(
                Auth::user() ?? User::first(),
                'created',
                'GeneratedCertificate',
                $certificate->id,
                null,
                $certificate->toArray()
            );

            // Send notification
            $this->sendCertificateNotification($certificate);

            return $certificate;

        } catch (\Exception $e) {
            Log::error('Certificate generation failed', [
                'student_id' => $student->id,
                'template_id' => $template->id,
                'certificate_type' => $certificateType,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate preview HTML for template testing
     */
    public function generatePreview(User $student, CertificateTemplate $template)
    {
        // Use sample data for preview
        $certificateData = $this->prepareSampleCertificateData($student, $template->type);
        
        // Render template with sample data
        $renderedContent = $template->renderTemplate($certificateData);
        
        return $renderedContent;
    }

    /**
     * Generate printable HTML for a certificate
     */
    public function generatePrintableHtml(GeneratedCertificate $certificate)
    {
        $template = $certificate->certificateTemplate;
        $certificateData = $certificate->certificate_data;

        // Add print-specific styling
        $printableContent = $template->renderTemplate($certificateData);
        
        // Wrap with print-friendly CSS
        $printableHtml = "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate - {$certificate->certificate_number}</title>
            <style>
                @media print {
                    body { margin: 0; }
                    @page { size: A4 landscape; margin: 0; }
                }
                body { 
                    font-family: 'Times New Roman', serif; 
                    margin: 0; 
                    padding: 20px;
                    background: white;
                }
                .certificate-container {
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .no-print {
                    display: none !important;
                }
            </style>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </head>
        <body>
            <div class='certificate-container'>
                {$printableContent}
            </div>
        </body>
        </html>";

        return $printableHtml;
    }

    /**
     * Generate bulk printable HTML for multiple certificates
     */
    public function generateBulkPrintableHtml($certificates)
    {
        $allContent = '';
        
        foreach ($certificates as $certificate) {
            $template = $certificate->certificateTemplate;
            $certificateData = $certificate->certificate_data;
            $renderedContent = $template->renderTemplate($certificateData);
            
            $allContent .= "
            <div class='certificate-page' style='page-break-after: always; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center;'>
                {$renderedContent}
            </div>";
        }

        // Wrap with print-friendly CSS
        $bulkPrintHtml = "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bulk Certificates</title>
            <style>
                @media print {
                    body { margin: 0; }
                    @page { size: A4 landscape; margin: 0; }
                    .certificate-page { page-break-after: always; }
                }
                body { 
                    font-family: 'Times New Roman', serif; 
                    margin: 0; 
                    padding: 0;
                    background: white;
                }
                .certificate-page:last-child {
                    page-break-after: avoid;
                }
            </style>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </head>
        <body>
            {$allContent}
        </body>
        </html>";

        return $bulkPrintHtml;
    }

    /**
     * Prepare generic certificate data for non-honor certificates
     */
    private function prepareGenericCertificateData(User $student, string $certificateType, $academicPeriodId = null)
    {
        $studentProfile = $student->studentProfile;
        $period = $academicPeriodId ? AcademicPeriod::find($academicPeriodId) : null;

        $data = [
            'student_name' => $studentProfile ? $studentProfile->full_name : $student->name,
            'student_id' => $studentProfile ? $studentProfile->student_id : $student->id,
            'certificate_type' => $certificateType,
            'date' => now()->format('F j, Y'),
            'academic_level' => $studentProfile ? $studentProfile->academicLevel->name : '',
            'section' => $studentProfile ? $studentProfile->section : '',
            'certificate_number' => '', // Will be auto-generated
            'generated_date' => now()->format('F j, Y'),
        ];

        if ($period) {
            $data['school_year'] = $period->school_year;
            $data['period_name'] = $period->name;
        }

        // Add specific data based on certificate type
        switch ($certificateType) {
            case 'graduation':
                $data['graduation_date'] = now()->format('F j, Y');
                $data['degree'] = $studentProfile ? $studentProfile->academicLevel->name : '';
                break;
            case 'achievement':
                $data['achievement_title'] = 'Academic Excellence';
                $data['achievement_description'] = 'For outstanding academic performance';
                break;
        }

        return $data;
    }

    /**
     * Prepare sample certificate data for previews
     */
    private function prepareSampleCertificateData(User $student, string $certificateType)
    {
        $studentProfile = $student->studentProfile;
        
        return [
            'student_name' => $studentProfile ? $studentProfile->full_name : $student->name,
            'student_id' => $studentProfile ? $studentProfile->student_id : 'STU-123456',
            'honor_type' => 'High Honor',
            'gpa' => '3.75',
            'school_year' => '2023-2024',
            'period_name' => 'First Semester',
            'date' => now()->format('F j, Y'),
            'academic_level' => $studentProfile ? $studentProfile->academicLevel->name : 'Grade 12',
            'section' => $studentProfile ? $studentProfile->section : 'Section A',
            'certificate_number' => 'CERT-PREVIEW-001',
            'generated_date' => now()->format('F j, Y'),
            'certificate_type' => $certificateType,
            'graduation_date' => now()->format('F j, Y'),
            'degree' => 'Senior High School',
            'achievement_title' => 'Academic Excellence',
            'achievement_description' => 'For outstanding academic performance',
        ];
    }
} 