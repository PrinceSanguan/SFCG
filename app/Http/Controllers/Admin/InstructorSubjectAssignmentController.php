<?php

namespace App\Http\Controllers\Admin;

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
        $gradingPeriods = GradingPeriod::all();

        return Inertia::render('Admin/Academic/AssignInstructorsSubjects', [
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

        // Check for existing assignment
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this subject for the specified section, period and school year.');
        }

        $assignment = InstructorSubjectAssignment::create([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'section_id' => $request->section_id,
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

        // Send assignment notification to instructor
        try {
            $notificationService = new \App\Services\NotificationService();
            $subject = Subject::find($request->subject_id);
            $section = Section::find($request->section_id);
            $academicLevel = AcademicLevel::find($request->academic_level_id);
            $gradingPeriod = $request->grading_period_id ? GradingPeriod::find($request->grading_period_id) : null;

            \Illuminate\Support\Facades\Log::info('Preparing instructor subject assignment notification data', [
                'instructor_id' => $instructor->id,
                'instructor_name' => $instructor->name,
                'subject_name' => $subject ? $subject->name : 'N/A',
                'section_name' => $section ? $section->name : 'N/A',
            ]);

            $assignmentDetails = [
                'assignment_id' => $assignment->id,
                'subject_name' => $subject ? $subject->name : 'N/A',
                'section_name' => $section ? $section->name : 'N/A',
                'course_name' => ($subject && $subject->course) ? $subject->course->name : 'N/A',
                'department_name' => ($subject && $subject->course && $subject->course->department) ? $subject->course->department->name : 'N/A',
                'academic_level' => $academicLevel ? $academicLevel->name : 'N/A',
                'school_year' => $request->school_year,
                'grading_period' => $gradingPeriod ? $gradingPeriod->name : null,
                'notes' => $request->notes,
            ];

            \Illuminate\Support\Facades\Log::info('Sending instructor subject assignment notification', [
                'instructor_id' => $instructor->id,
                'assignment_details' => $assignmentDetails,
            ]);

            $notificationResult = $notificationService->sendAssignmentNotification($instructor, 'instructor', $assignmentDetails);

            if ($notificationResult['success']) {
                \Illuminate\Support\Facades\Log::info('Instructor subject assignment notification sent successfully', [
                    'instructor_name' => $instructor->name,
                    'instructor_email' => $instructor->email,
                    'notification_id' => $notificationResult['notification_id'],
                ]);
            } else {
                \Illuminate\Support\Facades\Log::warning('Instructor subject assignment notification failed', [
                    'instructor_name' => $instructor->name,
                    'error' => $notificationResult['error'] ?? 'Unknown error',
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Exception while sending instructor subject assignment notification', [
                'instructor_id' => $instructor->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Don't fail the whole operation if notification fails
        }

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
}
