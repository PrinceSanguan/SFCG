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

class InstructorController extends Controller
{
    public function index()
    {
        $instructor = Auth::user();
        
        // Get instructor's subject assignments
        $assignments = $instructor->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        // Get dashboard statistics
        $stats = [
            'total_subjects' => $assignments->count(),
            'total_students' => $this->getTotalStudentsCount($instructor),
            'pending_grades' => $instructor->submittedGrades()->where('status', 'submitted')->count(),
            'approved_grades' => $instructor->submittedGrades()->where('status', 'approved')->count(),
            'draft_grades' => $instructor->submittedGrades()->where('status', 'draft')->count(),
        ];

        // Get recent activities
        $recentActivities = ActivityLog::where('user_id', $instructor->id)
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

        return Inertia::render('Instructor/InstructorDashboard', [
            'instructor' => [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'role_display' => $instructor->getRoleDisplayName(),
            ],
            'assignments' => $assignments,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'currentPeriod' => $currentPeriod,
        ]);
    }

    // 3.1.1. View/Edit own information
    public function profile()
    {
        $instructor = Auth::user();

        return Inertia::render('Instructor/Profile', [
            'instructor' => [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'created_at' => $instructor->created_at->format('M d, Y'),
                'last_login_at' => $instructor->last_login_at ? $instructor->last_login_at->format('M d, Y g:i A') : 'Never',
                'role_display' => $instructor->getRoleDisplayName(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $instructor = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($instructor->id)],
        ]);

        $instructor->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Log activity
        ActivityLog::logActivity(
            $instructor,
            'updated',
            'User',
            $instructor->id,
            ['name' => $instructor->getOriginal('name'), 'email' => $instructor->getOriginal('email')],
            ['name' => $request->name, 'email' => $request->email]
        );

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $instructor = Auth::user();

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $instructor->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $instructor->update([
            'password' => Hash::make($request->password),
        ]);

        // Log activity
        ActivityLog::logActivity(
            $instructor,
            'updated',
            'User',
            $instructor->id,
            null,
            ['action' => 'password_updated']
        );

        return back()->with('success', 'Password updated successfully.');
    }

    // 3.2. Grade Management
    public function grades(Request $request)
    {
        $instructor = Auth::user();
        $subjectId = $request->get('subject_id');
        $academicPeriodId = $request->get('academic_period_id');
        $status = $request->get('status', 'all');

        // Get instructor's subject assignments
        $assignments = $instructor->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        $query = $instructor->submittedGrades()
            ->with(['student.studentProfile', 'subject', 'academicPeriod']);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $grades = $query->orderBy('updated_at', 'desc')
            ->paginate(20)
            ->through(function ($grade) {
                $student = $grade->student;
                $profile = $student->studentProfile;
                
                return [
                    'id' => $grade->id,
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_id' => $profile->student_id ?? '',
                        'full_name' => $profile->full_name ?? $student->name,
                        'section' => $profile->section ?? '',
                        'academic_level' => $profile->academicLevel->name ?? '',
                    ],
                    'subject' => [
                        'id' => $grade->subject->id,
                        'name' => $grade->subject->name,
                        'code' => $grade->subject->code,
                        'units' => $grade->subject->units,
                    ],
                    'academic_period' => [
                        'id' => $grade->academicPeriod->id,
                        'name' => $grade->academicPeriod->name,
                        'school_year' => $grade->academicPeriod->school_year,
                    ],
                    'grade_value' => $grade->grade_value,
                    'status' => $grade->status,
                    'status_display' => ucfirst($grade->status),
                    'remarks' => $grade->remarks,
                    'submitted_at' => $grade->created_at->format('M d, Y g:i A'),
                    'updated_at' => $grade->updated_at->format('M d, Y g:i A'),
                    'can_edit' => in_array($grade->status, ['draft', 'returned']),
                    'can_submit' => $grade->status === 'draft',
                ];
            });

        // Get filter options
        $subjects = $assignments->pluck('subject')->unique('id')->values();
        $academicPeriods = $assignments->pluck('academicPeriod')->unique('id')->values();

        return Inertia::render('Instructor/Grades', [
            'grades' => $grades,
            'assignments' => $assignments,
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
            'filters' => $request->only(['subject_id', 'academic_period_id', 'status']),
        ]);
    }

