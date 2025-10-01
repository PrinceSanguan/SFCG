<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Certificate;

class CertificatesController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        // Get all certificates for the student with approved honors
        $certificates = Certificate::with(['template', 'academicLevel'])
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->orderBy('created_at', 'desc')
            ->get();

        // Verify each certificate has an approved honor
        $validCertificates = $certificates->filter(function ($certificate) {
            $honorResult = \App\Models\HonorResult::where([
                'student_id' => $certificate->student_id,
                'academic_level_id' => $certificate->academic_level_id,
                'school_year' => $certificate->school_year,
            ])->where('is_approved', true)->first();

            return $honorResult !== null;
        })->values();

        return Inertia::render('Student/Certificates/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'certificates' => $validCertificates,
        ]);
    }
}
