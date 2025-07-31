<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeneratedCertificate;
use App\Models\CertificateTemplate;
use App\Models\StudentHonor;
use App\Models\AcademicPeriod;
use App\Models\User;
use App\Services\CertificateGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateGenerationService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    public function index(Request $request)
    {
        $query = GeneratedCertificate::with(['student.studentProfile', 'certificateTemplate', 'academicPeriod', 'generatedBy']);

        // Apply filters
        if ($request->filled('certificate_type')) {
            $query->where('certificate_type', $request->certificate_type);
        }

        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('certificate_number', 'like', "%{$search}%");
        }

        $certificates = $query->orderBy('generated_at', 'desc')->paginate(20);

        // Get filter options
        $certificateTypes = GeneratedCertificate::distinct('certificate_type')->pluck('certificate_type');
        $academicPeriods = AcademicPeriod::where('is_active', true)->get();
        $templates = CertificateTemplate::where('is_active', true)->get();

        // Get statistics
        $stats = [
            'total_certificates' => GeneratedCertificate::count(),
            'honor_roll_certificates' => GeneratedCertificate::where('certificate_type', 'honor_roll')->count(),
            'graduation_certificates' => GeneratedCertificate::where('certificate_type', 'graduation')->count(),
            'achievement_certificates' => GeneratedCertificate::where('certificate_type', 'achievement')->count(),
        ];

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
            'certificateTypes' => $certificateTypes,
            'academicPeriods' => $academicPeriods,
            'templates' => $templates,
            'stats' => $stats,
            'filters' => $request->only(['certificate_type', 'academic_period_id', 'search']),
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'certificate_type' => 'required|in:honor_roll,graduation,achievement',
            'template_id' => 'required|exists:certificate_templates,id',
            'academic_period_id' => 'nullable|exists:academic_periods,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $template = CertificateTemplate::findOrFail($request->template_id);
                $generatedCertificates = [];

                foreach ($request->student_ids as $studentId) {
                    $student = User::with('studentProfile')->findOrFail($studentId);
                    
                    // Check if certificate already exists for this student and period
                    $existingCertificate = GeneratedCertificate::where([
                        'student_id' => $studentId,
                        'certificate_type' => $request->certificate_type,
                        'academic_period_id' => $request->academic_period_id,
                    ])->first();

                    if ($existingCertificate) {
                        continue; // Skip if certificate already exists
                    }

                    // Generate certificate using the service
                    $certificate = $this->certificateService->generateCertificate(
                        $student,
                        $template,
                        $request->certificate_type,
                        $request->academic_period_id
                    );

                    $generatedCertificates[] = $certificate;
                }
            });

            return back()->with('success', 'Certificates generated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Error generating certificates: ' . $e->getMessage());
        }
    }

    public function download(GeneratedCertificate $certificate)
    {
        if (!$certificate->file_path || !Storage::exists($certificate->file_path)) {
            return back()->with('error', 'Certificate file not found');
        }

        return Storage::download($certificate->file_path, "certificate_{$certificate->certificate_number}.pdf");
    }

    public function bulkGenerate(Request $request)
    {
        $request->validate([
            'certificate_type' => 'required|in:honor_roll,graduation,achievement',
            'template_id' => 'required|exists:certificate_templates,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'criteria' => 'required|array',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $template = CertificateTemplate::findOrFail($request->template_id);
                $criteria = $request->criteria;

                // Get students based on criteria
                $studentsQuery = User::where('user_role', 'student')->with('studentProfile');

                if ($request->certificate_type === 'honor_roll') {
                    // Generate for honor roll students
                    $honorStudents = StudentHonor::where('academic_period_id', $request->academic_period_id)
                                                 ->where('is_active', true)
                                                 ->pluck('student_id');
                    $studentsQuery->whereIn('id', $honorStudents);
                } elseif (isset($criteria['academic_level_id'])) {
                    $studentsQuery->whereHas('studentProfile', function ($q) use ($criteria) {
                        $q->where('academic_level_id', $criteria['academic_level_id']);
                    });
                }

                $students = $studentsQuery->get();

                foreach ($students as $student) {
                    // Check if certificate already exists
                    $existingCertificate = GeneratedCertificate::where([
                        'student_id' => $student->id,
                        'certificate_type' => $request->certificate_type,
                        'academic_period_id' => $request->academic_period_id,
                    ])->first();

                    if ($existingCertificate) {
                        continue;
                    }

                    $this->certificateService->generateCertificate(
                        $student,
                        $template,
                        $request->certificate_type,
                        $request->academic_period_id
                    );
                }
            });

            return back()->with('success', 'Bulk certificates generated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Error generating bulk certificates: ' . $e->getMessage());
        }
    }

    public function destroy(GeneratedCertificate $certificate)
    {
        try {
            // Delete file from storage
            if ($certificate->file_path && Storage::exists($certificate->file_path)) {
                Storage::delete($certificate->file_path);
            }

            $certificate->delete();

            return back()->with('success', 'Certificate deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Error deleting certificate: ' . $e->getMessage());
        }
    }

    public function templates(Request $request)
    {
        $templates = CertificateTemplate::orderBy('name')->paginate(20);

        return Inertia::render('Admin/Certificates/Templates', [
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:honor_roll,graduation,achievement',
            'template_content' => 'required|string',
            'variables' => 'nullable|json',
        ]);

        CertificateTemplate::create($request->all());

        return back()->with('success', 'Certificate template created successfully');
    }

    public function updateTemplate(Request $request, CertificateTemplate $template)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:honor_roll,graduation,achievement',
            'template_content' => 'required|string',
            'variables' => 'nullable|json',
        ]);

        $template->update($request->all());

        return back()->with('success', 'Certificate template updated successfully');
    }

    public function destroyTemplate(CertificateTemplate $template)
    {
        $template->delete();

        return back()->with('success', 'Certificate template deleted successfully');
    }

    public function preview(CertificateTemplate $template, Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $student = User::with('studentProfile')->findOrFail($request->student_id);
        
        // Generate preview HTML (without saving to database)
        $previewHtml = $this->certificateService->generatePreview($student, $template);

        return response()->json(['preview' => $previewHtml]);
    }

    public function print(GeneratedCertificate $certificate)
    {
        if (!$certificate->file_path || !Storage::exists($certificate->file_path)) {
            return back()->with('error', 'Certificate file not found');
        }

        // Mark certificate as printed
        $certificate->update([
            'printed_at' => now(),
            'print_count' => ($certificate->print_count ?? 0) + 1,
        ]);

        // Generate printable view
        $printContent = $this->certificateService->generatePrintableHtml($certificate);
        
        return response($printContent)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="certificate_' . $certificate->certificate_number . '.html"');
    }

    public function bulkPrint(Request $request)
    {
        $request->validate([
            'certificate_ids' => 'required|array',
            'certificate_ids.*' => 'exists:generated_certificates,id',
        ]);

        $certificates = GeneratedCertificate::whereIn('id', $request->certificate_ids)
            ->with(['student.studentProfile', 'certificateTemplate'])
            ->get();

        if ($certificates->isEmpty()) {
            return back()->with('error', 'No certificates found');
        }

        // Mark all certificates as printed
        GeneratedCertificate::whereIn('id', $request->certificate_ids)
            ->increment('print_count', 1, ['printed_at' => now()]);

        // Generate bulk printable content
        $printContent = $this->certificateService->generateBulkPrintableHtml($certificates);
        
        return response($printContent)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="bulk_certificates.html"');
    }

    public function trackIssuance(Request $request)
    {
        $query = GeneratedCertificate::with(['student.studentProfile', 'certificateTemplate', 'generatedBy']);

        // Apply filters
        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'issued') {
                $query->whereNotNull('issued_at');
            } elseif ($status === 'not_issued') {
                $query->whereNull('issued_at');
            } elseif ($status === 'printed') {
                $query->whereNotNull('printed_at');
            } elseif ($status === 'not_printed') {
                $query->whereNull('printed_at');
            }
        }

        if ($request->filled('date_from')) {
            $query->where('generated_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('generated_at', '<=', $request->date_to . ' 23:59:59');
        }

        if ($request->filled('certificate_type')) {
            $query->where('certificate_type', $request->certificate_type);
        }

        $certificates = $query->orderBy('generated_at', 'desc')->paginate(20);

        // Get statistics
        $stats = [
            'total_generated' => GeneratedCertificate::count(),
            'total_issued' => GeneratedCertificate::whereNotNull('issued_at')->count(),
            'total_printed' => GeneratedCertificate::whereNotNull('printed_at')->count(),
            'pending_issuance' => GeneratedCertificate::whereNull('issued_at')->count(),
        ];

        return Inertia::render('Admin/Certificates/Tracking', [
            'certificates' => $certificates,
            'stats' => $stats,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'certificate_type']),
        ]);
    }

    public function markAsIssued(Request $request)
    {
        $request->validate([
            'certificate_ids' => 'required|array',
            'certificate_ids.*' => 'exists:generated_certificates,id',
            'issued_to' => 'nullable|string|max:255',
            'issued_by' => 'nullable|string|max:255',
        ]);

        GeneratedCertificate::whereIn('id', $request->certificate_ids)
            ->update([
                'issued_at' => now(),
                'issued_to' => $request->issued_to,
                'issued_by' => $request->issued_by ?? (Auth::user() ? Auth::user()->name : 'System'),
            ]);

        return back()->with('success', 'Certificates marked as issued successfully');
    }
}