    // 3.2.1. Input grades
    public function createGrade()
    {
        $instructor = Auth::user();
        
        // Get instructor's active assignments
        $assignments = $instructor->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('Instructor/Grades/Create', [
            'assignments' => $assignments,
        ]);
    }

    public function getStudentsForSubject(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
        ]);

        $instructor = Auth::user();
        
        // Verify instructor has access to this subject
        $assignment = $instructor->subjectAssignments()
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            return response()->json(['error' => 'Unauthorized access to subject'], 403);
        }

        $subject = Subject::with(['academicLevel', 'academicStrand', 'collegeCourse'])->find($request->subject_id);

        // Get students eligible for this subject
        $studentsQuery = User::where('user_role', 'student')
            ->with(['studentProfile.academicLevel', 'studentProfile.academicStrand', 'studentProfile.collegeCourse'])
            ->whereHas('studentProfile', function ($q) use ($subject) {
                $q->where('enrollment_status', 'active');
                
                if ($subject->isCollegeSubject()) {
                    $q->where('college_course_id', $subject->college_course_id)
                      ->where('year_level', $subject->year_level)
                      ->where('semester', $subject->semester);
                } else {
                    $q->where('academic_level_id', $subject->academic_level_id);
                    if ($subject->academic_strand_id) {
                        $q->where('academic_strand_id', $subject->academic_strand_id);
                    }
                }
            });

        $students = $studentsQuery->get()->map(function ($student) use ($request) {
            $profile = $student->studentProfile;
            
            // Check if grade already exists
            $existingGrade = Grade::where('student_id', $student->id)
                ->where('subject_id', $request->subject_id)
                ->where('academic_period_id', $request->academic_period_id)
                ->first();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'student_id' => $profile->student_id,
                'full_name' => $profile->full_name,
                'section' => $profile->section,
                'academic_info' => $profile->academic_info,
                'existing_grade' => $existingGrade ? [
                    'id' => $existingGrade->id,
                    'grade_value' => $existingGrade->grade_value,
                    'status' => $existingGrade->status,
                    'remarks' => $existingGrade->remarks,
                ] : null,
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
            'grade_value' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:500',
            'status' => 'required|in:draft,submitted',
        ]);

        $instructor = Auth::user();

        // Verify instructor has access to this subject
        $assignment = $instructor->subjectAssignments()
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            return back()->withErrors(['error' => 'Unauthorized access to subject']);
        }

        // Check if grade already exists
        $existingGrade = Grade::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->first();

        if ($existingGrade) {
            return back()->withErrors(['error' => 'Grade already exists for this student in this subject and period']);
        }

        DB::transaction(function () use ($request, $instructor) {
            $grade = Grade::create([
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'academic_period_id' => $request->academic_period_id,
                'grade_value' => $request->grade_value,
                'remarks' => $request->remarks,
                'status' => $request->status,
                'submitted_by' => $instructor->id,
            ]);

            // Log activity
            ActivityLog::logActivity(
                $instructor,
                'created',
                'Grade',
                $grade->id,
                null,
                $grade->toArray()
            );

            // Send notification to student if submitted
            if ($request->status === 'submitted') {
                $student = User::find($request->student_id);
                $subject = Subject::find($request->subject_id);
                $period = AcademicPeriod::find($request->academic_period_id);

                Notification::createForUser(
                    $student->id,
                    'grade_submitted',
                    'Grade Submitted',
                    "Your grade for {$subject->name} in {$period->name} has been submitted for approval.",
                    [
                        'grade_id' => $grade->id,
                        'subject' => $subject->name,
                        'period' => $period->name,
                        'grade_value' => $grade->grade_value,
                    ]
                );
            }
        });

        return back()->with('success', 'Grade saved successfully.');
    }

    // 3.2.2. Edit submitted grades  
    public function editGrade(Grade $grade)
    {
        $instructor = Auth::user();

        // Verify instructor owns this grade and can edit it
        if ($grade->submitted_by !== $instructor->id) {
            abort(403, 'Unauthorized access to grade');
        }

        if (!in_array($grade->status, ['draft', 'returned'])) {
            abort(403, 'Cannot edit grade with current status');
        }

        $grade->load(['student.studentProfile', 'subject', 'academicPeriod']);

        return Inertia::render('Instructor/Grades/Edit', [
            'grade' => [
                'id' => $grade->id,
                'student' => [
                    'id' => $grade->student->id,
                    'name' => $grade->student->name,
                    'student_id' => $grade->student->studentProfile->student_id ?? '',
                    'full_name' => $grade->student->studentProfile->full_name ?? $grade->student->name,
                ],
                'subject' => [
                    'id' => $grade->subject->id,
                    'name' => $grade->subject->name,
                    'code' => $grade->subject->code,
                ],
                'academic_period' => [
                    'id' => $grade->academicPeriod->id,
                    'name' => $grade->academicPeriod->name,
                    'school_year' => $grade->academicPeriod->school_year,
                ],
                'grade_value' => $grade->grade_value,
                'remarks' => $grade->remarks,
                'status' => $grade->status,
            ],
        ]);
    }

    public function updateGrade(Request $request, Grade $grade)
    {
        $request->validate([
            'grade_value' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:500',
            'status' => 'required|in:draft,submitted',
        ]);

        $instructor = Auth::user();

        // Verify instructor owns this grade and can edit it
        if ($grade->submitted_by !== $instructor->id) {
            abort(403, 'Unauthorized access to grade');
        }

        if (!in_array($grade->status, ['draft', 'returned'])) {
            abort(403, 'Cannot edit grade with current status');
        }

        $oldData = $grade->toArray();

        DB::transaction(function () use ($request, $grade, $instructor, $oldData) {
            $grade->update([
                'grade_value' => $request->grade_value,
                'remarks' => $request->remarks,
                'status' => $request->status,
            ]);

            // Log activity
            ActivityLog::logActivity(
                $instructor,
                'updated',
                'Grade',
                $grade->id,
                $oldData,
                $grade->fresh()->toArray()
            );

            // Send notification to student if status changed to submitted
            if ($request->status === 'submitted' && $oldData['status'] !== 'submitted') {
                $student = $grade->student;
                $subject = $grade->subject;
                $period = $grade->academicPeriod;

                Notification::createForUser(
                    $student->id,
                    'grade_submitted',
                    'Grade Updated and Submitted',
                    "Your updated grade for {$subject->name} in {$period->name} has been submitted for approval.",
                    [
                        'grade_id' => $grade->id,
                        'subject' => $subject->name,
                        'period' => $period->name,
                        'grade_value' => $grade->grade_value,
                    ]
                );
            }
        });

        return back()->with('success', 'Grade updated successfully.');
    }

    // 3.2.3. Submit grades for validation
    public function submitGrades(Request $request)
    {
        $request->validate([
            'grade_ids' => 'required|array',
            'grade_ids.*' => 'exists:grades,id',
        ]);

        $instructor = Auth::user();

        $grades = Grade::whereIn('id', $request->grade_ids)
            ->where('submitted_by', $instructor->id)
            ->where('status', 'draft')
            ->get();

        if ($grades->isEmpty()) {
            return back()->withErrors(['error' => 'No eligible grades found for submission']);
        }

        DB::transaction(function () use ($grades, $instructor) {
            foreach ($grades as $grade) {
                $grade->update(['status' => 'submitted']);

                // Log activity
                ActivityLog::logActivity(
                    $instructor,
                    'updated',
                    'Grade',
                    $grade->id,
                    ['status' => 'draft'],
                    ['status' => 'submitted']
                );

                // Send notification to student
                $student = $grade->student;
                $subject = $grade->subject;
                $period = $grade->academicPeriod;

                Notification::createForUser(
                    $student->id,
                    'grade_submitted',
                    'Grade Submitted for Approval',
                    "Your grade for {$subject->name} in {$period->name} has been submitted for approval.",
                    [
                        'grade_id' => $grade->id,
                        'subject' => $subject->name,
                        'period' => $period->name,
                        'grade_value' => $grade->grade_value,
                    ]
                );
            }
        });

        return back()->with('success', count($grades) . ' grades submitted for approval successfully.');
    }

    // 3.2.4. Upload student grades via CSV
    public function uploadGrades()
    {
        $instructor = Auth::user();
        
        $assignments = $instructor->subjectAssignments()
            ->with(['subject', 'academicPeriod'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('Instructor/Grades/Upload', [
            'assignments' => $assignments,
        ]);
    }

    public function processGradeUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
        ]);

        $instructor = Auth::user();

        // Verify instructor has access to this subject
        $assignment = $instructor->subjectAssignments()
            ->where('subject_id', $request->subject_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            return back()->withErrors(['error' => 'Unauthorized access to subject']);
        }

        $file = $request->file('csv_file');
        
        try {
            $csvData = array_map('str_getcsv', file($file->path()));
            $headers = array_shift($csvData); // Remove header row
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            // Expected CSV format: student_id, grade_value, remarks
            $expectedHeaders = ['student_id', 'grade_value', 'remarks'];
            if (array_map('strtolower', $headers) !== $expectedHeaders) {
                return back()->withErrors(['error' => 'Invalid CSV format. Expected headers: ' . implode(', ', $expectedHeaders)]);
            }

            DB::transaction(function () use ($csvData, $headers, $request, $instructor, &$successCount, &$errorCount, &$errors) {
                foreach ($csvData as $rowIndex => $row) {
                    try {
                        $data = array_combine($headers, $row);
                        
                        // Basic validation
                        if (empty($data['student_id']) || empty($data['grade_value'])) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Student ID and grade value are required.";
                            $errorCount++;
                            continue;
                        }

                        // Find student by student_id
                        $student = User::where('user_role', 'student')
                            ->whereHas('studentProfile', function ($q) use ($data) {
                                $q->where('student_id', $data['student_id']);
                            })
                            ->first();

                        if (!$student) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Student with ID {$data['student_id']} not found.";
                            $errorCount++;
                            continue;
                        }

                        // Validate grade value
                        $gradeValue = floatval($data['grade_value']);
                        if ($gradeValue < 0 || $gradeValue > 100) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Grade value must be between 0 and 100.";
                            $errorCount++;
                            continue;
                        }

                        // Check if grade already exists
                        $existingGrade = Grade::where('student_id', $student->id)
                            ->where('subject_id', $request->subject_id)
                            ->where('academic_period_id', $request->academic_period_id)
                            ->first();

                        if ($existingGrade) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Grade already exists for student {$data['student_id']}.";
                            $errorCount++;
                            continue;
                        }

                        $grade = Grade::create([
                            'student_id' => $student->id,
                            'subject_id' => $request->subject_id,
                            'academic_period_id' => $request->academic_period_id,
                            'grade_value' => $gradeValue,
                            'remarks' => $data['remarks'] ?? null,
                            'status' => 'draft',
                            'submitted_by' => $instructor->id,
                        ]);

                        ActivityLog::logActivity(
                            $instructor,
                            'created',
                            'Grade',
                            $grade->id,
                            null,
                            array_merge($grade->toArray(), ['import_method' => 'csv'])
                        );

                        $successCount++;
                        
                    } catch (\Exception $e) {
                        $errors[] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                        $errorCount++;
                    }
                }
            });

            $message = "CSV upload completed. {$successCount} grades imported successfully.";
            if ($errorCount > 0) {
                $message .= " {$errorCount} rows had errors.";
            }

            return back()->with('success', $message)->with('errors', $errors);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    // 3.3.1. View honor results of students
    public function honors(Request $request)
    {
        $instructor = Auth::user();
        $academicPeriodId = $request->get('academic_period_id');
        $honorType = $request->get('honor_type');

        // Get students from instructor's subjects
        $subjectIds = $instructor->subjectAssignments()
            ->where('is_active', true)
            ->pluck('subject_id');

        $studentsQuery = User::where('user_role', 'student')
            ->whereHas('receivedGrades', function ($q) use ($subjectIds) {
                $q->whereIn('subject_id', $subjectIds)
                  ->where('status', 'approved');
            })
            ->with(['studentProfile', 'honors.academicPeriod'])
            ->distinct();

        $students = $studentsQuery->get();

        // Get honors for these students
        $honorsQuery = StudentHonor::whereIn('student_id', $students->pluck('id'))
            ->with(['student.studentProfile', 'academicPeriod'])
            ->orderBy('academic_period_id', 'desc')
            ->orderBy('gpa', 'desc');

        if ($academicPeriodId) {
            $honorsQuery->where('academic_period_id', $academicPeriodId);
        }

        if ($honorType) {
            $honorsQuery->where('honor_type', $honorType);
        }

        $honors = $honorsQuery->get()->map(function ($honor) {
            $student = $honor->student;
            $profile = $student->studentProfile;

            return [
                'id' => $honor->id,
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'student_id' => $profile->student_id ?? '',
                    'full_name' => $profile->full_name ?? $student->name,
                    'section' => $profile->section ?? '',
                    'academic_level' => $profile->academicLevel->name ?? '',
                ],
                'honor_type' => $honor->getHonorDisplayName(),
                'gpa' => number_format($honor->gpa, 2),
                'academic_period' => [
                    'id' => $honor->academicPeriod->id,
                    'name' => $honor->academicPeriod->name,
                    'school_year' => $honor->academicPeriod->school_year,
                ],
                'is_approved' => $honor->is_approved,
                'is_active' => $honor->is_active,
                'approved_at' => $honor->approved_at ? $honor->approved_at->format('M d, Y') : null,
                'created_at' => $honor->created_at->format('M d, Y'),
            ];
        });

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('school_year', 'desc')->get();
        $honorTypes = StudentHonor::distinct('honor_type')->pluck('honor_type');

        // Get statistics
        $stats = [
            'total_honor_students' => $honors->count(),
            'approved_honors' => $honors->where('is_approved', true)->count(),
            'pending_honors' => $honors->where('is_approved', false)->count(),
            'high_honors' => $honors->where('honor_type', 'with_high_honors')->count(),
            'highest_honors' => $honors->where('honor_type', 'with_highest_honors')->count(),
        ];

        return Inertia::render('Instructor/Honors', [
            'honors' => $honors,
            'stats' => $stats,
            'academicPeriods' => $academicPeriods,
            'honorTypes' => $honorTypes,
            'filters' => $request->only(['academic_period_id', 'honor_type']),
        ]);
    }

    // Helper methods
    private function getTotalStudentsCount(User $instructor)
    {
        return $instructor->subjectAssignments()
            ->where('is_active', true)
            ->with('subject')
            ->get()
            ->sum(function ($assignment) {
                $subject = $assignment->subject;
                
                return User::where('user_role', 'student')
                    ->whereHas('studentProfile', function ($q) use ($subject) {
                        $q->where('enrollment_status', 'active');
                        
                        if ($subject->isCollegeSubject()) {
                            $q->where('college_course_id', $subject->college_course_id)
                              ->where('year_level', $subject->year_level)
                              ->where('semester', $subject->semester);
                        } else {
                            $q->where('academic_level_id', $subject->academic_level_id);
                            if ($subject->academic_strand_id) {
                                $q->where('academic_strand_id', $subject->academic_strand_id);
                            }
                        }
                    })->count();
            });
    }
}
