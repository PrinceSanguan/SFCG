<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\TeacherSubjectAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    public function index()
    {
        Log::info('Teacher GradeManagementController@index accessed', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->user_role,
            'timestamp' => now()
        ]);
        
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects (Senior High School level only)
            // Group by subject_id to avoid duplicate subjects when teacher has multiple grading period assignments
            $assignments = \App\Models\TeacherSubjectAssignment::with([
                'subject.course',
                'academicLevel',
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'senior_highschool');
            })
            ->get();

            Log::info('Teacher assigned subjects retrieved', [
                'teacher_id' => $user->id,
                'assignments_count' => $assignments->count(),
                'subjects' => $assignments->pluck('subject.name')->unique()->toArray()
            ]);

            // Extract unique subject IDs after grouping to avoid duplicates
            $subjectIds = $assignments->pluck('subject_id')->unique()->toArray();

            // Group assignments by subject_id to avoid duplicate subject cards
            $assignedSubjects = $assignments->groupBy('subject_id')->map(function ($subjectAssignments) {
                // Take the first assignment for subject info
                $firstAssignment = $subjectAssignments->first();

                // Fetch students ONCE per subject (not per assignment)
                $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                    ->where('subject_id', $firstAssignment->subject_id)
                    ->where('school_year', $firstAssignment->school_year)
                    ->where('is_active', true)
                    ->get();

                return [
                    'id' => $firstAssignment->id,
                    'subject' => $firstAssignment->subject,
                    'academicLevel' => $firstAssignment->academicLevel,
                    'gradingPeriod' => $firstAssignment->gradingPeriod,
                    'school_year' => $firstAssignment->school_year,
                    'is_active' => $firstAssignment->is_active,
                    'enrolled_students' => $enrolledStudents,
                    'student_count' => $enrolledStudents->count(),
                    'assignment_count' => $subjectAssignments->count(),  // Track how many grading period assignments
                ];
            })->values();  // Re-index the collection

            // Get recent grades using the subject IDs extracted before mapping
            $gradesQuery = \App\Models\StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->whereIn('subject_id', $subjectIds)
                ->latest()
                ->paginate(15);

            // Format grades data to ensure gradingPeriod has all fields and include editability info
            $grades = $gradesQuery->toArray();
            $grades['data'] = collect($gradesQuery->items())->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'student' => [
                        'id' => $grade->student->id,
                        'name' => $grade->student->name,
                    ],
                    'subject' => [
                        'id' => $grade->subject->id,
                        'name' => $grade->subject->name,
                    ],
                    'academicLevel' => [
                        'id' => $grade->academicLevel->id,
                        'name' => $grade->academicLevel->name,
                    ],
                    'gradingPeriod' => $grade->gradingPeriod ? [
                        'id' => $grade->gradingPeriod->id,
                        'name' => $grade->gradingPeriod->name,
                        'code' => $grade->gradingPeriod->code,
                        'parent_id' => $grade->gradingPeriod->parent_id,
                        'type' => $grade->gradingPeriod->type,
                        'period_type' => $grade->gradingPeriod->period_type,
                    ] : null,
                    'grade' => $grade->grade,
                    'school_year' => $grade->school_year,
                    'is_submitted_for_validation' => $grade->is_submitted_for_validation,
                    'created_at' => $grade->created_at,
                    'updated_at' => $grade->updated_at,
                    // Editability fields
                    'is_editable' => $grade->isEditableByInstructor(),
                    'days_remaining' => $grade->getDaysRemainingForEdit(),
                    'edit_status' => $grade->getEditStatus(),
                ];
            })->toArray();

            Log::info('Teacher grades data prepared successfully', [
                'teacher_id' => $user->id,
                'assigned_subjects_count' => $assignedSubjects->count(),
                'grades_count' => $gradesQuery->total()
            ]);

            return Inertia::render('Teacher/Grades/Index', [
                'user' => $user,
                'assignedSubjects' => $assignedSubjects,
                'grades' => $grades,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher GradeManagementController@index', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    public function create()
    {
        Log::info('Teacher GradeManagementController@create accessed', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->user_role,
            'timestamp' => now()
        ]);
        
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects
            // Group by subject_id to avoid duplicate students when teacher has multiple grading period assignments
            $assignments = \App\Models\TeacherSubjectAssignment::with([
                'subject.course',
                'academicLevel',
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
            ->get();

            // Group assignments by subject_id to fetch students only once per subject
            $assignedSubjects = $assignments->groupBy('subject_id')->map(function ($subjectAssignments) {
                // Take the first assignment for subject info
                $firstAssignment = $subjectAssignments->first();

                // Fetch students ONCE per subject (not per assignment)
                $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                    ->where('subject_id', $firstAssignment->subject_id)
                    ->where('school_year', $firstAssignment->school_year)
                    ->where('is_active', true)
                    ->get();

                return [
                    'id' => $firstAssignment->id,
                    'subject' => $firstAssignment->subject,
                    'academicLevel' => $firstAssignment->academicLevel,
                    'gradingPeriod' => $firstAssignment->gradingPeriod,
                    'school_year' => $firstAssignment->school_year,
                    'is_active' => $firstAssignment->is_active,
                    'enrolled_students' => $enrolledStudents,
                    'student_count' => $enrolledStudents->count(),
                    'assignment_count' => $subjectAssignments->count(),  // Track how many grading period assignments
                ];
            })->values();  // Re-index the collection

            // Get all academic levels
            $academicLevels = \App\Models\AcademicLevel::where('is_active', true)->get();

            // Get grading periods based on teacher's assignments
            // First, try to get specific grading period IDs from teacher's assignments
            $assignedGradingPeriodIds = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('is_active', true)
                ->whereNotNull('grading_period_id')
                ->pluck('grading_period_id')
                ->unique()
                ->toArray();

            if (!empty($assignedGradingPeriodIds)) {
                // Teacher has specific grading period assignments - show ONLY those periods
                $assignedPeriods = \App\Models\GradingPeriod::where('is_active', true)
                    ->whereIn('id', $assignedGradingPeriodIds)
                    ->orderBy('sort_order')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'type',
                        'period_type',
                        'semester_number',
                        'parent_id',
                        'academic_level_id',
                        'start_date',
                        'end_date',
                        'sort_order',
                        'is_active'
                    ]);

                // Get unique parent IDs from assigned periods
                $parentIds = $assignedPeriods->whereNotNull('parent_id')->pluck('parent_id')->unique()->toArray();

                if (!empty($parentIds)) {
                    // Fetch parent semesters to enable grouped display
                    $parentSemesters = \App\Models\GradingPeriod::where('is_active', true)
                        ->whereIn('id', $parentIds)
                        ->get([
                            'id',
                            'name',
                            'code',
                            'type',
                            'period_type',
                            'semester_number',
                            'parent_id',
                            'academic_level_id',
                            'start_date',
                            'end_date',
                            'sort_order',
                            'is_active'
                        ]);

                    // Merge parents and children, then sort by sort_order
                    $gradingPeriods = $assignedPeriods->merge($parentSemesters)->sortBy('sort_order')->values();
                } else {
                    $gradingPeriods = $assignedPeriods;
                }

                Log::info('Teacher grading periods filtered by specific assignments', [
                    'teacher_id' => $user->id,
                    'assigned_grading_period_ids' => $assignedGradingPeriodIds,
                    'parent_ids_included' => $parentIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray()
                ]);
            } else {
                // Fallback: No specific grading periods assigned, show all for teacher's academic levels
                $assignedAcademicLevelIds = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
                    ->where('is_active', true)
                    ->pluck('academic_level_id')
                    ->unique()
                    ->toArray();

                $gradingPeriods = \App\Models\GradingPeriod::where('is_active', true)
                    ->whereIn('academic_level_id', $assignedAcademicLevelIds)
                    ->orderBy('sort_order')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'type',
                        'period_type',
                        'semester_number',
                        'parent_id',
                        'academic_level_id',
                        'start_date',
                        'end_date',
                        'sort_order',
                        'is_active'
                    ]);

                Log::warning('Teacher has no specific grading period assignments - showing all periods for academic level', [
                    'teacher_id' => $user->id,
                    'assigned_academic_level_ids' => $assignedAcademicLevelIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray(),
                    'note' => 'Admin should assign teacher to specific grading periods'
                ]);
            }
            
            // Check for selected student from query parameters
            $selectedStudent = null;
            if (request()->has('student_id')) {
                $student = \App\Models\User::find(request('student_id'));
                if ($student) {
                    $selectedStudent = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'subjectId' => request('subject_id'),
                        'academicLevelKey' => request('academic_level_key'),
                    ];
                }
            }
            
            Log::info('Teacher create form data prepared', [
                'teacher_id' => $user->id,
                'assigned_subjects_count' => $assignedSubjects->count(),
                'academic_levels_count' => $academicLevels->count(),
                'grading_periods_count' => $gradingPeriods->count(),
                'selected_student' => $selectedStudent ? $selectedStudent['name'] : 'none'
            ]);

            return Inertia::render('Teacher/Grades/Create', [
                'user' => $user,
                'assignedSubjects' => $assignedSubjects,
                'academicLevels' => $academicLevels,
                'gradingPeriods' => $gradingPeriods,
                'selectedStudent' => $selectedStudent,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher GradeManagementController@create', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created grade in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        Log::info('Teacher grade creation attempt', [
            'teacher_id' => $user->id,
            'user_role' => $user->user_role,
            'request_data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
            'grade' => 'required|numeric',
        ]);
        
        // Custom validation for grade based on academic level
        // SHS uses 1.0-5.0 scale (same as college)
        $academicLevel = AcademicLevel::find($request->academic_level_id);
        if ($academicLevel) {
            if ($academicLevel->key === 'college' || $academicLevel->key === 'senior_highschool') {
                $validator->addRules(['grade' => 'numeric|min:1.0|max:5.0']);
            } else {
                $validator->addRules(['grade' => 'numeric|min:0|max:100']);
            }
        }
        
        // Custom validation for grading_period_id
        if ($request->grading_period_id && $request->grading_period_id !== '0') {
            $validator->addRules(['grading_period_id' => 'exists:grading_periods,id']);
        }
        
        // Handle "0" value for grading_period_id (no period selected)
        if ($request->grading_period_id === '0') {
            $request->merge(['grading_period_id' => null]);
        }
        
        // Verify the teacher is assigned to this subject
        $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'senior_highschool');
            })
            ->exists();
        
        if (!$isAssigned) {
            Log::warning('Teacher attempted to create grade for unassigned subject', [
                'teacher_id' => $user->id,
                'subject_id' => $request->subject_id
            ]);
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Check if grade already exists
        $existingGrade = StudentGrade::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'school_year' => $request->school_year,
        ])->when($request->grading_period_id, function ($query, $gradingPeriodId) {
            $query->where('grading_period_id', $gradingPeriodId);
        })->when(!$request->grading_period_id, function ($query) {
            $query->whereNull('grading_period_id');
        })->first();
        
        if ($existingGrade) {
            return back()->withErrors(['grade' => 'A grade already exists for this student, subject, and period.']);
        }
        
        // Prepare data for grade creation
        // Auto-populate year_of_study from student's specific_year_level if not provided
        $yearOfStudy = $request->year_of_study;
        if (!$yearOfStudy) {
            $student = User::find($request->student_id);
            if ($student && $student->specific_year_level) {
                // Extract numeric value from specific_year_level
                // e.g., "grade_1" -> 1, "1st_year" -> 1, "grade_10" -> 10
                if (preg_match('/(\d+)/', $student->specific_year_level, $matches)) {
                    $yearOfStudy = (int)$matches[1];
                }
            }
        }

        $gradeData = [
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id === '0' ? null : $request->grading_period_id,
            'school_year' => $request->school_year,
            'year_of_study' => $yearOfStudy,
            'grade' => $request->grade,
        ];

        // Create the grade
        try {
            $grade = StudentGrade::create($gradeData);
            Log::info('Teacher grade created successfully', [
                'teacher_id' => $user->id,
                'grade_id' => $grade->id,
                'grade_data' => $gradeData
            ]);
            
            return redirect()->route('teacher.grades.index')
                ->with('success', 'Grade created successfully.');
        } catch (\Exception $e) {
            Log::error('Teacher grade creation failed', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'grade_data' => $gradeData
            ]);
            
            return back()->withErrors(['grade' => 'Failed to create grade: ' . $e->getMessage()])->withInput();
        }
    }

    public function showStudent($student, $subject)
    {
        $user = Auth::user();
        
        Log::info('Teacher showStudent accessed', [
            'teacher_id' => $user->id,
            'student_id' => $student,
            'subject_id' => $subject
        ]);
        
        try {
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $subject)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to view student grades for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $subject
                ]);
                abort(403, 'You do not have permission to view grades for this subject.');
            }
            
            // Get student information
            $studentData = User::findOrFail($student);
            $subjectData = Subject::with('course')->findOrFail($subject);

            // Get academic level from the subject or from the teacher's assignment
            $teacherAssignment = TeacherSubjectAssignment::with('academicLevel')
                ->where('teacher_id', $user->id)
                ->where('subject_id', $subject)
                ->where('is_active', true)
                ->first();

            $academicLevel = $teacherAssignment ? $teacherAssignment->academicLevel : AcademicLevel::where('key', 'senior_highschool')->first();

            // Get student's grades for this subject with editability info
            $grades = StudentGrade::with(['academicLevel', 'gradingPeriod'])
                ->where('student_id', $student)
                ->where('subject_id', $subject)
                ->orderBy('school_year', 'desc')
                ->orderBy('grading_period_id')
                ->get()
                ->map(function($grade) {
                    return [
                        'id' => $grade->id,
                        'grade' => $grade->grade,
                        'school_year' => $grade->school_year,
                        'year_of_study' => $grade->year_of_study,
                        'grading_period_id' => $grade->grading_period_id,
                        'gradingPeriod' => $grade->gradingPeriod ? [
                            'id' => $grade->gradingPeriod->id,
                            'name' => $grade->gradingPeriod->name,
                            'code' => $grade->gradingPeriod->code,
                            'parent_id' => $grade->gradingPeriod->parent_id,
                            'type' => $grade->gradingPeriod->type,
                            'period_type' => $grade->gradingPeriod->period_type,
                        ] : null,
                        'academicLevel' => $grade->academicLevel ? [
                            'id' => $grade->academicLevel->id,
                            'name' => $grade->academicLevel->name,
                            'key' => $grade->academicLevel->key,
                        ] : null,
                        'created_at' => $grade->created_at,
                        'updated_at' => $grade->updated_at,
                        // Editability fields
                        'is_editable' => $grade->isEditableByInstructor(),
                        'days_remaining' => $grade->getDaysRemainingForEdit(),
                        'edit_status' => $grade->getEditStatus(),
                    ];
                });

            // Get grading periods relevant to SHS (teachers only handle SHS)
            $gradingPeriods = GradingPeriod::where('is_active', true)
                ->where('academic_level_id', $academicLevel->id)
                ->orderBy('sort_order')
                ->get()
                ->map(function($period) {
                    return [
                        'id' => $period->id,
                        'name' => $period->name,
                        'code' => $period->code,
                        'type' => $period->type,
                        'period_type' => $period->period_type,
                        'parent_id' => $period->parent_id,
                        'sort_order' => $period->sort_order,
                        'is_active' => $period->is_active,
                    ];
                });

            // Log the grading periods for debugging
            Log::info('[Teacher Grades] Grading Periods Retrieved', [
                'teacher_id' => $user->id,
                'student_id' => $student,
                'subject_id' => $subject,
                'academic_level' => $academicLevel->name,
                'grading_periods_count' => $gradingPeriods->count(),
                'grading_periods' => $gradingPeriods->map(function($p) {
                    return [
                        'id' => $p['id'],
                        'name' => $p['name'],
                        'code' => $p['code'],
                        'parent_id' => $p['parent_id'],
                        'type' => $p['type'],
                        'period_type' => $p['period_type']
                    ];
                })
            ]);

            // Log the student grades for debugging
            Log::info('[Teacher Grades] Student Grades Retrieved', [
                'teacher_id' => $user->id,
                'student_id' => $student,
                'subject_id' => $subject,
                'grades_count' => $grades->count(),
                'grades_summary' => $grades->map(function($g) {
                    return [
                        'id' => $g['id'],
                        'grade' => $g['grade'],
                        'grading_period_id' => $g['grading_period_id'],
                        'grading_period_name' => $g['gradingPeriod'] ? $g['gradingPeriod']['name'] : 'N/A',
                        'grading_period_parent_id' => $g['gradingPeriod'] ? $g['gradingPeriod']['parent_id'] : null,
                        'school_year' => $g['school_year']
                    ];
                }),
                'unique_period_ids' => $grades->pluck('grading_period_id')->unique()->values()->toArray()
            ]);

            // Log final data being sent to frontend
            Log::info('[Teacher Grades] Data Being Sent to Frontend', [
                'teacher_id' => $user->id,
                'student_id' => $student,
                'subject_id' => $subject,
                'has_grades' => $grades->count() > 0,
                'has_grading_periods' => $gradingPeriods->count() > 0,
                'grades_period_ids' => $grades->pluck('grading_period_id')->unique()->sort()->values()->toArray(),
                'available_period_ids' => $gradingPeriods->pluck('id')->sort()->values()->toArray(),
                'period_ids_match' => $grades->pluck('grading_period_id')->unique()->diff($gradingPeriods->pluck('id'))->isEmpty()
            ]);

            return Inertia::render('Teacher/Grades/ShowStudent', [
                'user' => $user,
                'student' => $studentData,
                'subject' => $subjectData,
                'academicLevel' => $academicLevel,
                'grades' => $grades,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher showStudent', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    public function edit($grade)
    {
        $user = Auth::user();
        
        Log::info('Teacher edit grade accessed', [
            'teacher_id' => $user->id,
            'grade_id' => $grade
        ]);
        
        try {
            // Get the grade with relationships
            $gradeData = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->findOrFail($grade);
            
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $gradeData->subject_id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to edit grade for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $gradeData->subject_id
                ]);
                abort(403, 'You do not have permission to edit grades for this subject.');
            }

            // Check if grade is still editable (within 5-day window and not submitted)
            if (!$gradeData->isEditableByInstructor()) {
                $editStatus = $gradeData->getEditStatus();
                $message = $editStatus === 'locked'
                    ? 'This grade is locked because it has been submitted for validation.'
                    : 'This grade can no longer be edited. The 5-day edit window has expired.';

                Log::warning('Teacher attempted to edit grade outside edit window', [
                    'teacher_id' => $user->id,
                    'grade_id' => $grade,
                    'edit_status' => $editStatus,
                    'created_at' => $gradeData->created_at->toDateTimeString(),
                    'is_submitted' => $gradeData->is_submitted_for_validation,
                    'days_since_creation' => $gradeData->created_at->diffInDays(now())
                ]);

                abort(403, $message);
            }

            // Get academic levels and grading periods for the form
            $academicLevels = AcademicLevel::where('is_active', true)->get();

            // Get grading periods based on teacher's assignments
            // First, try to get specific grading period IDs from teacher's assignments
            $assignedGradingPeriodIds = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('is_active', true)
                ->whereNotNull('grading_period_id')
                ->pluck('grading_period_id')
                ->unique()
                ->toArray();

            if (!empty($assignedGradingPeriodIds)) {
                // Teacher has specific grading period assignments - show ONLY those periods
                $assignedPeriods = GradingPeriod::where('is_active', true)
                    ->whereIn('id', $assignedGradingPeriodIds)
                    ->orderBy('sort_order')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'type',
                        'period_type',
                        'semester_number',
                        'parent_id',
                        'academic_level_id',
                        'start_date',
                        'end_date',
                        'sort_order',
                        'is_active'
                    ]);

                // Get unique parent IDs from assigned periods
                $parentIds = $assignedPeriods->whereNotNull('parent_id')->pluck('parent_id')->unique()->toArray();

                if (!empty($parentIds)) {
                    // Fetch parent semesters to enable grouped display
                    $parentSemesters = GradingPeriod::where('is_active', true)
                        ->whereIn('id', $parentIds)
                        ->get([
                            'id',
                            'name',
                            'code',
                            'type',
                            'period_type',
                            'semester_number',
                            'parent_id',
                            'academic_level_id',
                            'start_date',
                            'end_date',
                            'sort_order',
                            'is_active'
                        ]);

                    // Merge parents and children, then sort by sort_order
                    $gradingPeriods = $assignedPeriods->merge($parentSemesters)->sortBy('sort_order')->values();
                } else {
                    $gradingPeriods = $assignedPeriods;
                }

                Log::info('Teacher edit grade - grading periods filtered by specific assignments', [
                    'teacher_id' => $user->id,
                    'grade_id' => $grade,
                    'assigned_grading_period_ids' => $assignedGradingPeriodIds,
                    'parent_ids_included' => $parentIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray()
                ]);
            } else {
                // Fallback: No specific grading periods assigned, show all for teacher's academic levels
                $assignedAcademicLevelIds = TeacherSubjectAssignment::where('teacher_id', $user->id)
                    ->where('is_active', true)
                    ->pluck('academic_level_id')
                    ->unique()
                    ->toArray();

                $gradingPeriods = GradingPeriod::where('is_active', true)
                    ->whereIn('academic_level_id', $assignedAcademicLevelIds)
                    ->orderBy('sort_order')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'type',
                        'period_type',
                        'semester_number',
                        'parent_id',
                        'academic_level_id',
                        'start_date',
                        'end_date',
                        'sort_order',
                        'is_active'
                    ]);

                Log::warning('Teacher edit grade - no specific grading period assignments, showing all for academic level', [
                    'teacher_id' => $user->id,
                    'grade_id' => $grade,
                    'assigned_academic_level_ids' => $assignedAcademicLevelIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray(),
                    'note' => 'Admin should assign teacher to specific grading periods'
                ]);
            }
            
            return Inertia::render('Teacher/Grades/Edit', [
                'user' => $user,
                'grade' => $gradeData,
                'academicLevels' => $academicLevels,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher edit grade', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $grade)
    {
        $user = Auth::user();
        
        Log::info('Teacher update grade attempt', [
            'teacher_id' => $user->id,
            'grade_id' => $grade,
            'request_data' => $request->all()
        ]);
        
        try {
            // Get the existing grade
            $gradeData = StudentGrade::findOrFail($grade);
            
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $gradeData->subject_id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to update grade for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $gradeData->subject_id
                ]);
                abort(403, 'You do not have permission to update grades for this subject.');
            }

            // Check if grade is still editable (within 5-day window and not submitted)
            if (!$gradeData->isEditableByInstructor()) {
                $editStatus = $gradeData->getEditStatus();
                $message = $editStatus === 'locked'
                    ? 'This grade is locked because it has been submitted for validation.'
                    : 'This grade can no longer be edited. The 5-day edit window has expired.';

                Log::warning('Teacher attempted to update grade outside edit window', [
                    'teacher_id' => $user->id,
                    'grade_id' => $grade,
                    'edit_status' => $editStatus,
                    'created_at' => $gradeData->created_at->toDateTimeString(),
                    'is_submitted' => $gradeData->is_submitted_for_validation,
                    'days_since_creation' => $gradeData->created_at->diffInDays(now())
                ]);

                return back()->withErrors(['grade' => $message])->withInput();
            }

            $validator = Validator::make($request->all(), [
                'grade' => 'required|numeric',
                'grading_period_id' => 'nullable',
            ]);
            
            // Custom validation for grade based on academic level
            $academicLevel = AcademicLevel::find($gradeData->academic_level_id);
            if ($academicLevel) {
                if ($academicLevel->key === 'college') {
                    $validator->addRules(['grade' => 'numeric|min:1.0|max:5.0']);
                } else {
                    $validator->addRules(['grade' => 'numeric|min:0|max:100']);
                }
            }
            
            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }
            
            // Update the grade
            $gradeData->update([
                'grade' => $request->grade,
                'grading_period_id' => $request->grading_period_id === '0' ? null : $request->grading_period_id,
            ]);
            
            Log::info('Teacher grade updated successfully', [
                'teacher_id' => $user->id,
                'grade_id' => $grade,
                'new_grade' => $request->grade
            ]);
            
            return redirect()->route('teacher.grades.index')
                ->with('success', 'Grade updated successfully.');
            
        } catch (\Exception $e) {
            Log::error('Teacher grade update failed', [
                'teacher_id' => $user->id,
                'grade_id' => $grade,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['grade' => 'Failed to update grade: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy($grade)
    {
        $user = Auth::user();
        
        Log::info('Teacher delete grade attempt', [
            'teacher_id' => $user->id,
            'grade_id' => $grade
        ]);
        
        try {
            // Get the existing grade
            $gradeData = StudentGrade::findOrFail($grade);
            
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $gradeData->subject_id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to delete grade for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $gradeData->subject_id
                ]);
                abort(403, 'You do not have permission to delete grades for this subject.');
            }

            // Check if grade is still editable (within 5-day window and not submitted)
            if (!$gradeData->isEditableByInstructor()) {
                $editStatus = $gradeData->getEditStatus();
                $message = $editStatus === 'locked'
                    ? 'This grade is locked because it has been submitted for validation.'
                    : 'This grade can no longer be deleted. The 5-day edit window has expired.';

                Log::warning('Teacher attempted to delete grade outside edit window', [
                    'teacher_id' => $user->id,
                    'grade_id' => $grade,
                    'edit_status' => $editStatus,
                    'created_at' => $gradeData->created_at->toDateTimeString(),
                    'is_submitted' => $gradeData->is_submitted_for_validation,
                    'days_since_creation' => $gradeData->created_at->diffInDays(now())
                ]);

                return back()->withErrors(['grade' => $message]);
            }

            // Delete the grade
            $gradeData->delete();
            
            Log::info('Teacher grade deleted successfully', [
                'teacher_id' => $user->id,
                'grade_id' => $grade
            ]);
            
            return redirect()->route('teacher.grades.index')
                ->with('success', 'Grade deleted successfully.');
            
        } catch (\Exception $e) {
            Log::error('Teacher grade deletion failed', [
                'teacher_id' => $user->id,
                'grade_id' => $grade,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['grade' => 'Failed to delete grade: ' . $e->getMessage()]);
        }
    }

    public function submitForValidation($grade)
    {
        $user = Auth::user();
        
        Log::info('Teacher submit grade for validation attempt', [
            'teacher_id' => $user->id,
            'grade_id' => $grade
        ]);
        
        try {
            // Get the existing grade
            $gradeData = StudentGrade::findOrFail($grade);
            
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $gradeData->subject_id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to submit grade for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $gradeData->subject_id
                ]);
                abort(403, 'You do not have permission to submit grades for this subject.');
            }
            
            // Update the grade status
            $gradeData->update([
                'is_submitted_for_validation' => true,
                'submitted_at' => now(),
            ]);
            
            Log::info('Teacher grade submitted for validation successfully', [
                'teacher_id' => $user->id,
                'grade_id' => $grade
            ]);
            
            return redirect()->route('teacher.grades.index')
                ->with('success', 'Grade submitted for validation successfully.');
            
        } catch (\Exception $e) {
            Log::error('Teacher grade submission failed', [
                'teacher_id' => $user->id,
                'grade_id' => $grade,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['grade' => 'Failed to submit grade: ' . $e->getMessage()]);
        }
    }

    public function unsubmitFromValidation($grade)
    {
        $user = Auth::user();
        
        Log::info('Teacher unsubmit grade from validation attempt', [
            'teacher_id' => $user->id,
            'grade_id' => $grade
        ]);
        
        try {
            // Get the existing grade
            $gradeData = StudentGrade::findOrFail($grade);
            
            // Verify the teacher is assigned to this subject
            $isAssigned = TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('subject_id', $gradeData->subject_id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->exists();
            
            if (!$isAssigned) {
                Log::warning('Teacher attempted to unsubmit grade for unassigned subject', [
                    'teacher_id' => $user->id,
                    'subject_id' => $gradeData->subject_id
                ]);
                abort(403, 'You do not have permission to unsubmit grades for this subject.');
            }
            
            // Update the grade status
            $gradeData->update([
                'is_submitted_for_validation' => false,
                'submitted_at' => null,
            ]);
            
            Log::info('Teacher grade unsubmitted from validation successfully', [
                'teacher_id' => $user->id,
                'grade_id' => $grade
            ]);
            
            return redirect()->route('teacher.grades.index')
                ->with('success', 'Grade unsubmitted from validation successfully.');
            
        } catch (\Exception $e) {
            Log::error('Teacher grade unsubmission failed', [
                'teacher_id' => $user->id,
                'grade_id' => $grade,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['grade' => 'Failed to unsubmit grade: ' . $e->getMessage()]);
        }
    }

    // API methods
    public function getAssignedStudents()
    {
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects (Senior High School level only)
            $assignedSubjects = TeacherSubjectAssignment::with(['subject'])
                ->where('teacher_id', $user->id)
                ->where('is_active', true)
                ->whereHas('academicLevel', function ($query) {
                    $query->where('key', 'senior_highschool');
                })
                ->get();
            
            // Get students enrolled in these subjects
            $students = \App\Models\StudentSubjectAssignment::with(['student'])
                ->whereIn('subject_id', $assignedSubjects->pluck('subject_id'))
                ->where('is_active', true)
                ->get()
                ->unique('student_id')
                ->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->student->id,
                        'name' => $enrollment->student->name,
                        'email' => $enrollment->student->email,
                        'student_number' => $enrollment->student->student_number,
                    ];
                });
            
            return response()->json($students);
            
        } catch (\Exception $e) {
            Log::error('Error getting assigned students for teacher', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to get assigned students'], 500);
        }
    }

    public function getAssignedSubjects()
    {
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects
            $assignedSubjects = TeacherSubjectAssignment::with(['subject.course', 'academicLevel'])
                ->where('teacher_id', $user->id)
                ->where('is_active', true)
                ->get()
                ->map(function ($assignment) {
                    return [
                        'id' => $assignment->subject->id,
                        'name' => $assignment->subject->name,
                        'code' => $assignment->subject->code,
                        'course' => $assignment->subject->course ? [
                            'id' => $assignment->subject->course->id,
                            'name' => $assignment->subject->course->name,
                            'code' => $assignment->subject->course->code,
                        ] : null,
                        'academic_level' => [
                            'id' => $assignment->academicLevel->id,
                            'name' => $assignment->academicLevel->name,
                            'key' => $assignment->academicLevel->key,
                        ],
                        'school_year' => $assignment->school_year,
                    ];
                });
            
            return response()->json($assignedSubjects);
            
        } catch (\Exception $e) {
            Log::error('Error getting assigned subjects for teacher', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to get assigned subjects'], 500);
        }
    }

    public function getGradingPeriods()
    {
        try {
            $gradingPeriods = GradingPeriod::where('is_active', true)
                ->orderBy('sort_order')
                ->get([
                    'id',
                    'name',
                    'code',
                    'type',
                    'period_type',
                    'semester_number',
                    'parent_id',
                    'academic_level_id',
                    'sort_order'
                ]);

            return response()->json($gradingPeriods);
            
        } catch (\Exception $e) {
            Log::error('Error getting grading periods', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to get grading periods'], 500);
        }
    }

    public function getAcademicLevels()
    {
        try {
            $academicLevels = AcademicLevel::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'key']);
            
            return response()->json($academicLevels);
            
        } catch (\Exception $e) {
            Log::error('Error getting academic levels', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to get academic levels'], 500);
        }
    }
}
