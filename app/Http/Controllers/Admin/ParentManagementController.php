<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\ParentStudentRelationship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

/**
 * Admin Parent Management Controller
 * 
 * Handles CRUD operations specifically for parent accounts and their relationships with students.
 * All methods require admin authentication via AdminMiddleware.
 */
class ParentManagementController extends Controller
{
    /**
     * Display a listing of parent users.
     */
    public function index(Request $request)
    {
        $query = User::where('user_role', 'parent');

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

        // Load relationships for each parent
        $query->with(['students', 'parentRelationships.student']);

        $parents = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/AccountManagement/Parents/List', [
            'user' => Auth::user(),
            'parents' => $parents,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new parent.
     */
    public function create()
    {
        return Inertia::render('Admin/AccountManagement/Parents/Create', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Store a newly created parent.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $parent = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'user_role' => 'parent',
            'password' => Hash::make($request->password),
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'created_parent',
            'entity_type' => 'user',
            'entity_id' => $parent->id,
            'details' => [
                'name' => $parent->name,
                'email' => $parent->email,
                'role' => 'parent',
                'created_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.parents.index')->with('success', 'Parent account created successfully!');
    }

    /**
     * Display the specified parent.
     */
    public function show(User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return redirect()->route('admin.parents.index')->with('error', 'User is not a parent.');
        }

        $parent->load([
            'students' => function ($query) {
                $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
            },
            'activityLogs', 
            'targetActivityLogs.user'
        ]);

        $activityLogs = ActivityLog::where(function ($query) use ($parent) {
            $query->where('user_id', $parent->id)
                  ->orWhere('target_user_id', $parent->id);
        })
        ->with(['user', 'targetUser'])
        ->latest()
        ->paginate(20);

        return Inertia::render('Admin/AccountManagement/Parents/View', [
            'user' => Auth::user(),
            'parent' => $parent,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Show the form for editing the specified parent.
     */
    public function edit(User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return redirect()->route('admin.parents.index')->with('error', 'User is not a parent.');
        }

        $parent->load([
            'students' => function ($query) {
                $query->withPivot(['relationship_type', 'emergency_contact', 'notes']);
            }
        ]);

        // Get all students for potential linking
        $allStudents = User::where('user_role', 'student')->orderBy('name')->get();

        return Inertia::render('Admin/AccountManagement/Parents/Edit', [
            'user' => Auth::user(),
            'parent' => $parent,
            'allStudents' => $allStudents,
            'relationshipTypes' => ParentStudentRelationship::getRelationshipTypes(),
        ]);
    }

    /**
     * Update the specified parent.
     */
    public function update(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return redirect()->route('admin.parents.index')->with('error', 'User is not a parent.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $parent->id,
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $originalData = $parent->toArray();

        $parent->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'updated_parent',
            'entity_type' => 'user',
            'entity_id' => $parent->id,
            'details' => [
                'original' => $originalData,
                'updated' => $parent->toArray(),
                'updated_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.parents.index')->with('success', 'Parent account updated successfully!');
    }

    /**
     * Remove the specified parent.
     */
    public function destroy(User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return redirect()->route('admin.parents.index')->with('error', 'User is not a parent.');
        }

        $parentData = $parent->toArray();

        // Log the activity before deletion
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'deleted_parent',
            'entity_type' => 'user',
            'entity_id' => $parent->id,
            'details' => [
                'deleted_parent' => $parentData,
                'deleted_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $parent->delete();

        return redirect()->route('admin.parents.index')->with('success', 'Parent account deleted successfully!');
    }

    /**
     * Reset parent password.
     */
    public function resetPassword(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return back()->with('error', 'User is not a parent.');
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $parent->update([
            'password' => Hash::make($request->password),
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'reset_parent_password',
            'entity_type' => 'user',
            'entity_id' => $parent->id,
            'details' => [
                'target_parent' => $parent->name,
                'reset_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Parent password reset successfully!');
    }

    /**
     * Link a parent to a student.
     */
    public function linkStudent(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return back()->with('error', 'User is not a parent.');
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'relationship_type' => 'required|in:father,mother,guardian,other',
            'emergency_contact' => 'required|in:yes,no',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $student = User::find($request->student_id);

        // Ensure the target user is actually a student
        if ($student->user_role !== 'student') {
            return back()->with('error', 'Target user is not a student.');
        }

        // Check if relationship already exists with same type
        $existingRelationship = ParentStudentRelationship::where([
            'parent_id' => $parent->id,
            'student_id' => $student->id,
            'relationship_type' => $request->relationship_type,
        ])->first();

        if ($existingRelationship) {
            return back()->with('error', 'This parent-student relationship already exists.');
        }

        // Create the relationship
        $relationship = ParentStudentRelationship::create([
            'parent_id' => $parent->id,
            'student_id' => $student->id,
            'relationship_type' => $request->relationship_type,
            'emergency_contact' => $request->emergency_contact,
            'notes' => $request->notes,
        ]);

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'linked_parent_student',
            'entity_type' => 'parent_student_relationship',
            'entity_id' => $relationship->id,
            'details' => [
                'parent_name' => $parent->name,
                'student_name' => $student->name,
                'relationship_type' => $request->relationship_type,
                'linked_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Parent successfully linked to student!');
    }

    /**
     * Unlink a parent from a student.
     */
    public function unlinkStudent(Request $request, User $parent, User $student)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            return back()->with('error', 'User is not a parent.');
        }

        // Ensure the target user is actually a student
        if ($student->user_role !== 'student') {
            return back()->with('error', 'Target user is not a student.');
        }

        $relationship = ParentStudentRelationship::where([
            'parent_id' => $parent->id,
            'student_id' => $student->id,
        ])->first();

        if (!$relationship) {
            return back()->with('error', 'Parent-student relationship not found.');
        }

        $relationshipData = $relationship->toArray();
        $relationship->delete();

        // Log the activity
        $currentUser = Auth::user();
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'unlinked_parent_student',
            'entity_type' => 'parent_student_relationship',
            'entity_id' => $relationshipData['id'],
            'details' => [
                'parent_name' => $parent->name,
                'student_name' => $student->name,
                'relationship_data' => $relationshipData,
                'unlinked_by' => $currentUser ? $currentUser->name : 'System',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Parent successfully unlinked from student!');
    }
}
