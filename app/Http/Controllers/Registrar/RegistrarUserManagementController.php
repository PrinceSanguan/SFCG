<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Registrar User Management Controller
 * 
 * Handles user management operations for registrars.
 * Registrars can view and edit users but cannot create new accounts.
 */
class RegistrarUserManagementController extends Controller
{
    /**
     * Display a listing of users (excluding admins).
     */
    public function index(Request $request)
    {
        $query = User::where('user_role', '!=', 'admin');

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

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        // Registrars cannot view admin users
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot view admin users.');
        }

        $activityLogs = ActivityLog::where('user_id', $user->id)
            ->orWhere('target_user_id', $user->id)
            ->with(['user', 'targetUser'])
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Registrar/Users/Show', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        // Registrars cannot edit admin users
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot edit admin users.');
        }

        return Inertia::render('Registrar/Users/Edit', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'roles' => User::getAvailableRoles(),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        // Registrars cannot edit admin users
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot edit admin users.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'user_role' => 'required|string|in:' . implode(',', array_keys(User::getAvailableRoles())),
        ]);

        // Registrars cannot change users to admin role
        if ($validated['user_role'] === 'admin') {
            abort(403, 'Access denied. Cannot assign admin role.');
        }

        $user->update($validated);

        // Log the activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'updated_user',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'details' => ['changes' => $validated],
        ]);

        return redirect()->route('registrar.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        // Registrars cannot reset admin passwords
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot reset admin passwords.');
        }

        $newPassword = Str::random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        // Log the activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'reset_password',
            'entity_type' => 'User',
            'entity_id' => $user->id,
        ]);

        return back()->with('success', 'Password reset successfully. New password: ' . $newPassword);
    }

    /**
     * Get user profile data for API calls.
     */
    public function profile(User $user)
    {
        // Registrars cannot view admin profiles
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot view admin profiles.');
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_role' => $user->user_role,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Display users by specific role.
     */
    public function indexByRole(Request $request, $role)
    {
        // Registrars cannot view admin users
        if ($role === 'admin') {
            abort(403, 'Access denied. Cannot view admin users.');
        }

        $query = User::where('user_role', $role);

        // Handle year_level filtering for students
        if ($role === 'student' && $request->has('year_level')) {
            $yearLevel = $request->get('year_level');
            $query->where('year_level', $yearLevel);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction', 'year_level']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => $role,
        ]);
    }

    /**
     * Display students (special case for students index).
     */
    public function indexStudents(Request $request)
    {
        $query = User::where('user_role', 'student');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
        ]);
    }

    /**
     * Display administrators.
     */
    public function indexAdministrators(Request $request)
    {
        $query = User::where('user_role', 'administrator');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'administrator',
        ]);
    }

    /**
     * Display registrars.
     */
    public function indexRegistrars(Request $request)
    {
        $query = User::where('user_role', 'registrar');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'registrar',
        ]);
    }

    /**
     * Display principals.
     */
    public function indexPrincipals(Request $request)
    {
        $query = User::where('user_role', 'principal');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'principal',
        ]);
    }

    /**
     * Display chairpersons.
     */
    public function indexChairpersons(Request $request)
    {
        $query = User::where('user_role', 'chairperson');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'chairperson',
        ]);
    }

    /**
     * Display teachers.
     */
    public function indexTeachers(Request $request)
    {
        $query = User::where('user_role', 'teacher');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'teacher',
        ]);
    }

    /**
     * Display instructors.
     */
    public function indexInstructors(Request $request)
    {
        $query = User::where('user_role', 'instructor');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'instructor',
        ]);
    }

    /**
     * Display advisers.
     */
    public function indexAdvisers(Request $request)
    {
        $query = User::where('user_role', 'adviser');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'adviser',
        ]);
    }

    /**
     * Show user by role.
     */
    public function showByRole(Request $request, $role, User $user)
    {
        // Registrars cannot view admin users
        if ($role === 'admin' || $user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot view admin users.');
        }

        return $this->show($user);
    }

    /**
     * Edit user by role.
     */
    public function editByRole(Request $request, $role, User $user)
    {
        // Registrars cannot edit admin users
        if ($role === 'admin' || $user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot edit admin users.');
        }

        return $this->edit($user);
    }

    /**
     * Update user by role.
     */
    public function updateByRole(Request $request, $role, User $user)
    {
        // Registrars cannot edit admin users
        if ($role === 'admin' || $user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot edit admin users.');
        }

        return $this->update($request, $user);
    }

    /**
     * Reset password by role.
     */
    public function resetPasswordByRole(Request $request, $role, User $user)
    {
        // Registrars cannot reset admin passwords
        if ($role === 'admin' || $user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot reset admin passwords.');
        }

        return $this->resetPassword($request, $user);
    }

    /**
     * Get users data for API calls.
     */
    public function apiIndex(Request $request)
    {
        $query = User::where('user_role', '!=', 'admin');

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

        $users = $query->get(['id', 'name', 'email', 'user_role', 'created_at']);

        return response()->json($users);
    }

    /**
     * Get user statistics for dashboard.
     */
    public function stats()
    {
        $stats = [
            'total_users' => User::where('user_role', '!=', 'admin')->count(),
            'admin_count' => User::where('user_role', 'admin')->count(),
            'registrar_count' => User::where('user_role', 'registrar')->count(),
            'instructor_count' => User::where('user_role', 'instructor')->count(),
            'teacher_count' => User::where('user_role', 'teacher')->count(),
            'adviser_count' => User::where('user_role', 'adviser')->count(),
            'chairperson_count' => User::where('user_role', 'chairperson')->count(),
            'principal_count' => User::where('user_role', 'principal')->count(),
            'student_count' => User::where('user_role', 'student')->count(),
            'parent_count' => User::where('user_role', 'parent')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Delete a user.
     */
    public function destroy(User $user)
    {
        // Registrars cannot delete admin users
        if ($user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot delete admin users.');
        }

        // Log the deletion
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_user',
            'target_user_id' => $user->id,
            'details' => "Deleted user: {$user->name} ({$user->email})",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Delete a user by role.
     */
    public function destroyByRole(Request $request, $role, User $user)
    {
        // Registrars cannot delete admin users
        if ($role === 'admin' || $user->user_role === 'admin') {
            abort(403, 'Access denied. Cannot delete admin users.');
        }

        // Log the deletion
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_user',
            'target_user_id' => $user->id,
            'details' => "Deleted {$role}: {$user->name} ({$user->email})",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $user->delete();

        return redirect()->back()->with('success', ucfirst($role) . ' deleted successfully.');
    }

    /**
     * Display elementary students.
     */
    public function indexElementary(Request $request)
    {
        $query = User::where('user_role', 'student')->where('year_level', 'elementary');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'elementary',
        ]);
    }

    /**
     * Display junior highschool students.
     */
    public function indexJuniorHighschool(Request $request)
    {
        $query = User::where('user_role', 'student')->where('year_level', 'junior_highschool');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'junior_highschool',
        ]);
    }

    /**
     * Display senior highschool students.
     */
    public function indexSeniorHighschool(Request $request)
    {
        $query = User::where('user_role', 'student')->where('year_level', 'senior_highschool');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'senior_highschool',
        ]);
    }

    /**
     * Display college students.
     */
    public function indexCollege(Request $request)
    {
        $query = User::where('user_role', 'student')->where('year_level', 'college');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'college',
        ]);
    }
}
