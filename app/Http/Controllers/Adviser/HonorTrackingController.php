<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorResult;
use App\Models\HonorType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->get();

        $academicLevels = $assignments->pluck('academicLevel')->filter()->unique('id')->values();
        $academicLevelIds = $academicLevels->pluck('id');

        // Only show Basic Education honor types (With Honors, With High Honors, With Highest Honors)
        // Filter OUT college-only honors (Dean's List, Cum Laude, Magna Cum Laude, Summa Cum Laude, College Honors)
        $honorTypes = HonorType::where('scope', 'basic')->get();

        Log::info('[Adviser] Honor Tracking Index - Honor Types Filtered', [
            'total_honor_types' => $honorTypes->count(),
            'honor_types' => $honorTypes->pluck('name', 'key')->toArray(),
            'scope' => 'basic',
            'user_id' => $user->id,
            'user_role' => $user->user_role,
        ]);

        // Get honor statistics for adviser's assigned academic levels
        $allHonorResults = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->whereIn('academic_level_id', $academicLevelIds)
            ->where('school_year', $schoolYear)
            ->get();

        // Calculate statistics for each academic level
        $academicLevelStats = $academicLevels->map(function ($level) use ($allHonorResults, $schoolYear) {
            $levelResults = $allHonorResults->where('academic_level_id', $level->id);

            return [
                'id' => $level->id,
                'name' => $level->name,
                'key' => $level->key,
                'total_students' => $levelResults->pluck('student_id')->unique()->count(),
                'qualified_honors' => $levelResults->count(),
                'approved_honors' => $levelResults->where('is_approved', true)->count(),
                'pending_honors' => $levelResults->where('is_pending_approval', true)->count(),
                'rejected_honors' => $levelResults->where('is_rejected', true)->count(),
                'average_gpa' => $levelResults->avg('gpa') ?: 0,
            ];
        });

        // Overall statistics
        $overallStats = [
            'total_honor_students' => $allHonorResults->pluck('student_id')->unique()->count(),
            'total_qualified' => $allHonorResults->count(),
            'total_approved' => $allHonorResults->where('is_approved', true)->count(),
            'total_pending' => $allHonorResults->where('is_pending_approval', true)->count(),
            'with_highest_honors' => $allHonorResults->where('honorType.key', 'with_highest_honors')->where('is_approved', true)->count(),
            'with_high_honors' => $allHonorResults->where('honorType.key', 'with_high_honors')->where('is_approved', true)->count(),
            'with_honors' => $allHonorResults->where('honorType.key', 'with_honors')->where('is_approved', true)->count(),
            'average_gpa' => $allHonorResults->avg('gpa') ?: 0,
        ];

        return Inertia::render('Adviser/Honors/Index', [
            'user' => $user,
            'academicLevels' => $academicLevelStats,
            'honorTypes' => $honorTypes,
            'schoolYear' => $schoolYear,
            'assignedCourses' => $assignments,
            'overallStats' => $overallStats,
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
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->exists();

        if (!$hasAssignment) {
            abort(403, 'You are not assigned to this academic level.');
        }

        $honorResults = HonorResult::with(['student', 'honorType', 'approvedBy', 'rejectedBy'])
            ->where('academic_level_id', $academicLevel->id)
            ->where('school_year', $schoolYear)
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform results to include status information
        $transformedResults = $honorResults->map(function ($result) {
            $status = 'pending';
            $statusColor = 'yellow';
            if ($result->is_approved) {
                $status = 'approved';
                $statusColor = 'green';
            } elseif ($result->is_rejected) {
                $status = 'rejected';
                $statusColor = 'red';
            }

            return [
                'id' => $result->id,
                'student' => $result->student,
                'honorType' => $result->honorType,
                'gpa' => $result->gpa,
                'school_year' => $result->school_year,
                'status' => $status,
                'status_color' => $statusColor,
                'is_approved' => $result->is_approved,
                'is_pending_approval' => $result->is_pending_approval,
                'is_rejected' => $result->is_rejected,
                'approved_at' => $result->approved_at,
                'approved_by' => $result->approvedBy,
                'rejected_at' => $result->rejected_at,
                'rejected_by' => $result->rejectedBy,
                'rejection_reason' => $result->rejection_reason,
                'is_overridden' => $result->is_overridden,
                'override_reason' => $result->override_reason,
                'created_at' => $result->created_at,
            ];
        });

        $groupedResults = $transformedResults->groupBy('honorType.id');

        // Only show Basic Education honor types (With Honors, With High Honors, With Highest Honors)
        // Filter OUT college-only honors (Dean's List, Cum Laude, Magna Cum Laude, Summa Cum Laude, College Honors)
        $honorTypes = HonorType::where('scope', 'basic')->get();

        Log::info('[Adviser] Honor Tracking ShowByLevel - Honor Types Filtered', [
            'total_honor_types' => $honorTypes->count(),
            'honor_types' => $honorTypes->pluck('name', 'key')->toArray(),
            'scope' => 'basic',
            'academic_level_id' => $academicLevel->id,
            'academic_level_name' => $academicLevel->name,
            'user_id' => $user->id,
        ]);

        // Calculate statistics for this level
        $levelStats = [
            'total_qualified' => $honorResults->count(),
            'total_approved' => $honorResults->where('is_approved', true)->count(),
            'total_pending' => $honorResults->where('is_pending_approval', true)->count(),
            'total_rejected' => $honorResults->where('is_rejected', true)->count(),
            'average_gpa' => $honorResults->avg('gpa') ?: 0,
        ];

        return Inertia::render('Adviser/Honors/ShowByLevel', [
            'user' => $user,
            'academicLevel' => $academicLevel,
            'honorResults' => $groupedResults,
            'transformedResults' => $transformedResults,
            'honorTypes' => $honorTypes,
            'schoolYear' => $schoolYear,
            'levelStats' => $levelStats,
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
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
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
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
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


