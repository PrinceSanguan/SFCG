<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get statistics
        $stats = [
            'total_students' => User::where('user_role', 'student')->count(),
            'total_teachers' => User::whereIn('user_role', ['teacher', 'instructor'])->count(),
            'pending_grades' => StudentGrade::where('is_submitted_for_validation', true)
                ->where('is_approved', false)
                ->where('is_returned', false)
                ->count(),
            'pending_honors' => HonorResult::where('is_pending_approval', true)
                ->where('is_approved', false)
                ->where('is_rejected', false)
                ->count(),
            'approved_grades_today' => StudentGrade::where('is_approved', true)
                ->whereDate('approved_at', today())
                ->count(),
            'approved_honors_today' => HonorResult::where('is_approved', true)
                ->whereDate('approved_at', today())
                ->count(),
        ];
        
        // Get recent activities
        $recentActivities = ActivityLog::with(['user', 'targetUser'])
            ->latest()
            ->limit(10)
            ->get();
        
        // Get recent grade submissions
        $recentGrades = StudentGrade::where('is_submitted_for_validation', true)
            ->with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
            ->latest('submitted_at')
            ->limit(5)
            ->get();
        
        // Get recent honor submissions
        $recentHonors = HonorResult::where('is_pending_approval', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->limit(5)
            ->get();
        
        return Inertia::render('Principal/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'recentGrades' => $recentGrades,
            'recentHonors' => $recentHonors,
        ]);
    }
}
