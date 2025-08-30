<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherSubjectAssignment;
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
     * Display the teacher dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025'); // Default school year
        
        // Debug logging
        Log::info('Teacher Dashboard accessed by user: ' . $user->id . ' - ' . $user->name . ' for school year: ' . $schoolYear);
        
        // Get teacher's assigned subjects
        $assignedSubjects = TeacherSubjectAssignment::with([
            'subject.course', 
            'academicLevel', 
            'gradingPeriod'
        ])
        ->where('teacher_id', $user->id)
        ->where('is_active', true)
        ->where('school_year', $schoolYear)
        ->get();
        
        // Debug logging
        Log::info('Found assigned subjects: ' . $assignedSubjects->count() . ' for school year: ' . $schoolYear);
        foreach($assignedSubjects as $subject) {
            Log::info('Subject: ' . $subject->subject->name . ' (ID: ' . $subject->subject_id . ')');
        }
        
        // Get students enrolled in each assigned subject
        $subjectsWithStudents = $assignedSubjects->map(function ($assignment) use ($schoolYear) {
            $enrolledStudents = StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $schoolYear)
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
        
        // Get recent grades entered by this teacher
        $recentGrades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->whereHas('subject', function ($query) use ($assignedSubjects) {
                $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
            })
            ->where('school_year', $schoolYear)
            ->latest()
            ->take(5)
            ->get();
        
        // Get upcoming grading deadlines
        $upcomingDeadlines = $this->getUpcomingDeadlines();
        
        // Get basic stats
        $stats = $this->getStats($schoolYear);
        
        // Debug logging
        Log::info('Dashboard data prepared - Subjects: ' . $subjectsWithStudents->count() . ', Stats: ' . json_encode($stats));
        
        return Inertia::render('Teacher/Dashboard', [
            'user' => $user,
            'assignedSubjects' => $subjectsWithStudents,
            'recentGrades' => $recentGrades,
            'upcomingDeadlines' => $upcomingDeadlines,
            'stats' => $stats,
            'currentSchoolYear' => $schoolYear,
            'debug' => [
                'total_assignments' => $assignedSubjects->count(),
                'total_students' => $subjectsWithStudents->sum('student_count'),
                'school_year' => $schoolYear,
            ]
        ]);
    }
    
    /**
     * Get teacher statistics.
     */
    public function getStats($schoolYear = '2024-2025')
    {
        $user = Auth::user();
        
        // Get assigned subjects for the specific school year
        $assignedSubjects = TeacherSubjectAssignment::where('teacher_id', $user->id)
            ->where('is_active', true)
            ->where('school_year', $schoolYear)
            ->get();
        
        // Count students in assigned subjects for the specific school year
        $studentCount = StudentSubjectAssignment::whereIn('subject_id', $assignedSubjects->pluck('subject_id'))
            ->where('is_active', true)
            ->where('school_year', $schoolYear)
            ->distinct('student_id')
            ->count('student_id');
        
        // Count grades entered for the specific school year
        $gradesEntered = StudentGrade::whereHas('subject', function ($query) use ($assignedSubjects) {
            $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
        })->where('school_year', $schoolYear)->count();
        
        // Count pending validations for the specific school year
        $pendingValidations = StudentGrade::whereHas('subject', function ($query) use ($assignedSubjects) {
            $query->whereIn('id', $assignedSubjects->pluck('subject_id'));
        })->where('school_year', $schoolYear)->where('is_submitted_for_validation', true)->count();
        
        return [
            'assigned_courses' => $assignedSubjects->count(),
            'student_count' => $studentCount,
            'grades_entered' => $gradesEntered,
            'pending_validations' => $pendingValidations,
        ];
    }
    
    /**
     * Get recent grades for the teacher.
     */
    public function getRecentGrades()
    {
        $user = Auth::user();
        
        $assignedSubjects = TeacherSubjectAssignment::where('teacher_id', $user->id)
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
    public function getUpcomingDeadlines()
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
        
        // Get teacher's assigned subjects
        $assignedSubjects = TeacherSubjectAssignment::with([
            'subject.course', 
            'academicLevel', 
            'gradingPeriod'
        ])
        ->where('teacher_id', $user->id)
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
                    'teacher_assignments' => TeacherSubjectAssignment::where('teacher_id', $user->id)->count(),
                    'student_enrollments' => StudentSubjectAssignment::count(),
                ]
            ]
        ]);
    }
}
