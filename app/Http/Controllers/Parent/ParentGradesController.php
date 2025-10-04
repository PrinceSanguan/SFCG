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
        ->get()
        ->map(function ($grade) {
            return [
                'id' => $grade->id,
                'grade' => $grade->grade,
                'gradingPeriod' => $grade->gradingPeriod ? [
                    'id' => $grade->gradingPeriod->id,
                    'name' => $grade->gradingPeriod->name,
                    'code' => $grade->gradingPeriod->code,
                    'type' => $grade->gradingPeriod->type,
                    'sort_order' => $grade->gradingPeriod->sort_order,
                ] : null,
                'academicLevel' => $grade->academicLevel ? [
                    'name' => $grade->academicLevel->name,
                ] : null,
            ];
        });

        if ($grades->isEmpty()) {
            abort(404, 'No grades found for this subject.');
        }

        // Get the subject from the first grade
        $firstGrade = StudentGrade::with('subject.course', 'academicLevel')
            ->where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->first();

        $subject = $firstGrade->subject;

        // Get grading periods for this academic level
        $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $firstGrade->academic_level_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'code', 'type', 'period_type', 'parent_id', 'sort_order']);

        return Inertia::render('Parent/Grades/Show', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'student' => $student,
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'academic_level_id' => $firstGrade->academic_level_id,
            ],
            'grades' => $grades,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }
}
