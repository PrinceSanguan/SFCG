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
        Log::info('[TEACHER DASHBOARD] Dashboard accessed', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'school_year' => $schoolYear
        ]);

        // Get teacher's assigned subjects (Senior High School only)
        $assignedSubjects = TeacherSubjectAssignment::with([
            'subject.course',
            'academicLevel',
            'gradingPeriod'
        ])
        ->where('teacher_id', $user->id)
        ->where('is_active', true)
        ->where('school_year', $schoolYear)
        ->whereHas('academicLevel', function ($query) {
            $query->where('key', 'senior_highschool');
        })
        ->get();

        // Debug logging
        Log::info('[TEACHER DASHBOARD] Found assigned subjects', [
            'total_assignments' => $assignedSubjects->count(),
            'school_year' => $schoolYear,
            'assignments' => $assignedSubjects->map(function($s) {
                return [
                    'assignment_id' => $s->id,
                    'subject_id' => $s->subject_id,
                    'subject_name' => $s->subject->name,
                    'grading_period_id' => $s->grading_period_id,
                    'grading_period_name' => $s->gradingPeriod?->name ?? 'N/A'
                ];
            })->toArray()
        ]);

        // Group assignments by subject_id to prevent duplicates
        $groupedBySubject = $assignedSubjects->groupBy('subject_id');

        Log::info('[TEACHER DASHBOARD] Grouped by subject', [
            'unique_subjects' => $groupedBySubject->count(),
            'subjects' => $groupedBySubject->keys()->toArray()
        ]);

        // Get students enrolled in each assigned subject (merged from all assignments)
        $subjectsWithStudents = $groupedBySubject->map(function ($assignments, $subjectId) use ($schoolYear) {
            // Use the first assignment for subject details
            $firstAssignment = $assignments->first();

            // Get all grading periods this teacher is assigned to for this subject
            $assignedGradingPeriods = $assignments->pluck('gradingPeriod')->filter()->unique('id')->values();

            // Get enrolled students for this subject (deduplicated by student_id)
            $enrolledStudents = StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $subjectId)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->get()
                ->unique('student_id') // Deduplicate by student_id
                ->values()
                ->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => $enrollment->student,
                        'school_year' => $enrollment->school_year,
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                    ];
                });

            // Debug logging
            Log::info('[TEACHER DASHBOARD] Subject enrollment', [
                'subject_id' => $subjectId,
                'subject_name' => $firstAssignment->subject->name,
                'enrolled_students' => $enrolledStudents->count(),
                'grading_periods' => $assignedGradingPeriods->pluck('name')->toArray()
            ]);

            return [
                'id' => $firstAssignment->id,
                'subject' => $firstAssignment->subject,
                'academicLevel' => $firstAssignment->academicLevel,
                'gradingPeriod' => $firstAssignment->gradingPeriod, // Primary grading period
                'gradingPeriods' => $assignedGradingPeriods, // All assigned grading periods
                'school_year' => $firstAssignment->school_year,
                'is_active' => $firstAssignment->is_active,
                'enrolled_students' => $enrolledStudents,
                'student_count' => $enrolledStudents->count(),
            ];
        })->values(); // Reset keys to ensure proper JSON encoding
        
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

        // Get assigned subjects for the specific school year (SHS only)
        $assignedSubjects = TeacherSubjectAssignment::where('teacher_id', $user->id)
            ->where('is_active', true)
            ->where('school_year', $schoolYear)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'senior_highschool');
            })
            ->get();

        // Get unique subject IDs (to avoid counting duplicates from multiple grading periods)
        $uniqueSubjectIds = $assignedSubjects->pluck('subject_id')->unique();

        Log::info('[TEACHER DASHBOARD] Stats calculation', [
            'total_assignments' => $assignedSubjects->count(),
            'unique_subjects' => $uniqueSubjectIds->count(),
            'school_year' => $schoolYear
        ]);

        // Count students in assigned subjects for the specific school year
        $studentCount = StudentSubjectAssignment::whereIn('subject_id', $uniqueSubjectIds)
            ->where('is_active', true)
            ->where('school_year', $schoolYear)
            ->distinct('student_id')
            ->count('student_id');

        // Count grades entered for the specific school year
        $gradesEntered = StudentGrade::whereHas('subject', function ($query) use ($uniqueSubjectIds) {
            $query->whereIn('id', $uniqueSubjectIds);
        })->where('school_year', $schoolYear)->count();

        // Count pending validations for the specific school year
        $pendingValidations = StudentGrade::whereHas('subject', function ($query) use ($uniqueSubjectIds) {
            $query->whereIn('id', $uniqueSubjectIds);
        })->where('school_year', $schoolYear)->where('is_submitted_for_validation', true)->count();

        return [
            'assigned_courses' => $uniqueSubjectIds->count(), // Use unique count
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
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'senior_highschool');
            })
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
        $schoolYear = request('school_year', '2024-2025');

        // Get teacher's assigned subjects (SHS only)
        $assignedSubjects = TeacherSubjectAssignment::with([
            'subject.course',
            'academicLevel',
            'gradingPeriod'
        ])
        ->where('teacher_id', $user->id)
        ->where('is_active', true)
        ->where('school_year', $schoolYear)
        ->whereHas('academicLevel', function ($query) {
            $query->where('key', 'senior_highschool');
        })
        ->get();

        // Group assignments by subject_id to prevent duplicates
        $groupedBySubject = $assignedSubjects->groupBy('subject_id');

        // Get students enrolled in each assigned subject (merged from all assignments)
        $subjectsWithStudents = $groupedBySubject->map(function ($assignments, $subjectId) use ($schoolYear) {
            $firstAssignment = $assignments->first();
            $assignedGradingPeriods = $assignments->pluck('gradingPeriod')->filter()->unique('id')->values();

            $enrolledStudents = StudentSubjectAssignment::with(['student'])
                ->where('subject_id', $subjectId)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->get()
                ->unique('student_id')
                ->values();

            return [
                'id' => $firstAssignment->id,
                'subject' => $firstAssignment->subject,
                'academicLevel' => $firstAssignment->academicLevel,
                'gradingPeriod' => $firstAssignment->gradingPeriod,
                'gradingPeriods' => $assignedGradingPeriods,
                'school_year' => $firstAssignment->school_year,
                'is_active' => $firstAssignment->is_active,
                'enrolled_students' => $enrolledStudents,
                'student_count' => $enrolledStudents->count(),
            ];
        })->values();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
            ],
            'assignedSubjects' => $subjectsWithStudents,
            'debug_info' => [
                'total_raw_assignments' => $assignedSubjects->count(),
                'unique_subjects' => $groupedBySubject->count(),
                'total_students' => $subjectsWithStudents->sum('student_count'),
                'school_year' => $schoolYear,
                'database_queries' => [
                    'teacher_assignments' => TeacherSubjectAssignment::where('teacher_id', $user->id)->count(),
                    'student_enrollments' => StudentSubjectAssignment::count(),
                ]
            ]
        ]);
    }
}
