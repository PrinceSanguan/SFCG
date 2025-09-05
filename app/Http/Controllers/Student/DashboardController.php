<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Certificate;
use App\Models\StudentSubjectAssignment;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        
        // Load user relationships for course and strand
        $user->load(['course', 'strand']);

        $gradesCount = StudentGrade::where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->count();

        $honors = HonorResult::with('honorType')
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->get();

        $certificates = Certificate::where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->get();

        // Get assigned subjects for the current school year
        $assignedSubjects = StudentSubjectAssignment::with([
            'subject.course',
            'subject.academicLevel'
        ])
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->orderBy('semester')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Student/Dashboard', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'stats' => [
                'grades' => $gradesCount,
                'honor_count' => $honors->count(),
                'certificates' => $certificates->count(),
                'subjects' => $assignedSubjects->count(),
            ],
            'assignedSubjects' => $assignedSubjects,
        ]);
    }
}
