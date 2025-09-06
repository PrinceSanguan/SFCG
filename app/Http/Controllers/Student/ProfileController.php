<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentSubjectAssignment;
use App\Models\StudentGrade;
use App\Models\User;

class ProfileController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        if (!$user) {
            abort(401, 'User not authenticated');
        }
        
        $currentSchoolYear = '2024-2025'; // Use the current active school year
        
        // Load linked parents with relationship details
        $user->load(['parents' => function ($query) {
            $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
        }]);

        // Load assigned subjects with teacher information
        $assignedSubjects = StudentSubjectAssignment::with([
            'subject.course',
            'subject.academicLevel',
            'subject.teacherAssignments.teacher' => function ($query) use ($currentSchoolYear) {
                $query->where('school_year', $currentSchoolYear)
                      ->where('is_active', true);
            }
        ])
        ->where('student_id', $user->id)
        ->where('school_year', $currentSchoolYear)
        ->where('is_active', true)
        ->orderBy('semester')
        ->orderBy('created_at')
        ->get();

        // Load grades for each subject
        $subjectGrades = StudentGrade::with([
            'subject',
            'gradingPeriod',
            'validatedBy',
            'approvedBy'
        ])
        ->where('student_id', $user->id)
        ->where('school_year', $currentSchoolYear)
        ->get()
        ->groupBy('subject_id');
        
        return Inertia::render('Student/Profile', [
            'user' => $user,
            'assignedSubjects' => $assignedSubjects,
            'subjectGrades' => $subjectGrades,
            'currentSchoolYear' => $currentSchoolYear,
        ]);
    }
}
