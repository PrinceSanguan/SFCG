<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing activity logs throughout the application.
 * Provides consistent logging to both Laravel logs and database activity_logs table.
 */
class ActivityLogService
{
    /**
     * Log an activity to both Laravel log and database.
     *
     * @param string $action The action being performed (e.g., 'student_enrolled_in_subject', 'csv_upload')
     * @param string $message Human-readable message for Laravel log
     * @param array $details Additional details to store in database (will be JSON encoded)
     * @param string|null $entityType Type of entity affected (e.g., 'student', 'subject', 'enrollment')
     * @param int|null $entityId ID of the affected entity
     * @param int|null $targetUserId User who was affected (for user management actions)
     * @param string $level Log level (info, warning, error, debug)
     * @return ActivityLog|null The created activity log record
     */
    public static function log(
        string $action,
        string $message,
        array $details = [],
        ?string $entityType = null,
        ?int $entityId = null,
        ?int $targetUserId = null,
        string $level = 'info'
    ): ?ActivityLog {
        // Log to Laravel log file
        Log::{$level}($message, array_merge(['action' => $action], $details));

        // Log to database activity_logs table
        try {
            return ActivityLog::create([
                'user_id' => Auth::id() ?? 1, // Default to system user (ID 1) if not authenticated
                'target_user_id' => $targetUserId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'details' => $details,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            // If database logging fails, still log to Laravel log
            Log::error("Failed to create activity log: {$e->getMessage()}", [
                'action' => $action,
                'original_message' => $message,
            ]);
            return null;
        }
    }

    /**
     * Log student enrollment in a subject.
     *
     * @param int $studentId
     * @param int $subjectId
     * @param string $schoolYear
     * @param string $source Where the enrollment came from (e.g., 'automatic', 'csv_upload', 'manual', 'section_assignment')
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logStudentEnrollment(
        int $studentId,
        int $subjectId,
        string $schoolYear,
        string $source = 'automatic',
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'student_id' => $studentId,
            'subject_id' => $subjectId,
            'school_year' => $schoolYear,
            'source' => $source,
        ], $additionalDetails);

        $message = "Student {$studentId} enrolled in subject {$subjectId} with school_year {$schoolYear} (source: {$source})";

        return self::log(
            action: 'student_enrolled_in_subject',
            message: $message,
            details: $details,
            entityType: 'student_subject_assignment',
            entityId: $subjectId,
            targetUserId: $studentId
        );
    }

    /**
     * Log CSV student upload.
     *
     * @param int $uploadedBy User ID who uploaded the CSV
     * @param string $academicLevel
     * @param int $successCount
     * @param int $failureCount
     * @param array $errors
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logCsvUpload(
        int $uploadedBy,
        string $academicLevel,
        int $successCount,
        int $failureCount,
        array $errors = [],
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'academic_level' => $academicLevel,
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'errors' => $errors,
        ], $additionalDetails);

        $message = "CSV upload for {$academicLevel}: {$successCount} students created, {$failureCount} failed";

        return self::log(
            action: 'csv_student_upload',
            message: $message,
            details: $details,
            entityType: 'user',
            entityId: null,
            targetUserId: null,
            level: $failureCount > 0 ? 'warning' : 'info'
        );
    }

    /**
     * Log student query for grade management.
     *
     * @param int $instructorId
     * @param int $subjectId
     * @param string $schoolYear
     * @param int $studentCount Number of students found
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logStudentQuery(
        int $instructorId,
        int $subjectId,
        string $schoolYear,
        int $studentCount,
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'instructor_id' => $instructorId,
            'subject_id' => $subjectId,
            'school_year' => $schoolYear,
            'student_count' => $studentCount,
        ], $additionalDetails);

        $message = "Instructor {$instructorId} viewing subject {$subjectId} with school_year {$schoolYear}: Found {$studentCount} students";

        return self::log(
            action: 'instructor_student_query',
            message: $message,
            details: $details,
            entityType: 'subject',
            entityId: $subjectId,
            targetUserId: null,
            level: $studentCount === 0 ? 'warning' : 'info'
        );
    }

    /**
     * Log school year mismatch warning.
     *
     * @param int $studentId
     * @param string $studentSchoolYear
     * @param string $expectedSchoolYear
     * @param string $context
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logSchoolYearMismatch(
        int $studentId,
        string $studentSchoolYear,
        string $expectedSchoolYear,
        string $context,
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'student_id' => $studentId,
            'student_school_year' => $studentSchoolYear,
            'expected_school_year' => $expectedSchoolYear,
            'context' => $context,
        ], $additionalDetails);

        $message = "School year mismatch for student {$studentId}: has '{$studentSchoolYear}' but expected '{$expectedSchoolYear}' (context: {$context})";

        return self::log(
            action: 'school_year_mismatch',
            message: $message,
            details: $details,
            entityType: 'student',
            entityId: $studentId,
            targetUserId: $studentId,
            level: 'warning'
        );
    }

    /**
     * Log enrollment year update (for migration).
     *
     * @param int $assignmentId
     * @param int $studentId
     * @param string $oldSchoolYear
     * @param string $newSchoolYear
     * @param string $source
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logEnrollmentYearUpdate(
        int $assignmentId,
        int $studentId,
        string $oldSchoolYear,
        string $newSchoolYear,
        string $source,
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
            'old_school_year' => $oldSchoolYear,
            'new_school_year' => $newSchoolYear,
            'source' => $source,
        ], $additionalDetails);

        $message = "Updated student_subject_assignment {$assignmentId} school_year from '{$oldSchoolYear}' to '{$newSchoolYear}' (source: {$source})";

        return self::log(
            action: 'enrollment_year_updated',
            message: $message,
            details: $details,
            entityType: 'student_subject_assignment',
            entityId: $assignmentId,
            targetUserId: $studentId
        );
    }

    /**
     * Log section school year usage.
     *
     * @param int $studentId
     * @param int $sectionId
     * @param string $sectionSchoolYear
     * @param string $context
     * @param array $additionalDetails
     * @return ActivityLog|null
     */
    public static function logSectionSchoolYearUsage(
        int $studentId,
        int $sectionId,
        string $sectionSchoolYear,
        string $context,
        array $additionalDetails = []
    ): ?ActivityLog {
        $details = array_merge([
            'student_id' => $studentId,
            'section_id' => $sectionId,
            'section_school_year' => $sectionSchoolYear,
            'context' => $context,
        ], $additionalDetails);

        $message = "Using section {$sectionId} school_year '{$sectionSchoolYear}' for student {$studentId} (context: {$context})";

        return self::log(
            action: 'section_school_year_used',
            message: $message,
            details: $details,
            entityType: 'section',
            entityId: $sectionId,
            targetUserId: $studentId,
            level: 'debug'
        );
    }
}
