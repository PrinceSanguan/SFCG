<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\User;
use App\Services\CertificateGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateController extends Controller
{
    private function sharedUser(): array
    {
        $user = Auth::user();
        return [
            'name' => $user?->name ?? '',
            'email' => $user?->email ?? '',
            'user_role' => method_exists($user, 'getAttribute') ? ($user->user_role ?? '') : '',
        ];
    }

    public function index(Request $request)
    {
        $currentSchoolYear = $request->get('school_year', '2024-2025');
        $selectedLevel = $request->get('academic_level_id');
        $selectedHonorType = $request->get('honor_type_id');

        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $honorTypes = HonorType::orderBy('name')->get();
        $templates = CertificateTemplate::with(['academicLevel', 'creator'])->orderBy('name')->get();

        // Get all approved honors from all academic levels with grade level and section info
        $honorsQuery = HonorResult::with([
            'student' => function ($query) {
                $query->select('id', 'name', 'student_number', 'year_level', 'section_id');
            },
            'honorType',
            'academicLevel',
            'approvedBy'
        ])->where('is_approved', true);

        if ($currentSchoolYear) {
            $honorsQuery->where('school_year', $currentSchoolYear);
        }

        if ($selectedLevel) {
            $honorsQuery->where('academic_level_id', $selectedLevel);
        }

        if ($selectedHonorType) {
            $honorsQuery->where('honor_type_id', $selectedHonorType);
        }

        $allHonors = $honorsQuery->orderBy('academic_level_id')
            ->orderBy('honor_type_id')
            ->orderBy('gpa', 'desc')
            ->get();

        // Group honors by academic level and honor type for honor roll display
        $honorRoll = $allHonors->groupBy(['academicLevel.name', 'honorType.name']);

        // Get certificates that have been generated
        $generatedCertificates = Certificate::with(['student', 'template', 'academicLevel'])
            ->where('school_year', $currentSchoolYear)
            ->orderByDesc('created_at')
            ->get();

        // Statistics
        $stats = [
            'total_honors' => $allHonors->count(),
            'elementary_honors' => $allHonors->where('academicLevel.key', 'elementary')->count(),
            'jhs_honors' => $allHonors->where('academicLevel.key', 'junior_highschool')->count(),
            'shs_honors' => $allHonors->where('academicLevel.key', 'senior_highschool')->count(),
            'college_honors' => $allHonors->where('academicLevel.key', 'college')->count(),
            'certificates_generated' => $generatedCertificates->count(),
            'certificates_pending' => $allHonors->count() - $generatedCertificates->count(),
        ];

        // Honor type breakdown
        $honorTypeStats = $honorTypes->map(function ($type) use ($allHonors) {
            $typeHonors = $allHonors->where('honor_type_id', $type->id);
            return [
                'id' => $type->id,
                'name' => $type->name,
                'key' => $type->key,
                'count' => $typeHonors->count(),
                'by_level' => [
                    'elementary' => $typeHonors->where('academicLevel.key', 'elementary')->count(),
                    'junior_highschool' => $typeHonors->where('academicLevel.key', 'junior_highschool')->count(),
                    'senior_highschool' => $typeHonors->where('academicLevel.key', 'senior_highschool')->count(),
                    'college' => $typeHonors->where('academicLevel.key', 'college')->count(),
                ]
            ];
        });

        return Inertia::render('Admin/Academic/Certificates/Index', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'templates' => $templates,
            'allHonors' => $allHonors,
            'honorRoll' => $honorRoll,
            'generatedCertificates' => $generatedCertificates,
            'stats' => $stats,
            'honorTypeStats' => $honorTypeStats,
            'schoolYears' => $this->getSchoolYears(),
            'currentSchoolYear' => $currentSchoolYear,
            'selectedLevel' => $selectedLevel,
            'selectedHonorType' => $selectedHonorType,
        ]);
    }

    public function search(Request $request)
    {
        $query = Certificate::with(['student', 'template', 'academicLevel']);

        // Search by serial number
        if ($request->filled('serial_number')) {
            $query->where('serial_number', 'like', '%' . $request->serial_number . '%');
        }

        // Search by student name
        if ($request->filled('student_name')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->student_name . '%');
            });
        }

        // Search by student number
        if ($request->filled('student_number')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('student_number', 'like', '%' . $request->student_number . '%');
            });
        }

        // Filter by template
        if ($request->filled('template_id')) {
            $query->where('template_id', $request->template_id);
        }

        // Filter by academic level
        if ($request->filled('academic_level_id')) {
            $query->where('academic_level_id', $request->academic_level_id);
        }

        // Filter by school year
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->school_year);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $certificates = $query->orderByDesc('created_at')->paginate(50);

        return response()->json($certificates);
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'key' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:certificate_templates,key'],
            'name' => ['required', 'string', 'max:150'],
            'content_html' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'docx' => ['nullable', 'file', 'mimes:doc,docx', 'max:10240'],
        ]);

        $validated['created_by'] = Auth::id();
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Optional DOCX upload -> convert to HTML
        if ($request->hasFile('docx')) {
            try {
                $phpWord = \PhpOffice\PhpWord\IOFactory::load($request->file('docx')->getRealPath());
                $htmlWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'HTML');
                ob_start();
                $htmlWriter->save('php://output');
                $html = ob_get_clean();
                $validated['content_html'] = $html;
                $validated['source_docx_path'] = $request->file('docx')->store('certificates/templates', 'public');
            } catch (\Throwable $e) {
                Log::warning('DOCX to HTML conversion failed on create: '.$e->getMessage());
            }
        }

        CertificateTemplate::create($validated);
        return back();
    }

    public function updateTemplate(Request $request, CertificateTemplate $template)
    {
        $validated = $request->validate([
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'key' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:certificate_templates,key,' . $template->id],
            'name' => ['required', 'string', 'max:150'],
            'content_html' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'docx' => ['nullable', 'file', 'mimes:doc,docx', 'max:10240'],
        ]);

        // Handle optional DOCX upload and convert to HTML
        if ($request->hasFile('docx')) {
            $path = $request->file('docx')->store('certificates/templates', 'public');
            $template->source_docx_path = $path;

            try {
                $phpWord = \PhpOffice\PhpWord\IOFactory::load($request->file('docx')->getRealPath());
                $htmlWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'HTML');
                ob_start();
                $htmlWriter->save('php://output');
                $html = ob_get_clean();
                // Basic cleanup; users can edit in-place after upload
                $validated['content_html'] = $html;
            } catch (\Throwable $e) {
                Log::warning('DOCX to HTML conversion failed: '.$e->getMessage());
            }
        }

        $template->update($validated);
        return back();
    }

    public function destroyTemplate(CertificateTemplate $template)
    {
        $template->delete();
        return back();
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string'],
            'template_id' => ['nullable', 'exists:certificate_templates,id'], // Optional - service will find template
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'school_year' => ['required', 'string'],
        ]);

        $academicLevel = AcademicLevel::findOrFail($validated['academic_level_id']);

        // Resolve student ID if it's a student number
        $studentId = ctype_digit($validated['student_id'])
            ? (int) $validated['student_id']
            : User::where('student_number', $validated['student_id'])->value('id');

        if (!$studentId) {
            return back()->withErrors(['student_id' => 'Could not resolve student ID.']);
        }

        // Check if honor exists and is approved
        $honor = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->where('student_id', $studentId)
            ->where('academic_level_id', $validated['academic_level_id'])
            ->where('school_year', $validated['school_year'])
            ->where('is_approved', true)
            ->first();

        if (!$honor) {
            return back()->withErrors(['student_id' => 'No approved honor found for this student in the selected academic level and school year.']);
        }

        // Check if certificate already exists
        $existingCertificate = Certificate::where([
            'student_id' => $studentId,
            'academic_level_id' => $validated['academic_level_id'],
            'school_year' => $validated['school_year'],
        ])->first();

        if ($existingCertificate) {
            return back()->with('info', 'Certificate already exists for this student. Serial: ' . $existingCertificate->serial_number);
        }

        // Use CertificateGenerationService to generate certificate with payload
        $certificateService = app(CertificateGenerationService::class);

        try {
            $certificate = $certificateService->generateHonorCertificate($honor);

            if ($certificate) {
                Log::info('Certificate generated manually by admin', [
                    'certificate_id' => $certificate->id,
                    'serial_number' => $certificate->serial_number,
                    'student_id' => $studentId,
                    'academic_level' => $academicLevel->key,
                    'school_year' => $validated['school_year'],
                    'generated_by' => Auth::id(),
                ]);

                return back()->with('success', 'Certificate generated successfully! Serial: ' . $certificate->serial_number);
            } else {
                return back()->withErrors(['error' => 'Certificate generation failed. Check logs for details.']);
            }
        } catch (\Exception $e) {
            Log::error('Admin certificate generation failed', [
                'student_id' => $studentId,
                'academic_level' => $academicLevel->key,
                'error' => $e->getMessage(),
                'generated_by' => Auth::id(),
            ]);

            return back()->withErrors(['error' => 'Certificate generation failed: ' . $e->getMessage()]);
        }
    }

    public function generateBulk(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => ['required', 'array'],
            'student_ids.*' => ['integer', 'exists:users,id'],
            'template_id' => ['nullable', 'exists:certificate_templates,id'], // Optional - service will find template
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'school_year' => ['required', 'string'],
        ]);

        $academicLevel = AcademicLevel::findOrFail($validated['academic_level_id']);
        $certificateService = app(CertificateGenerationService::class);

        $results = [
            'success' => 0,
            'failed' => 0,
            'already_exists' => 0,
            'errors' => [],
        ];

        // Get honor results for these students
        $honors = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->whereIn('student_id', $validated['student_ids'])
            ->where('academic_level_id', $validated['academic_level_id'])
            ->where('school_year', $validated['school_year'])
            ->where('is_approved', true)
            ->get();

        foreach ($honors as $honor) {
            try {
                // Check if certificate already exists
                $existingCertificate = Certificate::where([
                    'student_id' => $honor->student_id,
                    'academic_level_id' => $honor->academic_level_id,
                    'school_year' => $honor->school_year,
                ])->first();

                if ($existingCertificate) {
                    $results['already_exists']++;
                    continue;
                }

                // Use CertificateGenerationService to generate certificate with payload
                $certificate = $certificateService->generateHonorCertificate($honor);

                if ($certificate) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                    $results['errors'][] = [
                        'student_name' => $honor->student->name,
                        'student_number' => $honor->student->student_number,
                        'error' => 'Certificate generation returned null',
                    ];
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_name' => $honor->student->name,
                    'student_number' => $honor->student->student_number,
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info('Bulk certificate generation completed', [
            'academic_level' => $academicLevel->name,
            'school_year' => $validated['school_year'],
            'student_count' => count($validated['student_ids']),
            'results' => $results,
            'generated_by' => Auth::id(),
        ]);

        $message = "Bulk generation completed. Generated: {$results['success']}, Failed: {$results['failed']}, Already exists: {$results['already_exists']}";

        if (!empty($results['errors'])) {
            $message .= '. Some errors occurred - check logs for details.';
        }

        return back()->with('success', $message);
    }



    public function download(Certificate $certificate)
    {
        $html = $this->renderCertificateHtml($certificate);
        $pdf = Pdf::loadView('certificates.base', ['html' => $html]);

        $certificate->update([
            'status' => 'downloaded',
            'downloaded_at' => now(),
        ]);

        return $pdf->download($certificate->serial_number . '.pdf');
    }

    public function print(Certificate $certificate)
    {
        $html = $this->renderCertificateHtml($certificate);
        $pdf = Pdf::loadView('certificates.base', ['html' => $html]);

        $certificate->update([
            'status' => 'printed',
            'printed_at' => now(),
            'printed_by' => Auth::id(),
        ]);

        return $pdf->stream($certificate->serial_number . '.pdf');
    }

    private function renderCertificateHtml(Certificate $certificate): string
    {
        $template = $certificate->template;
        $student = $certificate->student;
        $academicLevel = $certificate->academicLevel;

        $replacements = [
            '{{student_name}}' => $student->name,
            '{{student_number}}' => $student->student_number ?? '',
            '{{school_year}}' => $certificate->school_year,
            '{{academic_level}}' => $academicLevel->name ?? '',
            '{{date_now}}' => now()->format('F d, Y'),
        ];

        $html = strtr($template->content_html, $replacements);

        if (is_array($certificate->payload)) {
            foreach ($certificate->payload as $key => $value) {
                $html = str_replace('{{' . $key . '}}', (string) $value, $html);
            }
        }

        return $html;
    }

    private function generateSerialNumber(string $schoolYear): string
    {
        $year = preg_replace('/[^0-9]/', '', $schoolYear);
        $suffix = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        return 'CERT-' . ($year ?: date('Y')) . '-' . $suffix;
    }

    private function getSchoolYears(): array
    {
        $years = [];
        $start = (int) date('Y') - 1;
        for ($i = 0; $i < 5; $i++) {
            $from = $start + $i;
            $to = $from + 1;
            $years[] = $from . '-' . $to;
        }
        return $years;
    }

    private function resolveStudentId(string $identifier): ?int
    {
        $trimmed = trim($identifier);
        if ($trimmed === '') {
            return null;
        }
        if (ctype_digit($trimmed)) {
            $user = User::find((int)$trimmed);
            return $user?->id;
        }
        $user = User::where('student_number', $trimmed)->first();
        return $user?->id;
    }

    public function resolveStudentApi(Request $request)
    {
        $request->validate(['q' => ['required', 'string']]);
        $q = $request->string('q')->trim();
        $user = null;
        if (ctype_digit($q)) {
            $user = User::find((int)$q);
        }
        if (!$user) {
            $user = User::where('student_number', $q)->first();
        }
        if (!$user) {
            return response()->json(['found' => false]);
        }
        return response()->json([
            'found' => true,
            'id' => $user->id,
            'name' => $user->name,
            'student_number' => $user->student_number,
        ]);
    }

    /**
     * Validate if a student is qualified for honors in the given academic level and school year
     */
    private function validateStudentHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        // Check if student has any honor results for this academic level and school year
        $honorResult = \App\Models\HonorResult::where([
            'student_id' => $studentId,
            'academic_level_id' => $academicLevelId,
            'school_year' => $schoolYear,
        ])->where('is_approved', true) // Only approved honor results
        ->first();

        if (!$honorResult) {
            return [
                'qualified' => false,
                'reason' => 'No approved honor qualification found for this academic level and school year.'
            ];
        }

        // Check if the honor result is not rejected
        if ($honorResult->is_rejected) {
            return [
                'qualified' => false,
                'reason' => 'Honor qualification was rejected. Reason: ' . ($honorResult->rejection_reason ?? 'No reason provided.')
            ];
        }

        // Check if the honor result is pending approval
        if ($honorResult->is_pending_approval && !$honorResult->is_approved) {
            return [
                'qualified' => false,
                'reason' => 'Honor qualification is pending approval.'
            ];
        }

        return [
            'qualified' => true,
            'reason' => 'Student is qualified for ' . $honorResult->honorType->name . ' (GPA: ' . $honorResult->gpa . ')',
            'honor_result' => $honorResult
        ];
    }

    /**
     * Get the appropriate certificate template for a specific honor type and academic level
     */
    private function getTemplateForHonorType(\App\Models\HonorType $honorType, \App\Models\AcademicLevel $academicLevel): ?\App\Models\CertificateTemplate
    {
        // Map honor types to template keys based on academic level
        $templateKey = match ($academicLevel->key) {
            'elementary' => match ($honorType->key) {
                'with_honors' => 'elementary_honor_certificate',
                'with_high_honors' => 'elementary_high_honor_certificate',
                'with_highest_honors' => 'elementary_highest_honor_certificate',
                default => 'elementary_honor_certificate',
            },
            'junior_highschool' => match ($honorType->key) {
                'with_honors' => 'junior_high_honor_certificate',
                'with_high_honors' => 'junior_high_high_honor_certificate',
                'with_highest_honors' => 'junior_high_highest_honor_certificate',
                default => 'junior_high_honor_certificate',
            },
            'senior_highschool' => match ($honorType->key) {
                'with_honors' => 'senior_high_honor_certificate',
                'with_high_honors' => 'senior_high_high_honor_certificate',
                'with_highest_honors' => 'senior_high_highest_honor_certificate',
                default => 'senior_high_honor_certificate',
            },
            'college' => match ($honorType->key) {
                'deans_list' => 'college_deans_list_certificate',
                'college_honors' => 'college_honors_certificate',
                'cum_laude' => 'college_cum_laude_certificate',
                'magna_cum_laude' => 'college_magna_cum_laude_certificate',
                'summa_cum_laude' => 'college_summa_cum_laude_certificate',
                default => 'college_honor_certificate',
            },
            default => null,
        };

        if (!$templateKey) {
            return null;
        }

        return \App\Models\CertificateTemplate::where('key', $templateKey)
            ->where('academic_level_id', $academicLevel->id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Generate certificate payload with honor-specific data
     */
    private function generateHonorCertificatePayload(\App\Models\User $student, \App\Models\AcademicLevel $academicLevel, \App\Models\HonorResult $honorResult): array
    {
        return [
            'student_name' => $student->name,
            'student_number' => $student->student_number ?? '',
            'academic_level' => $academicLevel->name,
            'honor_type' => $honorResult->honorType->name,
            'gpa' => $honorResult->gpa,
            'school_year' => $honorResult->school_year,
            'date_generated' => now()->format('F d, Y'),
            'honor_description' => $this->getHonorDescription($honorResult->honorType, $academicLevel),
        ];
    }

    /**
     * Get a description for the honor type
     */
    private function getHonorDescription(\App\Models\HonorType $honorType, \App\Models\AcademicLevel $academicLevel): string
    {
        return match ($honorType->key) {
            'with_honors' => 'For achieving academic excellence with a GPA of 90 and above',
            'with_high_honors' => 'For achieving high academic excellence with a GPA of 95-97 and no grade below 90',
            'with_highest_honors' => 'For achieving the highest academic excellence with a GPA of 98-100 and no grade below 93',
            'deans_list' => 'For being included in the Dean\'s List with outstanding academic performance',
            'college_honors' => 'For achieving college honors with consistent academic excellence',
            'cum_laude' => 'For graduating with honors (Cum Laude)',
            'magna_cum_laude' => 'For graduating with high honors (Magna Cum Laude)',
            'summa_cum_laude' => 'For graduating with highest honors (Summa Cum Laude)',
            default => 'For achieving academic excellence',
        };
    }

    /**
     * Bulk generate certificates by academic level
     */
    public function bulkGenerateByLevel(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'school_year' => ['required', 'string'],
            'honor_type_id' => ['nullable', 'exists:honor_types,id'],
        ]);

        $academicLevel = AcademicLevel::findOrFail($validated['academic_level_id']);
        $certificateService = app(CertificateGenerationService::class);

        // Get all approved honors for this level
        $honorsQuery = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->where('is_approved', true)
            ->where('academic_level_id', $validated['academic_level_id'])
            ->where('school_year', $validated['school_year']);

        if ($validated['honor_type_id']) {
            $honorsQuery->where('honor_type_id', $validated['honor_type_id']);
        }

        $honors = $honorsQuery->get();

        $results = [
            'success' => 0,
            'failed' => 0,
            'already_exists' => 0,
            'errors' => [],
        ];

        foreach ($honors as $honor) {
            try {
                // Check if certificate already exists
                $existingCertificate = Certificate::where([
                    'student_id' => $honor->student_id,
                    'academic_level_id' => $honor->academic_level_id,
                    'school_year' => $honor->school_year,
                ])->first();

                if ($existingCertificate) {
                    $results['already_exists']++;
                    continue;
                }

                $certificate = $certificateService->generateHonorCertificate($honor);

                if ($certificate) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_name' => $honor->student->name,
                    'student_number' => $honor->student->student_number,
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info('Bulk certificate generation completed', [
            'academic_level' => $academicLevel->name,
            'school_year' => $validated['school_year'],
            'results' => $results,
            'generated_by' => Auth::id(),
        ]);

        return back()->with('success', "Bulk generation completed. Generated: {$results['success']}, Failed: {$results['failed']}, Already exists: {$results['already_exists']}");
    }

    /**
     * Bulk generate certificates by honor type
     */
    public function bulkGenerateByHonorType(Request $request)
    {
        $validated = $request->validate([
            'honor_type_id' => ['required', 'exists:honor_types,id'],
            'school_year' => ['required', 'string'],
            'academic_level_id' => ['nullable', 'exists:academic_levels,id'],
        ]);

        $honorType = HonorType::findOrFail($validated['honor_type_id']);
        $certificateService = app(CertificateGenerationService::class);

        // Get all approved honors for this honor type
        $honorsQuery = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->where('is_approved', true)
            ->where('honor_type_id', $validated['honor_type_id'])
            ->where('school_year', $validated['school_year']);

        if ($validated['academic_level_id']) {
            $honorsQuery->where('academic_level_id', $validated['academic_level_id']);
        }

        $honors = $honorsQuery->get();

        $results = [
            'success' => 0,
            'failed' => 0,
            'already_exists' => 0,
            'errors' => [],
        ];

        foreach ($honors as $honor) {
            try {
                // Check if certificate already exists
                $existingCertificate = Certificate::where([
                    'student_id' => $honor->student_id,
                    'academic_level_id' => $honor->academic_level_id,
                    'school_year' => $honor->school_year,
                ])->first();

                if ($existingCertificate) {
                    $results['already_exists']++;
                    continue;
                }

                $certificate = $certificateService->generateHonorCertificate($honor);

                if ($certificate) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_name' => $honor->student->name,
                    'student_number' => $honor->student->student_number,
                    'error' => $e->getMessage(),
                ];
            }
        }

        Log::info('Bulk certificate generation by honor type completed', [
            'honor_type' => $honorType->name,
            'school_year' => $validated['school_year'],
            'results' => $results,
            'generated_by' => Auth::id(),
        ]);

        return back()->with('success', "Bulk generation completed. Generated: {$results['success']}, Failed: {$results['failed']}, Already exists: {$results['already_exists']}");
    }

    /**
     * Bulk print certificates in PDF format
     */
    public function bulkPrintPDF(Request $request)
    {
        $validated = $request->validate([
            'certificate_ids' => ['required', 'array'],
            'certificate_ids.*' => ['exists:certificates,id'],
        ]);

        $certificates = Certificate::with(['student', 'template', 'academicLevel'])
            ->whereIn('id', $validated['certificate_ids'])
            ->get();

        if ($certificates->isEmpty()) {
            return back()->withErrors(['certificate_ids' => 'No certificates found.']);
        }

        // Generate a combined PDF with all certificates
        $htmlContent = '';
        foreach ($certificates as $certificate) {
            $htmlContent .= $this->renderCertificateHtml($certificate);
            $htmlContent .= '<div style="page-break-after: always;"></div>';
        }

        // Remove the last page break
        $htmlContent = rtrim($htmlContent, '<div style="page-break-after: always;"></div>');

        $pdf = Pdf::loadView('certificates.bulk', ['html' => $htmlContent])
            ->setPaper('a4', 'landscape');

        // Update certificate status to printed
        Certificate::whereIn('id', $validated['certificate_ids'])->update([
            'status' => 'printed',
            'printed_at' => now(),
            'printed_by' => Auth::id(),
        ]);

        $filename = 'bulk_certificates_' . now()->format('Y-m-d_H-i-s') . '.pdf';

        Log::info('Bulk certificates printed', [
            'certificate_count' => $certificates->count(),
            'certificate_ids' => $validated['certificate_ids'],
            'printed_by' => Auth::id(),
        ]);

        return $pdf->download($filename);
    }

    /**
     * View honor roll for a specific academic level and school year
     */
    public function honorRoll(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => ['nullable', 'exists:academic_levels,id'],
            'honor_type_id' => ['nullable', 'exists:honor_types,id'],
            'school_year' => ['required', 'string'],
        ]);

        $honorsQuery = HonorResult::with(['student', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('is_approved', true)
            ->where('school_year', $validated['school_year']);

        if ($validated['academic_level_id']) {
            $honorsQuery->where('academic_level_id', $validated['academic_level_id']);
        }

        if ($validated['honor_type_id']) {
            $honorsQuery->where('honor_type_id', $validated['honor_type_id']);
        }

        $honors = $honorsQuery->orderBy('academic_level_id')
            ->orderBy('honor_type_id')
            ->orderBy('gpa', 'desc')
            ->get();

        // Group by academic level and honor type
        $honorRoll = $honors->groupBy(['academicLevel.name', 'honorType.name']);

        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $honorTypes = HonorType::orderBy('name')->get();

        return Inertia::render('Admin/Academic/Certificates/HonorRoll', [
            'user' => $this->sharedUser(),
            'honorRoll' => $honorRoll,
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'schoolYear' => $validated['school_year'],
            'selectedLevel' => $validated['academic_level_id'],
            'selectedHonorType' => $validated['honor_type_id'],
            'schoolYears' => $this->getSchoolYears(),
        ]);
    }

    /**
     * Generate honor roll PDF
     */
    public function generateHonorRollPDF(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => ['nullable', 'exists:academic_levels,id'],
            'honor_type_id' => ['nullable', 'exists:honor_types,id'],
            'school_year' => ['required', 'string'],
        ]);

        $honorsQuery = HonorResult::with(['student', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('is_approved', true)
            ->where('school_year', $validated['school_year']);

        if (!empty($validated['academic_level_id'])) {
            $honorsQuery->where('academic_level_id', $validated['academic_level_id']);
        }

        if (!empty($validated['honor_type_id'])) {
            $honorsQuery->where('honor_type_id', $validated['honor_type_id']);
        }

        $honors = $honorsQuery->orderBy('academic_level_id')
            ->orderBy('honor_type_id')
            ->orderBy('gpa', 'desc')
            ->get();

        $honorRoll = $honors->groupBy(['academicLevel.name', 'honorType.name']);

        $pdf = Pdf::loadView('certificates.honor-roll', [
            'honorRoll' => $honorRoll,
            'schoolYear' => $validated['school_year'],
            'generatedAt' => now()->format('F j, Y g:i A'),
        ])->setPaper('a4', 'portrait');

        $filename = 'honor_roll_' . $validated['school_year'] . '_' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

}


