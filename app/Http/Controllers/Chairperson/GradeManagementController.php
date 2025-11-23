<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\Subject;
use App\Models\Department;
use App\Models\AcademicLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        $academicLevelId = $request->get('academic_level_id');

        // Get College academic level
        $collegeLevel = AcademicLevel::where('key', 'college')->first();

        // Get all academic levels for the filter dropdown (but chairperson should only see college)
        $academicLevels = AcademicLevel::where('is_active', true)
            ->where('key', 'college')
            ->orderBy('sort_order')
            ->get();

        // If chairperson has no department assigned, return empty results
        if (!$departmentId || !$collegeLevel) {
            return Inertia::render('Chairperson/Grades/Index', [
                'user' => $user,
                'grades' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'stats' => [
                    'total' => 0,
                    'approved' => 0,
                    'submitted' => 0,
                ],
                'academicLevels' => $academicLevels,
                'selectedAcademicLevel' => $academicLevelId,
            ]);
        }

        // Filter grades by College level and chairperson's department only
        // Get the IDs of the latest grades for each student-subject-level-year combination
        $latestGradeIds = StudentGrade::query()
            ->where('academic_level_id', $collegeLevel->id)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->select('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->selectRaw('MAX(id) as latest_id')
            ->groupBy('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->get()
            ->pluck('latest_id');

        $grades = StudentGrade::query()
            ->whereIn('id', $latestGradeIds)
            ->with(['student', 'subject.course.department'])
            ->orderBy('created_at', 'DESC')
            ->paginate(20);

        // Manually attach academic level to each grade since relationship loading doesn't work well with grouped queries
        $grades->getCollection()->transform(function ($grade) use ($collegeLevel) {
            $grade->setRelation('academicLevel', $collegeLevel);
            $grade->academic_level = $collegeLevel; // Fallback for snake_case access
            return $grade;
        });

        // Calculate stats by counting only the latest grades
        $stats = [
            'total' => $latestGradeIds->count(),
            'approved' => StudentGrade::whereIn('id', $latestGradeIds)->where('is_approved', true)->count(),
            'submitted' => StudentGrade::whereIn('id', $latestGradeIds)->where('is_submitted_for_validation', true)->where('is_approved', false)->count(),
        ];

        return Inertia::render('Chairperson/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'stats' => $stats,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    public function allGrades(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        $academicLevelId = $request->get('academic_level_id');

        // Get College academic level
        $collegeLevel = AcademicLevel::where('key', 'college')->first();

        // Get all academic levels for the filter dropdown (but chairperson should only see college)
        $academicLevels = AcademicLevel::where('is_active', true)
            ->where('key', 'college')
            ->orderBy('sort_order')
            ->get();

        // If chairperson has no department assigned, return empty results
        if (!$departmentId || !$collegeLevel) {
            return Inertia::render('Chairperson/Grades/All', [
                'user' => $user,
                'grades' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'academicLevels' => $academicLevels,
                'selectedAcademicLevel' => $academicLevelId,
            ]);
        }

        // Filter grades by College level and chairperson's department only
        $gradesQuery = StudentGrade::query()
            ->where('academic_level_id', $collegeLevel->id)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            });

        $grades = $gradesQuery->with(['student', 'subject.course.department', 'gradingPeriod'])
            ->select('student_id', 'subject_id', 'academic_level_id', 'school_year', 'grading_period_id')
            ->selectRaw('MAX(id) as id') // Get the latest grade ID
            ->selectRaw('MAX(grade) as grade')
            ->selectRaw('MAX(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as is_approved')
            ->selectRaw('MAX(CASE WHEN is_submitted_for_validation = true THEN 1 ELSE 0 END) as is_submitted_for_validation')
            ->selectRaw('MAX(CASE WHEN is_returned = true THEN 1 ELSE 0 END) as is_returned')
            ->selectRaw('MAX(submitted_at) as submitted_at')
            ->selectRaw('MAX(approved_at) as approved_at')
            ->selectRaw('MAX(returned_at) as returned_at')
            ->groupBy('student_id', 'subject_id', 'academic_level_id', 'school_year', 'grading_period_id')
            ->orderByRaw('MAX(created_at) DESC')
            ->paginate(20);

        // Manually attach academic level to each grade since relationship loading doesn't work with grouped queries
        $grades->getCollection()->transform(function ($grade) use ($collegeLevel) {
            $grade->setRelation('academicLevel', $collegeLevel);
            $grade->academic_level = $collegeLevel; // Fallback for snake_case access
            return $grade;
        });

        return Inertia::render('Chairperson/Grades/All', [
            'user' => $user,
            'grades' => $grades,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    // Final Average Management Methods
    public function finalAverages(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        $academicLevelId = $request->get('academic_level_id');
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/FinalAverages/Index', [
                'user' => $user,
                'finalAverages' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'stats' => [
                    'pending' => 0,
                    'approved' => 0,
                    'returned' => 0,
                ],
                'academicLevels' => AcademicLevel::where('is_active', true)->orderBy('sort_order')->get(),
                'selectedAcademicLevel' => $academicLevelId,
            ]);
        }
        
        // Get final average grades (period_type = 'final')
        $finalAveragesQuery = StudentGrade::whereHas('gradingPeriod', function ($query) {
                $query->where('period_type', 'final');
            })
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('created_at');
        
        $finalAverages = $finalAveragesQuery->paginate(20);
        
        // Get academic levels for filter
        $academicLevels = AcademicLevel::where('is_active', true)->orderBy('sort_order')->get();
        
        // Calculate stats
        $statsQuery = function($conditions = []) use ($departmentId, $academicLevelId) {
            return StudentGrade::whereHas('gradingPeriod', function ($query) {
                    $query->where('period_type', 'final');
                })
                ->whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->when($academicLevelId, function($q) use ($academicLevelId) {
                    return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                        $query->where('academic_level_id', $academicLevelId);
                    });
                })
                ->when(!empty($conditions), function($q) use ($conditions) {
                    foreach ($conditions as $condition) {
                        if (is_array($condition) && count($condition) === 3) {
                            $q->where($condition[0], $condition[1], $condition[2]);
                        } else {
                            $q->where($condition, true);
                        }
                    }
                })
                ->count();
        };
        
        $stats = [
            'pending' => $statsQuery([
                ['is_submitted_for_validation', '=', true],
                ['is_approved', '=', false],
                ['is_returned', '=', false]
            ]),
            'approved' => $statsQuery(['is_approved']),
            'returned' => $statsQuery(['is_returned']),
        ];
        
        return Inertia::render('Chairperson/FinalAverages/Index', [
            'user' => $user,
            'finalAverages' => $finalAverages,
            'stats' => $stats,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    public function pendingFinalAverages(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        $academicLevelId = $request->get('academic_level_id');
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/FinalAverages/Pending', [
                'user' => $user,
                'finalAverages' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'academicLevels' => AcademicLevel::where('is_active', true)->orderBy('sort_order')->get(),
                'selectedAcademicLevel' => $academicLevelId,
            ]);
        }
        
        $finalAverages = StudentGrade::whereHas('gradingPeriod', function ($query) {
                $query->where('period_type', 'final');
            })
            ->where('is_submitted_for_validation', true)
            ->where('is_approved', false)
            ->where('is_returned', false)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->paginate(20);
        
        $academicLevels = AcademicLevel::where('is_active', true)->orderBy('sort_order')->get();
        
        return Inertia::render('Chairperson/FinalAverages/Pending', [
            'user' => $user,
            'finalAverages' => $finalAverages,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    // Note: Chairperson cannot approve final averages
    // This functionality is restricted to Principal role only
    public function approveFinalAverage(Request $request, $gradeId)
    {
        abort(403, 'Unauthorized. Only principals can approve final averages.');
    }
    
    // Note: Chairperson cannot return final averages
    // This functionality is restricted to Principal role only
    public function returnFinalAverage(Request $request, $gradeId)
    {
        abort(403, 'Unauthorized. Only principals can return final averages.');
    }
    
    public function reviewFinalAverage($gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->findOrFail($gradeId);
        
        // Chairperson can view (but not approve) all final averages across academic levels
        return Inertia::render('Chairperson/FinalAverages/Review', [
            'user' => $user,
            'grade' => $grade,
            'viewOnly' => true, // Indicate this is view-only mode
        ]);
    }
    
    public function reviewGrade($gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::with(['student', 'subject.course', 'subject.academicLevel', 'academicLevel', 'gradingPeriod', 'approvedBy', 'returnedBy'])
            ->findOrFail($gradeId);

        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only review grades from your department.');
        }

        // Ensure academic level is set - try multiple sources
        if (!$grade->academicLevel) {
            // Try to get from subject
            if ($grade->subject && $grade->subject->academicLevel) {
                $grade->setRelation('academicLevel', $grade->subject->academicLevel);
            }
            // If still not set, try to get from database using academic_level_id
            elseif ($grade->academic_level_id) {
                $academicLevel = AcademicLevel::find($grade->academic_level_id);
                if ($academicLevel) {
                    $grade->setRelation('academicLevel', $academicLevel);
                }
            }
            // Last resort: set to College for chairperson grades
            else {
                $collegeLevel = AcademicLevel::where('key', 'college')->first();
                if ($collegeLevel) {
                    $grade->setRelation('academicLevel', $collegeLevel);
                }
            }
        }

        // Format grade data explicitly for proper serialization
        $gradeData = [
            'id' => $grade->id,
            'grade' => $grade->grade,
            'school_year' => $grade->school_year,
            'year_of_study' => $grade->year_of_study,
            'is_submitted_for_validation' => (bool) $grade->is_submitted_for_validation,
            'submitted_at' => $grade->submitted_at?->toISOString(),
            'is_approved' => (bool) $grade->is_approved,
            'approved_at' => $grade->approved_at?->toISOString(),
            'is_returned' => (bool) $grade->is_returned,
            'returned_at' => $grade->returned_at?->toISOString(),
            'return_reason' => $grade->return_reason,
            'student' => [
                'id' => $grade->student->id,
                'name' => $grade->student->name,
                'student_number' => $grade->student->student_number,
                'email' => $grade->student->email,
            ],
            'subject' => [
                'id' => $grade->subject->id,
                'name' => $grade->subject->name,
                'code' => $grade->subject->code,
                'course' => [
                    'name' => $grade->subject->course->name ?? 'N/A',
                    'code' => $grade->subject->course->code ?? 'N/A',
                ],
                'academicLevel' => $grade->subject->academicLevel ? [
                    'name' => $grade->subject->academicLevel->name,
                ] : null,
            ],
            'academicLevel' => $grade->academicLevel ? [
                'name' => $grade->academicLevel->name,
            ] : null,
            'gradingPeriod' => $grade->gradingPeriod ? [
                'name' => $grade->gradingPeriod->name,
            ] : null,
            'approved_by' => $grade->approvedBy ? [
                'name' => $grade->approvedBy->name,
            ] : null,
            'returned_by' => $grade->returnedBy ? [
                'name' => $grade->returnedBy->name,
            ] : null,
        ];

        // Log the grade data for debugging
        Log::info('Chairperson Grade Review Data:', [
            'grade_id' => $gradeId,
            'grade' => $gradeData['grade'],
            'academic_level' => $gradeData['academicLevel']['name'] ?? 'NULL',
            'submitted_at' => $gradeData['submitted_at'] ?? 'NULL',
            'student' => $gradeData['student']['name'],
        ]);

        return Inertia::render('Chairperson/Grades/Review', [
            'user' => $user,
            'grade' => $gradeData,
        ]);
    }
    
    // API methods
    public function getPendingGrades()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $grades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->get();
        
        return response()->json($grades);
    }
    
    public function getPendingFinalAverages()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $grades = StudentGrade::whereHas('gradingPeriod', function ($query) {
                $query->where('period_type', 'final');
            })
            ->where('is_submitted_for_validation', true)
            ->where('is_approved', false)
            ->where('is_returned', false)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->get();
        
        return response()->json($grades);
    }
}
