<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Admin User Management Controller
 * 
 * Handles CRUD operations for user accounts in the admin panel.
 * All methods require admin authentication via EnsureAdmin middleware.
 */
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
            'registrar_count' => User::where('user_role', 'registrar')->count(),
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
            'user' => Auth::user(),
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
            'user' => Auth::user(),
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
            'user' => Auth::user(),
            'roles' => User::getAvailableRoles(),
            'yearLevels' => User::getYearLevels(),
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
            'user_role' => 'required|in:admin,registrar,instructor,teacher,adviser,chairperson,principal,student,parent',
            'password' => 'required|string|min:8|confirmed',
            'year_level' => 'nullable|string|in:elementary,junior_highschool,senior_highschool,college',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
            'password' => Hash::make($request->password),
            'year_level' => $request->user_role === 'student' ? $request->year_level : null,
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'created_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
                'created_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Redirect back to admin users index instead of role-specific dashboards
        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
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
        return Inertia::render('Admin/AccountManagement/Edit', [
            'user' => Auth::user(),
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
            'user_role' => 'required|in:admin,registrar,instructor,teacher,adviser,chairperson,principal,student,parent',
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
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'updated_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'original' => $originalData,
                'updated' => $user->toArray(),
                'updated_by' => $currentUser ? $currentUser->name : 'System',
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
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $userData = $user->toArray();

        // Log the activity before deletion
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'deleted_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'deleted_user' => $userData,
                'deleted_by' => $currentUser ? $currentUser->name : 'System',
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
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'reset_password',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'target_user' => $user->name,
                'reset_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Password reset successfully!');
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

    // Role-specific methods for different user types

    /**
     * Display a listing of users by role.
     */
    public function indexByRole(Request $request)
    {
        $role = $this->getRoleFromRoute();
        $query = User::where('user_role', $role);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Optional filter by student year level
        if ($role === 'student' && $request->filled('year_level') && $request->get('year_level') !== 'all') {
            $query->where('year_level', $request->get('year_level'));
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Eager load parents for students
        if ($role === 'student') {
            $query->with(['parents']);
        }

        $users = $query->paginate(15)->withQueryString();

        $folderName = $this->getRoleFolderName($role);

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/List', [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction', 'year_level']),
            'roles' => User::getAvailableRoles(),
            'yearLevels' => User::getYearLevels(),
        ]);
    }

    /**
     * Show the form for creating a new user by role.
     */
    public function createByRole()
    {
        $role = $this->getRoleFromRoute();
        
        $folderName = $this->getRoleFolderName($role);
        
        return Inertia::render('Admin/AccountManagement/' . $folderName . '/Create', [
            'user' => Auth::user(),
            'roles' => User::getAvailableRoles(),
            'yearLevels' => User::getYearLevels(),
        ]);
    }

    /**
     * Store a newly created user by role.
     */
    public function storeByRole(Request $request)
    {
        $role = $this->getRoleFromRoute();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'year_level' => 'nullable|string|in:elementary,junior_highschool,senior_highschool,college',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $role,
            'password' => Hash::make($request->password),
            'year_level' => $role === 'student' ? $request->year_level : null,
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'created_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
                'created_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Redirect back to the role-specific index page instead of external dashboards
        return redirect()->route('admin.' . $this->getRoleRouteName($role))->with('success', ucfirst($role) . ' created successfully!');
    }

    /**
     * Display the specified user by role.
     */
    public function showByRole(User $user)
    {
        $role = $this->getRoleFromRoute();
        
        // Ensure the user has the correct role
        if ($user->user_role !== $role) {
            abort(404);
        }

        $relations = ['activityLogs', 'targetActivityLogs.user'];
        if ($role === 'student') {
            $relations[] = 'parents';
        }
        $user->load($relations);

        $activityLogs = ActivityLog::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('target_user_id', $user->id);
        })
        ->with(['user', 'targetUser'])
        ->latest()
        ->paginate(20);

        $folderName = $this->getRoleFolderName($role);

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/View', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'activityLogs' => $activityLogs,
            'role' => $role,
            'roleDisplayName' => User::getAvailableRoles()[$role] ?? ucfirst($role),
        ]);
    }

    /**
     * Download CSV template for bulk student upload.
     */
    public function downloadStudentsCsvTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="students_template.csv"',
        ];

        $columns = ['name', 'email', 'password'];
        $sampleRows = [
            ['Juan Dela Cruz', 'juan@example.com', 'password123'],
            ['Maria Santos', 'maria@example.com', 'password123'],
        ];

        $callback = function () use ($columns, $sampleRows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);
            foreach ($sampleRows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Handle bulk student upload via CSV.
     */
    public function uploadStudentsCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');
        $header = fgetcsv($handle);
        $created = 0;
        $errors = [];

        $expected = ['name', 'email', 'password'];
        if (!$header || array_map('strtolower', $header) !== $expected) {
            return back()->with('error', 'Invalid CSV format. Expected columns: name,email,password');
        }

        while (($row = fgetcsv($handle)) !== false) {
            [$name, $email, $password] = $row;
            $validator = Validator::make([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ], [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'email' => $email,
                    'errors' => $validator->errors()->all(),
                ];
                continue;
            }

            User::create([
                'name' => $name,
                'email' => $email,
                'user_role' => 'student',
                'password' => Hash::make($password),
            ]);
            $created++;
        }

        fclose($handle);

        $message = "$created students uploaded successfully.";
        if (!empty($errors)) {
            $message .= ' Some rows were skipped due to validation errors.';
            Log::warning('Student CSV upload errors', ['errors' => $errors]);
        }

        return redirect()->route('admin.students.index')->with('success', $message);
    }

    /**
     * Show the form for editing the specified user by role.
     */
    public function editByRole(User $user)
    {
        $role = $this->getRoleFromRoute();
        
        // Ensure the user has the correct role
        if ($user->user_role !== $role) {
            abort(404);
        }

        $folderName = $this->getRoleFolderName($role);

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/Edit', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'roles' => User::getAvailableRoles(),
            'yearLevels' => User::getYearLevels(),
            'role' => $role,
            'roleDisplayName' => User::getAvailableRoles()[$role] ?? ucfirst($role),
        ]);
    }

    /**
     * Update the specified user by role.
     */
    public function updateByRole(Request $request, User $user)
    {
        $role = $this->getRoleFromRoute();
        
        // Ensure the user has the correct role
        if ($user->user_role !== $role) {
            abort(404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'user_role' => 'required|in:admin,registrar,instructor,teacher,adviser,chairperson,principal,student,parent',
            'year_level' => 'nullable|string|in:elementary,junior_highschool,senior_highschool,college',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $originalData = $user->toArray();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
            'year_level' => $user->user_role === 'student' ? $request->year_level : null,
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'updated_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'original' => $originalData,
                'updated' => $user->toArray(),
                'updated_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.' . $this->getRoleRouteName($role))->with('success', ucfirst($role) . ' updated successfully!');
    }

    /**
     * Remove the specified user by role.
     */
    public function destroyByRole(User $user)
    {
        Log::info('destroyByRole called for user: ' . $user->id . ' with role: ' . $user->user_role);
        
        $role = $this->getRoleFromRoute();
        Log::info('Role from route: ' . $role);
        
        // Ensure the user has the correct role
        if ($user->user_role !== $role) {
            Log::warning('Role mismatch: user role ' . $user->user_role . ' != route role ' . $role);
            abort(404);
        }

        // Prevent self-deletion
        if ($user->id === Auth::id()) {
            Log::warning('Self-deletion attempted by user: ' . Auth::id());
            return back()->with('error', 'You cannot delete your own account.');
        }

        $userData = $user->toArray();

        // Log the activity before deletion
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'deleted_user',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'deleted_user' => $userData,
                'deleted_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        Log::info('Deleting user: ' . $user->id);
        $user->delete();

        return redirect()->route('admin.' . $this->getRoleRouteName($role))->with('success', ucfirst($role) . ' deleted successfully!');
    }

    /**
     * Reset user password by role.
     */
    public function resetPasswordByRole(Request $request, User $user)
    {
        $role = $this->getRoleFromRoute();
        
        // Ensure the user has the correct role
        if ($user->user_role !== $role) {
            abort(404);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $user->id,
            'action' => 'reset_password',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'details' => [
                'target_user' => $user->name,
                'reset_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Password reset successfully!');
    }

    /**
     * Get the role from the current route.
     */
    private function getRoleFromRoute(): string
    {
        $route = request()->route();
        $segments = explode('/', $route->uri());
        
        // Map route segments to database role values
        $routeToRoleMap = [
            'administrators' => 'admin',
            'registrars' => 'registrar',
            'principals' => 'principal',
            'chairpersons' => 'chairperson',
            'teachers' => 'teacher',
            'instructors' => 'instructor',
            'advisers' => 'adviser',
            'students' => 'student',
        ];
        
        // Find the role from the route segments
        foreach ($segments as $segment) {
            if (isset($routeToRoleMap[$segment])) {
                return $routeToRoleMap[$segment];
            }
        }
        
        return 'user'; // fallback
    }

    /**
     * Get the folder name for a role (plural form for folder structure).
     */
    private function getRoleFolderName(string $role): string
    {
        $roleFolderMap = [
            'admin' => 'Administrators',
            'registrar' => 'Registrars',
            'principal' => 'Principals',
            'chairperson' => 'Chairpersons',
            'teacher' => 'Teachers',
            'instructor' => 'Instructors',
            'adviser' => 'Advisers',
            'student' => 'Students',
        ];

        return $roleFolderMap[$role] ?? ucfirst($role) . 's';
    }

    /**
     * Get the route name for a role's index page.
     */
    private function getRoleRouteName(string $role): string
    {
        $roleRouteMap = [
            'admin' => 'admin.administrators.index',
            'registrar' => 'admin.registrars.index',
            'principal' => 'admin.principals.index',
            'chairperson' => 'admin.chairpersons.index',
            'teacher' => 'admin.teachers.index',
            'instructor' => 'admin.instructors.index',
            'adviser' => 'admin.advisers.index',
            'student' => 'admin.students.index',
        ];

        return $roleRouteMap[$role] ?? 'admin.users.index';
    }
}
