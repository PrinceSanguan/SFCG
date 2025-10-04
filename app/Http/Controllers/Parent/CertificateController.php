<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ParentStudentRelationship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display a listing of the parent's children's certificates.
     */
    public function index()
    {
        $user = Auth::user();

        // Get all children of the parent
        $children = ParentStudentRelationship::with(['student'])
            ->where('parent_id', $user->id)
            ->get()
            ->pluck('student');

        // Get certificates for all children - only approved honors
        $certificates = Certificate::with(['template', 'academicLevel', 'student'])
            ->whereIn('student_id', $children->pluck('id'))
            ->orderByDesc('created_at')
            ->get()
            ->filter(function ($certificate) {
                // Verify each certificate has an approved honor
                $honorResult = \App\Models\HonorResult::where([
                    'student_id' => $certificate->student_id,
                    'academic_level_id' => $certificate->academic_level_id,
                    'school_year' => $certificate->school_year,
                ])->where('is_approved', true)->first();

                return $honorResult !== null;
            })
            ->values();

        return Inertia::render('Parent/Certificates/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
            'children' => $children,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Display the specified certificate.
     */
    public function show(Certificate $certificate)
    {
        $user = Auth::user();
        
        // Ensure the parent can only view certificates of their children
        $isChild = ParentStudentRelationship::where('parent_id', $user->id)
            ->where('student_id', $certificate->student_id)
            ->exists();

        if (!$isChild) {
            abort(403, 'You can only view certificates of your children.');
        }

        // Load the certificate with all necessary relationships
        $certificate->load(['template', 'academicLevel', 'student']);

        return Inertia::render('Parent/Certificates/Show', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
            'certificate' => $certificate,
        ]);
    }

    /**
     * Display the certificate as a view-only page (no download).
     */
    public function view(Certificate $certificate)
    {
        $user = Auth::user();
        
        // Ensure the parent can only view certificates of their children
        $isChild = ParentStudentRelationship::where('parent_id', $user->id)
            ->where('student_id', $certificate->student_id)
            ->exists();

        if (!$isChild) {
            abort(403, 'You can only view certificates of your children.');
        }

        // Load the certificate with all necessary relationships
        $certificate->load(['template', 'academicLevel', 'student']);

        // Render the certificate HTML with the payload data
        $html = $this->renderCertificateHtml($certificate);

        return view('certificates.view', [
            'certificate' => $certificate,
            'html' => $html,
        ]);
    }

    /**
     * Display certificates for a specific child.
     */
    public function showByChild($childId)
    {
        $user = Auth::user();
        
        // Ensure the parent can only view certificates of their children
        $isChild = ParentStudentRelationship::where('parent_id', $user->id)
            ->where('student_id', $childId)
            ->exists();

        if (!$isChild) {
            abort(403, 'You can only view certificates of your children.');
        }

        $child = \App\Models\User::findOrFail($childId);
        
        $certificates = Certificate::with(['template', 'academicLevel'])
            ->where('student_id', $childId)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Parent/Certificates/ShowByChild', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
            'child' => $child,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Render the certificate HTML with the payload data.
     */
    private function renderCertificateHtml(Certificate $certificate): string
    {
        $html = $certificate->template->content_html;
        $payload = $certificate->payload ?? [];

        // Add default date_now if not in payload
        if (!isset($payload['date_now'])) {
            $payload['date_now'] = now()->format('F d, Y');
        }

        // Replace placeholders with actual data
        foreach ($payload as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $html = str_replace($placeholder, $value, $html);
        }

        return $html;
    }
}

