<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Mail\UserAccountCreatedEmail;

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

        // Load additional relationships based on user role
        if ($user->user_role === 'student') {
            $user->load([
                'parents' => function ($query) {
                    $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
                },
                'section'
            ]);
        } elseif ($user->user_role === 'parent') {
            $user->load(['students' => function ($query) {
                $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
            }]);
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

        // Send email notification to user
        try {
            $resetBy = Auth::user()->name;
            \Illuminate\Support\Facades\Mail::to($user->email)->send(
                new \App\Mail\PasswordResetByAdminEmail($user, $newPassword, $resetBy)
            );
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());
        }

        return back()->with('success', 'Password reset successfully. The user has been notified via email with their new password.');
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

        \Log::info('[REGISTRAR DELETE] Attempting to delete user', [
            'registrar_id' => Auth::id(),
            'registrar_name' => Auth::user()->name,
            'target_user_id' => $user->id,
            'target_user_name' => $user->name,
            'target_user_email' => $user->email,
            'target_user_role' => $user->user_role,
        ]);

        try {
            // Log the deletion before attempting
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'deleted_user',
                'target_user_id' => $user->id,
                'details' => "Deleted user: {$user->name} ({$user->email})",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $user->delete();

            \Log::info('[REGISTRAR DELETE] User deleted successfully', [
                'user_id' => $user->id,
                'user_name' => $user->name,
            ]);

            return redirect()->back()->with('success', 'User deleted successfully.');

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('[REGISTRAR DELETE] Database error during deletion', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'error_code' => $e->getCode(),
                'error_message' => $e->getMessage(),
                'sql_state' => $e->errorInfo[0] ?? null,
            ]);

            // Check if it's a foreign key constraint error
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'foreign key constraint')) {
                return redirect()->back()->with('error',
                    'Cannot delete this user because they have related records (grades, assignments, etc.). ' .
                    'Please remove all related records first or contact an administrator.'
                );
            }

            return redirect()->back()->with('error', 'Failed to delete user. Please try again or contact support.');

        } catch (\Exception $e) {
            \Log::error('[REGISTRAR DELETE] Unexpected error during deletion', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'An unexpected error occurred. Please try again or contact support.');
        }
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

        \Log::info('[REGISTRAR DELETE BY ROLE] Attempting to delete user', [
            'registrar_id' => Auth::id(),
            'registrar_name' => Auth::user()->name,
            'target_role' => $role,
            'target_user_id' => $user->id,
            'target_user_name' => $user->name,
            'target_user_email' => $user->email,
            'target_user_role' => $user->user_role,
        ]);

        try {
            // Log the deletion before attempting
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'deleted_user',
                'target_user_id' => $user->id,
                'details' => "Deleted {$role}: {$user->name} ({$user->email})",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $user->delete();

            \Log::info('[REGISTRAR DELETE BY ROLE] User deleted successfully', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $role,
            ]);

            return redirect()->back()->with('success', ucfirst($role) . ' deleted successfully.');

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('[REGISTRAR DELETE BY ROLE] Database error during deletion', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $role,
                'error_code' => $e->getCode(),
                'error_message' => $e->getMessage(),
                'sql_state' => $e->errorInfo[0] ?? null,
            ]);

            // Check if it's a foreign key constraint error
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'foreign key constraint')) {
                return redirect()->back()->with('error',
                    'Cannot delete this ' . $role . ' because they have related records (grades, assignments, etc.). ' .
                    'Please remove all related records first or contact an administrator.'
                );
            }

            return redirect()->back()->with('error', 'Failed to delete ' . $role . '. Please try again or contact support.');

        } catch (\Exception $e) {
            \Log::error('[REGISTRAR DELETE BY ROLE] Unexpected error during deletion', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $role,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'An unexpected error occurred. Please try again or contact support.');
        }
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

        // Get academic level ID for elementary
        $academicLevel = \App\Models\AcademicLevel::where('key', 'elementary')->first();
        $sections = [];
        if ($academicLevel) {
            // Get all sections for this academic level
            $sections = \App\Models\Section::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->get(['id', 'name', 'code', 'academic_level_id', 'specific_year_level']);
        }

        // Add specific year levels for elementary
        $allYearLevels = User::getSpecificYearLevels();
        $specificYearLevels = $allYearLevels['elementary'] ?? [];

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'elementary',
            'sections' => $sections,
            'specificYearLevels' => $specificYearLevels,
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

        // Get academic level ID for junior highschool
        $academicLevel = \App\Models\AcademicLevel::where('key', 'junior_highschool')->first();
        $sections = [];
        if ($academicLevel) {
            // Get all sections for this academic level
            $sections = \App\Models\Section::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->get(['id', 'name', 'code', 'academic_level_id', 'specific_year_level']);
        }

        // Add specific year levels for junior highschool
        $allYearLevels = User::getSpecificYearLevels();
        $specificYearLevels = $allYearLevels['junior_highschool'] ?? [];

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'junior_highschool',
            'sections' => $sections,
            'specificYearLevels' => $specificYearLevels,
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

        // Get academic level ID for senior highschool
        $academicLevel = \App\Models\AcademicLevel::where('key', 'senior_highschool')->first();
        $sections = [];
        if ($academicLevel) {
            // Get all sections for this academic level
            $sections = \App\Models\Section::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->get(['id', 'name', 'code', 'academic_level_id', 'specific_year_level', 'track_id', 'strand_id']);
        }

        // Add specific year levels for senior highschool
        $allYearLevels = User::getSpecificYearLevels();
        $specificYearLevels = $allYearLevels['senior_highschool'] ?? [];

        // Get all tracks and strands for SHS
        $tracks = \App\Models\Track::where('is_active', true)->get(['id', 'name', 'code']);
        $strands = \App\Models\Strand::where('is_active', true)->get(['id', 'name', 'code', 'track_id']);

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'senior_highschool',
            'sections' => $sections,
            'specificYearLevels' => $specificYearLevels,
            'tracks' => $tracks,
            'strands' => $strands,
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

        // Get academic level ID for college
        $academicLevel = \App\Models\AcademicLevel::where('key', 'college')->first();
        $sections = [];
        if ($academicLevel) {
            // Get all sections for this academic level
            $sections = \App\Models\Section::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->get(['id', 'name', 'code', 'academic_level_id', 'specific_year_level', 'department_id', 'course_id']);
        }

        // Add specific year levels for college
        $allYearLevels = User::getSpecificYearLevels();
        $specificYearLevels = $allYearLevels['college'] ?? [];

        // Get all departments and courses for College
        $departments = \App\Models\Department::where('is_active', true)->get(['id', 'name', 'code']);
        $courses = \App\Models\Course::where('is_active', true)->get(['id', 'name', 'code', 'department_id']);

        return Inertia::render('Registrar/Users/Index', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction']),
            'roles' => User::getAvailableRoles(),
            'currentRole' => 'student',
            'yearLevel' => 'college',
            'sections' => $sections,
            'specificYearLevels' => $specificYearLevels,
            'departments' => $departments,
            'courses' => $courses,
        ]);
    }

    /**
     * Upload students from CSV file.
     */
    public function uploadStudentsCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'academic_level' => 'nullable|string|in:elementary,junior_highschool,senior_highschool,college',
        ]);

        $expectedAcademicLevel = $request->get('academic_level'); // Get expected academic level
        $providedSectionId = $request->get('section_id'); // Get provided section ID
        $providedYearLevel = $request->get('specific_year_level'); // Get provided year level
        $providedTrackId = $request->get('track_id'); // Get provided track ID for SHS
        $providedStrandId = $request->get('strand_id'); // Get provided strand ID for SHS
        $providedDepartmentId = $request->get('department_id'); // Get provided department ID for College
        $providedCourseId = $request->get('course_id'); // Get provided course ID for College
        $file = $request->file('file');

        \Log::info('[REGISTRAR CSV UPLOAD] Starting upload', [
            'academic_level' => $expectedAcademicLevel,
            'provided_section_id' => $providedSectionId,
            'provided_year_level' => $providedYearLevel,
            'provided_track_id' => $providedTrackId,
            'provided_strand_id' => $providedStrandId,
            'provided_department_id' => $providedDepartmentId,
            'provided_course_id' => $providedCourseId,
        ]);

        // Check if file can be opened
        if (!$file->isValid()) {
            return back()->with('error', 'Invalid file. Please ensure the file is a valid CSV file.');
        }

        $handle = fopen($file->getPathname(), 'r');
        if (!$handle) {
            return back()->with('error', 'Unable to read the CSV file. Please check the file format.');
        }

        $header = fgetcsv($handle);
        $created = 0;
        $errors = [];
        $lineNumber = 1; // Start at 1 since header is line 0

        // Remove UTF-8 BOM if present (Excel often adds this)
        if ($header && isset($header[0])) {
            $header[0] = preg_replace('/^\x{FEFF}/u', '', $header[0]);
        }

        // Trim and lowercase headers for comparison
        $header = $header ? array_map('trim', array_map('strtolower', $header)) : [];

        // Different expected columns based on academic level and section_id
        if ($expectedAcademicLevel === 'senior_highschool') {
            // New workflow: track/strand/section provided separately, simplified CSV format
            if (!empty($providedTrackId) && !empty($providedStrandId) && !empty($providedSectionId)) {
                $expected = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            } else {
                // Old workflow: include all columns
                $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'academic_strand', 'track', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,academic_strand,track,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            }
        } elseif ($expectedAcademicLevel === 'college') {
            // New workflow: department/course/section provided separately, simplified CSV format
            if (!empty($providedDepartmentId) && !empty($providedCourseId) && !empty($providedSectionId)) {
                $expected = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            } else {
                // Old workflow: include all columns
                $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,department_name,course_name,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            }
        } elseif ($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool') {
            // New workflow: section provided separately, simplified CSV format
            if (!empty($providedSectionId)) {
                $expected = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            } else {
                // Old workflow: section in CSV
                $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
                $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
            }
        } else {
            // Default for when no academic level is specified
            $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_name', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,strand_name,department_name,course_name,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
        }

        \Log::info('[REGISTRAR CSV UPLOAD] CSV format detection', [
            'expected_columns' => $expected,
            'actual_header' => $header,
            'using_simplified_format' => $providedSectionId ? 'yes' : 'no',
            'track_id' => $providedTrackId,
            'strand_id' => $providedStrandId,
            'section_id' => $providedSectionId,
        ]);

        // Validate header format (now case-insensitive and trimmed)
        // Use value-based comparison instead of strict reference comparison
        $headerValid = $header && count($header) === count($expected) && array_values($header) === array_values($expected);

        if (!$headerValid) {
            fclose($handle);
            \Log::error('[REGISTRAR CSV UPLOAD] Header validation failed', [
                'expected' => $expected,
                'actual' => $header,
                'header_count' => count($header ?? []),
                'expected_count' => count($expected),
            ]);
            return back()->with('error', 'Invalid CSV format. Expected columns: ' . $expectedColumnsString);
        }

        // FIRST PASS: Collect all emails and student numbers from CSV to detect internal duplicates
        \Log::info('[CSV UPLOAD] Starting first pass to detect internal duplicates', [
            'academic_level' => $expectedAcademicLevel,
        ]);

        $csvData = [];
        $csvEmails = [];
        $csvStudentNumbers = [];
        $internalDuplicates = [];
        $tempLineNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $tempLineNumber++;

            if (count($row) !== count($expected)) {
                continue; // Will be caught in second pass
            }

            // Trim all row values
            $row = array_map('trim', $row);

            // Extract email and student_number based on format (simplified vs old)
            $email = isset($row[1]) ? trim($row[1]) : '';

            // Determine student_number index based on format
            if ($providedSectionId && ($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool')) {
                // Simplified format for elementary/JHS: name, email, password, student_number...
                $studentNumberIndex = 3;
            } elseif ($providedDepartmentId && $providedCourseId && $providedSectionId && $expectedAcademicLevel === 'college') {
                // Simplified format for college: name, email, password, student_number...
                $studentNumberIndex = 3;
            } elseif ($providedTrackId && $providedStrandId && $providedSectionId && $expectedAcademicLevel === 'senior_highschool') {
                // Simplified format for SHS: name, email, password, student_number...
                $studentNumberIndex = 3;
            } else {
                // Old format with academic_level, specific_year_level, section_name columns
                $studentNumberIndex = ($expectedAcademicLevel === 'senior_highschool') ? 8 :
                                      (($expectedAcademicLevel === 'college') ? 8 :
                                      (($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool') ? 6 : 9));
            }

            $studentNumber = isset($row[$studentNumberIndex]) ? trim($row[$studentNumberIndex]) : '';

            $csvData[] = $row;

            // Check for duplicate emails within CSV
            if (!empty($email)) {
                if (isset($csvEmails[$email])) {
                    $internalDuplicates[] = [
                        'type' => 'email',
                        'value' => $email,
                        'first_line' => $csvEmails[$email],
                        'duplicate_line' => $tempLineNumber,
                    ];
                } else {
                    $csvEmails[$email] = $tempLineNumber;
                }
            }

            // Check for duplicate student numbers within CSV
            if (!empty($studentNumber)) {
                if (isset($csvStudentNumbers[$studentNumber])) {
                    $internalDuplicates[] = [
                        'type' => 'student_number',
                        'value' => $studentNumber,
                        'first_line' => $csvStudentNumbers[$studentNumber],
                        'duplicate_line' => $tempLineNumber,
                    ];
                } else {
                    $csvStudentNumbers[$studentNumber] = $tempLineNumber;
                }
            }
        }

        // If internal duplicates found, return errors immediately
        if (!empty($internalDuplicates)) {
            fclose($handle);

            $duplicateErrors = [];
            foreach ($internalDuplicates as $dup) {
                $duplicateErrors[] = "Row {$dup['duplicate_line']}: Duplicate {$dup['type']} '{$dup['value']}' (already appears on row {$dup['first_line']} in this CSV)";
            }

            \Log::error('[CSV UPLOAD] Internal duplicates found within CSV file', [
                'duplicates' => $internalDuplicates,
            ]);

            return back()->with('error', 'CSV contains internal duplicates:<br>' . implode('<br>', $duplicateErrors));
        }

        \Log::info('[CSV UPLOAD] First pass complete - no internal duplicates found', [
            'total_rows' => count($csvData),
            'unique_emails' => count($csvEmails),
            'unique_student_numbers' => count($csvStudentNumbers),
        ]);

        // SECOND PASS: Process each row with improved validation
        foreach ($csvData as $index => $row) {
            $lineNumber++;

            // Check if row has correct number of columns
            if (count($row) !== count($expected)) {
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => isset($row[1]) ? $row[1] : 'N/A',
                    'errors' => ['Row has incorrect number of columns. Expected ' . count($expected) . ' columns, got ' . count($row)],
                ];
                continue;
            }

            // Parse row based on academic level and format (simplified vs old)
            if ($expectedAcademicLevel === 'senior_highschool') {
                // Check if using simplified format
                if (!empty($providedTrackId) && !empty($providedStrandId) && !empty($providedSectionId)) {
                    // Simplified format: name, email, password, student_number, birth_date...
                    [$name, $email, $password, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    // Use provided values from request
                    $academicLevel = $expectedAcademicLevel;
                    $specificYearLevel = $providedYearLevel ?: '';
                    $strandName = '';
                    $trackName = '';
                    $sectionName = '';
                    $departmentName = '';
                    $courseName = '';
                } else {
                    // Old format: includes all columns
                    [$name, $email, $password, $academicLevel, $specificYearLevel, $strandName, $trackName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    $departmentName = '';
                    $courseName = '';
                }
            } elseif ($expectedAcademicLevel === 'college') {
                // Check if using simplified format
                if (!empty($providedDepartmentId) && !empty($providedCourseId) && !empty($providedSectionId)) {
                    // Simplified format: name, email, password, student_number, birth_date...
                    [$name, $email, $password, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    // Use provided values from request
                    $academicLevel = $expectedAcademicLevel;
                    $specificYearLevel = $providedYearLevel ?: '';
                    $departmentName = '';
                    $courseName = '';
                    $sectionName = '';
                    $strandName = '';
                    $trackName = '';
                } else {
                    // Old format: includes all columns
                    [$name, $email, $password, $academicLevel, $specificYearLevel, $departmentName, $courseName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    $strandName = '';
                    $trackName = '';
                }
            } elseif ($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool') {
                // Check if using simplified format
                if (!empty($providedSectionId)) {
                    // Simplified format: name, email, password, student_number, birth_date...
                    [$name, $email, $password, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    // Use provided values from request
                    $academicLevel = $expectedAcademicLevel;
                    $specificYearLevel = $providedYearLevel ?: '';
                    $sectionName = '';
                    $strandName = '';
                    $departmentName = '';
                    $courseName = '';
                    $trackName = '';
                } else {
                    // Old format: includes academic_level, specific_year_level, section_name
                    [$name, $email, $password, $academicLevel, $specificYearLevel, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                    $strandName = '';
                    $departmentName = '';
                    $courseName = '';
                    $trackName = '';
                }
            } else {
                // Default for when no academic level is specified
                [$name, $email, $password, $academicLevel, $specificYearLevel, $strandName, $departmentName, $courseName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                $trackName = '';
            }

            \Log::info('[REGISTRAR CSV UPLOAD] Parsed row data', [
                'line' => $lineNumber,
                'name' => $name,
                'email' => $email,
                'student_number' => $studentNumber,
                'academic_level' => $academicLevel,
                'specific_year_level' => $specificYearLevel,
                'section_name' => $sectionName,
                'provided_section_id' => $providedSectionId,
            ]);

            // Validate academic level matches expected level if provided
            if ($expectedAcademicLevel && $academicLevel !== $expectedAcademicLevel) {
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => ['Academic level mismatch. Expected "' . $expectedAcademicLevel . '" but got "' . $academicLevel . '". Please use the correct CSV template for this academic level.'],
                ];
                \Log::warning('[REGISTRAR CSV UPLOAD] Academic level mismatch', [
                    'line' => $lineNumber,
                    'expected' => $expectedAcademicLevel,
                    'actual' => $academicLevel,
                ]);
                continue;
            }

            // Normalize gender to lowercase for case-insensitive validation
            if (!empty($gender)) {
                $gender = strtolower(trim($gender));
            }

            // Convert names to IDs or use provided IDs
            $strandId = null;
            $departmentId = null;
            $courseId = null;
            $sectionId = null;

            // Use provided IDs from request if using simplified format, otherwise look up by name
            if ($providedSectionId) {
                // Simplified format: use provided IDs directly
                $sectionId = $providedSectionId;
                $strandId = $providedStrandId ?: null;
                $departmentId = $providedDepartmentId ?: null;
                $courseId = $providedCourseId ?: null;

                \Log::info('[REGISTRAR CSV UPLOAD] Using provided IDs (simplified format)', [
                    'line' => $lineNumber,
                    'section_id' => $sectionId,
                    'strand_id' => $strandId,
                    'department_id' => $departmentId,
                    'course_id' => $courseId,
                ]);
            } else {
                // Old format: look up IDs by name

                // Handle strand lookup differently for SHS (needs track)
                if (!empty($strandName)) {
                    if ($expectedAcademicLevel === 'senior_highschool' && !empty($trackName)) {
                        // For SHS, find strand by name and track
                        $track = \App\Models\Track::where('name', $trackName)->first();
                        if (!$track) {
                            $errors[] = [
                                'line' => $lineNumber,
                                'email' => $email,
                                'errors' => ['Track "' . $trackName . '" not found. Please check the track name.'],
                            ];
                            continue;
                        }

                        $strand = \App\Models\Strand::where('name', $strandName)
                            ->where('track_id', $track->id)
                            ->first();
                        if (!$strand) {
                            $errors[] = [
                                'line' => $lineNumber,
                                'email' => $email,
                                'errors' => ['Academic Strand "' . $strandName . '" not found for Track "' . $trackName . '". Please check the strand and track names.'],
                            ];
                            continue;
                        }
                        $strandId = $strand->id;
                    } else {
                        // For other levels, just find by strand name
                        $strand = \App\Models\Strand::where('name', $strandName)->first();
                        if (!$strand) {
                            $errors[] = [
                                'line' => $lineNumber,
                                'email' => $email,
                                'errors' => ['Strand "' . $strandName . '" not found. Please check the strand name.'],
                            ];
                            continue;
                        }
                        $strandId = $strand->id;
                    }
                }

                if (!empty($departmentName)) {
                    $department = \App\Models\Department::where('name', $departmentName)->first();
                    if (!$department) {
                        $errors[] = [
                            'line' => $lineNumber,
                            'email' => $email,
                            'errors' => ['Department "' . $departmentName . '" not found. Please check the department name.'],
                        ];
                        continue;
                    }
                    $departmentId = $department->id;
                }

                if (!empty($courseName)) {
                    $course = \App\Models\Course::where('name', $courseName)->first();
                    if (!$course) {
                        $errors[] = [
                            'line' => $lineNumber,
                            'email' => $email,
                            'errors' => ['Course "' . $courseName . '" not found. Please check the course name.'],
                        ];
                        continue;
                    }
                    $courseId = $course->id;
                }

                if (!empty($sectionName)) {
                    $section = \App\Models\Section::where('name', $sectionName)->first();
                    if (!$section) {
                        $errors[] = [
                            'line' => $lineNumber,
                            'email' => $email,
                            'errors' => ['Section "' . $sectionName . '" not found. Please check the section name.'],
                        ];
                        continue;
                    }
                    $sectionId = $section->id;
                }
            }

            // Log row being processed
            \Log::info('[CSV UPLOAD] Processing row', [
                'line' => $lineNumber,
                'name' => $name,
                'email' => $email,
                'student_number' => $studentNumber,
                'academic_level' => $academicLevel,
            ]);

            // Check if email already exists in database
            $existingEmailUser = \App\Models\User::where('email', $email)->first();
            if ($existingEmailUser) {
                \Log::warning('[CSV UPLOAD] Email already exists in database', [
                    'line' => $lineNumber,
                    'email' => $email,
                    'existing_user_id' => $existingEmailUser->id,
                    'existing_user_name' => $existingEmailUser->name,
                    'existing_user_role' => $existingEmailUser->user_role,
                ]);
            }

            // Check if student_number already exists in database
            if (!empty($studentNumber)) {
                $existingStudentNumberUser = \App\Models\User::where('student_number', $studentNumber)->first();
                if ($existingStudentNumberUser) {
                    \Log::warning('[CSV UPLOAD] Student number already exists in database', [
                        'line' => $lineNumber,
                        'student_number' => $studentNumber,
                        'existing_user_id' => $existingStudentNumberUser->id,
                        'existing_user_name' => $existingStudentNumberUser->name,
                        'existing_user_email' => $existingStudentNumberUser->email,
                    ]);
                }
            }

            $validator = Validator::make([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'academic_level' => $academicLevel,
                'specific_year_level' => $specificYearLevel,
                'strand_id' => $strandId,
                'department_id' => $departmentId,
                'course_id' => $courseId,
                'section_id' => $sectionId,
                'student_number' => $studentNumber,
                'birth_date' => $birthDate,
                'gender' => $gender,
                'phone_number' => $phoneNumber,
                'address' => $address,
                'emergency_contact_name' => $emergencyContactName,
                'emergency_contact_phone' => $emergencyContactPhone,
                'emergency_contact_relationship' => $emergencyContactRelationship,
            ], [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'academic_level' => 'required|string|in:elementary,junior_highschool,senior_highschool,college',
                'specific_year_level' => 'nullable|string|max:50',
                'strand_id' => 'nullable|exists:strands,id',
                'department_id' => 'nullable|exists:departments,id',
                'course_id' => 'nullable|exists:courses,id',
                'section_id' => 'nullable|exists:sections,id',
                'student_number' => 'nullable|string|max:40|unique:users,student_number',
                'birth_date' => 'nullable|date|before:today',
                'gender' => 'nullable|in:male,female,other',
                'phone_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_relationship' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                $validationErrors = $validator->errors()->all();

                \Log::error('[CSV UPLOAD] Validation failed for row', [
                    'line' => $lineNumber,
                    'email' => $email,
                    'student_number' => $studentNumber,
                    'errors' => $validationErrors,
                ]);

                // Enhance error messages for unique constraint violations
                $enhancedErrors = [];
                foreach ($validationErrors as $error) {
                    if (str_contains($error, 'email has already been taken')) {
                        $enhancedErrors[] = $error . ' (Email "' . $email . '" already exists in the database. Please use a unique email address.)';
                    } elseif (str_contains($error, 'student number has already been taken')) {
                        $enhancedErrors[] = $error . ' (Student number "' . $studentNumber . '" already exists in the database. Please use a unique student number.)';
                    } else {
                        $enhancedErrors[] = $error;
                    }
                }

                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => $enhancedErrors,
                ];
                continue;
            }

            try {
                $student = User::create([
                    'name' => $name,
                    'email' => $email,
                    'user_role' => 'student',
                    'password' => Hash::make($password),
                    'year_level' => $academicLevel,
                    'specific_year_level' => $specificYearLevel ?: null,
                    'strand_id' => $strandId ?: null,
                    'department_id' => $departmentId ?: null,
                    'course_id' => $courseId ?: null,
                    'section_id' => $sectionId ?: null,
                    'student_number' => $studentNumber ?: null,
                    'birth_date' => $birthDate ?: null,
                    'gender' => $gender ?: null,
                    'phone_number' => $phoneNumber ?: null,
                    'address' => $address ?: null,
                    'emergency_contact_name' => $emergencyContactName ?: null,
                    'emergency_contact_phone' => $emergencyContactPhone ?: null,
                    'emergency_contact_relationship' => $emergencyContactRelationship ?: null,
                ]);

                \Log::info('[CSV UPLOAD] Student created successfully', [
                    'line' => $lineNumber,
                    'user_id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_number' => $student->student_number,
                    'academic_level' => $student->year_level,
                ]);

                // Note: Automatic subject enrollment is handled by User model's boot method

                // Send email to student with their credentials
                try {
                    Mail::to($student->email)->send(
                        new UserAccountCreatedEmail($student, $password)
                    );
                    Log::info('CSV upload: Account creation email sent', [
                        'user_id' => $student->id,
                        'user_email' => $student->email,
                        'line_number' => $lineNumber,
                    ]);
                } catch (\Exception $e) {
                    Log::error('CSV upload: Email failed to send', [
                        'user_id' => $student->id,
                        'user_email' => $student->email,
                        'line_number' => $lineNumber,
                        'error' => $e->getMessage(),
                    ]);
                }

                $created++;
            } catch (\Exception $e) {
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => ['Database error: ' . $e->getMessage()],
                ];
            }
        }

        fclose($handle);

        // Determine redirect route based on academic level
        $redirectRoute = 'registrar.students.index';
        if ($expectedAcademicLevel) {
            $academicLevelRoute = str_replace('_', '-', $expectedAcademicLevel);
            $redirectRoute = 'registrar.students.' . $academicLevelRoute;
        }

        if ($created > 0 && empty($errors)) {
            $message = "Successfully uploaded {$created} students.";
            return redirect()->route($redirectRoute)->with('success', $message);
        } elseif ($created > 0 && !empty($errors)) {
            $errorCount = count($errors);
            $errorDetails = '';
            if ($errorCount <= 5) {
                // Show detailed errors for small number of errors
                $errorDetails = ' Errors: ';
                foreach ($errors as $error) {
                    $errorDetails .= "Line {$error['line']} ({$error['email']}): " . implode(', ', $error['errors']) . '; ';
                }
            } else {
                // Show summary for many errors
                $errorDetails = " {$errorCount} rows had errors. Please check the data format.";
            }
            $message = "Successfully uploaded {$created} students, but{$errorDetails}";
            Log::warning('Student CSV upload partial success', ['created' => $created, 'errors' => $errors]);
            return redirect()->route($redirectRoute)->with('warning', $message);
        } else {
            $errorCount = count($errors);
            $errorDetails = '';
            if ($errorCount <= 5) {
                // Show detailed errors for small number of errors
                $errorDetails = ' Errors: ';
                foreach ($errors as $error) {
                    $errorDetails .= "Line {$error['line']} ({$error['email']}): " . implode(', ', $error['errors']) . '; ';
                }
            } else {
                // Show summary for many errors
                $errorDetails = " {$errorCount} rows had errors. Please check the data format.";
            }
            $message = "No students were uploaded.{$errorDetails}";
            Log::error('Student CSV upload failed', ['errors' => $errors]);
            return redirect()->route($redirectRoute)->with('error', $message);
        }
    }

    /**
     * Download CSV template for student uploads.
     */
    public function downloadStudentsCsvTemplate(Request $request)
    {
        $academicLevel = $request->get('academic_level'); // Get academic level filter
        $sectionId = $request->get('section_id'); // Get section ID if provided
        $specificYearLevel = $request->get('specific_year_level'); // Get specific year level if provided
        $trackId = $request->get('track_id'); // Get track ID for SHS
        $strandId = $request->get('strand_id'); // Get strand ID for SHS
        $departmentId = $request->get('department_id'); // Get department ID for College
        $courseId = $request->get('course_id'); // Get course ID for College

        $filename = $academicLevel
            ? strtolower(str_replace('_', '-', $academicLevel)) . '_students_template.csv'
            : 'students_template.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        \Log::info('[REGISTRAR CSV TEMPLATE] Generating template', [
            'academic_level' => $academicLevel,
            'section_id' => $sectionId,
            'specific_year_level' => $specificYearLevel,
        ]);

        // Use different columns based on academic level and whether section_id is provided
        if ($academicLevel === 'senior_highschool') {
            // New workflow: track/strand/section provided separately, simplified CSV format
            if ($trackId && $strandId && $sectionId) {
                $columns = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            } else {
                // Old workflow: include all columns
                $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'academic_strand', 'track', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            }
        } elseif ($academicLevel === 'college') {
            // New workflow: department/course/section provided separately, simplified CSV format
            if ($departmentId && $courseId && $sectionId) {
                $columns = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            } else {
                // Old workflow: include all columns
                $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            }
        } elseif ($academicLevel === 'elementary' || $academicLevel === 'junior_highschool') {
            // New workflow: section provided separately, simplified CSV format
            if ($sectionId) {
                $columns = ['name', 'email', 'password', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            } else {
                // Old workflow: section in CSV
                $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            }
        } else {
            // Default for when no academic level is specified
            $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_name', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
        }

        $callback = function () use ($columns, $academicLevel, $sectionId, $specificYearLevel, $trackId, $strandId, $departmentId, $courseId) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);

            // Add sample rows based on academic level
            if (!$academicLevel || $academicLevel === 'elementary') {
                $elementarySection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'elementary');
                })->first();

                // Elementary - check if using simplified format
                if ($academicLevel === 'elementary') {
                    if ($sectionId) {
                        // Simplified format: no academic_level, specific_year_level, section_name columns
                        fputcsv($handle, [
                            'Juan Dela Cruz',
                            'juan.delacruz@example.com',
                            'password123',
                            'EL-2025-000001',
                            '2018-01-15',
                            'male',
                            '09123456789',
                            '123 Main Street, Barangay 1',
                            'Pedro Dela Cruz',
                            '09123456788',
                            'father'
                        ]);
                    } else {
                        // Old format: includes academic_level, specific_year_level, section_name
                        fputcsv($handle, [
                            'Juan Dela Cruz',
                            'juan.delacruz@example.com',
                            'password123',
                            'elementary',
                            'grade_1',
                            $elementarySection ? $elementarySection->name : '',
                            'EL-2025-000001',
                            '2018-01-15',
                            'male',
                            '09123456789',
                            '123 Main Street, Barangay 1',
                            'Pedro Dela Cruz',
                            '09123456788',
                            'father'
                        ]);
                    }
                } else {
                    // When no specific academic level, use full template with empty fields
                    fputcsv($handle, [
                        'Juan Dela Cruz',
                        'juan.delacruz@example.com',
                        'password123',
                        'elementary',
                        'grade_1',
                        '',
                        '',
                        '',
                        $elementarySection ? $elementarySection->name : '',
                        'EL-2025-000001',
                        '2018-01-15',
                        'male',
                        '09123456789',
                        '123 Main Street, Barangay 1',
                        'Pedro Dela Cruz',
                        '09123456788',
                        'father'
                    ]);
                }
            }

            if (!$academicLevel || $academicLevel === 'junior_highschool') {
                $jhsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'junior_highschool');
                })->first();

                // JHS - check if using simplified format
                if ($academicLevel === 'junior_highschool') {
                    if ($sectionId) {
                        // Simplified format: no academic_level, specific_year_level, section_name columns
                        fputcsv($handle, [
                            'Maria Santos',
                            'maria.santos@example.com',
                            'password123',
                            'JHS-2025-000002',
                            '2010-05-20',
                            'female',
                            '09123456790',
                            '456 Oak Avenue, Barangay 2',
                            'Juan Santos',
                            '09123456791',
                            'father'
                        ]);
                    } else {
                        // Old format: includes academic_level, specific_year_level, section_name
                        fputcsv($handle, [
                            'Maria Santos',
                            'maria.santos@example.com',
                            'password123',
                            'junior_highschool',
                            'grade_7',
                            $jhsSection ? $jhsSection->name : '',
                            'JHS-2025-000002',
                            '2010-05-20',
                            'female',
                            '09123456790',
                            '456 Oak Avenue, Barangay 2',
                            'Juan Santos',
                            '09123456791',
                            'father'
                        ]);
                    }
                } else {
                    // When no specific academic level, use full template with empty fields
                    fputcsv($handle, [
                        'Maria Santos',
                        'maria.santos@example.com',
                        'password123',
                        'junior_highschool',
                        'grade_7',
                        '',
                        '',
                        '',
                        $jhsSection ? $jhsSection->name : '',
                        'JHS-2025-000002',
                        '2010-05-20',
                        'female',
                        '09123456790',
                        '456 Oak Avenue, Barangay 2',
                        'Juan Santos',
                        '09123456791',
                        'father'
                    ]);
                }
            }

            if (!$academicLevel || $academicLevel === 'senior_highschool') {
                $strand = \App\Models\Strand::with('track')->first();
                $shsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'senior_highschool');
                })->first();

                // SHS uses simplified template with only required fields
                if ($academicLevel === 'senior_highschool') {
                    // New workflow: track/strand/section are pre-selected, exclude them from CSV
                    if ($trackId && $strandId && $sectionId) {
                        fputcsv($handle, [
                            'Pedro Garcia',
                            'pedro.garcia@example.com',
                            'password123',
                            'SHS-2025-000003',
                            '2008-03-10',
                            'male',
                            '09123456792',
                            '789 Pine Road, Barangay 3',
                            'Ana Garcia',
                            '09123456793',
                            'mother'
                        ]);
                    } else {
                        // Old workflow: include all columns for backward compatibility
                        fputcsv($handle, [
                            'Pedro Garcia',
                            'pedro.garcia@example.com',
                            'password123',
                            'senior_highschool',
                            'grade_11',
                            $strand ? $strand->name : '',  // academic_strand
                            $strand && $strand->track ? $strand->track->name : '',  // track
                            $shsSection ? $shsSection->name : '',  // section_name
                            'SHS-2025-000003',
                            '2008-03-10',
                            'male',
                            '09123456792',
                            '789 Pine Road, Barangay 3',
                            'Ana Garcia',
                            '09123456793',
                            'mother'
                        ]);
                    }
                } else {
                    // When no specific academic level, use full template with empty fields
                    fputcsv($handle, [
                        'Pedro Garcia',
                        'pedro.garcia@example.com',
                        'password123',
                        'senior_highschool',
                        'grade_11',
                        $strand ? $strand->name : '',  // academic_strand
                        $strand && $strand->track ? $strand->track->name : '',  // track
                        $shsSection ? $shsSection->name : '',  // section_name
                        'SHS-2025-000003',
                        '2008-03-10',
                        'male',
                        '09123456792',
                        '789 Pine Road, Barangay 3',
                        'Ana Garcia',
                        '09123456793',
                        'mother'
                    ]);
                }
            }

            if (!$academicLevel || $academicLevel === 'college') {
                $department = \App\Models\Department::first();
                $course = \App\Models\Course::first();
                $collegeSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'college');
                })->first();

                // College template
                if ($academicLevel === 'college') {
                    // New workflow: department/course/section provided separately, exclude from CSV
                    if ($departmentId && $courseId && $sectionId) {
                        fputcsv($handle, [
                            'Ana Rodriguez',
                            'ana.rodriguez@example.com',
                            'password123',
                            'CO-2025-000004',
                            '2005-12-25',
                            'female',
                            '09123456794',
                            '321 Elm Street, Barangay 4',
                            'Carlos Rodriguez',
                            '09123456795',
                            'father'
                        ]);
                    } else {
                        // Old workflow: include all columns
                        fputcsv($handle, [
                            'Ana Rodriguez',
                            'ana.rodriguez@example.com',
                            'password123',
                            'college',
                            'first_year',
                            $department ? $department->name : '',
                            $course ? $course->name : '',
                            $collegeSection ? $collegeSection->name : '',
                            'CO-2025-000004',
                            '2005-12-25',
                            'female',
                            '09123456794',
                            '321 Elm Street, Barangay 4',
                            'Carlos Rodriguez',
                            '09123456795',
                            'father'
                        ]);
                    }
                } else {
                    // When no specific academic level, use full template
                    fputcsv($handle, [
                        'Ana Rodriguez',
                        'ana.rodriguez@example.com',
                        'password123',
                        'college',
                        'first_year',
                        $department ? $department->name : '',
                        $course ? $course->name : '',
                        $collegeSection ? $collegeSection->name : '',
                        'CO-2025-000004',
                        '2005-12-25',
                        'female',
                        '09123456794',
                        '321 Elm Street, Barangay 4',
                        'Carlos Rodriguez',
                        '09123456795',
                        'father'
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
