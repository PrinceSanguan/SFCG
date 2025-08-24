<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\InstructorCourseAssignment;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the instructor dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get instructor's assigned courses
        $assignedCourses = InstructorCourseAssignment::with(['course', 'academicLevel', 'gradingPeriod'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Get recent grades entered by this instructor
        $recentGrades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedCourses) {
                $query->whereIn('course_id', $assignedCourses->pluck('course_id'));
            })
            ->latest()
            ->take(5)
            ->get();
        
        // Get upcoming grading deadlines
        $upcomingDeadlines = $this->getUpcomingDeadlines();
        
        // Get basic stats
        $stats = $this->getStats();
        
        return Inertia::render('Instructor/Dashboard', [
            'user' => $user,
            'assignedCourses' => $assignedCourses,
            'recentGrades' => $recentGrades,
            'upcomingDeadlines' => $upcomingDeadlines,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Get instructor statistics.
     */
    public function getStats()
    {
        $user = Auth::user();
        
        // Get assigned courses
        $assignedCourses = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Count students in assigned courses
        $studentCount = 0; // This would need to be calculated based on course enrollments
        
        // Count grades entered
        $gradesEntered = StudentGrade::whereHas('subject', function ($query) use ($assignedCourses) {
            $query->whereIn('course_id', $assignedCourses->pluck('course_id'));
        })->count();
        
        // Count pending validations
        $pendingValidations = StudentGrade::whereHas('subject', function ($query) use ($assignedCourses) {
            $query->whereIn('course_id', $assignedCourses->pluck('course_id'));
        })->where('is_submitted_for_validation', true)->count();
        
        return [
            'assigned_courses' => $assignedCourses->count(),
            'student_count' => $studentCount,
            'grades_entered' => $gradesEntered,
            'pending_validations' => $pendingValidations,
        ];
    }
    
    /**
     * Get recent grades for the instructor.
     */
    public function getRecentGrades()
    {
        $user = Auth::user();
        
        $assignedCourses = InstructorCourseAssignment::where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        return StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedCourses) {
                $query->whereIn('course_id', $assignedCourses->pluck('course_id'));
            })
            ->latest()
            ->take(10)
            ->get();
    }
    
    /**
     * Get upcoming grading deadlines.
     */
    public function getUpcomingDeadlines()
    {
        // This would typically come from a grading schedule or academic calendar
        // For now, return empty array
        return [];
    }
}
