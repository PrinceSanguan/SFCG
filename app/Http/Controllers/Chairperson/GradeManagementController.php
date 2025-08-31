<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Grades/Index', [
                'user' => $user,
                'grades' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'stats' => [
                    'pending' => 0,
                    'approved' => 0,
                    'returned' => 0,
                ],
            ]);
        }
        
        $grades = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject.course.department', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->paginate(20);
        
        $stats = [
            'pending' => StudentGrade::where('is_submitted_for_validation', true)
                ->whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->count(),
            'approved' => StudentGrade::where('is_approved', true)
                ->whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->count(),
            'returned' => StudentGrade::where('is_returned', true)
                ->whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->count(),
        ];
        

        
        return Inertia::render('Chairperson/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'stats' => $stats,
        ]);
    }
    
    public function pendingGrades()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Grades/Pending', [
                'user' => $user,
                'grades' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }
        
        $grades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject.course.department', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->paginate(20);
        
        return Inertia::render('Chairperson/Grades/Pending', [
            'user' => $user,
            'grades' => $grades,
        ]);
    }
    
    public function approveGrade(Request $request, $gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::findOrFail($gradeId);
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only approve grades from your department.');
        }
        
        $grade->update([
            'is_approved' => true,
            'is_submitted_for_validation' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        Log::info('Grade approved by chairperson', [
            'chairperson_id' => $user->id,
            'grade_id' => $gradeId,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
        ]);
        
        return back()->with('success', 'Grade approved successfully.');
    }
    
    public function returnGrade(Request $request, $gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::findOrFail($gradeId);
        
        $validated = $request->validate([
            'return_reason' => ['required', 'string', 'max:1000'],
        ]);
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only return grades from your department.');
        }
        
        $grade->update([
            'is_returned' => true,
            'is_submitted_for_validation' => false,
            'returned_at' => now(),
            'returned_by' => $user->id,
            'return_reason' => $validated['return_reason'],
        ]);
        
        Log::info('Grade returned by chairperson', [
            'chairperson_id' => $user->id,
            'grade_id' => $gradeId,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'reason' => $validated['return_reason'],
        ]);
        
        return back()->with('success', 'Grade returned for correction.');
    }
    
    public function reviewGrade($gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->findOrFail($gradeId);
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only review grades from your department.');
        }
        
        return Inertia::render('Chairperson/Grades/Review', [
            'user' => $user,
            'grade' => $grade,
        ]);
    }
    
    // API methods
    public function getPendingGrades()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $grades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->get();
        
        return response()->json($grades);
    }
    
    public function getApprovedGrades()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $grades = StudentGrade::where('is_approved', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($grades);
    }
    
    public function getReturnedGrades()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $grades = StudentGrade::where('is_returned', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('returned_at')
            ->get();
        
        return response()->json($grades);
    }
}
