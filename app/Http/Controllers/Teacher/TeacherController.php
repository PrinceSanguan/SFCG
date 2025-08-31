<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\TeacherSubjectAssignment;
use App\Models\StudentGrade;
use App\Models\User;
use App\Models\ActivityLog;

class TeacherController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Check if user is a teacher
        if (!$user || $user->user_role !== 'teacher') {
            abort(403, 'Unauthorized. You must be a teacher to access this resource.');
        }
        
        // Get teacher's assigned subjects (Senior High School level only)
        $assignedSubjects = TeacherSubjectAssignment::with([
            'subject.course',
            'academicLevel',
            'gradingPeriod',
            'enrolledStudents.student'
        ])
        ->where('teacher_id', $user->id)
        ->where('is_active', true)
        ->whereHas('academicLevel', function ($query) {
            $query->where('key', 'senior_highschool');
        })
        ->get()
        ->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'subject' => [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ],
                'academicLevel' => [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ],
                'gradingPeriod' => $assignment->gradingPeriod ? [
                    'id' => $assignment->gradingPeriod->id,
                    'name' => $assignment->gradingPeriod->name,
                ] : null,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $assignment->enrolledStudents->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                        'school_year' => $enrollment->school_year,
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                    ];
                }),
                'student_count' => $assignment->enrolledStudents->count(),
            ];
        });

        // Get recent grades entered by this teacher (Senior High School level only)
        $recentGrades = StudentGrade::with([
            'student',
            'subject',
            'academicLevel',
            'gradingPeriod'
        ])
        ->whereHas('teacherSubjectAssignment', function ($query) use ($user) {
            $query->where('teacher_id', $user->id)
                ->whereHas('academicLevel', function ($q) {
                    $q->where('key', 'senior_highschool');
                });
        })
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($grade) {
            return [
                'id' => $grade->id,
                'student' => [
                    'id' => $grade->student->id,
                    'name' => $grade->student->name,
                ],
                'subject' => [
                    'id' => $grade->subject->id,
                    'name' => $grade->subject->name,
                ],
                'academicLevel' => [
                    'id' => $grade->academicLevel->id,
                    'name' => $grade->academicLevel->name,
                ],
                'gradingPeriod' => $grade->gradingPeriod ? [
                    'id' => $grade->gradingPeriod->id,
                    'name' => $grade->gradingPeriod->name,
                ] : null,
                'grade' => $grade->grade,
                'school_year' => $grade->school_year,
                'created_at' => $grade->created_at,
            ];
        });

        // Calculate stats
        $stats = [
            'assigned_courses' => $assignedSubjects->count(),
            'student_count' => $assignedSubjects->sum('student_count'),
            'grades_entered' => StudentGrade::whereHas('teacherSubjectAssignment', function ($query) use ($user) {
                $query->where('teacher_id', $user->id)
                    ->whereHas('academicLevel', function ($q) {
                        $q->where('key', 'senior_highschool');
                    });
            })->count(),
            'pending_validations' => 0, // Placeholder for future implementation
        ];

        // Placeholder for upcoming deadlines
        $upcomingDeadlines = [];

        return Inertia::render('Teacher/Dashboard', [
            'user' => $user,
            'assignedSubjects' => $assignedSubjects,
            'recentGrades' => $recentGrades,
            'upcomingDeadlines' => $upcomingDeadlines,
            'stats' => $stats,
        ]);
    }
}
