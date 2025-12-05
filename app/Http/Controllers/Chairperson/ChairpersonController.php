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

        // Log: Chairperson info
        \Log::info('Chairperson Dashboard Access', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'department_id' => $user->department_id ?? 'NOT SET',
            'requested_academic_level_id' => $academicLevelId,
        ]);

        // Chairpersons ONLY manage College level - filter to show ONLY College
        $academicLevels = AcademicLevel::where('is_active', true)
            ->where('key', 'college') // ONLY College for Chairpersons
            ->orderBy('sort_order')
            ->get();

        \Log::info('Filtered Academic Levels for Chairperson', [
            'count' => $academicLevels->count(),
            'levels' => $academicLevels->pluck('name', 'id')->toArray(),
        ]);
        
        // Get comprehensive statistics (not department-limited)
        $stats = $this->getChairpersonStats($academicLevelId);
        
        // Get recent activities across all academic levels
        $recentActivities = $this->getRecentActivities($academicLevelId);
        
        // Get pending items for approval
        $pendingGrades = $this->getPendingGrades($academicLevelId);
        $pendingHonors = $this->getPendingHonors($academicLevelId);
        $approvedHonors = $this->getApprovedHonors($academicLevelId);
        
        // Get academic level insights
        $academicLevelInsights = $this->getAcademicLevelInsights($academicLevelId);
        
        // Get grade distribution insights
        $gradeDistribution = $this->getGradeDistribution($academicLevelId);
        
        // Get recent system activities
        $systemActivities = $this->getSystemActivities($academicLevelId);
        
        // Dynamic dashboard message for College-level chairperson
        $department = $user->department_id ? \App\Models\Department::find($user->department_id) : null;

        if ($department) {
            $dashboardMessage = "Welcome back, {$user->name}! Managing College academic oversight for {$department->name} ({$department->code}).";
            \Log::info('Chairperson Department Info', [
                'department_id' => $department->id,
                'department_name' => $department->name,
                'department_code' => $department->code,
            ]);
        } else {
            $dashboardMessage = "Welcome back, {$user->name}! Managing College academic oversight.";
            \Log::warning('Chairperson has NO department assigned', [
                'user_id' => $user->id,
                'user_name' => $user->name,
            ]);
        }
        
        return Inertia::render('Chairperson/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'pendingGrades' => $pendingGrades,
            'pendingHonors' => $pendingHonors,
            'approvedHonors' => $approvedHonors,
            'academicLevelInsights' => $academicLevelInsights,
            'gradeDistribution' => $gradeDistribution,
            'systemActivities' => $systemActivities,
            'dashboardMessage' => $dashboardMessage,
            'academicLevels' => $academicLevels,
            'selectedAcademicLevel' => $academicLevelId,
            'department' => $department,  // Pass department data for UI display
        ]);
    }
    
    private function getChairpersonStats($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        // If chairperson has no department assigned, return zeros
        if (!$departmentId) {
            \Log::warning('Chairperson accessing stats without department assignment', [
                'user_id' => $user->id,
                'user_name' => $user->name,
            ]);

            return [
                'total_students' => 0,
                'total_teachers' => 0,
                'total_subjects' => 0,
                'pending_grades' => 0,
                'pending_honors' => 0,
                'approved_honors' => 0,
                'average_gpa' => 0,
            ];
        }

        // Get department-filtered statistics
        $totalStudents = User::where('user_role', 'student')
            ->whereHas('course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                $academicLevel = AcademicLevel::find($academicLevelId);
                if ($academicLevel) {
                    switch($academicLevel->name) {
                        case 'Elementary':
                            return $q->where('year_level', 'elementary');
                        case 'Junior High School':
                            return $q->where('year_level', 'junior_highschool');
                        case 'Senior High School':
                            return $q->where('year_level', 'senior_highschool');
                        case 'College':
                            return $q->where('year_level', 'college');
                        default:
                            return $q->where('year_level', strtolower(str_replace(' ', '_', $academicLevel->name)));
                    }
                }
                return $q;
            })
            ->count();
            
        $totalTeachers = User::whereIn('user_role', ['teacher', 'instructor'])
            ->where(function($q) use ($departmentId, $academicLevelId) {
                $q->whereHas('teacherSubjectAssignments.subject.course', function($query) use ($departmentId, $academicLevelId) {
                    $query->where('department_id', $departmentId);
                    if ($academicLevelId) {
                        $query->where('academic_level_id', $academicLevelId);
                    }
                })->orWhereHas('instructorSubjectAssignments.subject.course', function($query) use ($departmentId, $academicLevelId) {
                    $query->where('department_id', $departmentId);
                    if ($academicLevelId) {
                        $query->where('academic_level_id', $academicLevelId);
                    }
                });
            })
            ->count();
            
        $totalSubjects = DB::table('subjects')
            ->join('courses', 'subjects.course_id', '=', 'courses.id')
            ->where('courses.department_id', $departmentId)
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('subjects.academic_level_id', $academicLevelId);
            })
            ->count();
            
        $pendingGrades = StudentGrade::where('is_submitted_for_validation', true)
            ->where('is_approved', false)
            ->where('is_returned', false)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->count();
            
        $pendingHonors = HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->count();
            
        $averageGpa = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->avg('grade') ?? 0;
            
        $approvedHonors = HonorResult::where('is_approved', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->count();

        \Log::info('Chairperson stats calculated with department filter', [
            'user_id' => $user->id,
            'department_id' => $departmentId,
            'academic_level_id' => $academicLevelId,
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_subjects' => $totalSubjects,
        ]);

        return [
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_subjects' => $totalSubjects,
            'pending_grades' => $pendingGrades,
            'pending_honors' => $pendingHonors,
            'approved_honors' => $approvedHonors,
            'average_gpa' => round($averageGpa, 2),
        ];
    }
    
    private function getRecentActivities($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        // Get recent grade submissions for the department
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
        
        // Get recent honor submissions for the department
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
        
        // Get recent honor approvals for the department
        $recentApprovals = HonorResult::where('is_approved', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('approved_at')
            ->limit(3)
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
        
        foreach ($recentApprovals as $honor) {
            $activities->push([
                'type' => 'honor_approval',
                'title' => 'Honor approved',
                'description' => "{$honor->honorType->name} honor approved for {$honor->student->name}",
                'timestamp' => $honor->approved_at,
                'data' => $honor,
            ]);
        }
        
        return $activities->sortByDesc('timestamp')->take(10)->values();
    }
    
    private function getPendingGrades($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        return StudentGrade::where('is_submitted_for_validation', true)
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
            ->limit(5)
            ->get();
    }
    
    private function getPendingHonors($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        return HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
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
    
    private function getApprovedHonors($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        return HonorResult::where('is_approved', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->where('academic_level_id', $academicLevelId);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('approved_at')
            ->limit(5)
            ->get();
    }
    
    private function getAcademicLevelInsights($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        if ($academicLevelId) {
            $academicLevel = AcademicLevel::find($academicLevelId);
            $insights = [
                'academic_level' => $academicLevel->name,
                'total_sections' => DB::table('sections')
                    ->join('subjects', 'sections.id', '=', 'subjects.section_id')
                    ->join('courses', 'subjects.course_id', '=', 'courses.id')
                    ->where('subjects.academic_level_id', $academicLevelId)
                    ->where('courses.department_id', $departmentId)
                    ->distinct('sections.id')
                    ->count('sections.id'),
                'honor_distribution' => HonorResult::where('academic_level_id', $academicLevelId)
                    ->where('is_approved', true)
                    ->whereHas('student.course', function ($query) use ($departmentId) {
                        $query->where('department_id', $departmentId);
                    })
                    ->selectRaw('honor_type_id, COUNT(*) as count')
                    ->groupBy('honor_type_id')
                    ->with('honorType')
                    ->get(),
                'grade_performance' => StudentGrade::whereHas('subject.course', function($q) use ($departmentId) {
                        $q->where('department_id', $departmentId);
                    })
                    ->whereHas('subject', function($q) use ($academicLevelId) {
                        $q->where('academic_level_id', $academicLevelId);
                    })
                    ->selectRaw('
                        COUNT(*) as total_grades,
                        AVG(grade) as average_grade,
                        COUNT(CASE WHEN grade >= 90 THEN 1 END) as excellent_grades,
                        COUNT(CASE WHEN grade >= 80 AND grade < 90 THEN 1 END) as good_grades,
                        COUNT(CASE WHEN grade < 75 THEN 1 END) as failing_grades
                    ')
                    ->first()
            ];
        } else {
            $insights = AcademicLevel::where('is_active', true)
                ->get()
                ->map(function($level) use ($departmentId) {
                    // Count students by year level mapping for the department
                    $studentCount = User::where('user_role', 'student')
                        ->whereHas('course', function ($query) use ($departmentId) {
                            $query->where('department_id', $departmentId);
                        })
                        ->where(function($q) use ($level) {
                            switch($level->name) {
                                case 'Elementary':
                                    return $q->where('year_level', 'elementary');
                                case 'Junior High School':
                                    return $q->where('year_level', 'junior_highschool');
                                case 'Senior High School':
                                    return $q->where('year_level', 'senior_highschool');
                                case 'College':
                                    return $q->where('year_level', 'college');
                                default:
                                    return $q->where('year_level', strtolower(str_replace(' ', '_', $level->name)));
                            }
                        })
                        ->count();
                        
                    // Count approved honors for this academic level in the department
                    $honorCount = HonorResult::where('academic_level_id', $level->id)
                        ->where('is_approved', true)
                        ->whereHas('student.course', function ($query) use ($departmentId) {
                            $query->where('department_id', $departmentId);
                        })
                        ->count();
                        
                    return [
                        'name' => $level->name,
                        'student_count' => $studentCount,
                        'honor_count' => $honorCount
                    ];
                });
        }
        
        return $insights;
    }
    
    private function getGradeDistribution($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        return StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->selectRaw('
                COUNT(CASE WHEN grade >= 95 THEN 1 END) as outstanding_count,
                COUNT(CASE WHEN grade >= 90 AND grade < 95 THEN 1 END) as excellent_count,
                COUNT(CASE WHEN grade >= 85 AND grade < 90 THEN 1 END) as very_good_count,
                COUNT(CASE WHEN grade >= 80 AND grade < 85 THEN 1 END) as good_count,
                COUNT(CASE WHEN grade >= 75 AND grade < 80 THEN 1 END) as satisfactory_count,
                COUNT(CASE WHEN grade < 75 THEN 1 END) as needs_improvement_count,
                COUNT(*) as total_grades
            ')
            ->first();
    }
    
    private function getSystemActivities($academicLevelId = null)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        $activities = collect();

        // Recent user registrations (system-wide, not department-filtered)
        $recentUsers = User::whereIn('user_role', ['student', 'teacher', 'instructor'])
            ->latest('created_at')
            ->limit(3)
            ->get();

        foreach ($recentUsers as $user) {
            $activities->push([
                'type' => 'user_registration',
                'title' => 'New user registered',
                'description' => "{$user->name} registered as {$user->user_role}",
                'timestamp' => $user->created_at,
                'icon' => 'user-plus'
            ]);
        }

        // Recent grade approvals for the department
        $recentApprovals = StudentGrade::where('is_approved', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($academicLevelId, function($q) use ($academicLevelId) {
                return $q->whereHas('subject', function($query) use ($academicLevelId) {
                    $query->where('academic_level_id', $academicLevelId);
                });
            })
            ->latest('approved_at')
            ->limit(2)
            ->with(['student', 'subject'])
            ->get();
            
        foreach ($recentApprovals as $grade) {
            $activities->push([
                'type' => 'grade_approval',
                'title' => 'Grade approved',
                'description' => "Grade {$grade->grade} approved for {$grade->student->name} in {$grade->subject->name}",
                'timestamp' => $grade->approved_at,
                'icon' => 'check-circle'
            ]);
        }
        
        return $activities->sortByDesc('timestamp')->take(8)->values();
    }
}
