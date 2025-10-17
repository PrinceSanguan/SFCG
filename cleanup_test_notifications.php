<?php

/**
 * Cleanup Script for Notification System Test
 * This script removes all test data created by test_notifications.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\InstructorCourseAssignment;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorResult;
use App\Models\Notification;

echo "\n🧹 Starting Cleanup Process\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    // Load test data IDs
    $testDataFile = __DIR__.'/test_data_ids.json';

    if (!file_exists($testDataFile)) {
        echo "❌ No test data file found. Nothing to clean up.\n";
        exit(0);
    }

    $testData = json_decode(file_get_contents($testDataFile), true);

    // ============================================
    // Delete Honor Results
    // ============================================
    if (!empty($testData['honor_results'])) {
        echo "🗑️  Deleting test honor results...\n";
        $deleted = HonorResult::whereIn('id', $testData['honor_results'])->delete();
        echo "   ✓ Deleted {$deleted} honor result(s)\n\n";
    }

    // ============================================
    // Delete Assignments
    // ============================================
    echo "🗑️  Deleting test assignments...\n";

    if ($testData['instructor_assignment']) {
        InstructorCourseAssignment::where('id', $testData['instructor_assignment'])->delete();
        echo "   ✓ Deleted instructor assignment\n";
    }

    if ($testData['teacher_assignment']) {
        TeacherSubjectAssignment::where('id', $testData['teacher_assignment'])->delete();
        echo "   ✓ Deleted teacher assignment\n";
    }

    if ($testData['adviser_assignment']) {
        ClassAdviserAssignment::where('id', $testData['adviser_assignment'])->delete();
        echo "   ✓ Deleted adviser assignment\n";
    }
    echo "\n";

    // ============================================
    // Delete Notifications
    // ============================================
    echo "🗑️  Deleting test notifications...\n";
    // Delete notifications created in the last hour (test notifications)
    $deletedNotifications = Notification::where('created_at', '>=', now()->subHour())->delete();
    echo "   ✓ Deleted {$deletedNotifications} notification(s)\n\n";

    // ============================================
    // Restore Original Emails
    // ============================================
    echo "📧 Restoring original emails...\n";

    if ($testData['principal_id'] && $testData['principal_original_email']) {
        $principal = User::find($testData['principal_id']);
        if ($principal) {
            $principal->update(['email' => $testData['principal_original_email']]);
            echo "   ✓ Restored Principal email\n";
        }
    }

    if ($testData['chairperson_id'] && $testData['chairperson_original_email']) {
        $chairperson = User::find($testData['chairperson_id']);
        if ($chairperson) {
            $chairperson->update(['email' => $testData['chairperson_original_email']]);
            echo "   ✓ Restored Chairperson email\n";
        }
    }
    echo "\n";

    // ============================================
    // Delete Test Users
    // ============================================
    echo "🗑️  Deleting test users...\n";
    $deletedUsers = User::whereIn('id', array_filter($testData['users']))
        ->where('name', 'like', '%DELETE ME%')
        ->delete();
    echo "   ✓ Deleted {$deletedUsers} test user(s)\n\n";

    // ============================================
    // Remove test data file
    // ============================================
    unlink($testDataFile);
    echo "   ✓ Removed test data file\n\n";

    // ============================================
    // Summary
    // ============================================
    echo "=" . str_repeat("=", 50) . "\n";
    echo "✅ CLEANUP COMPLETED SUCCESSFULLY!\n\n";
    echo "All test data has been removed from the database.\n";
    echo "The notification system is ready for production use.\n\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR during cleanup: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
