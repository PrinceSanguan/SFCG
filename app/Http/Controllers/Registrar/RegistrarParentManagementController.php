<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\ParentStudentRelationship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Registrar Parent Management Controller
 * 
 * Handles parent management operations for registrars.
 * Registrars can view and edit parents but cannot create new accounts.
 */
class RegistrarParentManagementController extends Controller
{
    /**
     * Display a listing of parents.
     */
    public function index(Request $request)
    {
        $query = User::where('user_role', 'parent')
            ->with(['parentRelationships.student']);

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

        $parents = $query->paginate(15)->withQueryString();

        return Inertia::render('Registrar/Parents/Index', [
            'user' => Auth::user(),
            'parents' => $parents,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Display the specified parent.
     */
    public function show(User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        $parent->load(['parentRelationships.student']);

        return Inertia::render('Registrar/Parents/Show', [
            'user' => Auth::user(),
            'parent' => $parent,
        ]);
    }

    /**
     * Show the form for editing the specified parent.
     */
    public function edit(User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        $parent->load(['parentRelationships.student']);

        return Inertia::render('Registrar/Parents/Edit', [
            'user' => Auth::user(),
            'parent' => $parent,
        ]);
    }

    /**
     * Update the specified parent in storage.
     */
    public function update(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $parent->id,
        ]);

        $parent->update($validated);

        return redirect()->route('registrar.parents.index')
            ->with('success', 'Parent updated successfully.');
    }

    /**
     * Reset parent password.
     */
    public function resetPassword(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $parent->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Log the activity
        \App\Models\ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $parent->id,
            'action' => 'reset_parent_password',
            'entity_type' => 'User',
            'entity_id' => $parent->id,
            'details' => [
                'target_parent' => $parent->name,
                'reset_by' => Auth::user()->name,
            ],
        ]);

        return back()->with('success', 'Parent password reset successfully!');
    }

    /**
     * Link parent to student.
     */
    public function linkStudent(Request $request, User $parent)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        // Ensure the student exists and is actually a student
        $student = User::findOrFail($validated['student_id']);
        if ($student->user_role !== 'student') {
            abort(400, 'Selected user is not a student.');
        }

        // Check if relationship already exists
        $existingRelationship = ParentStudentRelationship::where('parent_id', $parent->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingRelationship) {
            return back()->with('error', 'Parent is already linked to this student.');
        }

        // Create the relationship
        ParentStudentRelationship::create([
            'parent_id' => $parent->id,
            'student_id' => $student->id,
        ]);

        return back()->with('success', 'Parent linked to student successfully.');
    }

    /**
     * Unlink parent from student.
     */
    public function unlinkStudent(User $parent, User $student)
    {
        // Ensure the user is actually a parent
        if ($parent->user_role !== 'parent') {
            abort(404, 'User is not a parent.');
        }

        // Ensure the student exists and is actually a student
        if ($student->user_role !== 'student') {
            abort(404, 'User is not a student.');
        }

        // Find and delete the relationship
        $relationship = ParentStudentRelationship::where('parent_id', $parent->id)
            ->where('student_id', $student->id)
            ->first();

        if (!$relationship) {
            return back()->with('error', 'No relationship found between this parent and student.');
        }

        $relationship->delete();

        return back()->with('success', 'Parent unlinked from student successfully.');
    }
}
