<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user', 'targetUser']);

        // Filter by action
        if ($request->filled('action') && $request->get('action') !== 'all') {
            $query->where('action', $request->get('action'));
        }

        // Filter by user
        if ($request->filled('user_id') && $request->get('user_id') !== 'all') {
            $query->where('user_id', $request->get('user_id'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('entity_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('targetUser', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $activityLogs = $query->paginate(20)->withQueryString();

        // Get available actions for filter
        $availableActions = ActivityLog::distinct('action')->pluck('action')->sort();

        // Get users for filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'user' => Auth::user(),
            'activityLogs' => $activityLogs,
            'filters' => $request->only(['action', 'user_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_direction']),
            'availableActions' => $availableActions,
            'users' => $users,
        ]);
    }

    /**
     * Get activity logs for a specific user.
     */
    public function userLogs(Request $request, User $user)
    {
        $query = ActivityLog::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('target_user_id', $user->id);
        })->with(['user', 'targetUser']);

        // Filter by action
        if ($request->filled('action') && $request->get('action') !== 'all') {
            $query->where('action', $request->get('action'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        $activityLogs = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/ActivityLogs/UserLogs', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'activityLogs' => $activityLogs,
            'filters' => $request->only(['action', 'date_from', 'date_to']),
            'availableActions' => ActivityLog::distinct('action')->pluck('action')->sort(),
        ]);
    }

    /**
     * Get recent activities (API endpoint).
     */
    public function recentActivities(Request $request)
    {
        $limit = $request->get('limit', 10);
        
        $activities = ActivityLog::with(['user', 'targetUser'])
            ->latest()
            ->take($limit)
            ->get();

        return response()->json($activities);
    }

    /**
     * Get activity statistics.
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());

        $stats = [
            'total_activities' => ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'activities_by_action' => ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
            'activities_by_day' => ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
            'most_active_users' => ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('user_id, COUNT(*) as count')
                ->with('user:id,name,email')
                ->groupBy('user_id')
                ->orderByDesc('count')
                ->take(10)
                ->get(),
        ];

        return response()->json($stats);
    }
}
