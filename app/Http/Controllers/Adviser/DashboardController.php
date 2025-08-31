<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\ClassAdviserAssignment;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        // Get adviser's class assignments for current school year (Elementary and Junior High School only)
        $assignments = ClassAdviserAssignment::with(['academicLevel', 'adviser'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->orderBy('academic_level_id')
            ->get();

        // Stats (basic for now)
        $sectionsCount = $assignments->count();
        $studentsCount = 0; // TODO: derive from section-to-student mapping when available

        // Only count grades for adviser's assigned subjects
        $subjectIds = $assignments->pluck('subject_id')->filter()->unique();
        $gradesCount = StudentGrade::where('school_year', $schoolYear)
            ->when($subjectIds->isNotEmpty(), function ($q) use ($subjectIds) {
                $q->whereIn('subject_id', $subjectIds);
            }, function ($q) {
                $q->whereRaw('1=0');
            })
            ->count();

        // Recent grades (last 10, restricted to adviser's subjects)
        $recentGrades = StudentGrade::with(['student:id,name', 'subject:id,name', 'academicLevel:id,name', 'gradingPeriod:id,name'])
            ->where('school_year', $schoolYear)
            ->when($subjectIds->isNotEmpty(), function ($q) use ($subjectIds) {
                $q->whereIn('subject_id', $subjectIds);
            }, function ($q) {
                $q->whereRaw('1=0');
            })
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($g) {
                return [
                    'id' => $g->id,
                    'student' => ['id' => $g->student?->id, 'name' => $g->student?->name],
                    'subject' => ['id' => $g->subject?->id, 'name' => $g->subject?->name],
                    'academicLevel' => ['id' => $g->academicLevel?->id, 'name' => $g->academicLevel?->name],
                    'gradingPeriod' => ['id' => $g->gradingPeriod?->id, 'name' => $g->gradingPeriod?->name],
                    'grade' => $g->grade,
                    'school_year' => $g->school_year,
                    'created_at' => $g->created_at?->toISOString(),
                ];
            });

        return Inertia::render('Adviser/Dashboard', [
            'user' => $user,
            'assignments' => $assignments,
            'recentGrades' => $recentGrades,
            'upcomingDeadlines' => [],
            'stats' => [
                'sections' => $sectionsCount,
                'students' => $studentsCount,
                'grades' => $gradesCount,
            ],
            'schoolYear' => $schoolYear,
        ]);
    }
}


