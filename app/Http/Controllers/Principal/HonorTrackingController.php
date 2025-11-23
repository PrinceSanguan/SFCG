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

        // Principal can only handle their assigned academic level
        $allowedAcademicLevels = [$user->year_level];

        $honors = HonorResult::with(['student.section', 'honorType', 'academicLevel', 'approvedBy', 'rejectedBy'])
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

        // Principal can only handle their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        
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

        // Verify that principal can only approve honors for their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only approve honors for their assigned academic level.');
        }
        
        $honor->update([
            'is_approved' => true,
            'is_pending_approval' => false,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);

        // Generate certificate automatically
        $certificateService = app(CertificateGenerationService::class);
        $certificate = null;
        $certificateError = null;

        try {
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
        } catch (\Exception $e) {
            $certificateError = $e->getMessage();
            Log::error('Certificate generation FAILED for approved honor', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'academic_level' => $honor->academicLevel->key,
                'error' => $certificateError,
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
            return back()->with('success', $message);
        } elseif ($certificateError) {
            $message .= ' However, certificate generation failed: ' . $certificateError;
            return back()->with('warning', $message);
        }
        return back()->with('success', $message);
    }
    
    public function rejectHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::with(['academicLevel', 'honorType'])->findOrFail($honorId);

        // Verify that principal can only reject honors for their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only reject honors for their assigned academic level.');
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

        // Verify that principal can only review honors for their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        if (!$honor->academicLevel || !in_array($honor->academicLevel->key, $allowedAcademicLevels)) {
            abort(403, 'Principal can only review honors for their assigned academic level.');
        }
        
        return Inertia::render('Principal/Honors/Review', [
            'user' => $user,
            'honor' => $honor,
        ]);
    }
    
    /**
     * Send honor notification emails to the student and all parents of the student
     */
    private function sendParentNotifications($honor, $certificate = null)
    {
        try {
            Log::info('Starting parent notifications for honor approval', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'student_name' => $honor->student?->name ?? 'Unknown',
                'has_student' => $honor->student !== null,
                'student_email' => $honor->student?->email ?? 'N/A',
            ]);

            // Send email directly to the student
            if ($honor->student && $honor->student->email) {
                try {
                    Mail::to($honor->student->email)->send(
                        new StudentHonorQualificationEmail(
                            $honor->student,
                            $honor->student, // Student as recipient
                            $honor
                        )
                    );

                    Log::info('Student honor notification queued by principal', [
                        'student_id' => $honor->student_id,
                        'student_email' => $honor->student->email,
                        'honor_id' => $honor->id,
                        'honor_type' => $honor->honorType?->name ?? 'Unknown',
                        'approved_by' => 'principal',
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to send student honor notification', [
                        'student_id' => $honor->student_id,
                        'student_email' => $honor->student->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            } else {
                Log::warning('Cannot send student honor notification - missing student or email', [
                    'honor_id' => $honor->id,
                    'student_id' => $honor->student_id,
                    'has_student' => $honor->student !== null,
                    'student_email' => $honor->student?->email ?? 'N/A',
                ]);
            }

            // Get all parents for this student
            $parentRelationships = ParentStudentRelationship::with('parent')
                ->where('student_id', $honor->student_id)
                ->get();

            Log::info('Found parent relationships for student', [
                'student_id' => $honor->student_id,
                'parent_count' => $parentRelationships->count(),
                'parent_ids' => $parentRelationships->pluck('parent.id')->toArray(),
                'parent_emails' => $parentRelationships->pluck('parent.email')->filter()->toArray(),
            ]);

            if ($parentRelationships->isEmpty()) {
                Log::warning('No parent relationships found for student', [
                    'student_id' => $honor->student_id,
                    'student_name' => $honor->student?->name ?? 'Unknown',
                    'honor_id' => $honor->id,
                ]);
            }

            foreach ($parentRelationships as $relationship) {
                if ($relationship->parent && $relationship->parent->email) {
                    try {
                        // Use the new comprehensive honor qualification email
                        Mail::to($relationship->parent->email)->send(
                            new StudentHonorQualificationEmail(
                                $honor->student,
                                $relationship->parent,
                                $honor
                            )
                        );

                        Log::info('Parent honor notification queued by principal', [
                            'parent_id' => $relationship->parent->id,
                            'parent_name' => $relationship->parent->name,
                            'parent_email' => $relationship->parent->email,
                            'student_id' => $honor->student_id,
                            'student_name' => $honor->student?->name ?? 'Unknown',
                            'honor_id' => $honor->id,
                            'honor_type' => $honor->honorType?->name ?? 'Unknown',
                            'approved_by' => 'principal',
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to send parent honor notification', [
                            'parent_id' => $relationship->parent->id,
                            'parent_email' => $relationship->parent->email,
                            'student_id' => $honor->student_id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                } else {
                    Log::warning('Cannot send parent honor notification - missing parent or email', [
                        'relationship_id' => $relationship->id,
                        'has_parent' => $relationship->parent !== null,
                        'parent_email' => $relationship->parent?->email ?? 'N/A',
                        'student_id' => $honor->student_id,
                    ]);
                }
            }

            Log::info('Completed parent notifications for honor approval', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'total_parents' => $parentRelationships->count(),
                'parents_with_email' => $parentRelationships->filter(fn($r) => $r->parent && $r->parent->email)->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send honor notifications by principal', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
    
    // API methods
    public function getPendingHonors()
    {
        $user = Auth::user();

        // Principal can only handle their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        
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
        $user = Auth::user();

        // Principal can only handle their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        
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
        $user = Auth::user();

        // Principal can only handle their assigned academic level
        $allowedAcademicLevels = [$user->year_level];
        
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
