<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\InstructorSubjectAssignment;
use App\Models\User;
use App\Models\Subject;

use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class InstructorSubjectAssignmentController extends Controller
{
    public function index()
    {
        $assignments = InstructorSubjectAssignment::with([
            'instructor',
            'subject.course',
            'academicLevel',
            'gradingPeriod',
            'assignedBy'
        ])->latest()->paginate(15);

        $instructors = User::where('user_role', 'instructor')->get();
        $subjects = Subject::with(['course', 'academicLevel'])->get();
        $academicLevels = AcademicLevel::all();
        $gradingPeriods = GradingPeriod::all();

        return view('registrar.academic.assign-instructors-subjects', compact(
            'assignments',
            'instructors',
            'subjects',
            'academicLevels',
            'gradingPeriods'
        ));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        // Check for existing assignment
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this subject for the specified period and school year.');
        }

        $assignment = InstructorSubjectAssignment::create([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'assigned_instructor_subject',
            'entity_type' => 'instructor_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assigned to subject successfully!');
    }

    public function update(Request $request, InstructorSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        // Check for existing assignment (excluding current one)
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->where('id', '!=', $assignment->id)->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this subject for the specified period and school year.');
        }

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'updated_instructor_subject_assignment',
            'entity_type' => 'instructor_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor subject assignment updated successfully!');
    }

    public function destroy(InstructorSubjectAssignment $assignment)
    {
        $instructorName = $assignment->instructor->name;
        $subjectName = $assignment->subject->name;

        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $assignment->instructor_id,
            'action' => 'deleted_instructor_subject_assignment',
            'entity_type' => 'instructor_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructorName,
                'subject' => $subjectName,
            ],
        ]);

        return back()->with('success', 'Instructor subject assignment deleted successfully!');
    }

    public function toggleStatus(InstructorSubjectAssignment $assignment)
    {
        $assignment->update(['is_active' => !$assignment->is_active]);

        $status = $assignment->is_active ? 'activated' : 'deactivated';

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $assignment->instructor_id,
            'action' => $status . '_instructor_subject_assignment',
            'entity_type' => 'instructor_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $assignment->instructor->name,
                'subject' => $assignment->subject->name,
                'status' => $status,
            ],
        ]);

        return back()->with('success', "Instructor subject assignment {$status} successfully!");
    }

    public function getSubjectsByCourse(Request $request)
    {
        $courseId = $request->course_id;
        $academicLevelId = $request->academic_level_id;

        $subjects = Subject::where('course_id', $courseId)
            ->where('academic_level_id', $academicLevelId)
            ->where('is_active', true)
            ->get(['id', 'name', 'code']);

        return response()->json($subjects);
    }
}
