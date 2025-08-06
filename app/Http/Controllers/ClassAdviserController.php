<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\StudentHonor;
use App\Models\StudentProfile;
use App\Models\InstructorSubjectAssignment;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassAdviserController extends Controller
{
    public function index()
    {
        $adviser = Auth::user();
        
        // Get adviser's subject assignments
        $assignments = $adviser->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        // Get dashboard statistics
        $stats = [
            'total_subjects' => $assignments->count(),
            'total_students' => $this->getTotalStudentsCount($adviser),
            'pending_grades' => $adviser->submittedGrades()->where('status', 'submitted')->count(),
            'approved_grades' => $adviser->submittedGrades()->where('status', 'approved')->count(),
            'draft_grades' => $adviser->submittedGrades()->where('status', 'draft')->count(),
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
            'assignments' => $assignments,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'currentPeriod' => $currentPeriod,
        ]);
    }

    // 5.1.1. View/Edit own information
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
            ['name' => $originalName, 'email' => $originalEmail],
            ['name' => $adviser->name, 'email' => $adviser->email]
        );

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $adviser = Auth::user();

        if (!Hash::check($request->current_password, $adviser->password)) {
            return redirect()->back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $adviser->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::logActivity(
            $adviser,
            'updated',
            'User',
            $adviser->id,
            null,
            ['password' => '***']
        );

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    // 5.2. Grade Management
    public function grades(Request $request)
    {
        $adviser = Auth::user();
        
        // Get adviser's subject assignments
        $assignments = $adviser->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        // Get grades for the adviser's subjects
        $grades = Grade::where('instructor_id', $adviser->id)
            ->with(['student', 'subject', 'academicPeriod'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('ClassAdviser/Grades/Index', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignments' => $assignments,
            'grades' => $grades,
        ]);
    }

    public function createGrade()
    {
        $adviser = Auth::user();
        
        $assignments = $adviser->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('ClassAdviser/Grades/Create', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'assignments' => $assignments,
        ]);
    }

    public function getStudentsForSubject(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
        ]);

        $adviser = Auth::user();

        // Verify the adviser is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->first();

        if (!$assignment) {
            return response()->json(['error' => 'You are not assigned to this subject.'], 403);
        }

        // Get students for this subject/section - ONLY JUNIOR HIGH SCHOOL STUDENTS
        $students = User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($request) {
                $query->where('section', $request->section)
                      ->where('academic_level_id', 3); // 3 = Junior High School
            })
            ->with('studentProfile')
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_id' => $student->studentProfile->student_id ?? '',
                ];
            });

        return response()->json(['students' => $students]);
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
            'first_semester_midterm' => 'nullable|numeric|min:0|max:100',
            'first_semester_pre_final' => 'nullable|numeric|min:0|max:100',
            'second_semester_midterm' => 'nullable|numeric|min:0|max:100',
            'second_semester_pre_final' => 'nullable|numeric|min:0|max:100',
            'overall_grade' => 'nullable|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:255',
        ]);

        $adviser = Auth::user();

        // Verify the adviser is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->first();

        if (!$assignment) {
            return redirect()->back()->withErrors(['error' => 'You are not assigned to this subject.']);
        }

        // Check if grade already exists
        $existingGrade = Grade::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->where('instructor_id', $adviser->id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->first();

        if ($existingGrade) {
            return redirect()->back()->withErrors(['error' => 'Grade already exists for this student and subject.']);
        }

        // Create the grade
        $grade = Grade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'instructor_id' => $adviser->id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
            '1st_grading' => $request->first_grading,
            '2nd_grading' => $request->second_grading,
            '3rd_grading' => $request->third_grading,
            '4th_grading' => $request->fourth_grading,
            '1st_semester_midterm' => $request->first_semester_midterm,
            '1st_semester_pre_final' => $request->first_semester_pre_final,
            '2nd_semester_midterm' => $request->second_semester_midterm,
            '2nd_semester_pre_final' => $request->second_semester_pre_final,
            'overall_grade' => $request->overall_grade,
            'remarks' => $request->remarks,
            'status' => 'draft',
        ]);

        ActivityLog::logActivity(
            $adviser,
            'created',
            'Grade',
            $grade->id,
            null,
            $grade->toArray()
        );

        return redirect()->route('class-adviser.grades')->with('success', 'Grade created successfully.');
    }

    public function editGrade(Grade $grade)
    {
        $adviser = Auth::user();

        // Verify the adviser owns this grade
        if ($grade->instructor_id !== $adviser->id) {
            abort(403, 'You are not authorized to edit this grade.');
        }

        return Inertia::render('ClassAdviser/Grades/Edit', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'grade' => $grade->load(['student', 'subject', 'academicPeriod']),
        ]);
    }

    public function updateGrade(Request $request, Grade $grade)
    {
        $adviser = Auth::user();

        // Verify the adviser owns this grade
        if ($grade->instructor_id !== $adviser->id) {
            abort(403, 'You are not authorized to update this grade.');
        }

        $request->validate([
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

        $oldValues = $grade->toArray();

        $grade->update([
            '1st_grading' => $request->first_grading,
            '2nd_grading' => $request->second_grading,
            '3rd_grading' => $request->third_grading,
            '4th_grading' => $request->fourth_grading,
            '1st_semester_midterm' => $request->first_semester_midterm,
            '1st_semester_pre_final' => $request->first_semester_pre_final,
            '2nd_semester_midterm' => $request->second_semester_midterm,
            '2nd_semester_pre_final' => $request->second_semester_pre_final,
            'overall_grade' => $request->overall_grade,
            'remarks' => $request->remarks,
        ]);

        ActivityLog::logActivity(
            $adviser,
            'updated',
            'Grade',
            $grade->id,
            $oldValues,
            $grade->toArray()
        );

        return redirect()->route('class-adviser.grades')->with('success', 'Grade updated successfully.');
    }

    public function editGrades(Request $request)
    {
        $adviser = Auth::user();
        
        $grades = Grade::where('instructor_id', $adviser->id)
            ->with(['student', 'subject', 'academicPeriod'])
            ->where('status', 'submitted')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('ClassAdviser/Grades/Edit', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'grades' => $grades,
        ]);
    }

    public function uploadGradesPage()
    {
        $adviser = Auth::user();
        
        $subjects = $adviser->subjectAssignments()
            ->with('subject')
            ->where('is_active', true)
            ->get()
            ->pluck('subject');

        $periods = AcademicPeriod::where('is_active', true)->get();

        return Inertia::render('ClassAdviser/Grades/Upload', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'subjects' => $subjects,
            'periods' => $periods,
        ]);
    }

    public function processGradeUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'required|string',
        ]);

        $adviser = Auth::user();

        // Verify the adviser is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $adviser->id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('section', $request->section)
            ->first();

        if (!$assignment) {
            return redirect()->back()->withErrors(['error' => 'You are not assigned to this subject.']);
        }

        $file = $request->file('csv_file');
        
        try {
            $csvData = array_map('str_getcsv', file($file->path()));
            $headers = array_shift($csvData);
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            DB::transaction(function () use ($csvData, $headers, $assignment, &$successCount, &$errorCount, &$errors) {
                foreach ($csvData as $rowIndex => $row) {
                    try {
                        $data = array_combine($headers, $row);
                        
                        // Find student by email or student ID
                        $student = User::where('user_role', 'student')
                            ->where(function($query) use ($data) {
                                $query->where('email', $data['email'] ?? '')
                                      ->orWhereHas('studentProfile', function($q) use ($data) {
                                          $q->where('student_id', $data['student_id'] ?? '');
                                      });
                            })
                            ->first();

                        if (!$student) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Student not found.";
                            $errorCount++;
                            continue;
                        }

                        // Check if grade already exists
                        $existingGrade = Grade::where('student_id', $student->id)
                            ->where('subject_id', $assignment->subject_id)
                            ->where('instructor_id', $assignment->instructor_id)
                            ->where('academic_period_id', $assignment->academic_period_id)
                            ->where('section', $assignment->section)
                            ->first();

                        if ($existingGrade) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Grade already exists for student {$student->name}.";
                            $errorCount++;
                            continue;
                        }

                        // Create grade
                        Grade::create([
                            'student_id' => $student->id,
                            'subject_id' => $assignment->subject_id,
                            'instructor_id' => $assignment->instructor_id,
                            'academic_period_id' => $assignment->academic_period_id,
                            'section' => $assignment->section,
                            '1st_grading' => $data['first_grading'] ?? null,
                            '2nd_grading' => $data['second_grading'] ?? null,
                            '3rd_grading' => $data['third_grading'] ?? null,
                            '4th_grading' => $data['fourth_grading'] ?? null,
                            '1st_semester_midterm' => $data['first_semester_midterm'] ?? null,
                            '1st_semester_pre_final' => $data['first_semester_pre_final'] ?? null,
                            '2nd_semester_midterm' => $data['second_semester_midterm'] ?? null,
                            '2nd_semester_pre_final' => $data['second_semester_pre_final'] ?? null,
                            'overall_grade' => $data['overall_grade'] ?? null,
                            'remarks' => $data['remarks'] ?? null,
                            'status' => 'draft',
                        ]);

                        $successCount++;
                        
                    } catch (\Exception $e) {
                        $errors[] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                        $errorCount++;
                    }
                }
            });

            $message = "CSV upload completed. {$successCount} grades created successfully.";
            if ($errorCount > 0) {
                $message .= " {$errorCount} rows had errors.";
            }

            return redirect()->back()->with('success', $message)->with('errors', $errors);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    // 5.3.1. View honor results of students
    public function honors(Request $request)
    {
        $adviser = Auth::user();
        
        // Get adviser's assigned sections
        $adviserSections = $adviser->subjectAssignments()
            ->where('is_active', true)
            ->pluck('section')
            ->unique();
        
        $honors = StudentHonor::whereHas('student.studentProfile', function($query) use ($adviserSections) {
            $query->whereIn('section', $adviserSections);
        })
        ->with(['student', 'student.studentProfile', 'honorCriterion'])
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return Inertia::render('ClassAdviser/Honors/Index', [
            'adviser' => [
                'id' => $adviser->id,
                'name' => $adviser->name,
                'role_display' => $adviser->getRoleDisplayName(),
            ],
            'honors' => $honors,
        ]);
    }

    private function getTotalStudentsCount(User $adviser)
    {
        // Get adviser's assigned sections
        $adviserSections = $adviser->subjectAssignments()
            ->where('is_active', true)
            ->pluck('section')
            ->unique();
        
        return User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($adviserSections) {
                $query->whereIn('section', $adviserSections);
            })
            ->count();
    }
}
