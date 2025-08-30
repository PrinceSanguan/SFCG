<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display a listing of the student's certificates.
     */
    public function index()
    {
        $user = Auth::user();
        
        $certificates = Certificate::with(['template', 'academicLevel'])
            ->where('student_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Student/Certificates/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
            'certificates' => $certificates,
        ]);
    }

    /**
     * Display the specified certificate.
     */
    public function show(Certificate $certificate)
    {
        $user = Auth::user();
        
        // Ensure the student can only view their own certificates
        if ($certificate->student_id !== $user->id) {
            abort(403, 'You can only view your own certificates.');
        }

        // Load the certificate with all necessary relationships
        $certificate->load(['template', 'academicLevel', 'student']);

        return Inertia::render('Student/Certificates/Show', [
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
        
        // Ensure the student can only view their own certificates
        if ($certificate->student_id !== $user->id) {
            abort(403, 'You can only view your own certificates.');
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
     * Render the certificate HTML with the payload data.
     */
    private function renderCertificateHtml(Certificate $certificate): string
    {
        $html = $certificate->template->content_html;
        $payload = $certificate->payload ?? [];

        // Replace placeholders with actual data
        foreach ($payload as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $html = str_replace($placeholder, $value, $html);
        }

        return $html;
    }
}

