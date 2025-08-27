<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentProfileController extends Controller
{
    /**
     * Display a listing of linked children's profiles.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        
        // Get linked students with their relationships
        $linkedStudents = $user->students()->with([
            'parentRelationships' => function ($query) use ($user) {
                $query->where('parent_id', $user->id);
            },
            'studentGrades' => function ($query) use ($schoolYear) {
                $query->where('school_year', $schoolYear);
            },
            'honorResults' => function ($query) use ($schoolYear) {
                $query->where('school_year', $schoolYear);
            }
        ])->orderBy('name')->get();
        
        return Inertia::render('Parent/Profile/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'linkedStudents' => $linkedStudents,
        ]);
    }
    
    /**
     * Display the specified child's profile.
     */
    public function show(Request $request, $studentId)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        
        // Verify the student is linked to this parent
        $student = $user->students()->with([
            'parentRelationships' => function ($query) use ($user) {
                $query->where('parent_id', $user->id);
            },
            'studentGrades' => function ($query) use ($schoolYear) {
                $query->with(['subject.course', 'academicLevel', 'gradingPeriod']);
            },
            'honorResults' => function ($query) use ($schoolYear) {
                $query->with(['honorType', 'academicLevel']);
            }
        ])->findOrFail($studentId);
        
        // Get relationship details
        $relationship = $student->parentRelationships->first();
        
        // Calculate academic summary
        $academicSummary = $this->getAcademicSummary($student, $schoolYear);
        
        return Inertia::render('Parent/Profile/Show', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'student' => $student,
            'relationship' => $relationship,
            'academicSummary' => $academicSummary,
        ]);
    }
    
    /**
     * Get academic summary for a student.
     */
    private function getAcademicSummary($student, $schoolYear): array
    {
        $grades = $student->studentGrades;
        $honors = $student->honorResults;
        
        $totalSubjects = $grades->unique('subject_id')->count();
        $totalGradingPeriods = $grades->unique('gradingPeriod_id')->count();
        $averageGrade = $grades->whereNotNull('grade')->avg('grade');
        
        return [
            'total_subjects' => $totalSubjects,
            'total_grading_periods' => $totalGradingPeriods,
            'average_grade' => round($averageGrade, 2),
            'honor_count' => $honors->count(),
            'grade_count' => $grades->count(),
        ];
    }
}
