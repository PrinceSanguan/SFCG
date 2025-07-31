<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Models\Notification;
use App\Models\User;
use App\Models\ActivityLog;
use App\Mail\BulkEmail;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::with('user');

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->filled('user_role')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('user_role', $request->user_role);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $notificationTypes = Notification::distinct()->pluck('type');
        $userRoles = User::distinct()->pluck('user_role');

        // Get stats
        $stats = [
            'total' => Notification::count(),
            'unread' => Notification::where('is_read', false)->count(),
            'read' => Notification::where('is_read', true)->count(),
            'today' => Notification::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'notificationTypes' => $notificationTypes,
            'userRoles' => $userRoles,
            'stats' => $stats,
            'filters' => $request->only(['type', 'is_read', 'user_role', 'search'])
        ]);
    }

    public function compose()
    {
        $userRoles = User::distinct()->pluck('user_role');
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'user_role']);

        return Inertia::render('Admin/Notifications/Compose', [
            'userRoles' => $userRoles,
            'users' => $users
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'recipient_type' => 'required|in:all,role,individual,custom',
            'recipient_roles' => 'required_if:recipient_type,role|array',
            'recipient_roles.*' => 'in:admin,instructor,teacher,class_adviser,chairperson,principal,registrar,student,parent',
            'recipient_users' => 'required_if:recipient_type,individual|array',
            'recipient_users.*' => 'exists:users,id',
            'recipient_emails' => 'required_if:recipient_type,custom|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'send_email' => 'boolean',
            'send_notification' => 'boolean',
            'notification_type' => 'required_if:send_notification,true|string|max:50',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $recipients = $this->getRecipients($request);
                $sentCount = 0;
                $emailsSent = 0;
                $notificationsSent = 0;

                foreach ($recipients as $recipient) {
                    // Send in-app notification
                    if ($request->boolean('send_notification')) {
                        if (isset($recipient['user_id'])) {
                            Notification::create([
                                'user_id' => $recipient['user_id'],
                                'title' => $request->title,
                                'message' => $request->message,
                                'type' => $request->notification_type,
                                'data' => [
                                    'sent_by' => Auth::user()->name,
                                    'sent_at' => now(),
                                ],
                                'is_read' => false,
                            ]);
                            $notificationsSent++;
                        }
                    }

                    // Send email
                    if ($request->boolean('send_email') && isset($recipient['email'])) {
                        try {
                            Mail::to($recipient['email'])->send(
                                new BulkEmail(
                                    $request->title,
                                    $request->message,
                                    Auth::user()->name
                                )
                            );
                            $emailsSent++;
                        } catch (\Exception $e) {
                            \Log::error('Failed to send email', [
                                'email' => $recipient['email'],
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    $sentCount++;
                }

                // Log activity
                ActivityLog::logActivity(
                    Auth::user(),
                    'sent_bulk_notification',
                    'Notification',
                    null,
                    null,
                    [
                        'title' => $request->title,
                        'recipient_type' => $request->recipient_type,
                        'total_recipients' => $sentCount,
                        'emails_sent' => $emailsSent,
                        'notifications_sent' => $notificationsSent,
                    ]
                );
            });

            return redirect()->route('admin.notifications.index')
                           ->with('success', "Messages sent successfully to {$sentCount} recipients.");

        } catch (\Exception $e) {
            return redirect()->back()
                           ->with('error', 'Failed to send messages: ' . $e->getMessage());
        }
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        $count = Notification::whereIn('id', $request->notification_ids)
                            ->where('is_read', false)
                            ->update(['is_read' => true, 'read_at' => now()]);

        ActivityLog::logActivity(
            Auth::user(),
            'marked_notifications_read',
            'Notification',
            null,
            null,
            ['count' => $count]
        );

        return redirect()->back()->with('success', "{$count} notifications marked as read.");
    }

    public function markAsUnread(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        $count = Notification::whereIn('id', $request->notification_ids)
                            ->where('is_read', true)
                            ->update(['is_read' => false, 'read_at' => null]);

        ActivityLog::logActivity(
            Auth::user(),
            'marked_notifications_unread',
            'Notification',
            null,
            null,
            ['count' => $count]
        );

        return redirect()->back()->with('success', "{$count} notifications marked as unread.");
    }

    public function delete(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        $count = Notification::whereIn('id', $request->notification_ids)->count();
        Notification::whereIn('id', $request->notification_ids)->delete();

        ActivityLog::logActivity(
            Auth::user(),
            'deleted_notifications',
            'Notification',
            null,
            null,
            ['count' => $count]
        );

        return redirect()->back()->with('success', "{$count} notifications deleted.");
    }

    public function templates()
    {
        $templates = $this->getEmailTemplates();

        return Inertia::render('Admin/Notifications/Templates', [
            'templates' => $templates
        ]);
    }

    public function analytics()
    {
        $analytics = [
            'total_sent' => Notification::count(),
            'emails_sent_today' => $this->getEmailsSentToday(),
            'notifications_by_type' => Notification::groupBy('type')
                                                  ->selectRaw('type, count(*) as count')
                                                  ->pluck('count', 'type'),
            'read_rate' => $this->calculateReadRate(),
            'recent_activity' => Notification::with('user')
                                            ->orderBy('created_at', 'desc')
                                            ->limit(10)
                                            ->get(),
            'monthly_stats' => $this->getMonthlyStats(),
        ];

        return Inertia::render('Admin/Notifications/Analytics', [
            'analytics' => $analytics
        ]);
    }

    private function getRecipients(Request $request)
    {
        $recipients = [];

        switch ($request->recipient_type) {
            case 'all':
                $users = User::all(['id', 'name', 'email']);
                foreach ($users as $user) {
                    $recipients[] = [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }
                break;

            case 'role':
                $users = User::whereIn('user_role', $request->recipient_roles)
                           ->get(['id', 'name', 'email']);
                foreach ($users as $user) {
                    $recipients[] = [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }
                break;

            case 'individual':
                $users = User::whereIn('id', $request->recipient_users)
                           ->get(['id', 'name', 'email']);
                foreach ($users as $user) {
                    $recipients[] = [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }
                break;

            case 'custom':
                $emails = array_filter(array_map('trim', explode(',', $request->recipient_emails)));
                foreach ($emails as $email) {
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $recipients[] = [
                            'user_id' => null,
                            'name' => $email,
                            'email' => $email,
                        ];
                    }
                }
                break;
        }

        return $recipients;
    }

    private function getEmailTemplates()
    {
        return [
            [
                'id' => 'welcome',
                'name' => 'Welcome Email',
                'subject' => 'Welcome to Our School System',
                'content' => 'Dear {name}, welcome to our school management system...'
            ],
            [
                'id' => 'grade_notification',
                'name' => 'Grade Notification',
                'subject' => 'Grade Update Notification',
                'content' => 'Dear {name}, your grades have been updated...'
            ],
            [
                'id' => 'honor_achievement',
                'name' => 'Honor Achievement',
                'subject' => 'Congratulations on Your Achievement!',
                'content' => 'Dear {name}, congratulations on achieving honor roll...'
            ],
        ];
    }

    private function getEmailsSentToday()
    {
        // This would typically be tracked in a separate table or service
        // For now, return a placeholder
        return Notification::whereDate('created_at', today())->count();
    }

    private function calculateReadRate()
    {
        $total = Notification::count();
        $read = Notification::where('is_read', true)->count();
        
        return $total > 0 ? round(($read / $total) * 100, 2) : 0;
    }

    private function getMonthlyStats()
    {
        return Notification::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
                          ->groupBy('year', 'month')
                          ->orderBy('year', 'desc')
                          ->orderBy('month', 'desc')
                          ->limit(12)
                          ->get()
                          ->map(function ($item) {
                              return [
                                  'month' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                                  'count' => $item->count
                              ];
                          });
    }
}
