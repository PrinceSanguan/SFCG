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
            $assignedSubjects = \App\Models\TeacherSubjectAssignment::with([
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
                'subjects_count' => $assignedSubjects->count(),
                'subjects' => $assignedSubjects->pluck('subject.name')->toArray()
            ]);
            
            $assignedSubjects = $assignedSubjects->map(function ($assignment) {
                $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                    ->where('subject_id', $assignment->subject_id)
                    ->where('school_year', $assignment->school_year)
                    ->where('is_active', true)
                    ->get();
                
                return [
                    'id' => $assignment->id,
                    'subject' => $assignment->subject,
                    'academicLevel' => $assignment->academicLevel,
                    'gradingPeriod' => $assignment->gradingPeriod,
                    'school_year' => $assignment->school_year,
                    'is_active' => $assignment->is_active,
                    'enrolled_students' => $enrolledStudents,
                    'student_count' => $enrolledStudents->count(),
                ];
            });

            // Get recent grades
            $grades = \App\Models\StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->whereHas('subject', function ($query) use ($assignedSubjects) {
                    $query->whereIn('id', $assignedSubjects->pluck('subject.id'));
                })
                ->latest()
                ->paginate(15);
                
            Log::info('Teacher grades data prepared successfully', [
                'teacher_id' => $user->id,
                'assigned_subjects_count' => $assignedSubjects->count(),
                'grades_count' => $grades->total()
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
            $assignedSubjects = \App\Models\TeacherSubjectAssignment::with([
                'subject.course', 
                'academicLevel', 
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($assignment) {
                $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                    ->where('subject_id', $assignment->subject_id)
                    ->where('school_year', $assignment->school_year)
                    ->where('is_active', true)
                    ->get();
                
                return [
                    'id' => $assignment->id,
                    'subject' => $assignment->subject,
                    'academicLevel' => $assignment->academicLevel,
                    'gradingPeriod' => $assignment->gradingPeriod,
                    'school_year' => $assignment->school_year,
                    'is_active' => $assignment->is_active,
                    'enrolled_students' => $enrolledStudents,
                    'student_count' => $enrolledStudents->count(),
                ];
            });

            // Get academic levels
            $academicLevels = \App\Models\AcademicLevel::where('is_active', true)->get();
            
            // Get grading periods
            $gradingPeriods = \App\Models\GradingPeriod::where('is_active', true)->get();
            
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

            // Get student's grades for this subject
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
                        ] : null,
                        'academicLevel' => $grade->academicLevel ? [
                            'id' => $grade->academicLevel->id,
                            'name' => $grade->academicLevel->name,
                            'key' => $grade->academicLevel->key,
                        ] : null,
                        'created_at' => $grade->created_at,
                        'updated_at' => $grade->updated_at,
                    ];
                });

            // Get grading periods relevant to SHS (teachers only handle SHS)
            $gradingPeriods = GradingPeriod::where('is_active', true)
                ->where('academic_level_id', $academicLevel->id)
                ->orderBy('sort_order')
                ->get();

            // Log the grading periods for debugging
            Log::info('Grading periods for teacher showStudent', [
                'teacher_id' => $user->id,
                'academic_level' => $academicLevel->name,
                'grading_periods_count' => $gradingPeriods->count(),
                'grading_periods' => $gradingPeriods->map(function($p) {
                    return ['id' => $p->id, 'name' => $p->name, 'code' => $p->code];
                })
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
            
            // Get academic levels and grading periods for the form
            $academicLevels = AcademicLevel::where('is_active', true)->get();
            $gradingPeriods = GradingPeriod::where('is_active', true)->get();
            
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
                    $validator->addRules(['grade' => 'numeric|min:75|max:100']);
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
                ->get(['id', 'name', 'code', 'academic_level_id']);
            
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
