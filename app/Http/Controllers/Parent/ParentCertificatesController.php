<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentCertificatesController extends Controller
{
    /**
     * Display a listing of certificates for all linked children.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        $studentId = request('student_id');
        
        // Get linked students
        $linkedStudents = $user->students()->orderBy('name')->get();
        
        // If no students linked, return empty view
        if ($linkedStudents->isEmpty()) {
            return Inertia::render('Parent/Certificates/Index', [
                'user' => $user,
                'schoolYear' => $schoolYear,
                'linkedStudents' => [],
                'certificates' => [],
                'selectedStudent' => null,
            ]);
        }
        
        // If no student selected, use the first one
        if (!$studentId && $linkedStudents->isNotEmpty()) {
            $studentId = $linkedStudents->first()->id;
        }
        
        // Get certificates for selected student - only approved honors
        $certificates = collect();
        $selectedStudent = null;

        if ($studentId) {
            $selectedStudent = $linkedStudents->firstWhere('id', $studentId);

            if ($selectedStudent) {
                $certificates = Certificate::with([
                    'template',
                    'student',
                    'academicLevel'
                ])
                ->where('student_id', $studentId)
                ->where('school_year', $schoolYear)
                ->orderBy('created_at', 'desc')
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
            }
        }
        
        return Inertia::render('Parent/Certificates/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'linkedStudents' => $linkedStudents,
            'certificates' => $certificates,
            'selectedStudent' => $selectedStudent,
        ]);
    }
}
