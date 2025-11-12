<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use App\Models\Department;
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

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            abort(403, 'You must be assigned to a department to access honors.');
        }

        // Chairperson can only handle College honors from their department
        $honors = HonorResult::with(['student.section', 'student.course', 'honorType', 'academicLevel'])
            ->whereHas('academicLevel', function($query) {
                $query->where('key', 'college');
            })
            ->whereHas('student', function($query) use ($user) {
                $query->whereHas('course', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                });
            })
            ->latest('created_at')
            ->paginate(20);

        $stats = [
            'pending' => HonorResult::where('is_pending_approval', true)
                ->whereHas('academicLevel', function($query) {
                    $query->where('key', 'college');
                })
                ->whereHas('student', function($query) use ($user) {
                    $query->whereHas('course', function($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->count(),
            'approved' => HonorResult::where('is_approved', true)
                ->whereHas('academicLevel', function($query) {
                    $query->where('key', 'college');
                })
                ->whereHas('student', function($query) use ($user) {
                    $query->whereHas('course', function($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->count(),
            'rejected' => HonorResult::where('is_rejected', true)
                ->whereHas('academicLevel', function($query) {
                    $query->where('key', 'college');
                })
                ->whereHas('student', function($query) use ($user) {
                    $query->whereHas('course', function($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->count(),
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

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            abort(403, 'You must be assigned to a department to access honors.');
        }

        // Chairperson can only handle College honors from their department
        $honors = HonorResult::where('is_pending_approval', true)
            ->whereHas('academicLevel', function($query) {
                $query->where('key', 'college');
            })
            ->whereHas('student', function($query) use ($user) {
                $query->whereHas('course', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                });
            })
            ->with(['student', 'student.course', 'honorType', 'academicLevel'])
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
        
        // Verify that chairperson can only approve College honors
        if (!$honor->academicLevel || $honor->academicLevel->key !== 'college') {
            abort(403, 'Chairperson can only approve College honors.');
        }
        
        // Verify department relationship for college students
        if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
            abort(403, 'You can only approve honors from your department.');
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
                    'approved_by' => 'chairperson',
                ]);
            }
        } catch (\Exception $e) {
            $certificateError = $e->getMessage();
            Log::error('Certificate generation FAILED for approved honor', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'academic_level' => $honor->academicLevel->key,
                'error' => $certificateError,
                'approved_by' => 'chairperson',
            ]);
        }

        // Send parent notification emails
        $this->sendParentNotifications($honor, $certificate);
        
        Log::info('Honor approved by chairperson', [
            'chairperson_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
            'academic_level' => $honor->academicLevel?->name ?? 'Unknown',
            'department_id' => $user->department_id,
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
    
    /**
     * Send honor notification emails to all parents of the student
     */
    private function sendParentNotifications($honor, $certificate = null)
    {
        try {
            // Send email directly to the student
            if ($honor->student && $honor->student->email) {
                Mail::to($honor->student->email)->send(
                    new StudentHonorQualificationEmail(
                        $honor->student,
                        $honor->student, // Student as recipient
                        $honor
                    )
                );

                Log::info('[CHAIRPERSON APPROVAL] Student honor notification sent', [
                    'student_id' => $honor->student_id,
                    'student_name' => $honor->student->name,
                    'student_email' => $honor->student->email,
                    'honor_id' => $honor->id,
                    'honor_type' => $honor->honorType?->name ?? 'Unknown',
                    'gpa' => $honor->gpa,
                    'school_year' => $honor->school_year,
                    'approved_by' => 'chairperson',
                    'chairperson_id' => Auth::id(),
                    'chairperson_name' => Auth::user()->name,
                    'timestamp' => now()->toDateTimeString(),
                ]);
            }

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
                    
            Log::info('[CHAIRPERSON APPROVAL] Parent honor notification sent', [
                'parent_id' => $relationship->parent->id,
                'parent_name' => $relationship->parent->name,
                'parent_email' => $relationship->parent->email,
                'student_id' => $honor->student_id,
                'student_name' => $honor->student->name,
                'honor_id' => $honor->id,
                'honor_type' => $honor->honorType?->name ?? 'Unknown',
                'approved_by' => 'chairperson',
                'chairperson_id' => Auth::id(),
                'timestamp' => now()->toDateTimeString(),
            ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to send parent honor notifications by chairperson', [
                'honor_id' => $honor->id,
                'student_id' => $honor->student_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    public function rejectHonor(Request $request, $honorId)
    {
        $user = Auth::user();
        $honor = HonorResult::with(['student', 'academicLevel', 'honorType'])->findOrFail($honorId);
        
        // Verify that chairperson can only reject College honors
        if (!$honor->academicLevel || $honor->academicLevel->key !== 'college') {
            abort(403, 'Chairperson can only reject College honors.');
        }
        
        // Verify department relationship for college students
        if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
            abort(403, 'You can only reject honors from your department.');
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
        
        Log::info('Honor rejected by chairperson', [
            'chairperson_id' => $user->id,
            'honor_id' => $honorId,
            'student_id' => $honor->student_id,
            'honor_type' => $honor->honorType?->name ?? 'Unknown',
            'academic_level' => $honor->academicLevel?->name ?? 'Unknown',
            'department_id' => $user->department_id,
            'reason' => $validated['rejection_reason'],
        ]);
        
        return back()->with('success', 'Honor rejected.');
    }
    
    public function reviewHonor($honorId)
    {
        $user = Auth::user();

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            abort(403, 'You must be assigned to a department to access honors.');
        }

        $honor = HonorResult::with(['student', 'student.course', 'honorType', 'academicLevel'])
            ->findOrFail($honorId);

        // Verify that chairperson can only review College honors
        if (!$honor->academicLevel || $honor->academicLevel->key !== 'college') {
            abort(403, 'Chairperson can only review College honors.');
        }

        // Verify department relationship for college students
        if (!$honor->student || !$honor->student->course || $user->department_id !== $honor->student->course->department_id) {
            abort(403, 'You can only review honors from your department.');
        }

        return Inertia::render('Chairperson/Honors/Review', [
            'user' => $user,
            'honor' => $honor,
        ]);
    }
    
    // API methods
    public function getPendingHonors()
    {
        $user = Auth::user();

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            return response()->json(['error' => 'You must be assigned to a department to access honors.'], 403);
        }

        // Chairperson can only handle College honors from their department
        $honors = HonorResult::where('is_pending_approval', true)
            ->whereHas('academicLevel', function($query) {
                $query->where('key', 'college');
            })
            ->whereHas('student', function($query) use ($user) {
                $query->whereHas('course', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                });
            })
            ->with(['student', 'student.course', 'honorType', 'academicLevel'])
            ->latest('created_at')
            ->get();

        return response()->json($honors);
    }

    public function getApprovedHonors()
    {
        $user = Auth::user();

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            return response()->json(['error' => 'You must be assigned to a department to access honors.'], 403);
        }

        // Chairperson can only handle College honors from their department
        $honors = HonorResult::where('is_approved', true)
            ->whereHas('academicLevel', function($query) {
                $query->where('key', 'college');
            })
            ->whereHas('student', function($query) use ($user) {
                $query->whereHas('course', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                });
            })
            ->with(['student', 'student.course', 'honorType', 'academicLevel'])
            ->latest('approved_at')
            ->get();

        return response()->json($honors);
    }

    public function getRejectedHonors()
    {
        $user = Auth::user();

        // Chairperson must be assigned to a department
        if (!$user->department_id) {
            return response()->json(['error' => 'You must be assigned to a department to access honors.'], 403);
        }

        // Chairperson can only handle College honors from their department
        $honors = HonorResult::where('is_rejected', true)
            ->whereHas('academicLevel', function($query) {
                $query->where('key', 'college');
            })
            ->whereHas('student', function($query) use ($user) {
                $query->whereHas('course', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                });
            })
            ->with(['student', 'student.course', 'honorType', 'academicLevel'])
            ->latest('rejected_at')
            ->get();

        return response()->json($honors);
    }
}
