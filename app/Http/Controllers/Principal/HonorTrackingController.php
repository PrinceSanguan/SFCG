<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\AcademicLevel;
use App\Models\ParentStudentRelationship;
use App\Mail\ParentHonorNotificationEmail;
use App\Mail\StudentHonorQualificationEmail;
use App\Services\CertificateGenerationService;
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
        
        // Principal can only handle Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        
        $honors = HonorResult::with(['student', 'honorType', 'academicLevel', 'approvedBy', 'rejectedBy'])
            ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })
            ->latest('created_at')
            ->paginate(20);
        
        $honorTypes = HonorType::all();
        $academicLevels = AcademicLevel::all();
        
        // Get statistics for Principal's academic levels only
        $stats = [
            'total_honors' => HonorResult::whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })->count(),
            'pending_honors' => HonorResult::where('is_pending_approval', true)
                ->where('is_approved', false)
                ->where('is_rejected', false)
                ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                    $query->whereIn('key', $allowedAcademicLevels);
                })
                ->count(),
            'approved_honors' => HonorResult::where('is_approved', true)
                ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                    $query->whereIn('key', $allowedAcademicLevels);
                })
                ->count(),
            'rejected_honors' => HonorResult::where('is_rejected', true)
                ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                    $query->whereIn('key', $allowedAcademicLevels);
                })
                ->count(),
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
        
        // Principal can only handle Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        
        $honors = HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })
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
        $honor = HonorResult::with(['student', 'academicLevel', 'honorType'])->findOrFail($honorId);
        
        // Verify that principal can only approve Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only approve Elementary, Junior High School, and Senior High School honors.');
        }
        
        $honor->update([
            'is_approved' => true,
            'is_pending_approval' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);

        // Generate certificate automatically
        $certificateService = app(CertificateGenerationService::class);
        $certificate = $certificateService->generateHonorCertificate($honor);

        if ($certificate) {
            Log::info('Certificate generated automatically for approved honor', [
                'certificate_id' => $certificate->id,
                'certificate_serial' => $certificate->serial_number,
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'approved_by' => 'principal',
            ]);
        }

        // Send parent notification emails with new template
        $this->sendParentNotifications($honor, $certificate);
        
        Log::info('Honor approved by principal', [
            'principal_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
            'academic_level' => $honor->academicLevel?->name ?? 'Unknown',
        ]);
        
        $message = 'Honor approved successfully. Parent notifications have been sent.';
        if ($certificate) {
            $message .= ' Certificate has been generated with serial number: ' . $certificate->serial_number;
        }
        return back()->with('success', $message);
    }
    
    public function rejectHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::with(['academicLevel', 'honorType'])->findOrFail($honorId);
        
        // Verify that principal can only reject Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only reject Elementary, Junior High School, and Senior High School honors.');
        }
        
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
        
        // Verify that principal can only review Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only review Elementary, Junior High School, and Senior High School honors.');
        }
        
        return Inertia::render('Principal/Honors/Review', [
            'user' => $user,
            'honor' => $honor,
        ]);
    }
    
    /**
     * Send honor notification emails to all parents of the student
     */
    private function sendParentNotifications($honor, $certificate = null)
    {
        try {
            // Get all parents for this student
            $parentRelationships = ParentStudentRelationship::with('parent')
                ->where('student_id', $honor->student_id)
                ->get();
            
            foreach ($parentRelationships as $relationship) {
                if ($relationship->parent && $relationship->parent->email) {
                    // Use the new comprehensive honor qualification email
                    Mail::to($relationship->parent->email)->send(
                        new StudentHonorQualificationEmail(
                            $honor->student,
                            $relationship->parent,
                            $honor
                        )
                    );
                    
                    Log::info('Parent honor notification sent by principal', [
                        'parent_id' => $relationship->parent->id,
                        'parent_email' => $relationship->parent->email,
                        'student_id' => $honor->student_id,
                        'honor_id' => $honor->id,
                        'approved_by' => 'principal',
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to send parent honor notifications by principal', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    // API methods
    public function getPendingHonors()
    {
        // Principal can only handle Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        
        $honors = HonorResult::where('is_pending_approval', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })
            ->with(['student', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getApprovedHonors()
    {
        // Principal can only handle Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        
        $honors = HonorResult::where('is_approved', true)
            ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })
            ->with(['student', 'honorType', 'academicLevel', 'approvedBy'])
            ->latest('approved_at')
            ->get();
        
        return response()->json($honors);
    }
    
    public function getRejectedHonors()
    {
        // Principal can only handle Elementary, Junior High School, and Senior High School honors
        $allowedAcademicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];
        
        $honors = HonorResult::where('is_rejected', true)
            ->whereHas('academicLevel', function($query) use ($allowedAcademicLevels) {
                $query->whereIn('key', $allowedAcademicLevels);
            })
            ->with(['student', 'honorType', 'academicLevel', 'rejectedBy'])
            ->latest('rejected_at')
            ->get();
        
        return response()->json($honors);
    }
}
