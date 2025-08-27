<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentGradesController extends Controller
{
    /**
     * Display a listing of grades for all linked children.
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
            return Inertia::render('Parent/Grades/Index', [
                'user' => $user,
                'schoolYear' => $schoolYear,
                'linkedStudents' => [],
                'grades' => [],
                'selectedStudent' => null,
            ]);
        }
        
        // If no student selected, use the first one
        if (!$studentId && $linkedStudents->isNotEmpty()) {
            $studentId = $linkedStudents->first()->id;
        }
        
        // Get grades for selected student
        $grades = collect();
        $selectedStudent = null;
        
        if ($studentId) {
            $selectedStudent = $linkedStudents->firstWhere('id', $studentId);
            
            if ($selectedStudent) {
                $grades = StudentGrade::with([
                    'subject.course',
                    'academicLevel',
                    'gradingPeriod'
                ])
                ->where('student_id', $studentId)
                ->where('school_year', $schoolYear)
                ->orderBy('subject_id')
                ->orderBy('grading_period_id')
                ->get();
            }
        }
        
        return Inertia::render('Parent/Grades/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'linkedStudents' => $linkedStudents,
            'grades' => $grades,
            'selectedStudent' => $selectedStudent,
        ]);
    }
    
    /**
     * Display the specified grade details.
     */
    public function show(Request $request, $studentId, $subjectId)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        
        // Verify the student is linked to this parent
        $student = $user->students()->findOrFail($studentId);
        
        // Get all grades for this student and subject
        $grades = StudentGrade::with([
            'subject.course',
            'academicLevel',
            'gradingPeriod'
        ])
        ->where('student_id', $studentId)
        ->where('subject_id', $subjectId)
        ->where('school_year', $schoolYear)
        ->orderBy('grading_period_id')
        ->get();
        
        if ($grades->isEmpty()) {
            abort(404, 'No grades found for this subject.');
        }
        
        $subject = $grades->first()->subject;
        
        return Inertia::render('Parent/Grades/Show', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'student' => $student,
            'subject' => $subject,
            'grades' => $grades,
        ]);
    }
}
