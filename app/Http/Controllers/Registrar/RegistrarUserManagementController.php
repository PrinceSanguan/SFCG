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
        $file = $request->file('file');

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

        // Different expected columns based on academic level
        if ($expectedAcademicLevel === 'senior_highschool') {
            $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'academic_strand', 'track', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,academic_strand,track,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
        } elseif ($expectedAcademicLevel === 'college') {
            $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,department_name,course_name,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
        } elseif ($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool') {
            $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
        } else {
            // Default for when no academic level is specified
            $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_name', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
            $expectedColumnsString = 'name,email,password,academic_level,specific_year_level,strand_name,department_name,course_name,section_name,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship';
        }

        // Validate header format
        if (!$header || array_map('strtolower', $header) !== $expected) {
            fclose($handle);
            return back()->with('error', 'Invalid CSV format. Expected columns: ' . $expectedColumnsString);
        }

        while (($row = fgetcsv($handle)) !== false) {
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

            // Parse row based on academic level
            if ($expectedAcademicLevel === 'senior_highschool') {
                [$name, $email, $password, $academicLevel, $specificYearLevel, $strandName, $trackName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                $departmentName = '';
                $courseName = '';
            } elseif ($expectedAcademicLevel === 'college') {
                [$name, $email, $password, $academicLevel, $specificYearLevel, $departmentName, $courseName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                $strandName = '';
                $trackName = '';
            } elseif ($expectedAcademicLevel === 'elementary' || $expectedAcademicLevel === 'junior_highschool') {
                [$name, $email, $password, $academicLevel, $specificYearLevel, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                $strandName = '';
                $departmentName = '';
                $courseName = '';
                $trackName = '';
            } else {
                // Default for when no academic level is specified
                [$name, $email, $password, $academicLevel, $specificYearLevel, $strandName, $departmentName, $courseName, $sectionName, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;
                $trackName = '';
            }

            // Validate academic level matches expected level if provided
            if ($expectedAcademicLevel && $academicLevel !== $expectedAcademicLevel) {
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => ['Academic level mismatch. Expected "' . $expectedAcademicLevel . '" but got "' . $academicLevel . '". Please use the correct CSV template for this academic level.'],
                ];
                continue;
            }

            // Convert names to IDs
            $strandId = null;
            $departmentId = null;
            $courseId = null;
            $sectionId = null;

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
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => $validator->errors()->all(),
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

        $filename = $academicLevel
            ? strtolower(str_replace('_', '-', $academicLevel)) . '_students_template.csv'
            : 'students_template.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        // Use different columns based on academic level
        if ($academicLevel === 'senior_highschool') {
            $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'academic_strand', 'track', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
        } elseif ($academicLevel === 'college') {
            $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
        } elseif ($academicLevel === 'elementary' || $academicLevel === 'junior_highschool') {
            $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
        } else {
            // Default for when no academic level is specified
            $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_name', 'department_name', 'course_name', 'section_name', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
        }

        $callback = function () use ($columns, $academicLevel) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);

            // Add sample rows based on academic level
            if (!$academicLevel || $academicLevel === 'elementary') {
                $elementarySection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'elementary');
                })->first();

                if ($academicLevel === 'elementary') {
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
            }

            if (!$academicLevel || $academicLevel === 'junior_highschool') {
                $jhsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'junior_highschool');
                })->first();

                if ($academicLevel === 'junior_highschool') {
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
            }

            if (!$academicLevel || $academicLevel === 'senior_highschool') {
                $shsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'senior_highschool');
                })->first();
                $strand = \App\Models\Strand::first();
                $track = $strand ? $strand->track : null;

                if ($academicLevel === 'senior_highschool') {
                    fputcsv($handle, [
                        'Pedro Garcia',
                        'pedro.garcia@example.com',
                        'password123',
                        'senior_highschool',
                        'grade_11',
                        $strand ? $strand->name : '',
                        $track ? $track->name : '',
                        $shsSection ? $shsSection->name : '',
                        'SHS-2025-000003',
                        '2008-09-10',
                        'male',
                        '09123456792',
                        '789 Pine Road, Barangay 3',
                        'Miguel Garcia',
                        '09123456793',
                        'father'
                    ]);
                }
            }

            if (!$academicLevel || $academicLevel === 'college') {
                $collegeSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                    $q->where('key', 'college');
                })->first();
                $department = \App\Models\Department::first();
                $course = $department ? $department->courses()->first() : null;

                if ($academicLevel === 'college') {
                    fputcsv($handle, [
                        'Ana Reyes',
                        'ana.reyes@example.com',
                        'password123',
                        'college',
                        'first_year',
                        $department ? $department->name : '',
                        $course ? $course->name : '',
                        $collegeSection ? $collegeSection->name : '',
                        'COL-2025-000004',
                        '2006-03-25',
                        'female',
                        '09123456794',
                        '321 Elm Street, Barangay 4',
                        'Rosa Reyes',
                        '09123456795',
                        'mother'
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
