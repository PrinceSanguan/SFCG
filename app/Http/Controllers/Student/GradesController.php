<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentGrade;
use App\Models\StudentSubjectAssignment;
use App\Models\Subject;

class GradesController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $requestedYear = request('school_year');

        // Determine effective school year: requested -> latest available from grades or enrollments -> null
        $latestFromGrades = StudentGrade::where('student_id', $user->id)
            ->whereNotNull('school_year')
            ->orderByDesc('school_year')
            ->value('school_year');
        $latestFromEnrollments = StudentSubjectAssignment::where('student_id', $user->id)
            ->whereNotNull('school_year')
            ->orderByDesc('school_year')
            ->value('school_year');

        $schoolYear = $requestedYear !== null && $requestedYear !== ''
            ? $requestedYear
            : ($latestFromGrades ?? $latestFromEnrollments ?? null);

        // Base grades query
        $gradesQuery = StudentGrade::with(['subject', 'academicLevel', 'gradingPeriod'])
            ->where('student_id', $user->id)
            ->orderBy('subject_id');
        if ($schoolYear) {
            $gradesQuery->where('school_year', $schoolYear);
        }
        $grades = $gradesQuery->get();

        // Also fetch enrolled subjects to show rows even without grades
        $enrollmentsQuery = StudentSubjectAssignment::with(['subject.academicLevel'])
            ->where('student_id', $user->id)
            ->where('is_active', true);
        if ($schoolYear) {
            $enrollmentsQuery->where('school_year', $schoolYear);
        }
        $enrollments = $enrollmentsQuery->get();

        // Merge: for each enrollment, attach grade if exists (no grading period grouping here; show latest grade for that subject)
        $gradesBySubject = $grades->groupBy('subject_id');
        $merged = $enrollments->map(function ($enrollment) use ($gradesBySubject) {
            $subjectGrades = $gradesBySubject->get($enrollment->subject_id);
            $latest = $subjectGrades ? $subjectGrades->sortByDesc('created_at')->first() : null;
            return [
                'id' => $enrollment->id,
                'subject' => $enrollment->subject,
                'academicLevel' => $enrollment->subject?->academicLevel,
                'gradingPeriod' => $latest?->gradingPeriod,
                'school_year' => $enrollment->school_year,
                'grade' => $latest?->grade,
                'grade_id' => $latest?->id,
            ];
        });

        // If no enrollments, fall back to raw grades list (legacy data)
        if ($merged->isEmpty() && $grades->isNotEmpty()) {
            $merged = $grades->map(function ($g) {
                return [
                    'id' => $g->id,
                    'subject' => $g->subject,
                    'academicLevel' => $g->academicLevel,
                    'gradingPeriod' => $g->gradingPeriod,
                    'school_year' => $g->school_year,
                    'grade' => $g->grade,
                    'grade_id' => $g->id,
                ];
            });
        }

        return Inertia::render('Student/Grades/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear ?? 'All',
            'grades' => $merged,
        ]);
    }

    public function showSubject(Subject $subject)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025'); // Or dynamically determine as in index()

        // Check if the student is enrolled in this subject
        $enrollment = StudentSubjectAssignment::where('student_id', $user->id)
            ->where('subject_id', $subject->id)
            ->where('is_active', true)
            ->first();

        if (!$enrollment) {
            // Student is not enrolled in this subject, redirect to grades index
            return redirect()->route('student.grades.index')
                ->with('error', 'You are not enrolled in this subject.');
        }

        $query = StudentGrade::with(['gradingPeriod'])
            ->where('student_id', $user->id)
            ->where('subject_id', $subject->id)
            ->orderByRaw('COALESCE(grading_period_id, 0) asc, created_at desc');
        if ($schoolYear) {
            $query->where('school_year', $schoolYear);
        }
        $grades = $query->get();

        // Get the teacher/adviser/instructor for this subject
        $teacherService = new \App\Services\TeacherStudentAssignmentService();
        $assignedTeacher = $teacherService->getTeacherForStudentSubject($user, $subject);

        // Transform grades to include explicit grading period data and teacher information
        $transformedGrades = $grades->map(function($grade) use ($assignedTeacher) {
            return [
                'id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'academic_level_id' => $grade->academic_level_id,
                'grading_period_id' => $grade->grading_period_id,
                'school_year' => $grade->school_year,
                'year_of_study' => $grade->year_of_study,
                'grade' => $grade->grade,
                'is_submitted_for_validation' => $grade->is_submitted_for_validation,
                'submitted_at' => $grade->submitted_at,
                'validated_at' => $grade->validated_at,
                'validated_by' => $grade->validated_by,
                'created_at' => $grade->created_at,
                'updated_at' => $grade->updated_at,
                'teacher_name' => $assignedTeacher ? $assignedTeacher->name : null,
                'teacher_role' => $assignedTeacher ? $assignedTeacher->user_role : null,
                'gradingPeriod' => $grade->gradingPeriod ? [
                    'id' => $grade->gradingPeriod->id,
                    'name' => $grade->gradingPeriod->name,
                    'code' => $grade->gradingPeriod->code,
                    'academic_level_id' => $grade->gradingPeriod->academic_level_id,
                    'start_date' => $grade->gradingPeriod->start_date,
                    'end_date' => $grade->gradingPeriod->end_date,
                    'sort_order' => $grade->gradingPeriod->sort_order,
                    'is_active' => $grade->gradingPeriod->is_active,
                ] : null,
            ];
        });

        return Inertia::render('Student/Grades/Show', [
            'user' => $user,
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
            ],
            'schoolYear' => $schoolYear,
            'grades' => $transformedGrades,
        ]);
    }
}
