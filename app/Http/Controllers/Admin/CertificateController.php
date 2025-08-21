<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\User;
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
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $templates = CertificateTemplate::with(['academicLevel', 'creator'])->orderBy('name')->get();
        $recentCertificates = Certificate::with(['student', 'template', 'academicLevel'])
            ->orderByDesc('created_at')
            ->limit(25)
            ->get();

        return Inertia::render('Admin/Academic/Certificates/Index', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'templates' => $templates,
            'recentCertificates' => $recentCertificates,
            'schoolYears' => $this->getSchoolYears(),
        ]);
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
            'template_id' => ['required', 'exists:certificate_templates,id'],
            'student_id' => ['required', 'string'], // Accept numeric user ID or student_number
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'school_year' => ['required', 'string'],
            'payload' => ['nullable', 'array'],
        ]);

        $resolvedStudentId = $this->resolveStudentId($validated['student_id']);
        if ($resolvedStudentId === null) {
            return back()->withErrors(['student_id' => 'Student not found by ID or student number.'])->withInput();
        }

        $certificate = new Certificate();
        $certificate->fill([
            'template_id' => $validated['template_id'],
            'student_id' => $resolvedStudentId,
            'academic_level_id' => $validated['academic_level_id'],
            'school_year' => $validated['school_year'],
            'payload' => $validated['payload'] ?? [],
        ]);
        $certificate->serial_number = $this->generateSerialNumber($validated['school_year']);
        $certificate->status = 'generated';
        $certificate->generated_at = now();
        $certificate->generated_by = Auth::id();
        $certificate->save();

        return back();
    }

    public function generateBulk(Request $request)
    {
        $validated = $request->validate([
            'template_id' => ['required', 'exists:certificate_templates,id'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'school_year' => ['required', 'string'],
            'student_ids' => ['required', 'array'], // Accept IDs or student_numbers
            'student_ids.*' => ['string'],
            'payload' => ['nullable', 'array'],
        ]);

        $errors = [];
        foreach ($validated['student_ids'] as $identifier) {
            $studentId = $this->resolveStudentId($identifier);
            if ($studentId === null) {
                $errors[] = $identifier;
                continue;
            }
            $certificate = new Certificate();
            $certificate->template_id = $validated['template_id'];
            $certificate->student_id = $studentId;
            $certificate->academic_level_id = $validated['academic_level_id'];
            $certificate->school_year = $validated['school_year'];
            $certificate->payload = $validated['payload'] ?? [];
            $certificate->serial_number = $this->generateSerialNumber($validated['school_year']);
            $certificate->status = 'generated';
            $certificate->generated_at = now();
            $certificate->generated_by = Auth::id();
            $certificate->save();
        }

        if (!empty($errors)) {
            return back()->withErrors(['student_ids' => 'Some identifiers could not be resolved: '.implode(', ', $errors)])->withInput();
        }

        return back();
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
}


