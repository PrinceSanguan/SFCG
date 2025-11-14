<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\InstructorSubjectAssignment;
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
    /**
     * Display a listing of grades for the instructor's assigned courses.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Debug logging
        Log::info('Grades index accessed by user: ' . $user->id . ' - ' . $user->name);
        
        // Get instructor's assigned subjects (College level only)
        $assignedSubjects = InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod.parent'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->get();
        
        // Debug logging
        Log::info('Found assigned subjects: ' . $assignedSubjects->count());
        foreach($assignedSubjects as $subject) {
            Log::info('Subject: ' . $subject->subject->name . ' (ID: ' . $subject->subject_id . ')');
        }
        
        // Debug: Check the exact data structure being sent
        $debugData = $assignedSubjects->map(function($assignment) {
            // Get enrolled students for this subject
            $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->where('is_active', true)
                ->get();

            // Log the query results using ActivityLogService
            \App\Services\ActivityLogService::logStudentQuery(
                instructorId: auth()->id(),
                subjectId: $assignment->subject_id,
                schoolYear: $assignment->school_year,
                studentCount: $enrolledStudents->count(),
                additionalDetails: [
                    'subject_name' => $assignment->subject->name ?? 'Unknown',
                    'section_id' => $assignment->section_id,
                    'grading_period_id' => $assignment->grading_period_id,
                    'context' => 'instructor_dashboard_index',
                ]
            );
            
            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => $assignment->subject ? [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ] : null,
                'academicLevel' => $assignment->academicLevel ? [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ] : null,
                'gradingPeriod' => $assignment->gradingPeriod ? [
                    'id' => $assignment->gradingPeriod->id,
                    'name' => $assignment->gradingPeriod->name,
                    'semester_number' => $assignment->gradingPeriod->semester_number,
                    'type' => $assignment->gradingPeriod->type,
                    'full_name' => $assignment->gradingPeriod->full_name,
                ] : null,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->map(function($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                        'school_year' => $enrollment->school_year,
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });
        
        Log::info('Debug data structure: ' . json_encode($debugData->first()));
        
        // Get grades for assigned subjects
        $gradesQuery = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod.parent'])
            ->whereHas('subject', function ($query) use ($assignedSubjects) {
                // Get subjects that the instructor is assigned to
                $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
            })
            ->whereHas('student') // Ensure student exists
            ->whereHas('academicLevel') // Ensure academic level exists
            ->when($request->filled('subject'), function ($query) use ($request) {
                $query->where('subject_id', $request->subject);
            })
            ->when($request->filled('academic_level'), function ($query) use ($request) {
                $query->where('academic_level_id', $request->academic_level);
            })
            ->when($request->filled('grading_period'), function ($query) use ($request) {
                $query->where('grading_period_id', $request->grading_period);
            })
            ->when($request->filled('school_year'), function ($query) use ($request) {
                $query->where('school_year', $request->school_year);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Transform grades to include editability info
        $grades = $gradesQuery->toArray();
        $grades['data'] = collect($gradesQuery->items())->map(function ($grade) {
            $gradeArray = $grade->toArray();
            // Add editability fields
            $gradeArray['is_editable'] = $grade->isEditableByInstructor();
            $gradeArray['days_remaining'] = $grade->getDaysRemainingForEdit();
            $gradeArray['edit_status'] = $grade->getEditStatus();
            return $gradeArray;
        })->toArray();

        // Debug logging
        Log::info('Found grades: ' . count($grades['data']));

        // Debug: Log the actual grades data
        if (count($grades['data']) > 0) {
            Log::info('Sample grade data with editability: ' . json_encode($grades['data'][0]));
        }

        return Inertia::render('Instructor/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'assignedSubjects' => $debugData,
            'filters' => $request->only(['subject', 'academic_level', 'grading_period', 'school_year']),
        ]);
    }
    
    /**
     * Show the form for creating a new grade.
     */
    public function create()
    {
        $user = Auth::user();
        
        // Check for URL parameters to pre-select student and grading period
        $selectedStudent = null;
        $selectedGradingPeriodId = null;
        $selectedAssignmentId = null;

        if (request()->has('student_id') && request()->has('subject_id') && request()->has('academic_level_id')) {
            $studentId = request('student_id');
            $subjectId = request('subject_id');
            $academicLevelId = request('academic_level_id');

            // Get the specific assignment if assignment_id is provided
            if (request()->has('assignment_id')) {
                $selectedAssignmentId = request('assignment_id');
                $assignment = InstructorSubjectAssignment::where('instructor_id', $user->id)
                    ->where('id', $selectedAssignmentId)
                    ->where('is_active', true)
                    ->first();

                if ($assignment) {
                    $selectedGradingPeriodId = $assignment->grading_period_id;

                    Log::info('Selected assignment grading period:', [
                        'assignment_id' => $assignment->id,
                        'grading_period_id' => $selectedGradingPeriodId,
                        'subject_id' => $subjectId,
                        'student_id' => $studentId
                    ]);
                }
            }

            // Verify the instructor is assigned to this subject
            $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
                ->where('subject_id', $subjectId)
                ->where('academic_level_id', $academicLevelId)
                ->where('is_active', true)
                ->exists();

            if ($isAssigned) {
                $student = User::find($studentId);
                if ($student) {
                    $selectedStudent = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'subjectId' => (int) $subjectId,
                        'academicLevelKey' => request('academic_level_key'),
                    ];
                }
            }
        }
        
        // Get instructor's assigned subjects with enrolled students
        $assignedSubjects = InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod.parent'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Build the same data structure as index method
        $debugData = $assignedSubjects->map(function($assignment) {
            // Get enrolled students for this subject
            $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->where('is_active', true)
                ->get();

            // Log the query results using ActivityLogService
            \App\Services\ActivityLogService::logStudentQuery(
                instructorId: auth()->id(),
                subjectId: $assignment->subject_id,
                schoolYear: $assignment->school_year,
                studentCount: $enrolledStudents->count(),
                additionalDetails: [
                    'subject_name' => $assignment->subject->name ?? 'Unknown',
                    'section_id' => $assignment->section_id,
                    'grading_period_id' => $assignment->grading_period_id,
                    'context' => 'instructor_grade_input_create',
                ]
            );

            // Get the subject's grading_period_ids and semester_ids
            $subject = $assignment->subject;
            $gradingPeriodIds = $subject->grading_period_ids ?? [];
            $semesterIds = $subject->semester_ids ?? [];

            \Log::info('Assignment grading period details:', [
                'assignment_id' => $assignment->id,
                'assignment_grading_period_id' => $assignment->grading_period_id,
                'assignment_grading_period_name' => $assignment->gradingPeriod ? $assignment->gradingPeriod->full_name : 'None',
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'subject_grading_period_ids' => $gradingPeriodIds,
                'subject_semester_ids' => $semesterIds
            ]);

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => $assignment->subject ? [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'grading_period_ids' => $gradingPeriodIds,
                    'semester_ids' => $semesterIds,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ] : null,
                'academicLevel' => $assignment->academicLevel ? [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ] : null,
                'gradingPeriod' => $assignment->gradingPeriod ? [
                    'id' => $assignment->gradingPeriod->id,
                    'name' => $assignment->gradingPeriod->name,
                    'semester_number' => $assignment->gradingPeriod->semester_number,
                    'type' => $assignment->gradingPeriod->type,
                    'full_name' => $assignment->gradingPeriod->full_name,
                ] : null,
                'grading_period_ids' => $gradingPeriodIds,
                'semester_ids' => $semesterIds,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->map(function($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                        'school_year' => $enrollment->school_year,
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });
        
        // Get available subjects, academic levels, and grading periods
        // Instructors only handle college level courses
        $academicLevels = AcademicLevel::where('key', 'college')->get();

        // Get college grading periods
        $gradingPeriods = GradingPeriod::where('academic_level_id', 4) // College level ID
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Debug logging for grading periods
        Log::info('Grade Creation - Academic Levels:', $academicLevels->toArray());
        Log::info('Grade Creation - Grading Periods:', $gradingPeriods->toArray());
        Log::info('Grade Creation - Selected Student:', $selectedStudent ?: []);
        Log::info('Grade Creation - Selected Grading Period ID: ' . ($selectedGradingPeriodId ?: 'None'));
        Log::info('Grade Creation - Selected Assignment ID: ' . ($selectedAssignmentId ?: 'None'));
        Log::info('Grade Creation - Request Parameters:', request()->all());

        return Inertia::render('Instructor/Grades/Create', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'assignedSubjects' => $debugData,
            'selectedStudent' => $selectedStudent,
            'selectedGradingPeriodId' => $selectedGradingPeriodId,
            'selectedAssignmentId' => $selectedAssignmentId,
        ]);
    }
    
    /**
     * Store a newly created grade.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Enhanced debug logging
        Log::info('=== GRADE CREATION ATTEMPT ===', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'request_data' => $request->all(),
            'timestamp' => now()->toDateTimeString()
        ]);

        // Handle academic_level_id: could be ID (integer) or key (string like 'college')
        $academicLevelId = $request->academic_level_id;

        // If academic_level_id is a string (key like 'college'), convert it to ID
        if (!is_numeric($academicLevelId)) {
            Log::info('Academic level ID is a string key, converting to numeric ID', [
                'received_key' => $academicLevelId
            ]);

            $academicLevel = \App\Models\AcademicLevel::where('key', $academicLevelId)->first();
            if ($academicLevel) {
                $academicLevelId = $academicLevel->id;
                $request->merge(['academic_level_id' => $academicLevelId]);

                Log::info('Converted academic level key to ID', [
                    'key' => $academicLevelId,
                    'id' => $academicLevel->id,
                    'name' => $academicLevel->name
                ]);
            } else {
                Log::error('Academic level not found with key', [
                    'key' => $academicLevelId
                ]);
                return back()->withErrors(['academic_level_id' => 'Invalid academic level.'])->withInput();
            }
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
            'grade' => 'required|numeric',
        ]);

        Log::info('Validation rules defined', [
            'rules' => $validator->getRules()
        ]);

        // Custom validation for grade based on academic level
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        if ($academicLevel) {
            Log::info('Academic level found for validation', [
                'id' => $academicLevel->id,
                'name' => $academicLevel->name,
                'key' => $academicLevel->key
            ]);

            if ($academicLevel->key === 'college') {
                // College uses 1.0-5.0 scale with specific valid grades
                $validator->addRules([
                    'grade' => [
                        'required',
                        'numeric',
                        function ($attribute, $value, $fail) {
                            if (!$this->validateCollegeGrade($value)) {
                                $fail('Invalid college grade. Must be between 1.1-3.5 (in 0.1 increments) or 5.0 for failing.');
                            }
                        }
                    ]
                ]);
                Log::info('[COLLEGE_GRADE_VALIDATION] Applied college grade validation (1.0-5.0 scale)', [
                    'requested_grade' => $request->grade,
                    'percentage' => $this->gradeToPercentage($request->grade),
                    'quality' => $this->getQualityDescription($request->grade)
                ]);
            } else {
                $validator->addRules(['grade' => 'numeric|min:0|max:100']);
                Log::info('Applied standard grade validation (0-100)');
            }
        } else {
            Log::error('Academic level not found', [
                'academic_level_id' => $request->academic_level_id
            ]);
        }
        
        // Custom validation for grading_period_id
        if ($request->grading_period_id && $request->grading_period_id !== '0') {
            $validator->addRules(['grading_period_id' => 'exists:grading_periods,id']);
            Log::info('Added grading period validation', [
                'grading_period_id' => $request->grading_period_id
            ]);
        }

        // Handle "0" value for grading_period_id (no period selected)
        if ($request->grading_period_id === '0') {
            $request->merge(['grading_period_id' => null]);
            Log::info('Grading period set to null (no period selected)');
        }

        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();

        Log::info('Instructor assignment check', [
            'instructor_id' => $user->id,
            'subject_id' => $request->subject_id,
            'is_assigned' => $isAssigned
        ]);

        if (!$isAssigned) {
            Log::warning('Instructor not assigned to subject', [
                'instructor_id' => $user->id,
                'subject_id' => $request->subject_id
            ]);
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }

        if ($validator->fails()) {
            Log::error('Validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all()
            ]);
            return back()->withErrors($validator)->withInput();
        }

        Log::info('Validation passed successfully');
        
        // Check if grade already exists
        Log::info('Checking for existing grade', [
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'school_year' => $request->school_year,
            'grading_period_id' => $request->grading_period_id
        ]);

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
            Log::warning('Duplicate grade detected', [
                'existing_grade_id' => $existingGrade->id,
                'existing_grade_value' => $existingGrade->grade
            ]);
            return back()->withErrors(['grade' => 'A grade already exists for this student, subject, and period.']);
        }

        Log::info('No existing grade found, proceeding with creation');

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

        Log::info('Prepared grade data', [
            'grade_data' => $gradeData
        ]);

        // Create the grade
        try {
            Log::info('Attempting to create grade in database');
            $grade = StudentGrade::create($gradeData);

            // Enhanced logging for college grades
            $logData = [
                'grade_id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'grade_value' => $grade->grade,
                'grading_period_id' => $grade->grading_period_id,
                'school_year' => $grade->school_year,
                'academic_level_id' => $grade->academic_level_id,
                'created_at' => $grade->created_at->toDateTimeString()
            ];

            // Add college-specific grade information
            if ($academicLevel && $academicLevel->key === 'college') {
                $logData['percentage_equivalent'] = $this->gradeToPercentage($grade->grade);
                $logData['quality_description'] = $this->getQualityDescription($grade->grade);
                Log::info('[COLLEGE_GRADE_CREATE] === COLLEGE GRADE CREATED SUCCESSFULLY ===', $logData);
            } else {
                Log::info('=== GRADE CREATED SUCCESSFULLY ===', $logData);
            }

            return redirect()->route('instructor.grades.index')
                ->with('success', 'Grade created successfully.');
        } catch (\Exception $e) {
            Log::error('=== GRADE CREATION FAILED ===', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'grade_data' => $gradeData,
                'exception_class' => get_class($e)
            ]);

            return back()->withErrors(['grade' => 'Failed to create grade: ' . $e->getMessage()])->withInput();
        }
    }
    
    /**
     * Show student details and grades for a specific subject.
     */
    public function showStudent($studentId, $subjectId)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to view this student.');
        }
        
        // Get student information with linked parents
        $student = User::with(['parents' => function ($query) {
            $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
        }])->findOrFail($studentId);
        
        // Get subject information
        $subject = Subject::with('course')->findOrFail($subjectId);
        
        // Get academic level from the assignment
        $assignment = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->first();
        
        $academicLevel = $assignment->academicLevel;
        
        // Get all grades for this student in this subject with editability info
        $grades = StudentGrade::with(['student:id,name,student_number', 'subject', 'academicLevel', 'gradingPeriod.parent'])
            ->where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($grade) {
                $gradeArray = $grade->toArray();
                // Add editability fields
                $gradeArray['is_editable'] = $grade->isEditableByInstructor();
                $gradeArray['days_remaining'] = $grade->getDaysRemainingForEdit();
                $gradeArray['edit_status'] = $grade->getEditStatus();
                return $gradeArray;
            });

        // Get instructor's assigned grading periods for this subject
        $instructorAssignments = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->get();

        // Get only the grading period IDs that the instructor is assigned to
        $assignedGradingPeriodIds = $instructorAssignments->pluck('grading_period_id')->filter()->unique();

        Log::info('[INSTRUCTOR GRADES SHOW] Instructor assignments for subject', [
            'instructor_id' => $user->id,
            'instructor_name' => $user->name,
            'subject_id' => $subjectId,
            'subject_name' => $subject->name,
            'student_id' => $studentId,
            'student_name' => $student->name,
            'total_assignments' => $instructorAssignments->count(),
            'assigned_grading_period_ids' => $assignedGradingPeriodIds->toArray(),
            'assigned_grading_periods' => $instructorAssignments->map(function($a) {
                return [
                    'assignment_id' => $a->id,
                    'grading_period_id' => $a->grading_period_id,
                    'grading_period_name' => $a->gradingPeriod?->name ?? 'N/A'
                ];
            })->toArray()
        ]);

        // Get only grading periods that the instructor is assigned to
        // If no specific grading periods assigned, show all (fallback for backward compatibility)
        if ($assignedGradingPeriodIds->isEmpty()) {
            Log::warning('[INSTRUCTOR GRADES SHOW] No specific grading periods assigned, showing all periods as fallback', [
                'instructor_id' => $user->id,
                'subject_id' => $subjectId
            ]);

            $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        } else {
            $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $academicLevel->id)
                ->whereIn('id', $assignedGradingPeriodIds)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            Log::info('[INSTRUCTOR GRADES SHOW] Filtered grading periods', [
                'total_periods' => $gradingPeriods->count(),
                'periods' => $gradingPeriods->map(function($p) {
                    return ['id' => $p->id, 'name' => $p->name, 'code' => $p->code];
                })->toArray()
            ]);
        }

        return Inertia::render('Instructor/Grades/Show', [
            'user' => $user,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'student_number' => $student->student_number,
                'parents' => $student->parents,
            ],
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'course' => $subject->course ? [
                    'id' => $subject->course->id,
                    'name' => $subject->course->name,
                    'code' => $subject->course->code,
                ] : null,
            ],
            'academicLevel' => [
                'id' => $academicLevel->id,
                'name' => $academicLevel->name,
                'key' => $academicLevel->key,
            ],
            'grades' => $grades,
            'gradingPeriods' => $gradingPeriods,
            'assignmentSchoolYear' => $assignment->school_year,
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(StudentGrade $grade)
    {
        $user = Auth::user();

        Log::info('[INSTRUCTOR GRADES EDIT] Edit page accessed', [
            'instructor_id' => $user->id,
            'instructor_name' => $user->name,
            'grade_id' => $grade->id,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'current_grade' => $grade->grade,
            'grading_period_id' => $grade->grading_period_id,
            'is_submitted' => $grade->is_submitted_for_validation,
            'created_at' => $grade->created_at->toDateTimeString(),
        ]);

        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();

        if (!$isAssigned) {
            Log::warning('[INSTRUCTOR GRADES EDIT] Unauthorized edit attempt', [
                'instructor_id' => $user->id,
                'grade_id' => $grade->id,
                'subject_id' => $grade->subject_id,
            ]);
            abort(403, 'You are not authorized to edit this grade.');
        }

        // Check if grade is still editable (within 5-day window and not submitted)
        if (!$grade->isEditableByInstructor()) {
            $editStatus = $grade->getEditStatus();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be edited. The 5-day edit window has expired.';

            Log::warning('[INSTRUCTOR GRADES EDIT] Edit attempt outside edit window', [
                'instructor_id' => $user->id,
                'grade_id' => $grade->id,
                'edit_status' => $editStatus,
                'created_at' => $grade->created_at->toDateTimeString(),
                'is_submitted' => $grade->is_submitted_for_validation,
                'days_since_creation' => $grade->created_at->diffInDays(now())
            ]);

            abort(403, $message);
        }

        $grade->load(['student', 'subject', 'academicLevel', 'gradingPeriod']);

        // Get all grading periods for this academic level
        $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $grade->academic_level_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Get instructor's assigned subjects with enrolled students
        $assignedSubjects = InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod.parent'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();

        // Build the same data structure as create method
        $assignedSubjectsData = $assignedSubjects->map(function($assignment) {
            // Get enrolled students for this subject
            $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->where('is_active', true)
                ->get();

            // Get the subject's grading_period_ids and semester_ids (like create() method does)
            $subject = $assignment->subject;
            $gradingPeriodIds = $subject->grading_period_ids ?? [];
            $semesterIds = $subject->semester_ids ?? [];

            Log::info('[INSTRUCTOR GRADES EDIT] Assignment grading period details', [
                'assignment_id' => $assignment->id,
                'assignment_grading_period_id' => $assignment->grading_period_id,
                'assignment_grading_period_name' => $assignment->gradingPeriod ? $assignment->gradingPeriod->full_name : 'None',
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'subject_grading_period_ids' => $gradingPeriodIds,
                'subject_semester_ids' => $semesterIds
            ]);

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => $assignment->subject ? [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'grading_period_ids' => $gradingPeriodIds,
                    'semester_ids' => $semesterIds,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ] : null,
                'academicLevel' => $assignment->academicLevel ? [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ] : null,
                'gradingPeriod' => $assignment->gradingPeriod ? [
                    'id' => $assignment->gradingPeriod->id,
                    'name' => $assignment->gradingPeriod->name,
                    'semester_number' => $assignment->gradingPeriod->semester_number,
                    'type' => $assignment->gradingPeriod->type,
                    'full_name' => $assignment->gradingPeriod->full_name,
                ] : null,
                'grading_period_ids' => $gradingPeriodIds,
                'semester_ids' => $semesterIds,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->map(function($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                        'school_year' => $enrollment->school_year,
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });

        // Add editability fields to grade object (like index() and showStudent() methods do)
        $gradeArray = $grade->toArray();
        $gradeArray['is_editable'] = $grade->isEditableByInstructor();
        $gradeArray['days_remaining'] = $grade->getDaysRemainingForEdit();
        $gradeArray['edit_status'] = $grade->getEditStatus();

        Log::info('[INSTRUCTOR GRADES EDIT] Grade editability info', [
            'grade_id' => $grade->id,
            'is_editable' => $gradeArray['is_editable'],
            'days_remaining' => $gradeArray['days_remaining'],
            'edit_status' => $gradeArray['edit_status'],
            'created_at' => $grade->created_at->toDateTimeString(),
            'is_submitted' => $grade->is_submitted_for_validation,
        ]);

        Log::info('[INSTRUCTOR GRADES EDIT] Rendering edit page', [
            'grade_id' => $grade->id,
            'total_grading_periods' => count($gradingPeriods),
            'total_assigned_subjects' => $assignedSubjectsData->count(),
            'grading_periods' => $gradingPeriods->map(function($p) {
                return ['id' => $p->id, 'name' => $p->name, 'code' => $p->code];
            })->toArray()
        ]);

        return Inertia::render('Instructor/Grades/Edit', [
            'user' => $user,
            'grade' => $gradeArray,
            'gradingPeriods' => $gradingPeriods,
            'assignedSubjects' => $assignedSubjectsData,
        ]);
    }
    
    /**
     * Update the specified grade.
     */
    public function update(Request $request, StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to update this grade.');
        }

        // Check if grade is still editable (within 5-day window and not submitted)
        if (!$grade->isEditableByInstructor()) {
            $editStatus = $grade->getEditStatus();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be edited. The 5-day edit window has expired.';

            \Log::warning('Instructor attempted to update grade outside edit window', [
                'instructor_id' => $user->id,
                'grade_id' => $grade->id,
                'edit_status' => $editStatus,
                'created_at' => $grade->created_at->toDateTimeString(),
                'is_submitted' => $grade->is_submitted_for_validation,
                'days_since_creation' => $grade->created_at->diffInDays(now())
            ]);

            return back()->withErrors(['grade' => $message])->withInput();
        }

        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
        ]);
        
        // Custom validation for grade based on academic level
        $academicLevel = $grade->academicLevel;
        if ($academicLevel) {
            if ($academicLevel->key === 'college') {
                // College uses 1.0-5.0 scale with specific valid grades
                $validator->addRules([
                    'grade' => [
                        'required',
                        'numeric',
                        function ($attribute, $value, $fail) {
                            if (!$this->validateCollegeGrade($value)) {
                                $fail('Invalid college grade. Must be between 1.1-3.5 (in 0.1 increments) or 5.0 for failing.');
                            }
                        }
                    ]
                ]);
                Log::info('[COLLEGE_GRADE_UPDATE_VALIDATION] Applied college grade validation', [
                    'grade_id' => $grade->id,
                    'old_grade' => $grade->grade,
                    'new_grade' => $request->grade,
                    'old_percentage' => $this->gradeToPercentage($grade->grade),
                    'new_percentage' => $this->gradeToPercentage($request->grade),
                    'old_quality' => $this->getQualityDescription($grade->grade),
                    'new_quality' => $this->getQualityDescription($request->grade)
                ]);
            } else {
                $validator->addRules(['grade' => 'numeric|min:0|max:100']);
            }
        }

        if ($validator->fails()) {
            Log::error('[COLLEGE_GRADE_UPDATE] Validation failed', [
                'errors' => $validator->errors()->toArray(),
                'grade_id' => $grade->id
            ]);
            return back()->withErrors($validator)->withInput();
        }

        // Prepare update data
        $updateData = [
            'grade' => $request->grade,
        ];

        // Handle grading period update
        if ($request->has('grading_period_id')) {
            $updateData['grading_period_id'] = $request->grading_period_id === '0' ? null : $request->grading_period_id;
        }

        $grade->update($updateData);

        // Log successful update
        if ($academicLevel && $academicLevel->key === 'college') {
            Log::info('[COLLEGE_GRADE_UPDATE] === COLLEGE GRADE UPDATED SUCCESSFULLY ===', [
                'grade_id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'new_grade' => $grade->grade,
                'percentage_equivalent' => $this->gradeToPercentage($grade->grade),
                'quality_description' => $this->getQualityDescription($grade->grade),
                'updated_at' => $grade->updated_at->toDateTimeString()
            ]);
        }

        return redirect()->route('instructor.grades.index')
            ->with('success', 'Grade updated successfully.');
    }
    
    /**
     * Remove the specified grade.
     */
    public function destroy(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to delete this grade.');
        }

        // Check if grade is still editable (within 5-day window and not submitted)
        if (!$grade->isEditableByInstructor()) {
            $editStatus = $grade->getEditStatus();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be deleted. The 5-day edit window has expired.';

            \Log::warning('Instructor attempted to delete grade outside edit window', [
                'instructor_id' => $user->id,
                'grade_id' => $grade->id,
                'edit_status' => $editStatus,
                'created_at' => $grade->created_at->toDateTimeString(),
                'is_submitted' => $grade->is_submitted_for_validation,
                'days_since_creation' => $grade->created_at->diffInDays(now())
            ]);

            return back()->withErrors(['grade' => $message]);
        }

        $grade->delete();
        
        return redirect()->route('instructor.grades.index')
            ->with('success', 'Grade deleted successfully.');
    }
    
    /**
     * Submit a grade for validation.
     */
    public function submitForValidation(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to submit this grade.');
        }

        $grade->update([
            'is_submitted_for_validation' => true,
            'submitted_at' => now(),
        ]);

        \Log::info('Instructor submitted grade for validation', [
            'instructor_id' => $user->id,
            'grade_id' => $grade->id,
            'student_id' => $grade->student_id,
            'submitted_at' => now()->toDateTimeString(),
        ]);

        return back()->with('success', 'Grade submitted for validation.');
    }
    
    /**
     * Unsubmit a grade from validation.
     */
    public function unsubmitFromValidation(StudentGrade $grade)
    {
        $user = Auth::user();
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
            abort(403, 'You are not authorized to unsubmit this grade.');
        }

        $grade->update([
            'is_submitted_for_validation' => false,
            'submitted_at' => null,
        ]);

        \Log::info('Instructor unsubmitted grade from validation', [
            'instructor_id' => $user->id,
            'grade_id' => $grade->id,
            'student_id' => $grade->student_id,
        ]);

        return back()->with('success', 'Grade unsubmitted from validation.');
    }
    
    /**
     * Get assigned students for the instructor.
     */
    public function getAssignedStudents()
    {
        $user = Auth::user();
        
        // This would need to be implemented based on your enrollment system
        // For now, return empty array
        return [];
    }
    
    /**
     * Get assigned subjects for the instructor.
     */
    public function getAssignedSubjects()
    {
        $user = Auth::user();
        
        $assignedSubjects = InstructorSubjectAssignment::with(['subject', 'academicLevel'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->get();
        
        return Subject::whereIn('id', $assignedSubjects->pluck('subject_id'))->get();
    }
    
    /**
     * Get grading periods.
     */
    public function getGradingPeriods()
    {
        return GradingPeriod::all();
    }
    
    /**
     * Get academic levels.
     */
    public function getAcademicLevels()
    {
        return AcademicLevel::all();
    }

    /**
     * Validate college grade according to Saint Francis College grading scale.
     * Valid grades: 1.1-3.5 (in 0.1 increments) and 5.0 for failing
     *
     * @param float $grade
     * @return bool
     */
    private function validateCollegeGrade($grade)
    {
        // Convert to float to handle string inputs
        $grade = floatval($grade);

        // Check if it's exactly 5.0 (failing grade)
        if ($grade == 5.0) {
            return true;
        }

        // Check if it's within 1.1 to 3.5 range with 0.1 increments
        // Must be between 1.1 and 3.5, and when multiplied by 10, should be an integer
        if ($grade >= 1.1 && $grade <= 3.5) {
            // Check if it's a valid 0.1 increment (e.g., 1.1, 1.2, ..., 3.4, 3.5)
            $rounded = round($grade * 10) / 10; // Round to nearest 0.1
            return abs($grade - $rounded) < 0.001; // Allow small float precision errors
        }

        return false;
    }

    /**
     * Convert college grade to percentage equivalent.
     * Based on Saint Francis College Guihulugan grading scale.
     *
     * @param float $grade
     * @return string
     */
    private function gradeToPercentage($grade)
    {
        $grade = floatval($grade);

        // Grading scale mapping
        $gradeMap = [
            1.1 => '97-98%',
            1.2 => '95-96%',
            1.3 => '93-94%',
            1.4 => '91-92%',
            1.5 => '90%',
            1.6 => '89%',
            1.7 => '88%',
            1.8 => '87%',
            1.9 => '86%',
            2.0 => '85%',
            2.1 => '84%',
            2.2 => '83%',
            2.3 => '82%',
            2.4 => '81%',
            2.5 => '80%',
            2.6 => '79%',
            2.7 => '78%',
            2.8 => '77%',
            2.9 => '76%',
            3.0 => '75%',
            3.1 => '74%',
            3.2 => '73%',
            3.3 => '72%',
            3.4 => '71%',
            3.5 => '70%',
            5.0 => 'Below 70%',
        ];

        return $gradeMap[$grade] ?? 'Invalid';
    }

    /**
     * Get quality description for college grade.
     * Based on Saint Francis College Guihulugan quality descriptors.
     *
     * @param float $grade
     * @return string
     */
    private function getQualityDescription($grade)
    {
        $grade = floatval($grade);

        if ($grade >= 1.0 && $grade <= 1.2) {
            return 'Excellent';
        } elseif ($grade >= 1.3 && $grade <= 1.5) {
            return 'Superior';
        } elseif ($grade >= 1.6 && $grade <= 1.8) {
            return 'Very Good';
        } elseif ($grade >= 1.9 && $grade <= 2.1) {
            return 'Good';
        } elseif ($grade >= 2.2 && $grade <= 2.4) {
            return 'Average';
        } elseif ($grade >= 2.5 && $grade <= 2.7) {
            return 'Satisfactory';
        } elseif ($grade >= 2.8 && $grade <= 3.0) {
            return 'Fair';
        } elseif ($grade > 3.0 && $grade <= 3.5) {
            return 'Conditional';
        } elseif ($grade == 5.0) {
            return 'Failing';
        }

        return 'Invalid';
    }
}
