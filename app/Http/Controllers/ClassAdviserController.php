<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\ActivityLog;
use App\Models\InstructorSubjectAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ClassAdviserController extends Controller
{
    // Dashboard
    public function index()
    {
        $adviser = Auth::user();
        
        // Get adviser's subject assignments (InstructorSubjectAssignment)
        $subjectAssignments = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('is_active', true)
            ->with(['subject.academicLevel', 'academicPeriod'])
            ->get();

        // Get students assigned to this adviser
        $assignedStudents = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();

        // Get dashboard statistics
        $stats = [
            'total_students' => $assignedStudents->count(),
            'total_subjects' => $subjectAssignments->count(),
            'pending_grades' => Grade::whereIn('student_id', $assignedStudents->pluck('id'))
                ->where('status', 'submitted')
                ->count(),
            'approved_grades' => Grade::whereIn('student_id', $assignedStudents->pluck('id'))
                ->where('status', 'approved')
                ->count(),
            'draft_grades' => Grade::whereIn('student_id', $assignedStudents->pluck('id'))
                ->where('status', 'draft')
                ->count(),
        ];

        // Get recent activities
        $recentActivities = ActivityLog::where('user_id', $adviser->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->getActionDisplayName() . ' ' . $log->getModelDisplayName(),
                    'time' => $log->created_at->diffForHumans(),
                    'model' => $log->model,
                ];
            });

        // Get current academic period
        $currentPeriod = AcademicPeriod::where('is_active', true)->first();

        return Inertia::render('ClassAdviser/ClassAdviserDashboard', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'email' => $adviser->email,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignments' => $subjectAssignments,
            'assignedStudents' => $assignedStudents,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'currentPeriod' => $currentPeriod,
        ]);
    }

    // Profile Management
    public function profile()
    {
        $adviser = Auth::user();

        return Inertia::render('ClassAdviser/Profile', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'email' => $adviser->email,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $adviser = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($adviser->id)],
        ]);

        $adviser->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $adviser = Auth::user();

        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $adviser->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    // Grading System
    public function grading(Request $request)
    {
        $adviser = Auth::user();
        
        // Get students assigned to this adviser
        $assignedStudents = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();

        // Get subjects that are specifically assigned to this adviser
        $subjects = Subject::whereHas('instructorAssignments', function($query) use ($adviser) {
                $query->where('instructor_id', $adviser->id)
                      ->where('is_active', true);
            })
            ->with(['academicLevel'])
            ->get();

        // Get academic periods
        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        // Get sections from assigned students
        $sections = $assignedStudents->pluck('studentProfile.section')->filter()->unique()->values()->toArray();

        // Build query for grades
        $gradesQuery = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->with(['student.studentProfile', 'subject', 'academicPeriod', 'instructor']);

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $gradesQuery->where('academic_period_id', $request->academic_period_id);
        }
        if ($request->filled('subject_id')) {
            $gradesQuery->where('subject_id', $request->subject_id);
        }
        if ($request->filled('section')) {
            $gradesQuery->whereHas('student.studentProfile', function($query) use ($request) {
                $query->where('section', $request->section);
            });
        }
        if ($request->filled('status')) {
            $gradesQuery->where('status', $request->status);
        }

        $grades = $gradesQuery->orderBy('created_at', 'desc')->paginate(15);

        // Calculate statistics
        $totalGrades = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->count();
        $pendingGrades = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->where('status', 'submitted')
            ->count();
        $approvedGrades = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->where('status', 'approved')
            ->count();
        $averageGrade = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->whereNotNull('final_grade')
            ->avg('final_grade');

        return Inertia::render('ClassAdviser/Grades/Grading', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'sections' => $sections,
            'stats' => [
                'totalGrades' => $totalGrades,
                'pendingGrades' => $pendingGrades,
                'approvedGrades' => $approvedGrades,
                'averageGrade' => $averageGrade,
            ],
            'filters' => $request->only(['academic_period_id', 'subject_id', 'section', 'status']),
        ]);
    }

    public function createGrading()
    {
        $adviser = Auth::user();
        
        // Get students assigned to this adviser
        $assignedStudents = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();

        // Get subjects that are specifically assigned to this adviser
        $subjects = Subject::whereHas('instructorAssignments', function($query) use ($adviser) {
                $query->where('instructor_id', $adviser->id)
                      ->where('is_active', true);
            })
            ->with(['academicLevel'])
            ->get();

        // Get academic periods
        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        return Inertia::render('ClassAdviser/Grades/Create', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignedStudents' => $assignedStudents,
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
        ]);
    }

    public function storeGrading(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
            'quarterly_grades' => 'array',
            'quarterly_grades.*.quarter' => 'required|integer|min:1|max:4',
            'quarterly_grades.*.grade' => 'required|numeric|min:0|max:100',
            'quarterly_grades.*.weight' => 'required|numeric|min:0|max:100',
            'final_grade' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        $adviser = Auth::user();

        // Verify the student is assigned to this adviser
        $student = User::where('id', $request->student_id)
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->first();

        if (!$student) {
            return redirect()->back()->withErrors(['error' => 'Student is not assigned to you.']);
        }

        // Verify the subject is assigned to this adviser
        $subject = Subject::where('id', $request->subject_id)
            ->whereHas('instructorAssignments', function($query) use ($adviser) {
                $query->where('instructor_id', $adviser->id)
                      ->where('is_active', true);
            })
            ->first();

        if (!$subject) {
            return redirect()->back()->withErrors(['error' => 'Subject is not assigned to you.']);
        }

        // Create the grade
        $grade = Grade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'instructor_id' => $adviser->id,
            'section' => $request->section,
            'quarterly_grades' => $request->quarterly_grades,
            'final_grade' => $request->final_grade,
            'status' => 'draft',
            'remarks' => $request->remarks,
        ]);

        // Log the activity
        ActivityLog::create([
            'user_id' => $adviser->id,
            'action' => 'created',
            'model' => 'Grade',
            'model_id' => $grade->id,
            'description' => "Created grade for student {$student->name} in {$subject->name}",
        ]);

        return redirect()->route('class-adviser.grading')->with('success', 'Grade created successfully.');
    }
}
