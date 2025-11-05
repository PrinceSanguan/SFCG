<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\TeacherSubjectAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TeacherSubjectAssignmentController extends Controller
{
    public function index()
    {
        $assignments = TeacherSubjectAssignment::with([
            'teacher',
            'subject',
            'academicLevel',
            'gradingPeriod',
            'strand',
            'assignedBy'
        ])->latest()->paginate(15);

        $teachers = User::where('user_role', 'teacher')->orderBy('name')->get();
        $subjects = Subject::with(['academicLevel'])->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::select('id', 'name', 'academic_level_id', 'parent_id', 'sort_order')->orderBy('sort_order')->get();
        $strands = \App\Models\Strand::with('academicLevel')->orderBy('name')->get();

        return Inertia::render('Registrar/Academic/AssignTeachersSubjects', [
            'user' => Auth::user(),
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'strands' => $strands,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('TeacherSubjectAssignment store called', $request->all());

        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'nullable|in:grade_11,grade_12',
            'strand_id' => 'nullable|exists:strands,id',
            'grading_period_ids' => 'nullable|array',
            'grading_period_ids.*' => 'exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
            'auto_enroll_students' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        // Get grading period IDs (array or empty)
        $gradingPeriodIds = $request->grading_period_ids ?? [];

        // Determine what grading periods to process
        $periodsToProcess = empty($gradingPeriodIds) ? [null] : $gradingPeriodIds;

        // Check for existing assignments for each grading period
        foreach ($periodsToProcess as $gradingPeriodId) {
            $existing = TeacherSubjectAssignment::where([
                'teacher_id' => $request->teacher_id,
                'subject_id' => $request->subject_id,
                'academic_level_id' => $request->academic_level_id,
                'school_year' => $request->school_year,
            ])
            ->when($gradingPeriodId, function ($q) use ($gradingPeriodId) {
                $q->where('grading_period_id', $gradingPeriodId);
            }, function ($q) {
                $q->whereNull('grading_period_id');
            })
            ->first();

            if ($existing) {
                $gradingPeriodName = $gradingPeriodId ? GradingPeriod::find($gradingPeriodId)->name : 'this criteria';
                return back()->with('error', 'This teacher is already assigned to this subject for ' . $gradingPeriodName . '.');
            }
        }

        // Create assignments (one for each grading period, or one without grading period if none selected)
        $createdAssignments = [];
        foreach ($periodsToProcess as $gradingPeriodId) {
            $assignment = TeacherSubjectAssignment::create([
                'teacher_id' => $request->teacher_id,
                'subject_id' => $request->subject_id,
                'academic_level_id' => $request->academic_level_id,
                'grade_level' => $request->grade_level,
                'strand_id' => $request->strand_id,
                'grading_period_id' => $gradingPeriodId,
                'school_year' => $request->school_year,
                'assigned_by' => Auth::id(),
                'notes' => $request->notes,
            ]);
            $createdAssignments[] = $assignment;

            if ($request->boolean('auto_enroll_students', true)) {
                $this->autoEnrollStudents($assignment);
            }
        }

        // Use the first assignment for logging
        $assignment = $createdAssignments[0];

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
                'grading_periods_count' => count($createdAssignments),
            ],
        ]);

        return back()->with('success', 'Teacher assigned to subject successfully!');
    }

    public function update(Request $request, TeacherSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'nullable|in:grade_11,grade_12',
            'strand_id' => 'nullable|exists:strands,id',
            'grading_period_ids' => 'nullable|array',
            'grading_period_ids.*' => 'exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        // Delete all existing assignments for this teacher+subject+academic_level+school_year combination
        TeacherSubjectAssignment::where('teacher_id', $request->teacher_id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_level_id', $request->academic_level_id)
            ->where('school_year', $request->school_year)
            ->delete();

        // Get grading period IDs (array or empty)
        $gradingPeriodIds = $request->grading_period_ids ?? [];

        // Determine what grading periods to process
        $periodsToProcess = empty($gradingPeriodIds) ? [null] : $gradingPeriodIds;

        // Create new assignments (one for each grading period, or one without grading period if none selected)
        $createdAssignments = [];
        foreach ($periodsToProcess as $gradingPeriodId) {
            $newAssignment = TeacherSubjectAssignment::create([
                'teacher_id' => $request->teacher_id,
                'subject_id' => $request->subject_id,
                'academic_level_id' => $request->academic_level_id,
                'grade_level' => $request->grade_level,
                'strand_id' => $request->strand_id,
                'grading_period_id' => $gradingPeriodId,
                'school_year' => $request->school_year,
                'assigned_by' => Auth::id(),
                'notes' => $request->notes,
            ]);
            $createdAssignments[] = $newAssignment;

            // Auto-enroll students when assignment is created
            $this->autoEnrollStudents($newAssignment);
        }

        // Use the first assignment for logging
        $assignment = $createdAssignments[0];

        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'updated_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
                'grading_periods_count' => count($createdAssignments),
            ],
        ]);

        return back()->with('success', 'Teacher subject assignment updated successfully!');
    }

    public function destroy(TeacherSubjectAssignment $assignment)
    {
        $teacherName = $assignment->teacher->name;
        $subjectName = $assignment->subject->name;

        $assignment->delete();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $assignment->teacher_id,
            'action' => 'deleted_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacherName,
                'subject' => $subjectName,
            ],
        ]);

        return back()->with('success', 'Teacher subject assignment deleted successfully!');
    }

    public function toggleStatus(TeacherSubjectAssignment $assignment)
    {
        $assignment->update(['is_active' => !$assignment->is_active]);
        $status = $assignment->is_active ? 'activated' : 'deactivated';

        // Auto-enroll students when assignment is activated
        if ($assignment->is_active) {
            $this->autoEnrollStudents($assignment);
        }

        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $assignment->teacher_id,
            'action' => $status . '_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $assignment->teacher->name,
                'subject' => $assignment->subject->name,
                'status' => $status,
            ],
        ]);

        return back()->with('success', "Teacher subject assignment {$status} successfully!");
    }

    public function getSubjectsByLevel(Request $request)
    {
        $academicLevelId = $request->academic_level_id;
        $subjects = Subject::where('academic_level_id', $academicLevelId)
            ->where('is_active', true)
            ->get(['id', 'name', 'code']);
        return response()->json($subjects);
    }

    private function autoEnrollStudents(TeacherSubjectAssignment $assignment)
    {
        $enrolledCount = 0;

        try {
            // Get subject and academic level
            $subject = Subject::with('section')->find($assignment->subject_id);
            $academicLevel = AcademicLevel::find($assignment->academic_level_id);

            if (!$subject || !$academicLevel) {
                Log::warning('Subject or academic level not found for auto-enrollment', [
                    'assignment_id' => $assignment->id,
                    'subject_id' => $assignment->subject_id,
                    'academic_level_id' => $assignment->academic_level_id,
                ]);
                return 0;
            }

            // Build student query
            $studentsQuery = User::where('user_role', 'student')
                ->where('year_level', $academicLevel->key);

            // Filter by section if subject has a section
            if ($subject->section_id) {
                $studentsQuery->where('section_id', $subject->section_id);
            }

            // Filter by grade level
            if ($assignment->grade_level) {
                $studentsQuery->where('specific_year_level', $assignment->grade_level);
            }

            // Filter by strand for SHS
            if ($assignment->strand_id) {
                $studentsQuery->where('strand_id', $assignment->strand_id);
            }

            // Filter by department for College
            if ($assignment->department_id) {
                $studentsQuery->where('department_id', $assignment->department_id);
            }

            // Filter by course for College
            if ($assignment->course_id) {
                $studentsQuery->where('course_id', $assignment->course_id);
            }

            $students = $studentsQuery->get();

            Log::info('Auto-enrolling students for teacher assignment', [
                'assignment_id' => $assignment->id,
                'subject_name' => $subject->name,
                'students_found' => $students->count(),
            ]);

            foreach ($students as $student) {
                $existing = \App\Models\StudentSubjectAssignment::where([
                    'student_id' => $student->id,
                    'subject_id' => $assignment->subject_id,
                    'school_year' => $assignment->school_year,
                ])->first();

                if ($existing) {
                    // Reactivate if inactive
                    if (!$existing->is_active) {
                        $existing->update(['is_active' => true]);
                    }
                    $enrolledCount++;
                    continue;
                }

                // Create new enrollment
                \App\Models\StudentSubjectAssignment::create([
                    'student_id' => $student->id,
                    'subject_id' => $assignment->subject_id,
                    'school_year' => $assignment->school_year,
                    'is_active' => true,
                    'enrolled_by' => Auth::id(),
                ]);
                $enrolledCount++;
            }

            Log::info('Auto-enrollment completed', [
                'assignment_id' => $assignment->id,
                'students_enrolled' => $enrolledCount,
            ]);

            return $enrolledCount;
        } catch (\Exception $e) {
            Log::error('Failed to auto-enroll students for teacher assignment', [
                'assignment_id' => $assignment->id,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    public function showStudents(TeacherSubjectAssignment $assignment)
    {
        $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
            ->where('subject_id', $assignment->subject_id)
            ->where('school_year', $assignment->school_year)
            ->where('is_active', true)
            ->get();

        $availableStudents = User::where('user_role', 'student')
            ->where('academic_level_id', $assignment->academic_level_id)
            ->whereNotIn('id', $enrolledStudents->pluck('student_id'))
            ->get();

        return Inertia::render('Registrar/Academic/TeacherAssignmentStudents', [
            'user' => Auth::user(),
            'assignment' => $assignment->load(['subject', 'teacher', 'academicLevel']),
            'enrolledStudents' => $enrolledStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function enrollStudent(Request $request, TeacherSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'semester' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $existing = \App\Models\StudentSubjectAssignment::where([
            'student_id' => $request->student_id,
            'subject_id' => $assignment->subject_id,
            'school_year' => $assignment->school_year,
        ])->first();

        if ($existing) {
            return back()->with('error', 'This student is already enrolled in this subject.');
        }

        \App\Models\StudentSubjectAssignment::create([
            'student_id' => $request->student_id,
            'subject_id' => $assignment->subject_id,
            'school_year' => $assignment->school_year,
            'semester' => $request->semester ?? '1st Semester',
            'is_active' => true,
            'enrolled_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Student enrolled successfully!');
    }

    public function removeStudent(Request $request, TeacherSubjectAssignment $assignment)
    {
        $enrollment = \App\Models\StudentSubjectAssignment::where([
            'student_id' => $request->student_id,
            'subject_id' => $assignment->subject_id,
            'school_year' => $assignment->school_year,
        ])->first();

        if ($enrollment) {
            $enrollment->delete();
            return back()->with('success', 'Student removed from subject successfully!');
        }

        return back()->with('error', 'Student enrollment not found.');
    }
}


