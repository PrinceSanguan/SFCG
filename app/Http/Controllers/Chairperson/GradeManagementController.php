<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
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
        
        // Get all academic levels for the filter dropdown
        $academicLevels = AcademicLevel::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        if (!$departmentId) {
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
                    'pending' => 0,
                    'returned' => 0,
                ],
                'academicLevels' => $academicLevels,
                'selectedAcademicLevel' => $academicLevelId,
            ]);
        }
        
        // Get latest grade for each student-subject combination (excluding pending grades)
        // Only show grades that are either approved or returned, not pending
        $gradesQuery = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->where(function ($query) {
                $query->where('is_approved', true)
                      ->orWhere('is_returned', true);
            });
        
        // Add academic level filter if provided
        if ($academicLevelId) {
            $gradesQuery->where('academic_level_id', $academicLevelId);
        }
        
        $grades = $gradesQuery->with(['student', 'subject.course.department', 'academicLevel'])
            ->select('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->selectRaw('MAX(id) as id') // Get the latest grade ID
            ->selectRaw('MAX(grade) as grade')
            ->selectRaw('MAX(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as is_approved')
            ->selectRaw('MAX(CASE WHEN is_submitted_for_validation = true THEN 1 ELSE 0 END) as is_submitted_for_validation')
            ->selectRaw('MAX(CASE WHEN is_returned = true THEN 1 ELSE 0 END) as is_returned')
            ->selectRaw('MAX(submitted_at) as submitted_at')
            ->selectRaw('MAX(approved_at) as approved_at')
            ->selectRaw('MAX(returned_at) as returned_at')
            ->groupBy('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->orderByRaw('MAX(created_at) DESC')
            ->paginate(20);
        
        // Calculate stats for grouped data (unique student-subject combinations)
        $statsQuery = function($additionalConditions = []) use ($departmentId, $academicLevelId) {
            $query = StudentGrade::whereHas('subject.course', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
            
            if ($academicLevelId) {
                $query->where('academic_level_id', $academicLevelId);
            }
            
            foreach ($additionalConditions as $condition) {
                if (is_array($condition)) {
                    $query->where($condition[0], $condition[1], $condition[2]);
                } else {
                    $query->where($condition, true);
                }
            }
            
            return $query->select('student_id', 'subject_id', 'academic_level_id', 'school_year')
                ->groupBy('student_id', 'subject_id', 'academic_level_id', 'school_year')
                ->get()
                ->count();
        };
        
        $stats = [
            'pending' => $statsQuery([
                ['is_submitted_for_validation', '=', true],
                ['is_approved', '=', false],
                ['is_returned', '=', false]
            ]),
            'returned' => $statsQuery(['is_returned']),
        ];
        

        
        return Inertia::render('Chairperson/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'stats' => $stats,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    public function pendingGrades(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        $academicLevelId = $request->get('academic_level_id');
        
        // Get all academic levels for the filter dropdown
        $academicLevels = AcademicLevel::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Grades/Pending', [
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
        
        $gradesQuery = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            });
        
        // Add academic level filter if provided
        if ($academicLevelId) {
            $gradesQuery->where('academic_level_id', $academicLevelId);
        }
        
        $grades = $gradesQuery->with(['student', 'subject.course.department', 'academicLevel'])
            ->select('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->selectRaw('MAX(id) as id')
            ->selectRaw('MAX(grade) as grade')
            ->selectRaw('MAX(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as is_approved')
            ->selectRaw('MAX(CASE WHEN is_submitted_for_validation = true THEN 1 ELSE 0 END) as is_submitted_for_validation')
            ->selectRaw('MAX(CASE WHEN is_returned = true THEN 1 ELSE 0 END) as is_returned')
            ->selectRaw('MAX(submitted_at) as submitted_at')
            ->groupBy('student_id', 'subject_id', 'academic_level_id', 'school_year')
            ->orderByRaw('MAX(submitted_at) DESC')
            ->paginate(20);
        
        return Inertia::render('Chairperson/Grades/Pending', [
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
    
    public function approveFinalAverage(Request $request, $gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::findOrFail($gradeId);
        
        // Verify it's a final average grade
        if ($grade->gradingPeriod->period_type !== 'final') {
            abort(400, 'This is not a final average grade.');
        }
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only approve final averages from your department.');
        }
        
        $grade->update([
            'is_approved' => true,
            'is_submitted_for_validation' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        Log::info('Final average approved by chairperson', [
            'chairperson_id' => $user->id,
            'grade_id' => $gradeId,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
        ]);
        
        return back()->with('success', 'Final average approved successfully.');
    }
    
    public function returnFinalAverage(Request $request, $gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::findOrFail($gradeId);
        
        $validated = $request->validate([
            'return_reason' => ['required', 'string', 'max:1000'],
        ]);
        
        // Verify it's a final average grade
        if ($grade->gradingPeriod->period_type !== 'final') {
            abort(400, 'This is not a final average grade.');
        }
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only return final averages from your department.');
        }
        
        $grade->update([
            'is_returned' => true,
            'is_submitted_for_validation' => false,
            'returned_at' => now(),
            'returned_by' => $user->id,
            'return_reason' => $validated['return_reason'],
        ]);
        
        Log::info('Final average returned by chairperson', [
            'chairperson_id' => $user->id,
            'grade_id' => $gradeId,
            'student_id' => $grade->student_id,
            'subject_id' => $grade->subject_id,
            'return_reason' => $validated['return_reason'],
        ]);
        
        return back()->with('success', 'Final average returned for revision.');
    }
    
    public function reviewFinalAverage($gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->findOrFail($gradeId);
        
        // Verify it's a final average grade
        if ($grade->gradingPeriod->period_type !== 'final') {
            abort(400, 'This is not a final average grade.');
        }
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only review final averages from your department.');
        }
        
        return Inertia::render('Chairperson/FinalAverages/Review', [
            'user' => $user,
            'grade' => $grade,
        ]);
    }
    
    public function reviewGrade($gradeId)
    {
        $user = Auth::user();
        $grade = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->findOrFail($gradeId);
        
        // Verify the grade belongs to the chairperson's department
        if ($user->department_id !== $grade->subject->course->department_id) {
            abort(403, 'You can only review grades from your department.');
        }
        
        return Inertia::render('Chairperson/Grades/Review', [
            'user' => $user,
            'grade' => $grade,
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
