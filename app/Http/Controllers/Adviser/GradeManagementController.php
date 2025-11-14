<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\ClassAdviserAssignment;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\StudentSubjectAssignment;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    /**
     * List grades limited to the adviser's assigned subjects/sections.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = $request->input('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereHas('subject')
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->get();

        $subjectIds = $assignments->pluck('subject_id')->filter()->unique();

        $assignedData = $assignments->filter(function ($assignment) {
            return $assignment->subject && $assignment->academicLevel;
        })->map(function ($assignment) use ($schoolYear) {
            $enrolledStudents = StudentSubjectAssignment::with('student')
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->whereHas('student')
                ->get();

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ],
                'academicLevel' => [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ],
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->filter(function ($enrollment) {
                    return $enrollment->student;
                })->map(function ($enrollment) {
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

        $grades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->when($subjectIds->isNotEmpty(), function ($query) use ($subjectIds) {
                $query->whereIn('subject_id', $subjectIds);
            }, function ($query) {
                $query->whereRaw('1=0');
            })
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

        return Inertia::render('Adviser/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'assignedSubjects' => $assignedData,
            'filters' => $request->only(['subject', 'academic_level', 'grading_period', 'school_year']),
        ]);
    }

    /**
     * Show create form using adviser's assignments.
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $schoolYear = $request->input('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereHas('subject') // Only get assignments that have valid subjects
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->get();

        $assignedData = $assignments->filter(function ($assignment) {
            return $assignment->subject && $assignment->academicLevel; // Filter out any null relationships
        })->map(function ($assignment) use ($schoolYear) {
            $enrolledStudents = StudentSubjectAssignment::with('student')
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->whereHas('student') // Only get enrollments with valid students
                ->get();

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                ],
                'academicLevel' => [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ],
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->filter(function ($enrollment) {
                    return $enrollment->student; // Filter out null students
                })->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });

        $academicLevels = AcademicLevel::whereIn('key', ['elementary', 'junior_highschool'])->orderBy('name')->get();
        $gradingPeriods = GradingPeriod::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Adviser/Grades/Create', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'assignedSubjects' => $assignedData,
        ]);
    }

    /**
     * Store a newly created grade restricted to adviser's assignments.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
            'grade' => 'required|numeric|min:0|max:100',
        ]);

        if ($request->grading_period_id && $request->grading_period_id !== '0') {
            $validator->addRules(['grading_period_id' => 'exists:grading_periods,id']);
        }

        if ($request->grading_period_id === '0') {
            $request->merge(['grading_period_id' => null]);
        }

        // Verify adviser is assigned to this subject for the school year and academic level is Elementary or JHS
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('school_year', $request->school_year)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->exists();

        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject or advisers can only manage Elementary and Junior High School grades.']);
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Prevent duplicate
        $existing = StudentGrade::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'school_year' => $request->school_year,
        ])->when($request->grading_period_id, function ($query, $gradingPeriodId) {
            $query->where('grading_period_id', $gradingPeriodId);
        })->when(!$request->grading_period_id, function ($query) {
            $query->whereNull('grading_period_id');
        })->first();

        if ($existing) {
            return back()->withErrors(['grade' => 'A grade already exists for this student, subject, and period.']);
        }

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

        $grade = StudentGrade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'year_of_study' => $yearOfStudy,
            'grade' => $request->grade,
        ]);

        Log::info('Adviser created grade', ['adviser_id' => $user->id, 'grade_id' => $grade->id]);

        return redirect()->route('adviser.grades.index')
            ->with('success', 'Grade created successfully.');
    }

    /**
     * Show detailed grades for a specific student and subject.
     */
    public function showStudentGrades(User $student, Subject $subject)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        // Load the academic level relationship
        $subject->load('academicLevel');

        // Verify adviser is assigned to this subject
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $subject->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->exists();

        if (!$isAssigned) {
            return redirect()->route('adviser.grades.index')
                ->with('error', 'You are not assigned to this subject.');
        }

        // Check if the student is enrolled in this subject
        $enrollment = StudentSubjectAssignment::where('student_id', $student->id)
            ->where('subject_id', $subject->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->first();

        if (!$enrollment) {
            return redirect()->route('adviser.grades.index')
                ->with('error', 'Student is not enrolled in this subject.');
        }

        $query = StudentGrade::with(['gradingPeriod'])
            ->where('student_id', $student->id)
            ->where('subject_id', $subject->id)
            ->orderByRaw('COALESCE(grading_period_id, 0) asc, created_at desc');
        if ($schoolYear) {
            $query->where('school_year', $schoolYear);
        }
        $grades = $query->get();

        // Get the teacher/adviser for this subject
        $teacherService = new \App\Services\TeacherStudentAssignmentService();
        $assignedTeacher = $teacherService->getTeacherForStudentSubject($student, $subject);

        // Transform grades to include explicit grading period data, teacher information, and editability (3-day window)
        $transformedGrades = $grades->map(function($grade) use ($assignedTeacher) {
            return [
                'id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'academic_level_id' => $grade->academic_level_id,
                'grading_period_id' => $grade->grading_period_id,
                'school_year' => $grade->school_year,
                'year_of_study' => $grade->year_of_study,
                'grade' => $grade->grade,
                'is_submitted_for_validation' => $grade->is_submitted_for_validation,
                'submitted_at' => $grade->submitted_at,
                'validated_at' => $grade->validated_at,
                'validated_by' => $grade->validated_by,
                'created_at' => $grade->created_at,
                'updated_at' => $grade->updated_at,
                // Editability fields for 3-day edit window
                'is_editable' => $grade->isEditableByAdviser(),
                'days_remaining' => $grade->getDaysRemainingForEditByAdviser(),
                'edit_status' => $grade->getEditStatusForAdviser(),
                'teacher_name' => $assignedTeacher ? $assignedTeacher->name : null,
                'teacher_role' => $assignedTeacher ? $assignedTeacher->user_role : null,
                'gradingPeriod' => $grade->gradingPeriod ? [
                    'id' => $grade->gradingPeriod->id,
                    'name' => $grade->gradingPeriod->name,
                    'code' => $grade->gradingPeriod->code,
                    'academic_level_id' => $grade->gradingPeriod->academic_level_id,
                    'start_date' => $grade->gradingPeriod->start_date,
                    'end_date' => $grade->gradingPeriod->end_date,
                    'sort_order' => $grade->gradingPeriod->sort_order,
                    'is_active' => $grade->gradingPeriod->is_active,
                ] : null,
            ];
        });

        // Get available grading periods for the subject's academic level
        $gradingPeriods = GradingPeriod::where('academic_level_id', $subject->academic_level_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function($period) {
                return [
                    'id' => $period->id,
                    'name' => $period->name,
                    'code' => $period->code,
                    'sort_order' => $period->sort_order,
                ];
            });

        return Inertia::render('Adviser/Grades/Show', [
            'user' => $user,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'student_number' => $student->student_number ?? null,
            ],
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'academicLevel' => $subject->academicLevel ? [
                    'id' => $subject->academicLevel->id,
                    'name' => $subject->academicLevel->name,
                    'key' => $subject->academicLevel->key,
                ] : null,
            ],
            'schoolYear' => $schoolYear,
            'grades' => $transformedGrades,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(StudentGrade $grade)
    {
        $user = Auth::user();

        Log::info('[ADVISER GRADES EDIT] Edit page accessed', [
            'adviser_id' => $user->id,
            'adviser_name' => $user->name,
            'grade_id' => $grade->id,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'current_grade' => $grade->grade,
            'grading_period_id' => $grade->grading_period_id,
            'is_submitted' => $grade->is_submitted_for_validation,
            'created_at' => $grade->created_at->toDateTimeString(),
        ]);

        // Verify the adviser is assigned to a section with this subject
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();

        if (!$isAssigned) {
            Log::warning('[ADVISER GRADES EDIT] Unauthorized edit attempt', [
                'adviser_id' => $user->id,
                'grade_id' => $grade->id,
                'subject_id' => $grade->subject_id,
            ]);
            abort(403, 'You are not authorized to edit this grade.');
        }

        // Check if grade is still editable (within 3-day window and not submitted)
        if (!$grade->isEditableByAdviser()) {
            $editStatus = $grade->getEditStatusForAdviser();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be edited. The 3-day edit window has expired.';

            Log::warning('[ADVISER GRADES EDIT] Edit attempt outside edit window', [
                'adviser_id' => $user->id,
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
        $gradingPeriods = GradingPeriod::where('academic_level_id', $grade->academic_level_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Get adviser's assigned sections with enrolled students
        $assignedSections = ClassAdviserAssignment::with(['section', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->where('adviser_id', $user->id)
            ->where('is_active', true)
            ->get();

        // Build the same data structure as create method
        $assignedSubjectsData = $assignedSections->map(function($assignment) {
            // Get enrolled students for this section
            $enrolledStudents = StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->where('is_active', true)
                ->get();

            // Get the subject's grading_period_ids and semester_ids
            $subject = $assignment->subject;
            $gradingPeriodIds = $subject->grading_period_ids ?? [];
            $semesterIds = $subject->semester_ids ?? [];

            Log::info('[ADVISER GRADES EDIT] Assignment grading period details', [
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

        // Add editability fields to grade object
        $gradeArray = $grade->toArray();
        $gradeArray['is_editable'] = $grade->isEditableByAdviser();
        $gradeArray['days_remaining'] = $grade->getDaysRemainingForEditByAdviser();
        $gradeArray['edit_status'] = $grade->getEditStatusForAdviser();

        Log::info('[ADVISER GRADES EDIT] Grade editability info', [
            'grade_id' => $grade->id,
            'is_editable' => $gradeArray['is_editable'],
            'days_remaining' => $gradeArray['days_remaining'],
            'edit_status' => $gradeArray['edit_status'],
            'created_at' => $grade->created_at->toDateTimeString(),
            'is_submitted' => $grade->is_submitted_for_validation,
        ]);

        Log::info('[ADVISER GRADES EDIT] Rendering edit page', [
            'grade_id' => $grade->id,
            'total_grading_periods' => count($gradingPeriods),
            'total_assigned_subjects' => $assignedSubjectsData->count(),
            'grading_periods' => $gradingPeriods->map(function($p) {
                return ['id' => $p->id, 'name' => $p->name, 'code' => $p->code];
            })->toArray()
        ]);

        return Inertia::render('Adviser/Grades/Edit', [
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

        // Verify the adviser is assigned to a section with this subject
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();

        if (!$isAssigned) {
            abort(403, 'You are not authorized to update this grade.');
        }

        // Check if grade is still editable (within 3-day window and not submitted)
        if (!$grade->isEditableByAdviser()) {
            $editStatus = $grade->getEditStatusForAdviser();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be edited. The 3-day edit window has expired.';

            Log::warning('[ADVISER GRADES UPDATE] Update attempt outside edit window', [
                'adviser_id' => $user->id,
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
            if ($academicLevel->key === 'college' || $academicLevel->key === 'senior_highschool') {
                $validator->addRules(['grade' => 'numeric|min:1.0|max:5.0']);
            } else {
                $validator->addRules(['grade' => 'numeric|min:0|max:100']);
            }
        }

        if ($validator->fails()) {
            Log::error('[ADVISER GRADES UPDATE] Validation failed', [
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

        $oldGrade = $grade->grade;
        $grade->update($updateData);

        Log::info('[ADVISER GRADES UPDATE] Grade updated successfully', [
            'grade_id' => $grade->id,
            'adviser_id' => $user->id,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'old_grade' => $oldGrade,
            'new_grade' => $grade->grade,
            'updated_at' => $grade->updated_at->toDateTimeString()
        ]);

        return redirect()->route('adviser.grades.show-student', [$grade->student_id, $grade->subject_id])
            ->with('success', 'Grade updated successfully.');
    }

    /**
     * Remove the specified grade.
     */
    public function destroy(StudentGrade $grade)
    {
        $user = Auth::user();

        // Verify the adviser is assigned to a section with this subject
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $grade->subject_id)
            ->where('is_active', true)
            ->exists();

        if (!$isAssigned) {
            abort(403, 'You are not authorized to delete this grade.');
        }

        // Check if grade is still editable (within 3-day window and not submitted)
        if (!$grade->isEditableByAdviser()) {
            $editStatus = $grade->getEditStatusForAdviser();
            $message = $editStatus === 'locked'
                ? 'This grade is locked because it has been submitted for validation.'
                : 'This grade can no longer be deleted. The 3-day edit window has expired.';

            Log::warning('[ADVISER GRADES DELETE] Delete attempt outside edit window', [
                'adviser_id' => $user->id,
                'grade_id' => $grade->id,
                'edit_status' => $editStatus,
            ]);

            return back()->withErrors(['grade' => $message]);
        }

        Log::info('[ADVISER GRADES DELETE] Grade deleted', [
            'grade_id' => $grade->id,
            'adviser_id' => $user->id,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'grade_value' => $grade->grade,
        ]);

        $grade->delete();

        return redirect()->route('adviser.grades.index')
            ->with('success', 'Grade deleted successfully.');
    }
}


