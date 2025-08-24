<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\StudentSubjectAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class StudentSubjectController extends Controller
{
    /**
     * Display the student subject management page.
     */
    public function index(Request $request)
    {
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        // Get search and filter parameters
        $search = $request->get('search', '');
        $selectedLevel = $request->get('level', '');
        $selectedYear = $request->get('year', '');
        
        // Get all student subject assignments grouped by academic level
        $assignmentsByLevel = [];
        foreach ($academicLevels as $level) {
            $query = StudentSubjectAssignment::with([
                'student', 
                'subject.academicLevel', 
                'subject.course',
                'enrolledBy'
            ])
            ->whereHas('subject', function ($query) use ($level) {
                $query->where('academic_level_id', $level->id);
            });
            
            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('student', function ($studentQuery) use ($search) {
                        $studentQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('subject', function ($subjectQuery) use ($search) {
                        $subjectQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('code', 'like', "%{$search}%");
                    });
                });
            }
            
            // Apply year filter
            if ($selectedYear) {
                $query->where('school_year', $selectedYear);
            }
            
            $assignmentsByLevel[$level->key] = $query->orderBy('created_at', 'desc')->get();
        }

        // Get filtered students based on search and level
        $studentsQuery = User::where('user_role', 'student');
        
        if ($search) {
            $studentsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($selectedLevel) {
            $level = AcademicLevel::where('key', $selectedLevel)->first();
            if ($level) {
                $studentsQuery->where('academic_level_id', $level->id);
            }
        }
        
        $students = $studentsQuery->orderBy('name')->get();

        // Get filtered subjects based on search and level
        $subjectsQuery = Subject::with(['academicLevel', 'course']);
        
        if ($search) {
            $subjectsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            });
        }
        
        if ($selectedLevel) {
            $level = AcademicLevel::where('key', $selectedLevel)->first();
            if ($level) {
                $subjectsQuery->where('academic_level_id', $level->id);
            }
        }
        
        $subjects = $subjectsQuery->orderBy('academic_level_id')->orderBy('name')->get();

        // Get unique school years for filter
        $schoolYears = StudentSubjectAssignment::distinct()->pluck('school_year')->sort()->values();

        return Inertia::render('Registrar/Academic/StudentSubjects', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'assignmentsByLevel' => $assignmentsByLevel,
            'students' => $students,
            'subjects' => $subjects,
            'search' => $search,
            'selectedLevel' => $selectedLevel,
            'selectedYear' => $selectedYear,
            'schoolYears' => $schoolYears,
        ]);
    }

    /**
     * Store a new student subject assignment.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'school_year' => 'required|string',
            'semester' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if student has the correct role
        $student = User::find($request->student_id);
        if (!$student || $student->user_role !== 'student') {
            return back()->with('error', 'Selected user is not a student.');
        }

        // Check for existing assignment to prevent duplicates
        $existingAssignment = StudentSubjectAssignment::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'school_year' => $request->school_year,
            'semester' => $request->semester,
        ])->first();

        if ($existingAssignment) {
            return back()->with('error', 'This student is already enrolled in this subject for the specified period.');
        }

        $assignment = StudentSubjectAssignment::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'school_year' => $request->school_year,
            'semester' => $request->semester,
            'enrolled_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->student_id,
            'action' => 'enrolled_student_subject',
            'entity_type' => 'student_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'student' => $student->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
                'semester' => $request->semester,
            ],
        ]);

        return back()->with('success', 'Student enrolled in subject successfully!');
    }

    /**
     * Update a student subject assignment.
     */
    public function update(Request $request, StudentSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'school_year' => 'required|string',
            'semester' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if student has the correct role
        $student = User::find($request->student_id);
        if (!$student || $student->user_role !== 'student') {
            return back()->with('error', 'Selected user is not a student.');
        }

        // Check for existing assignment (excluding current one)
        $existingAssignment = StudentSubjectAssignment::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'school_year' => $request->school_year,
            'semester' => $request->semester,
        ])->where('id', '!=', $assignment->id)->first();

        if ($existingAssignment) {
            return back()->with('error', 'This student is already enrolled in this subject for the specified period.');
        }

        $assignment->update([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'school_year' => $request->school_year,
            'semester' => $request->semester,
            'notes' => $request->notes,
            'is_active' => $request->is_active,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->student_id,
            'action' => 'updated_student_subject_enrollment',
            'entity_type' => 'student_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'student' => $student->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
                'semester' => $request->semester,
            ],
        ]);

        return back()->with('success', 'Student subject enrollment updated successfully!');
    }

    /**
     * Remove a student subject assignment.
     */
    public function destroy(StudentSubjectAssignment $assignment)
    {
        $studentName = $assignment->student->name;
        $subjectName = $assignment->subject->name;

        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $assignment->student_id,
            'action' => 'removed_student_subject_enrollment',
            'entity_type' => 'student_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'student' => $studentName,
                'subject' => $subjectName,
            ],
        ]);

        return back()->with('success', 'Student subject enrollment removed successfully!');
    }

    /**
     * Get students by academic level.
     */
    public function getStudentsByLevel($levelId)
    {
        $students = User::where('user_role', 'student')
            ->where('academic_level_id', $levelId)
            ->orderBy('name')
            ->get();

        return response()->json($students);
    }

    /**
     * Get subjects by academic level.
     */
    public function getSubjectsByLevel($levelId)
    {
        $subjects = Subject::with(['academicLevel', 'course'])
            ->where('academic_level_id', $levelId)
            ->orderBy('name')
            ->get();

        return response()->json($subjects);
    }

    /**
     * Get shared user data.
     */
    private function sharedUser()
    {
        return Auth::user();
    }
}
