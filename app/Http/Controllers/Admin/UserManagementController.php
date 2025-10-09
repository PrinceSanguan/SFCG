<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Mail\UserAccountCreatedEmail;
use App\Services\StudentSubjectAssignmentService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            'year_level' => 'required_if:user_role,student|string|in:elementary,junior_highschool,senior_highschool,college|nullable',
            'strand_id' => 'nullable|exists:strands,id',
            'course_id' => 'nullable|exists:courses,id',
            'department_id' => 'required_if:user_role,chairperson|nullable|exists:departments,id',
            'section_id' => 'nullable|exists:sections,id',
            'student_number' => 'nullable|string|max:40|unique:users,student_number',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Enforce section capacity if provided
        if ($request->user_role === 'student' && $request->section_id) {
            $section = \App\Models\Section::find($request->section_id);
            if ($section && $section->max_students) {
                $currentCount = \App\Models\User::where('user_role', 'student')->where('section_id', $section->id)->count();
                if ($currentCount >= $section->max_students) {
                    return back()->withErrors(['section_id' => 'Selected section is at full capacity.'])->withInput();
                }
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
            'password' => Hash::make($request->password),
            'year_level' => $request->user_role === 'student' ? $request->year_level : null,
            'strand_id' => $request->user_role === 'student' ? $request->strand_id : null,
            'course_id' => $request->user_role === 'student' ? $request->course_id : null,
            'department_id' => in_array($request->user_role, ['student', 'chairperson']) ? $request->department_id : null,
            'section_id' => $request->user_role === 'student' ? $request->section_id : null,
            'student_number' => $request->user_role === 'student' ? $request->student_number : null,
        ]);

        // Send email to user with their credentials
        try {
            Mail::to($user->email)->send(
                new UserAccountCreatedEmail($user, $request->password)
            );
            Log::info('User account creation email sent successfully', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->user_role,
            ]);
        } catch (\Exception $e) {
            Log::error('User account creation email failed to send', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

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
            'student_number' => 'nullable|string|max:40|unique:users,student_number,' . $user->id,
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $originalData = $user->toArray();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $request->user_role,
            'student_number' => $request->user_role === 'student' ? $request->student_number : $user->student_number,
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

        $data = [
            'user' => Auth::user(),
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_direction', 'year_level']),
            'roles' => User::getAvailableRoles(),
            'yearLevels' => User::getYearLevels(),
        ];

        // Add current academic level for student pages
        if ($role === 'student' && $request->filled('year_level')) {
            $data['currentAcademicLevel'] = $request->get('year_level');
        }

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/List', $data);
    }

    /**
     * Show the form for creating a new user by role.
     */
    public function createByRole()
    {
        $role = $this->getRoleFromRoute();
        
        $folderName = $this->getRoleFolderName($role);
        
        // Get additional data for student creation
        $data = [
            'user' => Auth::user(),
            'yearLevels' => User::getYearLevels(),
            'currentRole' => $role, // Pass the current role to the form
        ];

        // Add specific year levels and other data for students
        if ($role === 'student') {
            $data['specificYearLevels'] = User::getSpecificYearLevels();
            $data['strands'] = \App\Models\Strand::with('track')->where('is_active', true)->get();
            $data['departments'] = \App\Models\Department::where('is_active', true)->get();
            $data['courses'] = \App\Models\Course::where('is_active', true)->get();
        }

        // Add departments for chairpersons (College departments only)
        if ($role === 'chairperson') {
            $collegeAcademicLevel = \App\Models\AcademicLevel::where('key', 'college')->first();
            $data['departments'] = \App\Models\Department::where('is_active', true)
                ->where('academic_level_id', $collegeAcademicLevel?->id)
                ->get();
        }

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/Create', $data);
    }

    /**
     * Show the form for creating a new student by academic level.
     */
    public function createByAcademicLevel()
    {
        $academicLevel = $this->getAcademicLevelFromRoute();
        
        // Get additional data for student creation
        $data = [
            'user' => Auth::user(),
            'academicLevel' => $academicLevel,
            'specificYearLevels' => User::getSpecificYearLevels(),
            'strands' => \App\Models\Strand::with('track')->where('is_active', true)->get(),
            'departments' => \App\Models\Department::where('is_active', true)->get(),
            'courses' => \App\Models\Course::where('is_active', true)->get(),
        ];
        
        return Inertia::render('Admin/AccountManagement/Students/Create', $data);
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
            'academic_level' => 'required_if:user_role,student|string|in:elementary,junior_highschool,senior_highschool,college|nullable',
            'specific_year_level' => 'required_if:user_role,student|string|nullable',
            'strand_id' => 'nullable|exists:strands,id',
            'course_id' => 'nullable|exists:courses,id',
            'department_id' => 'required_if:user_role,chairperson|nullable|exists:departments,id',
            'student_number' => 'nullable|string|max:40|unique:users,student_number',
            // Personal Information validation
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:50',
        ]);

        // Additional validation for strands, courses, and departments
        if ($role === 'student') {
            if ($request->academic_level === 'senior_highschool' && !$request->strand_id) {
                $validator->errors()->add('strand_id', 'Strand is required for Senior High School students.');
            }
            if ($request->academic_level === 'college' && !$request->department_id) {
                $validator->errors()->add('department_id', 'Department is required for College students.');
            }
            if ($request->academic_level === 'college' && !$request->course_id) {
                $validator->errors()->add('course_id', 'Course is required for College students.');
            }
            // Section is required for all academic levels
            if (!$request->section_id) {
                $validator->errors()->add('section_id', 'Section is required for all students.');
            }
        }

        // Chairperson must have department
        if ($role === 'chairperson' && !$request->department_id) {
            $validator->errors()->add('department_id', 'Department is required for Chairpersons.');
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => $role,
            'password' => Hash::make($request->password),
            'year_level' => $role === 'student' ? $request->academic_level : null,
            'specific_year_level' => $role === 'student' ? $request->specific_year_level : null,
            'strand_id' => $role === 'student' ? $request->strand_id : null,
            'course_id' => $role === 'student' ? $request->course_id : null,
            'department_id' => in_array($role, ['student', 'chairperson']) ? $request->department_id : null,
            'section_id' => $role === 'student' ? $request->section_id : null,
            'student_number' => $role === 'student' ? $request->student_number : null,
            // Personal Information
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'phone_number' => $request->phone_number,
            'address' => $request->address,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'emergency_contact_relationship' => $request->emergency_contact_relationship,
        ]);

        // Note: Automatic subject enrollment is now handled by the User model's boot method
        // This ensures consistency across all student creation methods

        // Send email to user with their credentials
        try {
            Mail::to($user->email)->send(
                new UserAccountCreatedEmail($user, $request->password)
            );
            Log::info('User account creation email sent successfully', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->user_role,
            ]);
        } catch (\Exception $e) {
            Log::error('User account creation email failed to send', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

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
        if ($role === 'student' && $request->academic_level) {
            $academicLevelRoute = str_replace('_', '-', $request->academic_level);
            return redirect()->route('admin.students.' . $academicLevelRoute)->with('success', ucfirst($request->academic_level) . ' student created successfully!');
        }
        return redirect()->route($this->getRoleRouteName($role))->with('success', ucfirst($role) . ' created successfully!');
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
            $relations[] = 'section';
        }
        $user->load($relations);

        // Load additional data for students, teachers, instructors, and advisers
        $assignedSubjects = collect();
        $subjectGrades = collect();
        $teacherSubjectAssignments = collect();
        $instructorSubjectAssignments = collect();
        $adviserClassAssignments = collect();
        $assignedStudents = collect();
        $currentSchoolYear = '2024-2025'; // Use the current active school year

        if ($role === 'student') {
            // Load assigned subjects with teacher information
            $assignedSubjects = \App\Models\StudentSubjectAssignment::with([
                'subject.course',
                'subject.academicLevel',
                'subject.teacherAssignments' => function ($query) use ($currentSchoolYear) {
                    $query->where('school_year', $currentSchoolYear)
                          ->where('is_active', true);
                },
                'subject.teacherAssignments.teacher'
            ])
            ->where('student_id', $user->id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->orderBy('semester')
            ->orderBy('created_at')
            ->get();

            // Load grades for each subject
            $subjectGrades = \App\Models\StudentGrade::with([
                'subject',
                'gradingPeriod',
                'validatedBy',
                'approvedBy'
            ])
            ->where('student_id', $user->id)
            ->where('school_year', $currentSchoolYear)
            ->get()
            ->groupBy('subject_id');
        } elseif ($role === 'teacher') {
            // Load teacher subject assignments
            $teacherSubjectAssignments = \App\Models\TeacherSubjectAssignment::with([
                'subject.course',
                'subject.academicLevel',
                'subject.gradingPeriod',
                'academicLevel',
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->orderBy('academic_level_id')
            ->orderBy('subject_id')
            ->get()
            ->map(function ($a) {
                $a->level_name = optional($a->academicLevel)->name ?? optional($a->subject?->academicLevel)->name;
                $a->period_name = optional($a->gradingPeriod)->name ?? optional($a->subject?->gradingPeriod)->name;
                return $a;
            });

            // Load students assigned to this teacher's subjects
            $subjectIds = $teacherSubjectAssignments->pluck('subject_id')->toArray();
            if (!empty($subjectIds)) {
                $assignedStudents = \App\Models\StudentSubjectAssignment::with([
                    'student',
                    'subject.academicLevel'
                ])
                ->whereIn('subject_id', $subjectIds)
                ->where('school_year', $currentSchoolYear)
                ->where('is_active', true)
                ->join('users', 'student_subject_assignments.student_id', '=', 'users.id')
                ->orderBy('users.name')
                ->select('student_subject_assignments.*')
                ->get();
            }
        } elseif ($role === 'instructor') {
            // Load instructor subject assignments
            $instructorSubjectAssignments = \App\Models\InstructorSubjectAssignment::with([
                'subject.course',
                'subject.academicLevel',
                'subject.gradingPeriod',
                'academicLevel',
                'gradingPeriod'
            ])
            ->where('instructor_id', $user->id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->orderBy('academic_level_id')
            ->orderBy('subject_id')
            ->get()
            ->map(function ($a) {
                $a->level_name = optional($a->academicLevel)->name ?? optional($a->subject?->academicLevel)->name;
                $a->period_name = optional($a->gradingPeriod)->name ?? optional($a->subject?->gradingPeriod)->name;
                return $a;
            });

            // Load students assigned to this instructor's subjects
            $subjectIds = $instructorSubjectAssignments->pluck('subject_id')->toArray();
            if (!empty($subjectIds)) {
                $assignedStudents = \App\Models\StudentSubjectAssignment::with([
                    'student',
                    'subject.academicLevel'
                ])
                ->whereIn('subject_id', $subjectIds)
                ->where('school_year', $currentSchoolYear)
                ->where('is_active', true)
                ->join('users', 'student_subject_assignments.student_id', '=', 'users.id')
                ->orderBy('users.name')
                ->select('student_subject_assignments.*')
                ->get();
            }
        } elseif ($role === 'adviser') {
            // Load adviser class assignments
            $adviserClassAssignments = \App\Models\ClassAdviserAssignment::with([
                'academicLevel',
                'subject',
                'adviser'
            ])
            ->where('adviser_id', $user->id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->orderBy('academic_level_id')
            ->orderBy('grade_level')
            ->orderBy('section')
            ->get();

            // Load students in the adviser's classes
            $gradeLevels = $adviserClassAssignments->pluck('grade_level')->unique()->toArray();
            
            if (!empty($gradeLevels)) {
                $assignedStudents = \App\Models\User::with(['section.academicLevel'])
                    ->where('user_role', 'student')
                    ->where(function ($query) use ($gradeLevels) {
                        foreach ($gradeLevels as $gradeLevel) {
                            $query->orWhere('specific_year_level', $gradeLevel);
                        }
                    })
                    ->orderBy('name')
                    ->get();
            }
        }

        $activityLogs = ActivityLog::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('target_user_id', $user->id);
        })
        ->with(['user', 'targetUser'])
        ->latest()
        ->paginate(20);

        $folderName = $this->getRoleFolderName($role);

        // Transform adviserClassAssignments to ensure all relationships are properly included
        $transformedAdviserClassAssignments = $adviserClassAssignments ? $adviserClassAssignments->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'academic_level_id' => $assignment->academic_level_id,
                'grade_level' => $assignment->grade_level,
                'section' => $assignment->section,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'assigned_at' => $assignment->assigned_at,
                'assigned_by' => $assignment->assigned_by,
                'created_at' => $assignment->created_at,
                'updated_at' => $assignment->updated_at,
                'subject_id' => $assignment->subject_id,
                'academicLevel' => $assignment->academicLevel,
                'subject' => $assignment->subject,
                'adviser' => $assignment->adviser,
            ];
        }) : collect();

        return Inertia::render('Admin/AccountManagement/' . $folderName . '/View', [
            'user' => Auth::user(),
            'targetUser' => $user,
            'activityLogs' => $activityLogs,
            'role' => $role,
            'roleDisplayName' => User::getAvailableRoles()[$role] ?? ucfirst($role),
            'assignedSubjects' => $assignedSubjects,
            'subjectGrades' => $subjectGrades,
            'teacherSubjectAssignments' => $teacherSubjectAssignments,
            'instructorSubjectAssignments' => $instructorSubjectAssignments,
            'adviserClassAssignments' => $transformedAdviserClassAssignments,
            'assignedStudents' => $assignedStudents,
            'currentSchoolYear' => $currentSchoolYear,
        ]);
    }

    /**
     * Download CSV template for bulk student upload.
     * Filters template by academic level if provided.
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

        $columns = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_id', 'department_id', 'course_id', 'section_id', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];

        $sampleRows = [];

        // Generate samples based on academic level filter
        if (!$academicLevel || $academicLevel === 'elementary') {
            $elementarySection = \App\Models\Section::whereHas('academicLevel', function($q) {
                $q->where('key', 'elementary');
            })->first();

            $sampleRows[] = [
                'Juan Dela Cruz',
                'juan.delacruz@example.com',
                'password123',
                'elementary',
                'grade_1',
                '',
                '',
                '',
                $elementarySection ? $elementarySection->id : '',
                'EL-2025-000001',
                '2018-01-15',
                'male',
                '09123456789',
                '123 Main Street, Barangay 1',
                'Pedro Dela Cruz',
                '09123456788',
                'father'
            ];
        }

        if (!$academicLevel || $academicLevel === 'junior_highschool') {
            $jhsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                $q->where('key', 'junior_highschool');
            })->first();

            $sampleRows[] = [
                'Maria Santos',
                'maria.santos@example.com',
                'password123',
                'junior_highschool',
                'first_year',
                '',
                '',
                '',
                $jhsSection ? $jhsSection->id : '',
                'JHS-2025-000002',
                '2010-05-20',
                'female',
                '09123456790',
                '456 Oak Avenue, Barangay 2',
                'Juan Santos',
                '09123456791',
                'father'
            ];
        }

        if (!$academicLevel || $academicLevel === 'senior_highschool') {
            $strand = \App\Models\Strand::first();
            $shsSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                $q->where('key', 'senior_highschool');
            })->first();

            $sampleRows[] = [
                'Pedro Garcia',
                'pedro.garcia@example.com',
                'password123',
                'senior_highschool',
                'grade_11',
                $strand ? $strand->id : '',
                '',
                '',
                $shsSection ? $shsSection->id : '',
                'SHS-2025-000003',
                '2008-03-10',
                'male',
                '09123456792',
                '789 Pine Road, Barangay 3',
                'Ana Garcia',
                '09123456793',
                'mother'
            ];
        }

        if (!$academicLevel || $academicLevel === 'college') {
            $department = \App\Models\Department::first();
            $course = \App\Models\Course::first();
            $collegeSection = \App\Models\Section::whereHas('academicLevel', function($q) {
                $q->where('key', 'college');
            })->first();

            $sampleRows[] = [
                'Ana Rodriguez',
                'ana.rodriguez@example.com',
                'password123',
                'college',
                '',
                '',
                $department ? $department->id : '',
                $course ? $course->id : '',
                $collegeSection ? $collegeSection->id : '',
                'CO-2025-000004',
                '2005-12-25',
                'female',
                '09123456794',
                '321 Elm Street, Barangay 4',
                'Carlos Rodriguez',
                '09123456795',
                'father'
            ];
        }

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
     * Validates that all students match the expected academic level if provided.
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

        $expected = ['name', 'email', 'password', 'academic_level', 'specific_year_level', 'strand_id', 'department_id', 'course_id', 'section_id', 'student_number', 'birth_date', 'gender', 'phone_number', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];

        // Validate header format
        if (!$header || array_map('strtolower', $header) !== $expected) {
            fclose($handle);
            return back()->with('error', 'Invalid CSV format. Expected columns: name,email,password,academic_level,specific_year_level,strand_id,department_id,course_id,section_id,student_number,birth_date,gender,phone_number,address,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship');
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

            [$name, $email, $password, $academicLevel, $specificYearLevel, $strandId, $departmentId, $courseId, $sectionId, $studentNumber, $birthDate, $gender, $phoneNumber, $address, $emergencyContactName, $emergencyContactPhone, $emergencyContactRelationship] = $row;

            // Validate academic level matches expected level if provided
            if ($expectedAcademicLevel && $academicLevel !== $expectedAcademicLevel) {
                $errors[] = [
                    'line' => $lineNumber,
                    'email' => $email,
                    'errors' => ['Academic level mismatch. Expected "' . $expectedAcademicLevel . '" but got "' . $academicLevel . '". Please use the correct CSV template for this academic level.'],
                ];
                continue;
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
        $redirectRoute = 'admin.students.index';
        if ($expectedAcademicLevel) {
            $academicLevelRoute = str_replace('_', '-', $expectedAcademicLevel);
            $redirectRoute = 'admin.students.' . $academicLevelRoute;
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
            'year_level' => 'required_if:user_role,student|string|in:elementary,junior_highschool,senior_highschool,college|nullable',
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

        return redirect()->route($this->getRoleRouteName($role))->with('success', ucfirst($role) . ' updated successfully!');
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

        return redirect()->route($this->getRoleRouteName($role))->with('success', ucfirst($role) . ' deleted successfully!');
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

    /**
     * Get the academic level from the current route.
     */
    private function getAcademicLevelFromRoute(): string
    {
        $route = request()->route();
        $segments = explode('/', $route->uri());
        
        // Map route segments to academic level values
        $routeToAcademicLevelMap = [
            'elementary' => 'elementary',
            'junior-highschool' => 'junior_highschool',
            'senior-highschool' => 'senior_highschool',
            'college' => 'college',
        ];
        
        // Find the academic level from the route segments
        foreach ($segments as $segment) {
            if (isset($routeToAcademicLevelMap[$segment])) {
                return $routeToAcademicLevelMap[$segment];
            }
        }
        
        return 'elementary'; // fallback
    }
}
