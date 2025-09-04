<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\AcademicLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HonorTrackingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get all honors with different statuses
        $honors = HonorResult::with(['student', 'honorType', 'academicLevel', 'approvedBy', 'rejectedBy'])
            ->latest('created_at')
            ->paginate(20);
        
        $honorTypes = HonorType::all();
        $academicLevels = AcademicLevel::all();
        
        // Get statistics
        $stats = [
            'total_honors' => HonorResult::count(),
            'pending_honors' => HonorResult::where('is_pending_approval', true)
                ->where('is_approved', false)
                ->where('is_rejected', false)
                ->count(),
            'approved_honors' => HonorResult::where('is_approved', true)->count(),
            'rejected_honors' => HonorResult::where('is_rejected', true)->count(),
        ];
        
        return Inertia::render('Principal/Honors/Index', [
            'user' => $user,
            'honors' => $honors,
            'honorTypes' => $honorTypes,
            'academicLevels' => $academicLevels,
            'stats' => $stats,
        ]);
    }
    
    public function pendingHonors()
    {
        $user = Auth::user();
        
        $honors = HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->paginate(20);
        
        return Inertia::render('Principal/Honors/Pending', [
            'user' => $user,
            'honors' => $honors,
        ]);
    }
    
    public function approveHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::findOrFail($honorId);
        
        $honor->update([
            'is_approved' => true,
            'is_pending_approval' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        Log::info('Honor approved by principal', [
            'principal_id' => $user->id,
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
        
        $honor->update([
            'is_rejected' => true,
            'is_pending_approval' => false,
            'rejected_at' => now(),
            'rejected_by' => $user->id,
            'rejection_reason' => $validated['rejection_reason'],
        ]);
        
        Log::info('Honor rejected by principal', [
            'principal_id' => $user->id,
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
        
        return Inertia::render('Principal/Honors/Review', [
            'user' => $user,
            'honor' => $honor,
        ]);
    }
    
    // API methods
    public function getPendingHonors()
    {
        $honors = HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getApprovedHonors()
    {
        $honors = HonorResult::where('is_approved', true)
            ->with(['student', 'honorType', 'academicLevel', 'approvedBy'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getRejectedHonors()
    {
        $honors = HonorResult::where('is_rejected', true)
            ->with(['student', 'honorType', 'academicLevel', 'rejectedBy'])
            ->latest('rejected_at')
            ->get();
        
        return response()->json($honors);
    }
}
