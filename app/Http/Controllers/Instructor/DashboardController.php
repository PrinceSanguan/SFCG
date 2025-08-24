<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\InstructorSubjectAssignment;
use App\Models\StudentSubjectAssignment;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the instructor dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Debug logging
        Log::info('Dashboard accessed by user: ' . $user->id . ' - ' . $user->name);
        
        // Get instructor's assigned subjects (new system)
        $assignedSubjects = InstructorSubjectAssignment::with([
            'subject.course', 
            'academicLevel', 
            'gradingPeriod'
        ])
        ->where('instructor_id', $user->id)
        ->where('is_active', true)
        ->get();
        
        // Debug logging
        Log::info('Found assigned subjects: ' . $assignedSubjects->count());
        foreach($assignedSubjects as $subject) {
            Log::info('Subject: ' . $subject->subject->name . ' (ID: ' . $subject->subject_id . ')');
        }
        
        // Get students enrolled in each assigned subject
        $subjectsWithStudents = $assignedSubjects->map(function ($assignment) {
            $enrolledStudents = StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->where('is_active', true)
                ->get();
            
            // Debug logging
            Log::info('Subject ' . $assignment->subject->name . ' has ' . $enrolledStudents->count() . ' students');
            
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
        
        // Get recent grades entered by this instructor
        $recentGrades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedSubjects) {
                $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
            })
            ->latest()
            ->take(5)
            ->get();
        
        // Get upcoming grading deadlines
        $upcomingDeadlines = $this->getUpcomingDeadlines();
        
        // Get basic stats
        $stats = $this->getStats();
        
        // Debug logging
        Log::info('Dashboard data prepared - Subjects: ' . $subjectsWithStudents->count() . ', Stats: ' . json_encode($stats));
        
        return Inertia::render('Instructor/Dashboard', [
            'user' => $user,
            'assignedSubjects' => $subjectsWithStudents,
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
        
        // Get assigned subjects
        $assignedSubjects = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        // Count students in assigned subjects
        $studentCount = StudentSubjectAssignment::whereIn('subject_id', $assignedSubjects->pluck('subject_id'))
            ->where('is_active', true)
            ->distinct('student_id')
            ->count('student_id');
        
        // Count grades entered
        $gradesEntered = StudentGrade::whereHas('subject', function ($query) use ($assignedSubjects) {
            $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
        })->count();
        
        // Count pending validations
        $pendingValidations = StudentGrade::whereHas('subject', function ($query) use ($assignedSubjects) {
            $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
        })->where('is_submitted_for_validation', true)->count();
        
        return [
            'assigned_courses' => $assignedSubjects->count(),
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
        
        $assignedSubjects = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('is_active', true)
            ->get();
        
        return StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedSubjects) {
                $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
            })
            ->latest()
            ->take(10)
            ->get();
    }
    
    /**
     * Get upcoming grading deadlines.
     */
    private function getUpcomingDeadlines()
    {
        // This would typically come from a grading deadlines table
        // For now, return empty array
        return [];
    }
    
    /**
     * Debug method to test dashboard data.
     */
    public function debugDashboard()
    {
        $user = Auth::user();
        
        // Get instructor's assigned subjects
        $assignedSubjects = InstructorSubjectAssignment::with([
            'subject.course', 
            'academicLevel', 
            'gradingPeriod'
        ])
        ->where('instructor_id', $user->id)
        ->where('is_active', true)
        ->get();
        
        // Get students enrolled in each assigned subject
        $subjectsWithStudents = $assignedSubjects->map(function ($assignment) {
            $enrolledStudents = StudentSubjectAssignment::with(['student'])
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
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
            ],
            'assignedSubjects' => $subjectsWithStudents,
            'debug_info' => [
                'total_assignments' => $assignedSubjects->count(),
                'total_students' => $subjectsWithStudents->sum('student_count'),
                'database_queries' => [
                    'instructor_assignments' => InstructorSubjectAssignment::where('instructor_id', $user->id)->count(),
                    'student_enrollments' => StudentSubjectAssignment::count(),
                ]
            ]
        ]);
    }
}
