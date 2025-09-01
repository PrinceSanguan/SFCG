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
        $assignedSubjects = InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod'])
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
        $grades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
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
        
        // Debug logging
        Log::info('Found grades: ' . $grades->count());
        
        // Debug: Log the actual grades data
        if ($grades->count() > 0) {
            Log::info('Sample grade data: ' . json_encode($grades->first()));
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
        
        // Check for URL parameters to pre-select student
        $selectedStudent = null;
        if (request()->has('student_id') && request()->has('subject_id') && request()->has('academic_level_id')) {
            $studentId = request('student_id');
            $subjectId = request('subject_id');
            $academicLevelId = request('academic_level_id');
            
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
        $assignedSubjects = InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod'])
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
        
        // Get available subjects, academic levels, and grading periods
        $academicLevels = AcademicLevel::all();
        $gradingPeriods = GradingPeriod::all();
        
        return Inertia::render('Instructor/Grades/Create', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'assignedSubjects' => $debugData,
            'selectedStudent' => $selectedStudent,
        ]);
    }
    
    /**
     * Store a newly created grade.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Debug logging
        Log::info('Grade creation attempt', [
            'user_id' => $user->id,
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
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        if ($academicLevel) {
            if ($academicLevel->key === 'college') {
                $validator->addRules(['grade' => 'numeric|min:1.0|max:5.0']);
            } else {
                $validator->addRules(['grade' => 'numeric|min:75|max:100']);
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
        
        // Verify the instructor is assigned to this subject
        $isAssigned = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->exists();
        
        if (!$isAssigned) {
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
        $gradeData = [
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id === '0' ? null : $request->grading_period_id,
            'school_year' => $request->school_year,
            'year_of_study' => $request->year_of_study ?: null,
            'grade' => $request->grade,
        ];
        
        // Create the grade
        try {
            $grade = StudentGrade::create($gradeData);
            Log::info('Grade created successfully', [
                'grade_id' => $grade->id,
                'grade_data' => $gradeData
            ]);
            
            return redirect()->route('instructor.grades.index')
                ->with('success', 'Grade created successfully.');
        } catch (\Exception $e) {
            Log::error('Grade creation failed', [
                'error' => $e->getMessage(),
                'grade_data' => $gradeData
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
        
        // Get all grades for this student in this subject
        $grades = StudentGrade::with(['student:id,name,student_number', 'subject', 'academicLevel', 'gradingPeriod'])
            ->where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->orderBy('created_at', 'desc')
            ->get();
        

        
        // Get all grading periods for this academic level
        $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $academicLevel->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        

        
        return Inertia::render('Instructor/Grades/Show', [
            'user' => $user,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'student_number' => $student->student_number,
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
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(StudentGrade $grade)
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
            abort(403, 'You are not authorized to edit this grade.');
        }
        
        $grade->load(['student', 'subject', 'academicLevel', 'gradingPeriod']);
        
        // Get all grading periods for this academic level
        $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $grade->academic_level_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        return Inertia::render('Instructor/Grades/Edit', [
            'user' => $user,
            'grade' => $grade,
            'gradingPeriods' => $gradingPeriods,
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
        
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
        ]);
        
        // Custom validation for grade based on academic level
        $academicLevel = $grade->academicLevel;
        if ($academicLevel) {
            if ($academicLevel->key === 'college') {
                $validator->addRules(['grade' => 'numeric|min:1.0|max:5.0']);
            } else {
                $validator->addRules(['grade' => 'numeric|min:75|max:100']);
            }
        }
        
        if ($validator->fails()) {
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
        
        $grade->update(['is_submitted_for_validation' => true]);
        
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
        
        $grade->update(['is_submitted_for_validation' => false]);
        
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
}
