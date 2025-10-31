<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\InstructorSubjectAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\Section;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InstructorSubjectAssignmentController extends Controller
{
    public function index()
    {
        $assignments = InstructorSubjectAssignment::with([
            'instructor',
            'subject.course',
            'section',
            'academicLevel',
            'gradingPeriod',
            'assignedBy'
        ])->latest()->paginate(15);

        $instructors = User::where('user_role', 'instructor')->get();
        $subjects = Subject::with(['course', 'academicLevel'])->get();
        $sections = Section::with('course')->where('is_active', true)->get();
        $academicLevels = AcademicLevel::all();

        // Fetch grading periods excluding final average periods (period_type = 'final')
        $gradingPeriods = GradingPeriod::where(function ($query) {
            $query->whereNull('period_type')
                  ->orWhere('period_type', '!=', 'final');
        })->get();

        // Log grading periods filtering for debugging
        \Illuminate\Support\Facades\Log::info('[REGISTRAR_INSTRUCTOR_SUBJECT_ASSIGNMENT] Grading periods filtered', [
            'total_in_db' => GradingPeriod::count(),
            'filtered_count' => $gradingPeriods->count(),
            'excluded_final_periods' => GradingPeriod::where('period_type', 'final')->count(),
            'period_details' => $gradingPeriods->map(function($gp) {
                return [
                    'id' => $gp->id,
                    'name' => $gp->name,
                    'period_type' => $gp->period_type,
                    'academic_level_id' => $gp->academic_level_id
                ];
            })
        ]);

        return Inertia::render('Registrar/Academic/AssignInstructorsSubjects', [
            'user' => Auth::user(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'subjects' => $subjects,
            'sections' => $sections,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function store(Request $request)
    {
        // Debug logging
        Log::info('InstructorSubjectAssignment store method called with data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
            'auto_enroll_students' => 'boolean', // New field for auto-enrolling students
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            Log::error('User is not an instructor:', ['user_id' => $request->instructor_id, 'role' => $instructor?->user_role]);
            return back()->with('error', 'Selected user is not an instructor.');
        }

        // Check for existing assignment
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
            'academic_level_id' => $request->academic_level_id,
            'school_year' => $request->school_year,
        ])
        ->where(function($query) use ($request) {
            if ($request->grading_period_id) {
                $query->where('grading_period_id', $request->grading_period_id);
            } else {
                $query->whereNull('grading_period_id');
            }
        })
        ->first();

        if ($existingAssignment) {
            Log::info('Assignment already exists:', ['existing_id' => $existingAssignment->id]);
            return back()->with('error', 'This instructor is already assigned to this subject for the specified section, period and school year.');
        }

        Log::info('Creating new assignment with data:', [
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        $assignment = InstructorSubjectAssignment::create([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id ?: null,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        Log::info('Assignment created successfully:', ['assignment_id' => $assignment->id]);

        // Auto-enroll students if requested
        if ($request->boolean('auto_enroll_students', true)) {
            $enrolledCount = $this->autoEnrollStudents($assignment);
            Log::info('Auto-enrolled students:', ['count' => $enrolledCount]);
        }

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
            'section_id' => 'required|exists:sections,id',
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
            'section_id' => $request->section_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->where('id', '!=', $assignment->id)->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this subject for the specified section, period and school year.');
        }

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
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

    /**
     * Get subjects by course for AJAX requests.
     */
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

    /**
     * Get sections by course for AJAX requests.
     */
    public function getSectionsByCourse(Request $request)
    {
        $courseId = $request->course_id;
        $yearLevel = $request->year_level;

        $query = Section::where('course_id', $courseId)
            ->where('is_active', true);

        // Filter by year level if provided
        if ($yearLevel) {
            $query->where('specific_year_level', $yearLevel);
        }

        $sections = $query->get(['id', 'name', 'code', 'specific_year_level']);

        return response()->json($sections);
    }

    /**
     * Auto-enroll students in a subject when an instructor is assigned.
     */
    private function autoEnrollStudents(InstructorSubjectAssignment $assignment)
    {
        // Get students in the same academic level
        $students = User::where('user_role', 'student')
            ->where('academic_level_id', $assignment->academic_level_id)
            ->get();

        $enrolledCount = 0;
        foreach ($students as $student) {
            // Check if student is already enrolled in this subject
            $existingEnrollment = \App\Models\StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $assignment->subject_id,
                'school_year' => $assignment->school_year,
            ])->first();

            if (!$existingEnrollment) {
                \App\Models\StudentSubjectAssignment::create([
                    'student_id' => $student->id,
                    'subject_id' => $assignment->subject_id,
                    'school_year' => $assignment->school_year,
                    'semester' => '1st Semester', // Default semester
                    'is_active' => true,
                    'enrolled_by' => Auth::id(),
                    'notes' => 'Auto-enrolled when instructor was assigned',
                ]);
                $enrolledCount++;
            }
        }

        return $enrolledCount;
    }

    /**
     * Show students enrolled in a specific instructor assignment.
     */
    public function showStudents(InstructorSubjectAssignment $assignment)
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

        return Inertia::render('Registrar/Academic/InstructorAssignmentStudents', [
            'user' => Auth::user(),
            'assignment' => $assignment->load(['subject', 'instructor', 'academicLevel']),
            'enrolledStudents' => $enrolledStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Enroll a student in an instructor's subject.
     */
    public function enrollStudent(Request $request, InstructorSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'semester' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if student is already enrolled
        $existingEnrollment = \App\Models\StudentSubjectAssignment::where([
            'student_id' => $request->student_id,
            'subject_id' => $assignment->subject_id,
            'school_year' => $assignment->school_year,
        ])->first();

        if ($existingEnrollment) {
            return back()->with('error', 'This student is already enrolled in this subject.');
        }

        // Create enrollment
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

    /**
     * Remove a student from an instructor's subject.
     */
    public function removeStudent(Request $request, InstructorSubjectAssignment $assignment)
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
