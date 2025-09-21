<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChairpersonController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $academicLevelId = $request->get('academic_level_id');
        
        // Get all academic levels for the filter dropdown
        $academicLevels = AcademicLevel::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        // Get department information for the chairperson
        $department = null;
        if ($user->department_id) {
            $baseDepartment = Department::find($user->department_id);
            
            // If academic level filter is applied, get filtered department info
            if ($academicLevelId) {
                $academicLevel = AcademicLevel::find($academicLevelId);
                
                // Find all departments that match the academic level
                $filteredDepartments = Department::where('academic_level_id', $academicLevelId)->get();
                
                if ($filteredDepartments->count() > 0) {
                    if ($filteredDepartments->count() == 1) {
                        // Single department for this academic level
                        $filteredDepartment = $filteredDepartments->first();
                        $department = [
                            'id' => $filteredDepartment->id,
                            'name' => $filteredDepartment->name,
                            'code' => $filteredDepartment->code,
                            'description' => $filteredDepartment->description,
                            'filtered_by' => $academicLevel->name
                        ];
                    } else {
                        // Multiple departments for this academic level (like College)
                        $departmentNames = $filteredDepartments->pluck('name')->join(', ');
                        $departmentCodes = $filteredDepartments->pluck('code')->join(', ');
                        $department = [
                            'id' => $baseDepartment->id,
                            'name' => $departmentNames,
                            'code' => $departmentCodes,
                            'description' => "Multiple {$academicLevel->name} departments",
                            'filtered_by' => $academicLevel->name
                        ];
                    }
                } else {
                    // Fallback to base department with academic level appended
                    $department = [
                        'id' => $baseDepartment->id,
                        'name' => $baseDepartment->name . ' - ' . $academicLevel->name,
                        'code' => $baseDepartment->code,
                        'description' => $baseDepartment->description,
                        'filtered_by' => $academicLevel->name
                    ];
                }
            } else {
                // No filter applied, use base department
                $department = $baseDepartment;
            }
        }
        
        // Get statistics for the chairperson's department
        $stats = $this->getDepartmentStats($user, $academicLevelId);
        
        // Get recent activities
        $recentActivities = $this->getRecentActivities($user, $academicLevelId);
        
        // Get pending grades for approval
        $pendingGrades = $this->getPendingGrades($user, $academicLevelId);
        
        // Get pending honors for approval
        $pendingHonors = $this->getPendingHonors($user, $academicLevelId);
        
        // Determine dashboard message
        $departmentName = is_array($department) ? $department['name'] : $department->name;
        $dashboardMessage = $department 
            ? "Welcome back, {$user->name}! Managing {$departmentName}."
            : "Welcome back, {$user->name}! No specific department assigned - viewing all data.";
        
        return Inertia::render('Chairperson/Dashboard', [
            'user' => $user,
            'department' => $department,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'pendingGrades' => $pendingGrades,
            'pendingHonors' => $pendingHonors,
            'dashboardMessage' => $dashboardMessage,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
        ]);
    }
    
    private function getDepartmentStats($user, $academicLevelId = null)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            // If no department assigned, show general stats
            $baseQuery = function($additionalConditions = []) use ($academicLevelId) {
                $query = collect();
                if (empty($additionalConditions)) {
                    return $query;
                }
                
                // This is a simplified version for no department case
                // In practice, you might want to handle this differently
                return $query;
            };
            
            return [
                'total_students' => User::where('user_role', 'student')
                    ->when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->whereHas('course.subjects', function($query) use ($academicLevelId) {
                            $query->where('academic_level_id', $academicLevelId);
                        });
                    })
                    ->count(),
                'total_courses' => Course::when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->whereHas('subjects', function($query) use ($academicLevelId) {
                            $query->where('academic_level_id', $academicLevelId);
                        });
                    })->count(),
                'total_instructors' => User::where('user_role', 'instructor')
                    ->when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->whereHas('instructorSubjectAssignments.subject', function($query) use ($academicLevelId) {
                            $query->where('academic_level_id', $academicLevelId);
                        });
                    })->count(),
                'pending_grades' => StudentGrade::where('is_submitted_for_validation', true)
                    ->when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->whereHas('subject', function($query) use ($academicLevelId) {
                            $query->where('academic_level_id', $academicLevelId);
                        });
                    })->count(),
                'pending_honors' => HonorResult::where('is_pending_approval', true)
                    ->when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->where('academic_level_id', $academicLevelId);
                    })->count(),
                'average_gpa' => StudentGrade::when($academicLevelId, function($q) use ($academicLevelId) {
                        return $q->whereHas('subject', function($query) use ($academicLevelId) {
                            $query->where('academic_level_id', $academicLevelId);
                        });
                    })->avg('grade') ?? 0,
            ];
        }
        
        // Helper function to add academic level filter
        $addAcademicLevelFilter = function($query, $academicLevelId) {
            if ($academicLevelId) {
                return $query->where('academic_level_id', $academicLevelId);
            }
            return $query;
        };
        
        // Get students in the department
        $totalStudents = User::where('user_role', 'student')
            ->whereHas('course', function ($query) use ($departmentId, $academicLevelId) {
                $query->where('department_id', $departmentId);
                if ($academicLevelId) {
                    $query->whereHas('subjects', function ($q) use ($academicLevelId) {
                        $q->where('academic_level_id', $academicLevelId);
                    });
                }
            })
            ->count();
        
        // Get courses in the department
        $totalCourses = Course::where('department_id', $departmentId)
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subjects', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->count();
        
        // Get instructors in the department
        $totalInstructors = User::where('user_role', 'instructor')
            ->whereHas('instructorSubjectAssignments', function ($query) use ($departmentId, $academicLevelId) {
                $query->whereHas('subject.course', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
                if ($academicLevelId) {
                    $query->whereHas('subject', function ($q) use ($academicLevelId) {
                        $q->where('academic_level_id', $academicLevelId);
                    });
                }
            })
            ->count();
        
        // Get pending grades
        $pendingGrades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->count();
        
        // Get pending honors
        $pendingHonors = HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->count();
        
        // Calculate average GPA for the department
        $averageGpa = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->avg('grade') ?? 0;
        
        return [
            'total_students' => $totalStudents,
            'total_courses' => $totalCourses,
            'total_instructors' => $totalInstructors,
            'pending_grades' => $pendingGrades,
            'pending_honors' => $pendingHonors,
            'average_gpa' => round($averageGpa, 2),
        ];
    }
    
    private function getRecentActivities($user, $academicLevelId = null)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return [];
        }
        
        // Get recent grade submissions
        $recentGrades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function ($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->with(['student', 'subject', 'academicLevel'])
            ->latest('submitted_at')
            ->limit(5)
            ->get();
        
        // Get recent honor submissions
        $recentHonors = HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->limit(5)
            ->get();
        
        $activities = collect();
        
        foreach ($recentGrades as $grade) {
            $activities->push([
                'type' => 'grade_submission',
                'title' => 'Grade submitted for validation',
                'description' => "Grade {$grade->grade} submitted for {$grade->student->name} in {$grade->subject->name}",
                'timestamp' => $grade->submitted_at,
                'data' => $grade,
            ]);
        }
        
        foreach ($recentHonors as $honor) {
            $activities->push([
                'type' => 'honor_submission',
                'title' => 'Honor submitted for approval',
                'description' => "{$honor->honorType->name} honor submitted for {$honor->student->name}",
                'timestamp' => $honor->created_at,
                'data' => $honor,
            ]);
        }
        
        return $activities->sortByDesc('timestamp')->take(10)->values();
    }
    
    private function getPendingGrades($user, $academicLevelId = null)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return collect();
        }
        
        return StudentGrade::where('is_submitted_for_validation', true)
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
            ->limit(5)
            ->get();
    }
    
    private function getPendingHonors($user, $academicLevelId = null)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return collect();
        }
        
        return HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->limit(5)
            ->get();
    }
}
