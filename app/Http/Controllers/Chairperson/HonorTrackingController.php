<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use App\Models\Department;
use App\Models\ParentStudentRelationship;
use App\Mail\ParentHonorNotificationEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class HonorTrackingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Show all honors for chairperson (they can manage all academic levels)
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
        
        // Show all pending honors for chairperson (they can manage all academic levels)
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
        $honor = HonorResult::with(['student', 'academicLevel', 'honorType'])->findOrFail($honorId);
        
        // For Elementary and Junior High, chairperson can approve all honors
        // For Senior High and College, verify department relationship
        if ($honor->academicLevel && in_array($honor->academicLevel->key, ['senior_highschool', 'college'])) {
            if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
                abort(403, 'You can only approve honors from your department.');
            }
        }
        
        $honor->update([
            'is_approved' => true,
            'is_pending_approval' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
        
        // Send parent notification emails
        $this->sendParentNotifications($honor);
        
        Log::info('Honor approved by chairperson', [
            'chairperson_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
            'academic_level' => $honor->academicLevel?->name ?? 'Unknown',
        ]);
        
        return back()->with('success', 'Honor approved successfully. Parent notifications have been sent.');
    }
    
    /**
     * Send honor notification emails to all parents of the student
     */
    private function sendParentNotifications($honor)
    {
        try {
            // Get all parents for this student
            $parentRelationships = ParentStudentRelationship::with('parent')
                ->where('student_id', $honor->student_id)
                ->get();
            
            foreach ($parentRelationships as $relationship) {
                if ($relationship->parent && $relationship->parent->email) {
                    Mail::to($relationship->parent->email)->send(
                        new ParentHonorNotificationEmail(
                            $relationship->parent,
                            $honor->student,
                            $honor,
                            $honor->school_year
                        )
                    );
                    
                    Log::info('Parent honor notification sent', [
                        'parent_id' => $relationship->parent->id,
                        'parent_email' => $relationship->parent->email,
                        'student_id' => $honor->student_id,
                        'honor_id' => $honor->id,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to send parent honor notifications', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    public function rejectHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::with(['student', 'academicLevel'])->findOrFail($honorId);
        
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);
        
        // For Elementary and Junior High, chairperson can reject all honors
        // For Senior High and College, verify department relationship
        if ($honor->academicLevel && in_array($honor->academicLevel->key, ['senior_highschool', 'college'])) {
            if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
                abort(403, 'You can only reject honors from your department.');
            }
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
            'academic_level' => $honor->academicLevel?->name ?? 'Unknown',
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
        $honors = HonorResult::where('is_pending_approval', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getApprovedHonors()
    {
        $honors = HonorResult::where('is_approved', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getRejectedHonors()
    {
        $honors = HonorResult::where('is_rejected', true)
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('rejected_at')
            ->get();
        
        return response()->json($honors);
    }
}
