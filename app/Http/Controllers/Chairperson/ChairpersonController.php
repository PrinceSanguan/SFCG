<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Department;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChairpersonController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get department information for the chairperson
        $department = null;
        if ($user->department_id) {
            $department = Department::find($user->department_id);
        }
        
        // Get statistics for the chairperson's department
        $stats = $this->getDepartmentStats($user);
        
        // Get recent activities
        $recentActivities = $this->getRecentActivities($user);
        
        // Get pending grades for approval
        $pendingGrades = $this->getPendingGrades($user);
        
        // Get pending honors for approval
        $pendingHonors = $this->getPendingHonors($user);
        
        // Determine dashboard message
        $dashboardMessage = $department 
            ? "Welcome back, {$user->name}! Managing {$department->name}."
            : "Welcome back, {$user->name}! No specific department assigned - viewing all data.";
        
        return Inertia::render('Chairperson/Dashboard', [
            'user' => $user,
            'department' => $department,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'pendingGrades' => $pendingGrades,
            'pendingHonors' => $pendingHonors,
            'dashboardMessage' => $dashboardMessage,
        ]);
    }
    
    private function getDepartmentStats($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            // If no department assigned, show general stats
            return [
                'total_students' => User::where('user_role', 'student')->count(),
                'total_courses' => Course::count(),
                'total_instructors' => User::where('user_role', 'instructor')->count(),
                'pending_grades' => StudentGrade::where('is_submitted_for_validation', true)->count(),
                'pending_honors' => HonorResult::where('is_pending_approval', true)->count(),
                'average_gpa' => StudentGrade::avg('grade') ?? 0,
            ];
        }
        
        // Get students in the department
        $totalStudents = User::where('user_role', 'student')
            ->whereHas('course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->count();
        
        // Get courses in the department
        $totalCourses = Course::where('department_id', $departmentId)->count();
        
        // Get instructors in the department
        $totalInstructors = User::where('user_role', 'instructor')
            ->whereHas('instructorSubjectAssignments', function ($query) use ($departmentId) {
                $query->whereHas('subject.course', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
            })
            ->count();
        
        // Get pending grades
        $pendingGrades = StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->count();
        
        // Get pending honors
        $pendingHonors = HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->count();
        
        // Calculate average GPA for the department
        $averageGpa = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
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
    
    private function getRecentActivities($user)
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
            ->with(['student', 'subject', 'academicLevel'])
            ->latest('submitted_at')
            ->limit(5)
            ->get();
        
        // Get recent honor submissions
        $recentHonors = HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
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
    
    private function getPendingGrades($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return collect();
        }
        
        return StudentGrade::where('is_submitted_for_validation', true)
            ->whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->limit(5)
            ->get();
    }
    
    private function getPendingHonors($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return collect();
        }
        
        return HonorResult::where('is_pending_approval', true)
            ->whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->limit(5)
            ->get();
    }
}
