<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $grades = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod', 'approvedBy', 'returnedBy'])
            ->where('is_submitted_for_validation', true)
            ->latest('submitted_at')
            ->paginate(20);
        
        $academicLevels = AcademicLevel::all();
        $gradingPeriods = GradingPeriod::all();
        
        return Inertia::render('Principal/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }
    
    public function pendingGrades()
    {
        $user = Auth::user();
        
        $grades = StudentGrade::where('is_submitted_for_validation', true)
            ->where('is_approved', false)
            ->where('is_returned', false)
            ->with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->paginate(20);
        
        return Inertia::render('Principal/Grades/Pending', [
            'user' => $user,
            'grades' => $grades,
        ]);
    }
    
    public function approveGrade(Request $request, $gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::findOrFail($gradeId);
        
        $grade->update([
            'is_approved' => true,
            'is_submitted_for_validation' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        Log::info('Grade approved by principal', [
            'principal_id' => $user->id,
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
        
        $grade->update([
            'is_returned' => true,
            'is_submitted_for_validation' => false,
            'returned_at' => now(),
            'returned_by' => $user->id,
            'return_reason' => $validated['return_reason'],
        ]);
        
        Log::info('Grade returned by principal', [
            'principal_id' => $user->id,
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
        
        return Inertia::render('Principal/Grades/Review', [
            'user' => $user,
            'grade' => $grade,
        ]);
    }
    
    // API methods
    public function getPendingGrades()
    {
        $grades = StudentGrade::where('is_submitted_for_validation', true)
            ->where('is_approved', false)
            ->where('is_returned', false)
            ->with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->get();
        
        return response()->json($grades);
    }
    
    public function getApprovedGrades()
    {
        $grades = StudentGrade::where('is_approved', true)
            ->with(['student', 'subject.course', 'academicLevel', 'gradingPeriod', 'approvedBy'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($grades);
    }
    
    public function getReturnedGrades()
    {
        $grades = StudentGrade::where('is_returned', true)
            ->with(['student', 'subject.course', 'academicLevel', 'gradingPeriod', 'returnedBy'])
            ->latest('returned_at')
            ->get();
        
        return response()->json($grades);
    }
}
