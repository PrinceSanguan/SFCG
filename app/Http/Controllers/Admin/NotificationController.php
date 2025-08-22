<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    private function sharedUser(): array
    {
        $user = Auth::user();
        return [
            'name' => $user?->name ?? '',
            'email' => $user?->email ?? '',
            'user_role' => method_exists($user, 'getAttribute') ? ($user->user_role ?? '') : '',
        ];
    }

    public function index()
    {
        $notifications = Notification::orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = $this->notificationService->getNotificationStats();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();

        return Inertia::render('Admin/Notifications/Index', [
            'user' => $this->sharedUser(),
            'notifications' => $notifications,
            'stats' => $stats,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function previewGradeNotifications(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);

        try {
            $preview = $this->notificationService->getGradeNotificationPreview(
                $validated['school_year'],
                $validated['academic_level_id'] ?? null
            );

            return response()->json($preview);
        } catch (\Exception $e) {
            Log::error('Failed to preview grade notifications', [
                'error' => $e->getMessage(),
                'request' => $validated
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to preview grade notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    public function previewHonorNotifications(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);

        try {
            $preview = $this->notificationService->getHonorNotificationPreview(
                $validated['school_year'],
                $validated['academic_level_id'] ?? null
            );

            return response()->json($preview);
        } catch (\Exception $e) {
            Log::error('Failed to preview honor notifications', [
                'error' => $e->getMessage(),
                'request' => $validated
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to preview honor notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sendGradeNotifications(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);

        try {
            $result = $this->notificationService->sendGradeUpdateNotifications(
                $validated['school_year'],
                $validated['academic_level_id'] ?? null
            );

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->withErrors(['error' => $result['message']]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send grade notifications', [
                'error' => $e->getMessage(),
                'request' => $validated
            ]);

            return back()->withErrors(['error' => 'Failed to send grade notifications. Please try again.']);
        }
    }

    public function sendHonorNotifications(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);

        try {
            $result = $this->notificationService->sendHonorQualificationNotifications(
                $validated['school_year'],
                $validated['academic_level_id'] ?? null
            );

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->withErrors(['error' => $result['message']]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send honor notifications', [
                'error' => $e->getMessage(),
                'request' => $validated
            ]);

            return back()->withErrors(['error' => 'Failed to send honor notifications. Please try again.']);
        }
    }

    public function sendGeneralAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'email',
            'email_subject' => 'nullable|string|max:255',
            'email_body' => 'nullable|string',
        ]);

        try {
            $result = $this->notificationService->sendGeneralAnnouncement(
                $validated['title'],
                $validated['message'],
                $validated['recipients'],
                $validated['email_subject'],
                $validated['email_body']
            );

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->withErrors(['error' => $result['message']]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send general announcement', [
                'error' => $e->getMessage(),
                'request' => $validated
            ]);

            return back()->withErrors(['error' => 'Failed to send general announcement. Please try again.']);
        }
    }

    public function getRecipients(Request $request)
    {
        $query = User::query();

        if ($request->filled('role') && $request->get('role') !== 'all') {
            $query->where('user_role', $request->get('role'));
        }

        if ($request->filled('academic_level_id') && $request->get('academic_level_id') !== 'all') {
            $query->where('academic_level_id', $request->get('academic_level_id'));
        }

        $recipients = $query->select('id', 'name', 'email', 'user_role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'label' => "{$user->name} ({$user->email}) - {$user->user_role}",
                    'value' => $user->email,
                ];
            });

        return response()->json($recipients);
    }

    public function resendFailed(Request $request, Notification $notification)
    {
        try {
            if ($notification->status !== Notification::STATUS_FAILED) {
                return back()->withErrors(['error' => 'Only failed notifications can be resent.']);
            }

            // Reset status to pending
            $notification->update(['status' => Notification::STATUS_PENDING]);

            // Attempt to resend based on type
            switch ($notification->type) {
                case Notification::TYPE_GRADE_UPDATE:
                    $this->resendGradeNotification($notification);
                    break;
                case Notification::TYPE_HONOR_QUALIFICATION:
                    $this->resendHonorNotification($notification);
                    break;
                default:
                    return back()->withErrors(['error' => 'Cannot resend this type of notification.']);
            }

            return back()->with('success', 'Notification resent successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to resend notification', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to resend notification. Please try again.']);
        }
    }

    private function resendGradeNotification(Notification $notification)
    {
        $metadata = $notification->metadata;
        $student = User::find($metadata['student_id']);
        
        if (!$student) {
            throw new \Exception('Student not found');
        }

        $grades = \App\Models\StudentGrade::with(['subject', 'gradingPeriod', 'academicLevel'])
            ->where('student_id', $student->id)
            ->where('school_year', $metadata['school_year'])
            ->get();

        $academicLevel = \App\Models\AcademicLevel::find($metadata['academic_level_id']);

        Mail::mailer('gmail')->to($student->email)->send(
            new \App\Mail\GradeUpdateEmail($student, $grades, $metadata['school_year'], $academicLevel)
        );

        $notification->markAsSent();
    }

    private function resendHonorNotification(Notification $notification)
    {
        $metadata = $notification->metadata;
        $student = User::find($metadata['student_id']);
        $honorResult = \App\Models\HonorResult::with(['honorType', 'academicLevel'])
            ->find($metadata['honor_result_id']);
        
        if (!$student || !$honorResult) {
            throw new \Exception('Student or honor result not found');
        }

        Mail::mailer('gmail')->to($student->email)->send(
            new \App\Mail\HonorQualificationEmail($student, $honorResult, $metadata['school_year'])
        );

        $notification->markAsSent();
    }
}
