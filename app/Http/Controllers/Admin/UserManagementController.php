<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'admin_count' => User::where('user_role', 'admin')->count(),
            'instructor_count' => User::where('user_role', 'instructor')->count(),
            'teacher_count' => User::where('user_role', 'teacher')->count(),
            'adviser_count' => User::where('user_role', 'adviser')->count(),
            'chairperson_count' => User::where('user_role', 'chairperson')->count(),
            'principal_count' => User::where('user_role', 'principal')->count(),
            'student_count' => User::where('user_role', 'student')->count(),
            'parent_count' => User::where('user_role', 'parent')->count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentActivities = ActivityLog::with(['user', 'targetUser'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'user' => auth()->user(),
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role') && $request->get('role') !== 'all') {
            $query->where('user_role', $request->get('role'));
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/AccountManagement/List', [
            'user' => auth()->user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/AccountManagement/Create', [
            'user' => auth()->user(),
            'roles' => User::getAvailableRoles(),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'user_role' => 'required|in:admin,instructor,teacher,adviser,chairperson,principal,student,parent',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
            'password' => Hash::make($request->password),
        ]);

        // Log the activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
            'action' => 'created_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
                'created_by' => auth()->user()->name ?? 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Redirect based on role
        $roleRedirects = [
            'instructor' => route('instructor.dashboard'),
            'teacher' => route('teacher.dashboard'),
            'adviser' => route('adviser.dashboard'),
            'chairperson' => route('chairperson.dashboard'),
            'principal' => route('principal.dashboard'),
            'student' => route('student.dashboard'),
            'parent' => route('parent.dashboard'),
        ];

        $redirectUrl = $roleRedirects[$user->user_role] ?? route('admin.users.index');

        return redirect($redirectUrl)->with('success', 'User created successfully!');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load(['activityLogs', 'targetActivityLogs.user']);

        $activityLogs = ActivityLog::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('target_user_id', $user->id);
        })
        ->with(['user', 'targetUser'])
        ->latest()
        ->paginate(20);

        return Inertia::render('Admin/AccountManagement/View', [
            'user' => auth()->user(),
            'targetUser' => $user,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/AccountManagement/Edit', [
            'user' => auth()->user(),
            'targetUser' => $user,
            'roles' => User::getAvailableRoles(),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'user_role' => 'required|in:admin,instructor,teacher,adviser,chairperson,principal,student,parent',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $originalData = $user->toArray();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
        ]);

        // Log the activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
            'action' => 'updated_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'original' => $originalData,
                'updated' => $user->toArray(),
                'updated_by' => auth()->user()->name ?? 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $userData = $user->toArray();

        // Log the activity before deletion
        ActivityLog::create([
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
            'action' => 'deleted_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'deleted_user' => $userData,
                'deleted_by' => auth()->user()->name ?? 'System',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully!');
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $newPassword = Str::random(12);
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Log the activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
            'action' => 'reset_password',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'target_user' => $user->name,
                'reset_by' => auth()->user()->name ?? 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', "Password reset successfully! New password: {$newPassword}");
    }

    /**
     * Get user profile data (API endpoint).
     */
    public function profile(User $user)
    {
        $user->load(['activityLogs', 'targetActivityLogs.user']);

        return response()->json([
            'user' => $user,
            'activity_logs' => $user->targetActivityLogs()->with('user')->latest()->take(10)->get(),
        ]);
    }

    /**
     * API endpoint for user data (for datatables/search).
     */
    public function apiIndex(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->get('role') !== 'all') {
            $query->where('user_role', $request->get('role'));
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Get stats for dashboard.
     */
    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'role_breakdown' => User::selectRaw('user_role, COUNT(*) as count')
                ->groupBy('user_role')
                ->pluck('count', 'user_role'),
            'recent_registrations' => User::whereDate('created_at', '>=', now()->subDays(7))->count(),
            'active_users' => User::whereDate('last_login_at', '>=', now()->subDays(30))->count(),
        ]);
    }
}
