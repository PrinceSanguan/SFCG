<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\StudentHonor;
use App\Models\StudentProfile;
use App\Models\ClassAdviserAssignment;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\InstructorSubjectAssignment;

class ClassAdviserController extends Controller
{
    // 5.1. Account Management
    // 5.1.1. View/Edit own information
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

    public function profile()
    {
        $adviser = Auth::user();

        return Inertia::render('ClassAdviser/Profile', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'email' => $adviser->email,
                'created_at' => $adviser->created_at->format('M d, Y'),
                'last_login_at' => $adviser->last_login_at ? $adviser->last_login_at->format('M d, Y g:i A') : 'Never',
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

        // Store original values for activity log
        $originalName = $adviser->name;
        $originalEmail = $adviser->email;

        $adviser->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Log the activity
        ActivityLog::logActivity(
            $adviser,
            'updated',
            'User',
            $adviser->id,
            [
                'original_name' => $originalName,
                'original_email' => $originalEmail,
                'new_name' => $request->name,
                'new_email' => $request->email,
            ]
        );

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

        // Log the activity
        ActivityLog::logActivity(
            $adviser,
            'updated',
            'User',
            $adviser->id,
            ['action' => 'password_change']
        );

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    // 5.2. Grade Management
    public function students(Request $request)
    {
        $adviser = Auth::user();
        
        $students = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('ClassAdviser/Students/Index', [
            'students' => $students,
        ]);
    }

    public function grades(Request $request)
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
            ->with(['academicLevel', 'instructorAssignments.instructor', 'instructorAssignments.academicPeriod'])
            ->get();

        // Get grades for the adviser's students only
        $grades = Grade::whereIn('student_id', $assignedStudents->pluck('id'))
            ->with(['student', 'subject', 'academicPeriod'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('ClassAdviser/Grades/Index', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignedStudents' => $assignedStudents,
            'subjects' => $subjects,
            'grades' => $grades,
        ]);
    }

    // 5.2.1. Input grades
    public function createGrade()
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
            ->with(['academicLevel', 'instructorAssignments.instructor', 'instructorAssignments.academicPeriod'])
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

    public function storeGrade(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
            'first_grading' => 'nullable|numeric|min:0|max:100',
            'second_grading' => 'nullable|numeric|min:0|max:100',
            'third_grading' => 'nullable|numeric|min:0|max:100',
            'fourth_grading' => 'nullable|numeric|min:0|max:100',
            'overall_grade' => 'nullable|numeric|min:0|max:100',
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
        $subjectAssignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->first();

        if (!$subjectAssignment) {
            return redirect()->back()->withErrors(['error' => 'Subject is not assigned to you.']);
        }

        // Check if grade already exists
        $existingGrade = Grade::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->first();

        if ($existingGrade) {
            return redirect()->back()->withErrors(['error' => 'Grade already exists for this student, subject, and period.']);
        }

        // Create the grade
        $grade = Grade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'instructor_id' => $adviser->id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
            'first_grading' => $request->first_grading,
            'second_grading' => $request->second_grading,
            'third_grading' => $request->third_grading,
            'fourth_grading' => $request->fourth_grading,
            'overall_grade' => $request->overall_grade,
            'remarks' => $request->remarks,
            'status' => 'submitted',
            'submitted_by' => $adviser->id,
        ]);

        // Log the activity
        ActivityLog::logActivity(
            $adviser,
            'created',
            'Grade',
            $grade->id,
            [
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'academic_period_id' => $request->academic_period_id,
            ]
        );

        return response()->json(['success' => true, 'message' => 'Grade submitted successfully.']);
    }

