<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\InstructorCourseAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    /**
     * Display a listing of grades for the instructor's assigned courses.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get instructor's assigned courses
        $assignedCourses = InstructorCourseAssignment::with(['course', 'academicLevel', 'gradingPeriod'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Get grades for assigned courses
        $grades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedCourses) {
                $query->whereIn('id', $assignedCourses->pluck('course_id'));
            })
            ->when($request->filled('subject'), function ($query) use ($request) {
                $query->where('subject_id', $request->subject);
            })
            ->when($request->filled('academic_level'), function ($query) use ($request) {
                $query->where('academic_level_id', $request->academic_level);
            })
            ->when($request->filled('grading_period'), function ($query) use ($request) {
                $query->where('grading_period_id', $request->grading_period);
            })
            ->when($request->filled('school_year'), function ($query) use ($request) {
                $query->where('school_year', $request->school_year);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();
        
        return Inertia::render('Instructor/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'assignedCourses' => $assignedCourses,
            'filters' => $request->only(['subject', 'academic_level', 'grading_period', 'school_year']),
        ]);
    }
    
    /**
     * Show the form for creating a new grade.
     */
    public function create()
    {
        $user = Auth::user();
        
        // Get instructor's assigned courses
        $assignedCourses = InstructorCourseAssignment::with(['course', 'academicLevel', 'gradingPeriod'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Get available subjects, academic levels, and grading periods
        $subjects = Subject::whereIn('id', $assignedCourses->pluck('course_id'))->get();
        $academicLevels = AcademicLevel::all();
        $gradingPeriods = GradingPeriod::all();
        
        return Inertia::render('Instructor/Grades/Create', [
            'user' => $user,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'assignedCourses' => $assignedCourses,
        ]);
    }
    
    /**
     * Store a newly created grade.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
            'grade' => 'required|numeric|min:0|max:100',
        ]);
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $request->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Check if grade already exists
        $existingGrade = StudentGrade::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->first();
        
        if ($existingGrade) {
            return back()->withErrors(['grade' => 'A grade already exists for this student, subject, and period.']);
        }
        
        StudentGrade::create($validator->validated());
        
        return redirect()->route('instructor.grades.index')
            ->with('success', 'Grade created successfully.');
    }
    
    /**
     * Show the form for editing the specified grade.
     */
    public function edit(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to edit this grade.');
        }
        
        $grade->load(['student', 'subject', 'academicLevel', 'gradingPeriod']);
        
        return Inertia::render('Instructor/Grades/Edit', [
            'user' => $user,
            'grade' => $grade,
        ]);
    }
    
    /**
     * Update the specified grade.
     */
    public function update(Request $request, StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to update this grade.');
        }
        
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0|max:100',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $grade->update($validator->validated());
        
        return redirect()->route('instructor.grades.index')
            ->with('success', 'Grade updated successfully.');
    }
    
    /**
     * Remove the specified grade.
     */
    public function destroy(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to delete this grade.');
        }
        
        $grade->delete();
        
        return redirect()->route('instructor.grades.index')
            ->with('success', 'Grade deleted successfully.');
    }
    
    /**
     * Submit a grade for validation.
     */
    public function submitForValidation(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to submit this grade.');
        }
        
        $grade->update(['is_submitted_for_validation' => true]);
        
        return back()->with('success', 'Grade submitted for validation.');
    }
    
    /**
     * Unsubmit a grade from validation.
     */
    public function unsubmitFromValidation(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('course_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to unsubmit this grade.');
        }
        
        $grade->update(['is_submitted_for_validation' => false]);
        
        return back()->with('success', 'Grade unsubmitted from validation.');
    }
    
    /**
     * Get assigned students for the instructor.
     */
    public function getAssignedStudents()
    {
        $user = Auth::user();
        
        // This would need to be implemented based on your enrollment system
        // For now, return empty array
        return [];
    }
    
    /**
     * Get assigned subjects for the instructor.
     */
    public function getAssignedSubjects()
    {
        $user = Auth::user();
        
        $assignedCourses = InstructorCourseAssignment::with(['course', 'academicLevel'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        return Subject::whereIn('id', $assignedCourses->pluck('course_id'))->get();
    }
    
    /**
     * Get grading periods.
     */
    public function getGradingPeriods()
    {
        return GradingPeriod::all();
    }
    
    /**
     * Get academic levels.
     */
    public function getAcademicLevels()
    {
        return AcademicLevel::all();
    }
}
