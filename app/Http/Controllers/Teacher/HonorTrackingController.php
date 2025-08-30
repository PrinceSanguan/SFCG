<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HonorTrackingController extends Controller
{
    public function index()
    {
        Log::info('Teacher HonorTrackingController@index accessed', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->user_role,
            'timestamp' => now()
        ]);
        
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects
            $assignedSubjects = \App\Models\TeacherSubjectAssignment::with([
                'subject.course', 
                'academicLevel', 
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
            ->get();
            
            // Get honor results for teacher's subjects
            $honorResults = \App\Models\HonorResult::with(['student', 'honorType', 'academicLevel'])
                ->whereHas('student', function ($query) use ($assignedSubjects) {
                    $query->whereIn('id', $assignedSubjects->pluck('subject.id'));
                })
                ->latest()
                ->get();
            
            Log::info('Teacher honors data prepared', [
                'teacher_id' => $user->id,
                'assigned_subjects_count' => $assignedSubjects->count(),
                'honor_results_count' => $honorResults->count()
            ]);

            return Inertia::render('Teacher/Honors/Index', [
                'user' => $user,
                'assignedSubjects' => $assignedSubjects,
                'honorResults' => $honorResults,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher HonorTrackingController@index', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    public function showByLevel($academicLevel)
    {
        return Inertia::render('Teacher/Honors/ShowByLevel', [
            'user' => Auth::user(),
            'academicLevel' => $academicLevel,
        ]);
    }

    public function getHonorResults()
    {
        // Placeholder for getting honor results
        return response()->json([]);
    }

    public function getStatistics()
    {
        // Placeholder for getting honor statistics
        return response()->json([]);
    }
}