    public function getStudentsForSubject(Request $request)
    {
        $adviser = Auth::user();

        // Get the subject to check its academic level
        $subject = Subject::with('academicLevel')->findOrFail($request->subject_id);

        // Verify the adviser is assigned to this specific subject
        $subjectAssignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->where('is_active', true)
            ->first();

        if (!$subjectAssignment) {
            return response()->json(['error' => 'You are not assigned to this subject for this period and section.'], 403);
        }

        // Get students assigned to this adviser for this section and academic level
        $students = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser, $request, $subject) {
                $query->where('class_adviser_id', $adviser->id)
                      ->where('section', $request->section)
                      ->where('academic_level_id', $subject->academic_level_id);
            })
            ->with('studentProfile')
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_id' => $student->studentProfile->student_id ?? '',
                    'section' => $student->studentProfile->section ?? '',
                ];
            });

        return response()->json(['students' => $students]);
    }

    // 5.2.2. Edit submitted grades
    public function editGrade(Grade $grade)
    {
        $adviser = Auth::user();

        // Verify the adviser is assigned to this student
        $student = User::find($grade->student_id);
        if (!$student || $student->studentProfile->class_adviser_id !== $adviser->id) {
            abort(403, 'You are not authorized to edit this grade.');
        }

        // Get subjects and academic periods for the form
        $subjects = Subject::orderBy('name')->get();
        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        return Inertia::render('ClassAdviser/Grades/Edit', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'grade' => $grade->load(['student', 'subject', 'academicPeriod']),
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
        ]);
    }

    public function updateGrade(Request $request, Grade $grade)
    {
        $adviser = Auth::user();

        // Verify the adviser is assigned to this student
        $student = User::find($grade->student_id);
        if (!$student || $student->studentProfile->class_adviser_id !== $adviser->id) {
            abort(403, 'You are not authorized to edit this grade.');
        }

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
            'first_grading' => 'nullable|numeric|min:0|max:100',
            'second_grading' => 'nullable|numeric|min:0|max:100',
            'third_grading' => 'nullable|numeric|min:0|max:100',
            'fourth_grading' => 'nullable|numeric|min:0|max:100',
            'first_semester_midterm' => 'nullable|numeric|min:0|max:100',
            'first_semester_pre_final' => 'nullable|numeric|min:0|max:100',
            'second_semester_midterm' => 'nullable|numeric|min:0|max:100',
            'second_semester_pre_final' => 'nullable|numeric|min:0|max:100',
            'overall_grade' => 'nullable|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        // Update the grade
        $grade->update([
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
            'first_grading' => $request->first_grading,
            'second_grading' => $request->second_grading,
            'third_grading' => $request->third_grading,
            'fourth_grading' => $request->fourth_grading,
            'first_semester_midterm' => $request->first_semester_midterm,
            'first_semester_pre_final' => $request->first_semester_pre_final,
            'second_semester_midterm' => $request->second_semester_midterm,
            'second_semester_pre_final' => $request->second_semester_pre_final,
            'overall_grade' => $request->overall_grade,
            'remarks' => $request->remarks,
            'status' => 'submitted',
        ]);

        // Log the activity
        ActivityLog::logActivity(
            $adviser,
            'updated',
            'Grade',
            $grade->id,
            [
                'student_id' => $grade->student_id,
                'subject_id' => $request->subject_id,
                'academic_period_id' => $request->academic_period_id,
            ]
        );

        return redirect()->route('class-adviser.grades')->with('success', 'Grade updated successfully.');
    }

    // 5.2.3. Upload student grades via CSV
    public function uploadGradesPage()
    {
        $adviser = Auth::user();
        
        // Get students assigned to this adviser
        $assignedStudents = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();

        // Get subjects and academic periods
        $subjects = Subject::orderBy('name')->get();
        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        return Inertia::render('ClassAdviser/Grades/Upload', [
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

    public function processGradeUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
        ]);

        $adviser = Auth::user();

        try {
            $file = $request->file('csv_file');
            $path = $file->store('temp');
            $fullPath = Storage::path($path);

            $handle = fopen($fullPath, 'r');
            $header = fgetcsv($handle);
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            while (($data = fgetcsv($handle)) !== false) {
                $row = array_combine($header, $data);
                
                try {
                    // Validate required fields
                    if (empty($row['student_id']) || empty($row['subject_id'])) {
                        $errors[] = "Row " . ($successCount + $errorCount + 1) . ": Missing student_id or subject_id";
                        $errorCount++;
                        continue;
                    }

                    // Find student and verify they are assigned to this adviser
                    $student = User::where('user_role', 'student')
                        ->whereHas('studentProfile', function($query) use ($adviser) {
                            $query->where('class_adviser_id', $adviser->id);
                        })
                        ->where('id', $row['student_id'])
                        ->first();

                    if (!$student) {
                        $errors[] = "Row " . ($successCount + $errorCount + 1) . ": Student not found or not assigned to you";
                        $errorCount++;
                        continue;
                    }

                    // Verify the subject is assigned to this adviser
                    $subjectAssignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
                        ->where('subject_id', $row['subject_id'])
                        ->where('is_active', true)
                        ->first();

                    if (!$subjectAssignment) {
                        $errors[] = "Row " . ($successCount + $errorCount + 1) . ": Subject not assigned to you";
                        $errorCount++;
                        continue;
                    }

                    // Check if grade already exists
                    $existingGrade = Grade::where('student_id', $row['student_id'])
                        ->where('subject_id', $row['subject_id'])
                        ->where('academic_period_id', $request->academic_period_id)
                        ->where('section', $request->section)
                        ->first();

                    if ($existingGrade) {
                        $errors[] = "Row " . ($successCount + $errorCount + 1) . ": Grade already exists for this student and subject";
                        $errorCount++;
                        continue;
                    }

                    // Create grade
                    Grade::create([
                        'student_id' => $row['student_id'],
                        'subject_id' => $row['subject_id'],
                        'instructor_id' => $adviser->id,
                        'academic_period_id' => $request->academic_period_id,
                        'section' => $request->section,
                        'first_grading' => $row['first_grading'] ?? null,
                        'second_grading' => $row['second_grading'] ?? null,
                        'third_grading' => $row['third_grading'] ?? null,
                        'fourth_grading' => $row['fourth_grading'] ?? null,
                        'first_semester_midterm' => $row['first_semester_midterm'] ?? null,
                        'first_semester_pre_final' => $row['first_semester_pre_final'] ?? null,
                        'second_semester_midterm' => $row['second_semester_midterm'] ?? null,
                        'second_semester_pre_final' => $row['second_semester_pre_final'] ?? null,
                        'overall_grade' => $row['overall_grade'] ?? null,
                        'remarks' => $row['remarks'] ?? null,
                        'status' => 'submitted',
                        'submitted_by' => $adviser->id,
                    ]);

                    $successCount++;

                } catch (\Exception $e) {
                    $errors[] = "Row " . ($successCount + $errorCount + 1) . ": " . $e->getMessage();
                    $errorCount++;
                }
            }

            fclose($handle);
            Storage::delete($path);

            // Log the activity
            ActivityLog::logActivity(
                $adviser,
                'uploaded',
                'Grade',
                null,
                [
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                    'academic_period_id' => $request->academic_period_id,
                    'section' => $request->section,
                ]
            );

            $message = "Upload completed. Successfully imported {$successCount} grades.";
            if ($errorCount > 0) {
                $message .= " {$errorCount} errors occurred.";
            }

            return redirect()->back()->with('success', $message)->with('errors', $errors);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    // 5.3. Honor Tracking
    // 5.3.1. View honor results of students (limited to assigned students)
    public function honors(Request $request)
    {
        $adviser = Auth::user();
        
        // Get students assigned to this adviser
        $assignedStudents = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();

        // Get honor results for the adviser's students only
        $honors = StudentHonor::whereIn('student_id', $assignedStudents->pluck('id'))
            ->with(['student.studentProfile.academicLevel', 'academicPeriod'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('ClassAdviser/Honors/Index', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignedStudents' => $assignedStudents,
            'honors' => $honors,
        ]);
    }

    private function getTotalStudentsCount(User $adviser)
    {
        return User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviser) {
                $query->where('class_adviser_id', $adviser->id);
            })
            ->count();
    }
}
