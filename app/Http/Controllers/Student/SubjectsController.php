<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentSubjectAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectsController extends Controller
{
    /**
     * Display a listing of the student's assigned subjects.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        
        // Load user relationships for course and strand
        $user->load(['course', 'strand']);
        
        // Get assigned subjects for the current school year
        $assignedSubjects = StudentSubjectAssignment::with([
            'subject.course',
            'subject.academicLevel',
            'subject.gradingPeriod',
            'enrolledBy'
        ])
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->orderBy('semester')
            ->orderBy('created_at')
            ->get();

        // Group subjects by semester
        $subjectsBySemester = $assignedSubjects->groupBy('semester');

        return Inertia::render('Student/Subjects/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'assignedSubjects' => $assignedSubjects,
            'subjectsBySemester' => $subjectsBySemester,
            'stats' => [
                'total_subjects' => $assignedSubjects->count(),
                'core_subjects' => $assignedSubjects->where('subject.is_core', true)->count(),
                'total_units' => $assignedSubjects->sum('subject.units'),
                'semesters' => $subjectsBySemester->keys()->filter()->count(),
            ],
        ]);
    }
}
