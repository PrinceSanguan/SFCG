<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\AcademicLevel;
use App\Mail\GradeUpdateEmail;
use App\Mail\HonorQualificationEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send grade update notifications to students (MANUAL TRIGGER)
     */
    public function sendGradeUpdateNotifications($schoolYear, $academicLevelId = null)
    {
        try {
            $query = StudentGrade::with(['student', 'subject', 'gradingPeriod', 'academicLevel'])
                ->where('school_year', $schoolYear);

            if ($academicLevelId && $academicLevelId !== 'all') {
                $query->where('academic_level_id', $academicLevelId);
            }

            $grades = $query->get();
            
            if ($grades->isEmpty()) {
                Log::info('No grades found for notifications', ['school_year' => $schoolYear]);
                return [
                    'success' => false,
                    'message' => 'No grades found for the selected criteria',
                    'count' => 0
                ];
            }

            // Group grades by student
            $studentGrades = $grades->groupBy('student_id');
            $successCount = 0;
            $failedCount = 0;
            
            foreach ($studentGrades as $studentId => $studentGradeList) {
                $student = $studentGradeList->first()->student;
                $academicLevel = $studentGradeList->first()->academicLevel;
                
                if (!$student || !$academicLevel) {
                    continue;
                }

                // Create notification record
                $notification = Notification::create([
                    'type' => Notification::TYPE_GRADE_UPDATE,
                    'title' => 'Grade Update Notification',
                    'message' => "Grades updated for {$student->name} for {$schoolYear}",
                    'recipients' => [$student->email],
                    'status' => Notification::STATUS_PENDING,
                    'metadata' => [
                        'student_id' => $student->id,
                        'school_year' => $schoolYear,
                        'academic_level_id' => $academicLevel->id,
                        'grade_count' => $studentGradeList->count(),
                    ],
                    'email_subject' => "Grade Update Notification - {$schoolYear}",
                    'email_body' => "Your grades for {$schoolYear} have been updated.",
                ]);

                // Send email
                try {
                    Mail::to($student->email)->send(
                        new GradeUpdateEmail($student, $studentGradeList, $schoolYear, $academicLevel)
                    );
                    
                    $notification->markAsSent();
                    $successCount++;
                    
                    Log::info('Grade update email sent successfully', [
                        'student_id' => $student->id,
                        'email' => $student->email,
                        'notification_id' => $notification->id
                    ]);
                } catch (\Exception $e) {
                    $notification->markAsFailed();
                    $failedCount++;
                    
                    Log::error('Failed to send grade update email', [
                        'student_id' => $student->id,
                        'email' => $student->email,
                        'error' => $e->getMessage(),
                        'notification_id' => $notification->id
                    ]);
                }
            }

            Log::info('Grade update notifications completed', [
                'school_year' => $schoolYear,
                'total_students' => $studentGrades->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ]);

            return [
                'success' => true,
                'message' => "Grade notifications sent successfully! {$successCount} emails sent, {$failedCount} failed.",
                'count' => $studentGrades->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ];

        } catch (\Exception $e) {
            Log::error('Error sending grade update notifications', [
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Error sending grade notifications: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }

    /**
     * Send honor qualification notifications to students (MANUAL TRIGGER)
     */
    public function sendHonorQualificationNotifications($schoolYear, $academicLevelId = null)
    {
        try {
            $query = HonorResult::with(['student', 'honorType', 'academicLevel'])
                ->where('school_year', $schoolYear);

            if ($academicLevelId && $academicLevelId !== 'all') {
                $query->where('academic_level_id', $academicLevelId);
            }

            $honorResults = $query->get();
            
            if ($honorResults->isEmpty()) {
                Log::info('No honor results found for notifications', ['school_year' => $schoolYear]);
                return [
                    'success' => false,
                    'message' => 'No honor results found for the selected criteria',
                    'count' => 0
                ];
            }

            $successCount = 0;
            $failedCount = 0;

            foreach ($honorResults as $honorResult) {
                $student = $honorResult->student;
                
                if (!$student) {
                    continue;
                }

                // Create notification record
                $notification = Notification::create([
                    'type' => Notification::TYPE_HONOR_QUALIFICATION,
                    'title' => 'Honor Qualification Achievement',
                    'message' => "{$student->name} qualified for {$honorResult->honorType->name}",
                    'recipients' => [$student->email],
                    'status' => Notification::STATUS_PENDING,
                    'metadata' => [
                        'student_id' => $student->id,
                        'honor_result_id' => $honorResult->id,
                        'honor_type' => $honorResult->honorType->name,
                        'gpa' => $honorResult->gpa,
                        'school_year' => $schoolYear,
                    ],
                    'email_subject' => "Honor Qualification Achievement - {$schoolYear}",
                    'email_body' => "Congratulations! You have qualified for {$honorResult->honorType->name}.",
                ]);

                // Send email
                try {
                    Mail::to($student->email)->send(
                        new HonorQualificationEmail($student, $honorResult, $schoolYear)
                    );
                    
                    $notification->markAsSent();
                    $successCount++;
                    
                    Log::info('Honor qualification email sent successfully', [
                        'student_id' => $student->id,
                        'email' => $student->email,
                        'honor_type' => $honorResult->honorType->name,
                        'notification_id' => $notification->id
                    ]);
                } catch (\Exception $e) {
                    $notification->markAsFailed();
                    $failedCount++;
                    
                    Log::error('Failed to send honor qualification email', [
                        'student_id' => $student->id,
                        'email' => $student->email,
                        'error' => $e->getMessage(),
                        'notification_id' => $notification->id
                    ]);
                }
            }

            Log::info('Honor qualification notifications completed', [
                'school_year' => $schoolYear,
                'total_honors' => $honorResults->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ]);

            return [
                'success' => true,
                'message' => "Honor notifications sent successfully! {$successCount} emails sent, {$failedCount} failed.",
                'count' => $honorResults->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ];

        } catch (\Exception $e) {
            Log::error('Error sending honor qualification notifications', [
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Error sending honor notifications: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }

    /**
     * Send honor qualification notifications to parents (MANUAL TRIGGER)
     */
    public function sendParentHonorNotifications($schoolYear, $academicLevelId = null)
    {
        try {
            $query = HonorResult::with(['student.parents', 'honorType', 'academicLevel'])
                ->where('school_year', $schoolYear);

            if ($academicLevelId && $academicLevelId !== 'all') {
                $query->where('academic_level_id', $academicLevelId);
            }

            $honorResults = $query->get();
            
            if ($honorResults->isEmpty()) {
                Log::info('No honor results found for parent notifications', ['school_year' => $schoolYear]);
                return [
                    'success' => false,
                    'message' => 'No honor results found for the selected criteria',
                    'count' => 0
                ];
            }

            $successCount = 0;
            $failedCount = 0;
            $totalParentsNotified = 0;

            foreach ($honorResults as $honorResult) {
                $student = $honorResult->student;
                
                if (!$student) {
                    continue;
                }

                // Get linked parents
                $parents = $student->parents;
                
                if ($parents->isEmpty()) {
                    Log::info('No parents linked to student', [
                        'student_id' => $student->id,
                        'student_name' => $student->name
                    ]);
                    continue;
                }

                foreach ($parents as $parent) {
                    // Create notification record
                    $notification = Notification::create([
                        'type' => Notification::TYPE_HONOR_QUALIFICATION,
                        'title' => 'Child Honor Qualification Achievement',
                        'message' => "Your child {$student->name} qualified for {$honorResult->honorType->name}",
                        'recipients' => [$parent->email],
                        'status' => Notification::STATUS_PENDING,
                        'metadata' => [
                            'parent_id' => $parent->id,
                            'student_id' => $student->id,
                            'honor_result_id' => $honorResult->id,
                            'honor_type' => $honorResult->honorType->name,
                            'gpa' => $honorResult->gpa,
                            'school_year' => $schoolYear,
                        ],
                        'email_subject' => "Honor Qualification Achievement - {$student->name} - {$schoolYear}",
                        'email_body' => "Congratulations! Your child has qualified for {$honorResult->honorType->name}.",
                    ]);

                    // Send email
                    try {
                        Mail::to($parent->email)->send(
                            new \App\Mail\ParentHonorNotificationEmail($parent, $student, $honorResult, $schoolYear)
                        );
                        
                        $notification->markAsSent();
                        $successCount++;
                        $totalParentsNotified++;
                        
                        Log::info('Parent honor notification email sent successfully', [
                            'parent_id' => $parent->id,
                            'parent_email' => $parent->email,
                            'student_id' => $student->id,
                            'student_name' => $student->name,
                            'honor_type' => $honorResult->honorType->name,
                            'notification_id' => $notification->id
                        ]);
                    } catch (\Exception $e) {
                        $notification->markAsFailed();
                        $failedCount++;
                        
                        Log::error('Failed to send parent honor notification email', [
                            'parent_id' => $parent->id,
                            'parent_email' => $parent->email,
                            'student_id' => $student->id,
                            'student_name' => $student->name,
                            'error' => $e->getMessage(),
                            'notification_id' => $notification->id
                        ]);
                    }
                }
            }

            Log::info('Parent honor notifications completed', [
                'school_year' => $schoolYear,
                'total_honors' => $honorResults->count(),
                'total_parents_notified' => $totalParentsNotified,
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ]);

            return [
                'success' => true,
                'message' => "Parent honor notifications sent successfully! {$successCount} emails sent, {$failedCount} failed.",
                'count' => $honorResults->count(),
                'total_parents_notified' => $totalParentsNotified,
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ];

        } catch (\Exception $e) {
            Log::error('Error sending parent honor notifications', [
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Error sending parent honor notifications: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }

    /**
     * Send general announcement to multiple recipients (MANUAL TRIGGER)
     */
    public function sendGeneralAnnouncement($title, $message, $recipients, $emailSubject = null, $emailBody = null)
    {
        try {
            $notification = Notification::create([
                'type' => Notification::TYPE_GENERAL_ANNOUNCEMENT,
                'title' => $title,
                'message' => $message,
                'recipients' => $recipients,
                'status' => Notification::STATUS_PENDING,
                'metadata' => [
                    'announcement_type' => 'general',
                    'recipient_count' => count($recipients),
                ],
                'email_subject' => $emailSubject ?? $title,
                'email_body' => $emailBody ?? $message,
            ]);

            $successCount = 0;
            $failedCount = 0;

            // Send emails to each recipient
            foreach ($recipients as $recipientEmail) {
                try {
                    Mail::raw($message, function($mailMessage) use ($title, $recipientEmail) {
                        $mailMessage->to($recipientEmail)->subject($title);
                    });
                    
                    $successCount++;
                    Log::info('General announcement email sent successfully', [
                        'recipient' => $recipientEmail,
                        'notification_id' => $notification->id
                    ]);
                } catch (\Exception $e) {
                    $failedCount++;
                    Log::error('Failed to send general announcement email', [
                        'recipient' => $recipientEmail,
                        'error' => $e->getMessage(),
                        'notification_id' => $notification->id
                    ]);
                }
            }

            // Update notification status based on results
            if ($failedCount === 0) {
                $notification->markAsSent();
            } elseif ($successCount > 0) {
                $notification->update(['status' => 'partial_sent']);
            } else {
                $notification->markAsFailed();
            }
            
            Log::info('General announcement emails completed', [
                'title' => $title,
                'total_recipients' => count($recipients),
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'notification_id' => $notification->id
            ]);

            return [
                'success' => true,
                'message' => "General announcement sent successfully to {$successCount} recipients! {$failedCount} failed.",
                'count' => count($recipients),
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'notification_id' => $notification->id
            ];

        } catch (\Exception $e) {
            Log::error('Error creating general announcement notification', [
                'title' => $title,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Error sending general announcement: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats()
    {
        return [
            'total' => Notification::count(),
            'pending' => Notification::pending()->count(),
            'sent' => Notification::sent()->count(),
            'failed' => Notification::failed()->count(),
            'by_type' => [
                'grade_updates' => Notification::ofType(Notification::TYPE_GRADE_UPDATE)->count(),
                'honor_qualifications' => Notification::ofType(Notification::TYPE_HONOR_QUALIFICATION)->count(),
                'general_announcements' => Notification::ofType(Notification::TYPE_GENERAL_ANNOUNCEMENT)->count(),
            ],
        ];
    }

    /**
     * Get preview data for notifications (without sending)
     */
    public function getGradeNotificationPreview($schoolYear, $academicLevelId = null)
    {
        $query = StudentGrade::with(['student', 'subject', 'gradingPeriod', 'academicLevel'])
            ->where('school_year', $schoolYear);

        if ($academicLevelId && $academicLevelId !== 'all') {
            $query->where('academic_level_id', $academicLevelId);
        }

        $grades = $query->get();
        
        if ($grades->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No grades found for the selected criteria',
                'count' => 0,
                'students' => []
            ];
        }

        $studentGrades = $grades->groupBy('student_id');
        $students = [];

        foreach ($studentGrades as $studentId => $studentGradeList) {
            $student = $studentGradeList->first()->student;
            if ($student) {
                $students[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_number' => $student->student_number,
                    'grade_count' => $studentGradeList->count(),
                    'academic_level' => $studentGradeList->first()->academicLevel->name ?? 'N/A'
                ];
            }
        }

        return [
            'success' => true,
            'message' => "Found {$studentGrades->count()} students with grades for {$schoolYear}",
            'count' => $studentGrades->count(),
            'students' => $students
        ];
    }

    public function getHonorNotificationPreview($schoolYear, $academicLevelId = null)
    {
        $query = HonorResult::with(['student', 'honorType', 'academicLevel'])
            ->where('school_year', $schoolYear);

        if ($academicLevelId && $academicLevelId !== 'all') {
            $query->where('academic_level_id', $academicLevelId);
        }

        $honorResults = $query->get();

        if ($honorResults->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No honor results found for the selected criteria',
                'count' => 0,
                'students' => []
            ];
        }

        $students = [];

        foreach ($honorResults as $honorResult) {
            $student = $honorResult->student;
            if ($student) {
                $students[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_number' => $student->student_number,
                    'honor_type' => $honorResult->honorType->name ?? 'N/A',
                    'gpa' => $honorResult->gpa,
                    'academic_level' => $honorResult->academicLevel->name ?? 'N/A'
                ];
            }
        }

        return [
            'success' => true,
            'message' => "Found " . count($students) . " students with honors for {$schoolYear}",
            'count' => count($students),
            'students' => $students
        ];
    }

    /**
     * Send assignment notification to assigned user (instructor/teacher/adviser)
     */
    public function sendAssignmentNotification($user, $assignmentType, $assignmentDetails)
    {
        try {
            Log::info('Preparing assignment notification', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'assignment_type' => $assignmentType,
                'assignment_details' => $assignmentDetails
            ]);

            // Extract assignment details
            $assignmentName = $assignmentDetails['subject_name'] ?? $assignmentDetails['course_name'] ?? 'your new assignment';
            $subjectName = $assignmentDetails['subject_name'] ?? null;
            $courseName = $assignmentDetails['course_name'] ?? null;
            $academicLevel = $assignmentDetails['academic_level'] ?? null;
            $schoolYear = $assignmentDetails['school_year'] ?? null;
            $assignmentId = $assignmentDetails['assignment_id'] ?? null;

            // Create notification record
            $notification = Notification::create([
                'type' => Notification::TYPE_ASSIGNMENT_NOTIFICATION,
                'title' => ucfirst($assignmentType) . ' Assignment Notification',
                'message' => "You have been assigned as {$assignmentType}",
                'recipients' => [$user->email],
                'status' => Notification::STATUS_PENDING,
                'metadata' => [
                    'user_id' => $user->id,
                    'assignment_type' => $assignmentType,
                    'subject_name' => $subjectName,
                    'course_name' => $courseName,
                    'academic_level' => $academicLevel,
                    'school_year' => $schoolYear,
                    'assignment_id' => $assignmentId,
                ],
                'email_subject' => ucfirst($assignmentType) . ' Assignment Notification',
                'email_body' => "You have been assigned as {$assignmentType} for {$assignmentName}.",
            ]);

            Log::info('Assignment notification record created', [
                'notification_id' => $notification->id,
                'user_email' => $user->email
            ]);

            // Send email
            try {
                Log::info('Sending assignment notification email', [
                    'notification_id' => $notification->id,
                    'email' => $user->email
                ]);

                Mail::to($user->email)->send(
                    new \App\Mail\AssignmentNotificationEmail($user, $assignmentType, $assignmentDetails)
                );

                $notification->markAsSent();

                Log::info('Assignment notification sent successfully', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'assignment_type' => $assignmentType
                ]);

                return [
                    'success' => true,
                    'message' => "{$assignmentType} assignment notification sent successfully",
                    'notification_id' => $notification->id
                ];
            } catch (\Exception $e) {
                $notification->markAsFailed();

                Log::error('Failed to send assignment notification email', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'assignment_type' => $assignmentType,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to send assignment notification: ' . $e->getMessage(),
                    'notification_id' => $notification->id
                ];
            }
        } catch (\Exception $e) {
            Log::error('Error creating assignment notification', [
                'user_id' => $user->id,
                'assignment_type' => $assignmentType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error creating assignment notification: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send pending honor approval notification to Chairperson/Principal
     */
    public function sendPendingHonorApprovalNotification($academicLevel, $schoolYear, $honorCount)
    {
        try {
            Log::info('Preparing pending honor approval notification', [
                'academic_level' => $academicLevel->name,
                'academic_level_key' => $academicLevel->key,
                'school_year' => $schoolYear,
                'honor_count' => $honorCount
            ]);

            // Determine recipients based on academic level
            // Principal handles: elementary, junior_highschool, senior_highschool
            // Chairperson handles: college
            $recipients = [];
            $role = '';

            if ($academicLevel->key === 'college') {
                // Send to Chairpersons - department-specific only
                Log::info('[HONOR NOTIFICATION] Getting department-specific chairpersons', [
                    'academic_level' => $academicLevel->key,
                    'school_year' => $schoolYear,
                ]);

                // Get unique department IDs from pending honors
                $departmentIds = HonorResult::where('academic_level_id', $academicLevel->id)
                    ->where('school_year', $schoolYear)
                    ->where('is_pending_approval', true)
                    ->whereHas('student.course')
                    ->with('student.course')
                    ->get()
                    ->pluck('student.course.department_id')
                    ->unique()
                    ->filter(); // Remove nulls

                Log::info('[HONOR NOTIFICATION] Found departments with pending honors', [
                    'department_ids' => $departmentIds->toArray(),
                ]);

                // Only notify chairpersons for relevant departments
                $chairpersons = User::where('user_role', 'chairperson')
                    ->whereIn('department_id', $departmentIds)
                    ->get();

                Log::info('[HONOR NOTIFICATION] Chairpersons to notify', [
                    'count' => $chairpersons->count(),
                    'chairpersons' => $chairpersons->map(function($c) {
                        return [
                            'name' => $c->name,
                            'email' => $c->email,
                            'department_id' => $c->department_id,
                            'department_name' => $c->department?->name ?? 'N/A',
                        ];
                    })->toArray(),
                ]);

                foreach ($chairpersons as $chairperson) {
                    $recipients[] = $chairperson->email;
                }
                $role = 'Chairperson';
            } else {
                // Send to Principals (elementary, junior_highschool, senior_highschool)
                $principals = User::where('user_role', 'principal')->get();
                foreach ($principals as $principal) {
                    $recipients[] = $principal->email;
                }
                $role = 'Principal';
            }

            if (empty($recipients)) {
                Log::warning('No recipients found for honor approval notification', [
                    'academic_level' => $academicLevel->name,
                    'role' => $role
                ]);

                return [
                    'success' => false,
                    'message' => "No {$role}s found to notify"
                ];
            }

            Log::info('Recipients identified for honor approval notification', [
                'role' => $role,
                'recipient_count' => count($recipients),
                'recipients' => $recipients
            ]);

            // Create notification record
            $notification = Notification::create([
                'type' => Notification::TYPE_PENDING_HONOR_APPROVAL,
                'title' => 'Pending Honor Results for Approval',
                'message' => "{$honorCount} honor results for {$academicLevel->name} ({$schoolYear}) are pending your approval",
                'recipients' => $recipients,
                'status' => Notification::STATUS_PENDING,
                'metadata' => [
                    'academic_level_id' => $academicLevel->id,
                    'academic_level_name' => $academicLevel->name,
                    'academic_level_key' => $academicLevel->key,
                    'school_year' => $schoolYear,
                    'honor_count' => $honorCount,
                    'approver_role' => $role,
                ],
                'email_subject' => "Pending Honor Results - {$academicLevel->name} - {$schoolYear}",
                'email_body' => "{$honorCount} honor results are pending your approval.",
            ]);

            Log::info('Honor approval notification record created', [
                'notification_id' => $notification->id,
                'recipient_count' => count($recipients)
            ]);

            $successCount = 0;
            $failedCount = 0;

            // Send emails to each recipient
            foreach ($recipients as $recipientEmail) {
                try {
                    Log::info('Sending honor approval notification email', [
                        'notification_id' => $notification->id,
                        'email' => $recipientEmail,
                        'role' => $role
                    ]);

                    $recipient = User::where('email', $recipientEmail)->first();

                    // Use sendNow() to send immediately instead of queueing
                    // This ensures emails are sent right away for testing
                    Mail::to($recipientEmail)->send(
                        new \App\Mail\PendingHonorApprovalEmail($recipient, $academicLevel, $schoolYear, $honorCount)
                    );

                    $successCount++;

                    Log::info('Honor approval email sent successfully', [
                        'notification_id' => $notification->id,
                        'recipient' => $recipientEmail,
                        'role' => $role,
                        'mail_driver' => config('mail.default'),
                    ]);
                } catch (\Exception $e) {
                    $failedCount++;

                    Log::error('Failed to send honor approval email', [
                        'notification_id' => $notification->id,
                        'recipient' => $recipientEmail,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            // Update notification status based on results
            if ($failedCount === 0) {
                $notification->markAsSent();
            } elseif ($successCount > 0) {
                $notification->update(['status' => 'partial_sent']);
            } else {
                $notification->markAsFailed();
            }

            Log::info('Honor approval notifications completed', [
                'notification_id' => $notification->id,
                'academic_level' => $academicLevel->name,
                'role' => $role,
                'total_recipients' => count($recipients),
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ]);

            return [
                'success' => true,
                'message' => "Honor approval notification sent to {$role}(s) successfully! {$successCount} sent, {$failedCount} failed.",
                'notification_id' => $notification->id,
                'success_count' => $successCount,
                'failed_count' => $failedCount
            ];

        } catch (\Exception $e) {
            Log::error('Error creating honor approval notification', [
                'academic_level' => $academicLevel->name ?? 'unknown',
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error sending honor approval notification: ' . $e->getMessage()
            ];
        }
    }
}
