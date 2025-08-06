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
use App\Models\AcademicLevel;

class TeacherController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();
        
        // Get teacher's subject assignments
        $assignments = $teacher->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        // Get dashboard statistics
        $stats = [
            'total_subjects' => $assignments->count(),
            'total_students' => $this->getTotalStudentsCount($teacher),
            'pending_grades' => $teacher->submittedGrades()->where('status', 'submitted')->count(),
            'approved_grades' => $teacher->submittedGrades()->where('status', 'approved')->count(),
            'draft_grades' => $teacher->submittedGrades()->where('status', 'draft')->count(),
        ];

        // Get recent activities
        $recentActivities = ActivityLog::where('user_id', $teacher->id)
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

        return Inertia::render('Teacher/TeacherDashboard', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'assignments' => $assignments,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'currentPeriod' => $currentPeriod,
        ]);
    }

    // 4.1.1. View/Edit own information
    public function profile()
    {
        $teacher = Auth::user();

        return Inertia::render('Teacher/Profile', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'created_at' => $teacher->created_at->format('M d, Y'),
                'last_login_at' => $teacher->last_login_at ? $teacher->last_login_at->format('M d, Y g:i A') : 'Never',
                'role_display' => $teacher->getRoleDisplayName(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $teacher = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($teacher->id)],
        ]);

        // Store original values for activity log
        $originalName = $teacher->name;
        $originalEmail = $teacher->email;

        $teacher->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Log the activity
        ActivityLog::logActivity(
            $teacher,
            'updated',
            'User',
            $teacher->id,
            ['name' => $originalName, 'email' => $originalEmail],
            ['name' => $teacher->name, 'email' => $teacher->email]
        );

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $teacher = Auth::user();

        if (!Hash::check($request->current_password, $teacher->password)) {
            return redirect()->back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $teacher->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::logActivity(
            $teacher,
            'updated',
            'User',
            $teacher->id,
            null,
            ['password' => '***']
        );

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    // 4.2. Grade Management
    public function grades(Request $request)
    {
        $teacher = Auth::user();
        
        // Get teacher's subject assignments
        $assignments = $teacher->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        // Get grades for the teacher's subjects
        $grades = Grade::where('instructor_id', $teacher->id)
            ->with(['student', 'subject', 'academicPeriod'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Teacher/Grades/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'assignments' => $assignments,
            'grades' => $grades,
        ]);
    }

    public function createGrade()
    {
        $teacher = Auth::user();
        
        $assignments = $teacher->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('Teacher/Grades/Create', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
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

        $teacher = Auth::user();

        // Verify the teacher is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $teacher->id)
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

        $teacher = Auth::user();

        // Verify the teacher is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $teacher->id)
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
            ->where('instructor_id', $teacher->id)
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
            'instructor_id' => $teacher->id,
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
            $teacher,
            'created',
            'Grade',
            $grade->id,
            null,
            $grade->toArray()
        );

        return redirect()->route('teacher.grades')->with('success', 'Grade created successfully.');
    }

    public function editGrade(Grade $grade)
    {
        $teacher = Auth::user();

        // Verify the teacher owns this grade
        if ($grade->instructor_id !== $teacher->id) {
            abort(403, 'You are not authorized to edit this grade.');
        }

        return Inertia::render('Teacher/Grades/Edit', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'grade' => $grade->load(['student', 'subject', 'academicPeriod']),
        ]);
    }

    public function updateGrade(Request $request, Grade $grade)
    {
        $teacher = Auth::user();

        // Verify the teacher owns this grade
        if ($grade->instructor_id !== $teacher->id) {
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
            $teacher,
            'updated',
            'Grade',
            $grade->id,
            $oldValues,
            $grade->toArray()
        );

        return redirect()->route('teacher.grades')->with('success', 'Grade updated successfully.');
    }

    public function submitGrades(Request $request)
    {
        $request->validate([
            'grade_ids' => 'required|array',
            'grade_ids.*' => 'exists:grades,id',
        ]);

        $teacher = Auth::user();
        $submittedCount = 0;

        foreach ($request->grade_ids as $gradeId) {
            $grade = Grade::find($gradeId);
            
            // Verify the teacher owns this grade
            if ($grade && $grade->instructor_id === $teacher->id) {
                $grade->update(['status' => 'submitted']);
                $submittedCount++;
            }
        }

        ActivityLog::logActivity(
            $teacher,
            'submitted',
            'Grade',
            null,
            null,
            ['submitted_count' => $submittedCount]
        );

        return redirect()->back()->with('success', "{$submittedCount} grades submitted for validation.");
    }

    public function uploadGradesPage()
    {
        $teacher = Auth::user();
        
        $subjects = $teacher->subjectAssignments()
            ->with('subject')
            ->where('is_active', true)
            ->get()
            ->pluck('subject');

        $periods = AcademicPeriod::where('is_active', true)->get();

        return Inertia::render('Teacher/Grades/Upload', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
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

        $teacher = Auth::user();

        // Verify the teacher is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $teacher->id)
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
                            ->where('instructor_id', $teacher->id)
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
                            'instructor_id' => $teacher->id,
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

    public function editGrades(Request $request)
    {
        $teacher = Auth::user();
        
        $grades = Grade::where('instructor_id', $teacher->id)
            ->with(['student', 'subject', 'academicPeriod'])
            ->where('status', 'submitted')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Teacher/Grades/Edit', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'grades' => $grades,
        ]);
    }

    public function submitGradesPage(Request $request)
    {
        $teacher = Auth::user();
        
        $grades = Grade::where('instructor_id', $teacher->id)
            ->with(['student', 'subject', 'academicPeriod'])
            ->where('status', 'draft')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Teacher/Grades/Submit', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'grades' => $grades,
        ]);
    }

    // 4.3.1. View honor results of students
    public function honors(Request $request)
    {
        $teacher = Auth::user();
        
        // Get teacher's assigned sections
        $teacherSections = $teacher->subjectAssignments()
            ->where('is_active', true)
            ->pluck('section')
            ->unique();
        
        $honors = StudentHonor::whereHas('student.studentProfile', function($query) use ($teacherSections) {
            $query->whereIn('section', $teacherSections);
        })
        ->with(['student', 'student.studentProfile', 'honorCriterion'])
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return Inertia::render('Teacher/Honors/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'role_display' => $teacher->getRoleDisplayName(),
            ],
            'honors' => $honors,
        ]);
    }

    // ==================== GRADING MANAGEMENT ====================
    
    public function gradingIndex()
    {
        $teacher = Auth::user();
        
        // Get K-12 academic levels only (no college)
        $elementaryLevels = AcademicLevel::whereIn('name', ['Elementary'])
            ->orWhere('code', 'ELEM')
            ->pluck('id');
            
        $juniorHighLevels = AcademicLevel::whereIn('name', ['Junior High School', 'Junior High'])
            ->orWhere('code', 'JHS')
            ->pluck('id');
            
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');

        // Count grades by category for this teacher only
        $gradeCounts = [
            'elementary' => Grade::where('instructor_id', $teacher->id)
                ->whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                    $q->whereIn('academic_level_id', $elementaryLevels);
                })->count(),
            'junior_high' => Grade::where('instructor_id', $teacher->id)
                ->whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                    $q->whereIn('academic_level_id', $juniorHighLevels);
                })->count(),
            'senior_high' => Grade::where('instructor_id', $teacher->id)
                ->whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                    $q->whereIn('academic_level_id', $seniorHighLevels);
                })->count(),
            'total' => Grade::where('instructor_id', $teacher->id)->count(),
            'pending' => Grade::where('instructor_id', $teacher->id)->where('status', 'submitted')->count(),
            'approved' => Grade::where('instructor_id', $teacher->id)->where('status', 'approved')->count(),
            'draft' => Grade::where('instructor_id', $teacher->id)->where('status', 'draft')->count(),
        ];
        
        return Inertia::render('Teacher/Grading/Index', [
            'gradeCounts' => $gradeCounts,
        ]);
    }

    public function elementaryGrading(Request $request)
    {
        $teacher = Auth::user();
        $elementaryLevels = AcademicLevel::whereIn('name', ['Elementary'])
            ->orWhere('code', 'ELEM')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod'
        ])->where('instructor_id', $teacher->id)
        ->whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
            $q->whereIn('academic_level_id', $elementaryLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/Elementary', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'section', 'status']),
        ]);
    }

    public function juniorHighGrading(Request $request)
    {
        $teacher = Auth::user();
        $juniorHighLevels = AcademicLevel::whereIn('name', ['Junior High School', 'Junior High'])
            ->orWhere('code', 'JHS')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod'
        ])->where('instructor_id', $teacher->id)
        ->whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
            $q->whereIn('academic_level_id', $juniorHighLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/JuniorHigh', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'section', 'status']),
        ]);
    }

    public function seniorHighGrading(Request $request)
    {
        $teacher = Auth::user();
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod'
        ])->where('instructor_id', $teacher->id)
        ->whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
            $q->whereIn('academic_level_id', $seniorHighLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/SeniorHigh', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'section', 'status']),
        ]);
    }

    public function createElementary()
    {
        $teacher = Auth::user();
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/CreateElementary', [
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
        ]);
    }

    public function createJuniorHigh()
    {
        $teacher = Auth::user();
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/CreateJuniorHigh', [
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
        ]);
    }

    public function createSeniorHigh()
    {
        $teacher = Auth::user();
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('instructorSubjectAssignments', function($q) use ($teacher) {
            $q->where('instructor_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/Grading/CreateSeniorHigh', [
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
        ]);
    }

    private function getTotalStudentsCount(User $teacher)
    {
        // Get teacher's assigned sections
        $teacherSections = $teacher->subjectAssignments()
            ->where('is_active', true)
            ->pluck('section')
            ->unique();
        
        return User::where('user_role', 'student')
            ->whereHas('studentProfile', function($query) use ($teacherSections) {
                $query->whereIn('section', $teacherSections);
            })
            ->count();
    }
} 