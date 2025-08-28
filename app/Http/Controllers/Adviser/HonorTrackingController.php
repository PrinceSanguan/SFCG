<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorResult;
use App\Models\HonorType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HonorTrackingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->get();

        $academicLevels = $assignments->pluck('academicLevel')->filter()->unique('id')->values();
        $honorTypes = HonorType::all();

        return Inertia::render('Adviser/Honors/Index', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'schoolYear' => $schoolYear,
            'assignedCourses' => $assignments,
        ]);
    }

    public function showByLevel(AcademicLevel $academicLevel)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        $hasAssignment = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('academic_level_id', $academicLevel->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->exists();

        if (!$hasAssignment) {
            abort(403, 'You are not assigned to this academic level.');
        }

        $honorResults = HonorResult::with(['student', 'honorType'])
            ->where('academic_level_id', $academicLevel->id)
            ->where('school_year', $schoolYear)
            ->get();

        $groupedResults = $honorResults->groupBy('honor_type_id');
        $honorTypes = HonorType::all();

        return Inertia::render('Adviser/Honors/ShowByLevel', [
            'user' => $user,
            'academicLevel' => $academicLevel,
            'honorResults' => $groupedResults,
            'honorTypes' => $honorTypes,
            'schoolYear' => $schoolYear,
        ]);
    }

    public function getHonorResults(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $hasAssignment = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('academic_level_id', $request->academic_level_id)
            ->where('school_year', $request->school_year)
            ->where('is_active', true)
            ->exists();

        if (!$hasAssignment) {
            abort(403, 'You are not assigned to this academic level.');
        }

        $honorResults = HonorResult::with(['student', 'honorType'])
            ->where('academic_level_id', $request->academic_level_id)
            ->where('school_year', $request->school_year)
            ->get();

        return response()->json($honorResults);
    }

    public function getStatistics(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $hasAssignment = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('academic_level_id', $request->academic_level_id)
            ->where('school_year', $request->school_year)
            ->where('is_active', true)
            ->exists();

        if (!$hasAssignment) {
            abort(403, 'You are not assigned to this academic level.');
        }

        $honorResults = HonorResult::with(['honorType'])
            ->where('academic_level_id', $request->academic_level_id)
            ->where('school_year', $request->school_year)
            ->get();

        $statistics = [
            'total_honors' => $honorResults->count(),
            'by_type' => $honorResults->groupBy('honor_type_id')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'average_gpa' => $group->avg('gpa'),
                ];
            }),
            'average_gpa' => $honorResults->avg('gpa'),
            'overridden_count' => $honorResults->where('is_overridden', true)->count(),
        ];

        return response()->json($statistics);
    }
}


