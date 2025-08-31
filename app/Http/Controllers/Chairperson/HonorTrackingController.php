<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HonorTrackingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Honors/Index', [
                'user' => $user,
                'honors' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'stats' => [
                    'pending' => 0,
                    'approved' => 0,
                    'rejected' => 0,
                ],
            ]);
        }
        
        // For now, show all honors since students don't have department_id assigned
        // TODO: Implement proper department filtering when student-department relationship is established
        $honors = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->paginate(20);
        
        $stats = [
            'pending' => HonorResult::where('is_pending_approval', true)->count(),
            'approved' => HonorResult::where('is_approved', true)->count(),
            'rejected' => HonorResult::where('is_rejected', true)->count(),
        ];
        
        return Inertia::render('Chairperson/Honors/Index', [
            'user' => $user,
            'honors' => $honors,
            'stats' => $stats,
        ]);
    }
    
    public function pendingHonors()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Honors/Pending', [
                'user' => $user,
                'honors' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }
        
        $honors = HonorResult::where('is_pending_approval', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->paginate(20);
        
        return Inertia::render('Chairperson/Honors/Pending', [
            'user' => $user,
            'honors' => $honors,
        ]);
    }
    
    public function approveHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::findOrFail($honorId);
        
        // Verify the honor belongs to the chairperson's department
        if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
            abort(403, 'You can only approve honors from your department.');
        }
        
        $honor->update([
            'is_approved' => true,
            'is_pending_approval' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        Log::info('Honor approved by chairperson', [
            'chairperson_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
        ]);
        
        return back()->with('success', 'Honor approved successfully.');
    }
    
    public function rejectHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::findOrFail($honorId);
        
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);
        
        // Verify the honor belongs to the chairperson's department
        if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
            abort(403, 'You can only reject honors from your department.');
        }
        
        $honor->update([
            'is_rejected' => true,
            'is_pending_approval' => false,
            'rejected_at' => now(),
            'rejected_by' => $user->id,
            'rejection_reason' => $validated['rejection_reason'],
        ]);
        
        Log::info('Honor rejected by chairperson', [
            'chairperson_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
            'reason' => $validated['rejection_reason'],
        ]);
        
        return back()->with('success', 'Honor rejected.');
    }
    
    public function reviewHonor($honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->findOrFail($honorId);
        
        // For now, allow review of all honors since students don't have department_id assigned
        // TODO: Implement proper department filtering when student-department relationship is established
        
        return Inertia::render('Chairperson/Honors/Review', [
            'user' => $user,
            'honor' => $honor,
        ]);
    }
    
    // API methods
    public function getPendingHonors()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $honors = HonorResult::where('is_pending_approval', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getApprovedHonors()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $honors = HonorResult::where('is_approved', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getRejectedHonors()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $honors = HonorResult::where('is_rejected', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('rejected_at')
            ->get();
        
        return response()->json($honors);
    }
}
