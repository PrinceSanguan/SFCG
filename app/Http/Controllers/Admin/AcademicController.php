<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AcademicLevel;
use App\Models\Strand;
use App\Models\Course;
use App\Models\Department;
use App\Models\GradingPeriod;
use App\Models\Subject;
use App\Models\TeacherSubjectAssignment;
use App\Models\InstructorCourseAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AcademicController extends Controller
{
    private function sharedUser()
    {
        $user = Auth::user();
        return [
            'name' => $user->name,
            'email' => $user->email,
            'user_role' => $user->user_role,
        ];
    }

    public function index()
    {
        return Inertia::render('Admin/Academic/Index', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function levels()
    {
        $levels = AcademicLevel::orderBy('sort_order')->get();
        return Inertia::render('Admin/Academic/Levels', [
            'user' => $this->sharedUser(),
            'levels' => $levels,
        ]);
    }

    public function grading()
    {
        $gradingPeriods = GradingPeriod::with('academicLevel')
            ->orderBy('academic_level_id')
            ->orderBy('sort_order')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/Grading', [
            'user' => $this->sharedUser(),
            'gradingPeriods' => $gradingPeriods,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function programs()
    {
        $academicLevels = AcademicLevel::with(['strands'])->orderBy('sort_order')->get();
        $departments = Department::with(['courses'])->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/Programs', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'departments' => $departments,
        ]);
    }

    public function assignInstructors()
    {
        $assignments = InstructorCourseAssignment::with([
            'instructor', 
            'course', 
            'academicLevel', 
            'gradingPeriod'
        ])->orderBy('school_year', 'desc')->get();
        
        $instructors = User::where('user_role', 'instructor')->orderBy('name')->get();
        $courses = Course::orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'courses' => $courses,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function assignTeachers()
    {
        $assignments = TeacherSubjectAssignment::with([
            'teacher', 
            'subject', 
            'academicLevel', 
            'gradingPeriod'
        ])->orderBy('school_year', 'desc')->get();
        
        $teachers = User::where('user_role', 'teacher')->orderBy('name')->get();
        $subjects = Subject::orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignTeachers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function assignAdvisers()
    {
        $assignments = ClassAdviserAssignment::with([
            'adviser', 
            'academicLevel'
        ])->orderBy('school_year', 'desc')->get();
        
        $advisers = User::where('user_role', 'adviser')->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'advisers' => $advisers,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'gradingPeriod'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/Subjects', [
            'user' => $this->sharedUser(),
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    // Grading Period Management
    public function storeGradingPeriod(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:grading_periods,code',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod = GradingPeriod::create([
            'name' => $request->name,
            'code' => $request->code,
            'academic_level_id' => $request->academic_level_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
                'academic_level' => $gradingPeriod->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Grading period created successfully!');
    }

    public function updateGradingPeriod(Request $request, GradingPeriod $gradingPeriod)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:grading_periods,code,' . $gradingPeriod->id,
            'academic_level_id' => 'required|exists:academic_levels,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod->update([
            'name' => $request->name,
            'code' => $request->code,
            'academic_level_id' => $request->academic_level_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period updated successfully!');
    }

    public function destroyGradingPeriod(GradingPeriod $gradingPeriod)
    {
        $gradingPeriod->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period deleted successfully!');
    }

    // Subject Management
    public function storeSubject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'units' => 'nullable|integer|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $subject = Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'units' => $request->units ?? 0,
            'hours_per_week' => $request->hours_per_week ?? 0,
            'is_core' => $request->is_core ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
                'academic_level' => $subject->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Subject created successfully!');
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'units' => 'nullable|integer|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'units' => $request->units ?? 0,
            'hours_per_week' => $request->hours_per_week ?? 0,
            'is_core' => $request->is_core ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject updated successfully!');
    }

    public function destroySubject(Subject $subject)
    {
        $subject->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject deleted successfully!');
    }

    // Assignment Management
    public function storeTeacherAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment = TeacherSubjectAssignment::create([
            'teacher_id' => $request->teacher_id,
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
            'target_user_id' => $request->teacher_id,
            'action' => 'assigned_teacher_subject',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assigned to subject successfully!');
    }

    public function storeInstructorAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
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

        $assignment = InstructorCourseAssignment::create([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
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
            'action' => 'assigned_instructor_course',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assigned to course successfully!');
    }

    public function storeClassAdviserAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'adviser_id' => 'required|exists:users,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|string',
            'section' => 'required|string',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if adviser has the correct role
        $adviser = User::find($request->adviser_id);
        if (!$adviser || $adviser->user_role !== 'adviser') {
            return back()->with('error', 'Selected user is not an adviser.');
        }

        $assignment = ClassAdviserAssignment::create([
            'adviser_id' => $request->adviser_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'assigned_class_adviser',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Class adviser assigned successfully!');
    }

    // Delete assignments
    public function destroyTeacherAssignment(TeacherSubjectAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Teacher assignment removed successfully!');
    }

    public function destroyInstructorAssignment(InstructorCourseAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Instructor assignment removed successfully!');
    }

    public function destroyClassAdviserAssignment(ClassAdviserAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_class_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Class adviser assignment removed successfully!');
    }
}


