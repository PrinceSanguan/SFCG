<?php

/**
 * Comprehensive Notification System Test Script
 * This script tests all notification types with real email delivery
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\Course;
use App\Models\Department;
use App\Models\Section;
use App\Models\GradingPeriod;
use App\Models\InstructorCourseAssignment;
use App\Models\TeacherSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

echo "\n🚀 Starting Notification System Test\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseEmail = 'jshgencianeo11@gmail.com';
$testUsers = [];
$testData = [];

try {
    // ============================================
    // STEP 1: Create Test Users
    // ============================================
    echo "📝 STEP 1: Creating test users (all emails will go to {$baseEmail})\n";
    echo "   Using Gmail aliases (+instructor, +teacher, etc.) for unique database entries\n\n";

    // Create Test Instructor (using Gmail alias)
    $instructorEmail = 'jshgencianeo11+instructor@gmail.com';
    $testUsers['instructor'] = User::create([
        'name' => 'Test Instructor (DELETE ME)',
        'email' => $instructorEmail,
        'password' => Hash::make('password'),
        'user_role' => 'instructor',
        'email_verified_at' => now(),
    ]);
    echo "   ✓ Created Test Instructor (ID: {$testUsers['instructor']->id}, Email: {$instructorEmail})\n";

    // Create Test Teacher (using Gmail alias)
    $teacherEmail = 'jshgencianeo11+teacher@gmail.com';
    $testUsers['teacher'] = User::create([
        'name' => 'Test Teacher (DELETE ME)',
        'email' => $teacherEmail,
        'password' => Hash::make('password'),
        'user_role' => 'teacher',
        'year_level' => 'senior_highschool',
        'specific_year_level' => 'grade_11',
        'email_verified_at' => now(),
    ]);
    echo "   ✓ Created Test Teacher (ID: {$testUsers['teacher']->id}, Email: {$teacherEmail})\n";

    // Create Test Adviser (using Gmail alias)
    $adviserEmail = 'jshgencianeo11+adviser@gmail.com';
    $testUsers['adviser'] = User::create([
        'name' => 'Test Adviser (DELETE ME)',
        'email' => $adviserEmail,
        'password' => Hash::make('password'),
        'user_role' => 'adviser',
        'year_level' => 'elementary',
        'specific_year_level' => 'grade_1',
        'email_verified_at' => now(),
    ]);
    echo "   ✓ Created Test Adviser (ID: {$testUsers['adviser']->id}, Email: {$adviserEmail})\n";

    // Update Principal and Chairperson emails temporarily (using Gmail aliases)
    $principalEmail = 'jshgencianeo11+principal@gmail.com';
    $principal = User::where('user_role', 'principal')->first();
    if ($principal) {
        $testUsers['principal_original_email'] = $principal->email;
        $principal->update(['email' => $principalEmail]);
        $testUsers['principal'] = $principal;
        echo "   ✓ Updated Principal email temporarily (ID: {$principal->id}, Email: {$principalEmail})\n";
    } else {
        echo "   ⚠️  Warning: No Principal found in database, will skip elementary/JHS/SHS honor tests\n";
    }

    $chairpersonEmail = 'jshgencianeo11+chairperson@gmail.com';
    $chairperson = User::where('user_role', 'chairperson')->first();
    if ($chairperson) {
        $testUsers['chairperson_original_email'] = $chairperson->email;
        $chairperson->update(['email' => $chairpersonEmail]);
        $testUsers['chairperson'] = $chairperson;
        echo "   ✓ Updated Chairperson email temporarily (ID: {$chairperson->id}, Email: {$chairpersonEmail})\n";
    } else {
        echo "   ⚠️  Warning: No Chairperson found in database, will skip college honor test\n";
    }

    echo "\n";

    // ============================================
    // STEP 2: Get Academic Data
    // ============================================
    echo "📚 STEP 2: Fetching academic data\n";

    $collegeLevel = AcademicLevel::where('key', 'college')->first();
    $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
    $jhsLevel = AcademicLevel::where('key', 'junior_highschool')->first();
    $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();

    echo "   ✓ Academic levels loaded\n";

    $department = Department::where('academic_level_id', $collegeLevel->id)->first();
    $course = Course::where('department_id', $department->id)->first();
    $subject = Subject::where('course_id', $course->id)->where('academic_level_id', $collegeLevel->id)->first();

    echo "   ✓ College course and subject loaded\n";

    $elementarySubject = Subject::where('academic_level_id', $elementaryLevel->id)->first();
    $shsSubject = Subject::where('academic_level_id', $shsLevel->id)->first();

    if (!$elementarySubject) {
        echo "   ⚠️  Warning: No elementary subject found, will skip adviser assignment test\n";
    }
    if (!$shsSubject) {
        echo "   ⚠️  Warning: No SHS subject found, will skip teacher assignment test\n";
    }

    echo "   ✓ Elementary and SHS subjects loaded\n\n";

    // ============================================
    // STEP 3: Test Instructor Assignment Notification
    // ============================================
    echo "📧 TEST 1: Instructor Assignment Notification\n";

    $instructorAssignment = InstructorCourseAssignment::create([
        'instructor_id' => $testUsers['instructor']->id,
        'course_id' => $course->id,
        'academic_level_id' => $collegeLevel->id,
        'year_level' => 'first_year',
        'department_id' => $department->id,
        'school_year' => '2024-2025',
        'assigned_by' => 1,
        'notes' => 'Test assignment for notification testing',
    ]);
    $testData['instructor_assignment'] = $instructorAssignment;

    $notificationService = new NotificationService();
    $result = $notificationService->sendAssignmentNotification(
        $testUsers['instructor'],
        'instructor',
        [
            'assignment_id' => $instructorAssignment->id,
            'course_name' => $course->name,
            'department_name' => $department->name,
            'academic_level' => $collegeLevel->name,
            'year_level' => 'first_year',
            'school_year' => '2024-2025',
            'notes' => 'Test assignment for notification testing',
        ]
    );

    if ($result['success']) {
        echo "   ✅ Instructor notification sent successfully!\n";
        echo "   📬 Email sent to: {$instructorEmail}\n";
        echo "   🆔 Notification ID: {$result['notification_id']}\n";
    } else {
        echo "   ❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
    }
    echo "\n";

    // ============================================
    // STEP 4: Test Teacher Assignment Notification
    // ============================================
    echo "📧 TEST 2: Teacher Assignment Notification\n";

    $teacherAssignment = TeacherSubjectAssignment::create([
        'teacher_id' => $testUsers['teacher']->id,
        'subject_id' => $shsSubject->id,
        'academic_level_id' => $shsLevel->id,
        'grade_level' => 'grade_11',
        'school_year' => '2024-2025',
        'assigned_by' => 1,
        'notes' => 'Test teacher assignment',
    ]);
    $testData['teacher_assignment'] = $teacherAssignment;

    $result = $notificationService->sendAssignmentNotification(
        $testUsers['teacher'],
        'teacher',
        [
            'assignment_id' => $teacherAssignment->id,
            'subject_name' => $shsSubject->name,
            'academic_level' => $shsLevel->name,
            'grade_level' => 'grade_11',
            'school_year' => '2024-2025',
            'notes' => 'Test teacher assignment',
        ]
    );

    if ($result['success']) {
        echo "   ✅ Teacher notification sent successfully!\n";
        echo "   📬 Email sent to: {$teacherEmail}\n";
        echo "   🆔 Notification ID: {$result['notification_id']}\n";
    } else {
        echo "   ❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
    }
    echo "\n";

    // ============================================
    // STEP 5: Test Adviser Assignment Notification
    // ============================================
    echo "📧 TEST 3: Adviser Assignment Notification\n";

    if ($elementarySubject) {
        $adviserAssignment = ClassAdviserAssignment::create([
            'adviser_id' => $testUsers['adviser']->id,
            'subject_id' => $elementarySubject->id,
            'academic_level_id' => $elementaryLevel->id,
            'grade_level' => 'grade_1',
            'section' => 'A',
            'school_year' => '2024-2025',
            'assigned_by' => 1,
            'notes' => 'Test adviser assignment',
        ]);
        $testData['adviser_assignment'] = $adviserAssignment;

        $result = $notificationService->sendAssignmentNotification(
            $testUsers['adviser'],
            'adviser',
            [
                'assignment_id' => $adviserAssignment->id,
                'subject_name' => $elementarySubject->name,
                'academic_level' => $elementaryLevel->name,
                'grade_level' => 'grade_1',
                'section' => 'A',
                'school_year' => '2024-2025',
                'notes' => 'Test adviser assignment',
            ]
        );

        if ($result['success']) {
            echo "   ✅ Adviser notification sent successfully!\n";
            echo "   📬 Email sent to: {$adviserEmail}\n";
            echo "   🆔 Notification ID: {$result['notification_id']}\n";
        } else {
            echo "   ❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "   ⏭️  Skipped: No elementary subject available for testing\n";
    }
    echo "\n";

    // ============================================
    // STEP 6: Test Elementary Honor Approval Notification (to Principal)
    // ============================================
    echo "📧 TEST 4: Elementary Honor Approval Notification (to Principal)\n";

    // Use a unique test school year to avoid conflicts
    $testSchoolYear = '2099-2100-TEST';

    // Create some test honor results
    $honorType = HonorType::first();
    if ($honorType) {
        $elementaryStudents = User::where('user_role', 'student')->where('year_level', 'elementary')->limit(3)->get();

        if ($elementaryStudents->count() > 0) {
            foreach ($elementaryStudents as $index => $student) {
                $honorResult = HonorResult::create([
                    'student_id' => $student->id,
                    'honor_type_id' => $honorType->id,
                    'academic_level_id' => $elementaryLevel->id,
                    'school_year' => $testSchoolYear,
                    'gpa' => 95.5 + $index,
                    'approval_status' => 'pending',
                    'remarks' => 'Test honor result for notification testing',
                ]);
                $testData['honor_results'][] = $honorResult;
            }

            $result = $notificationService->sendPendingHonorApprovalNotification(
                $elementaryLevel,
                $testSchoolYear,
                $elementaryStudents->count()
            );

            if ($result['success']) {
                echo "   ✅ Elementary honor approval notification sent to Principal!\n";
                echo "   📬 Email sent to: {$principalEmail}\n";
                echo "   🆔 Notification ID: {$result['notification_id']}\n";
            } else {
                echo "   ❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
            }
        } else {
            echo "   ⏭️  Skipped: No elementary students found for testing\n";
        }
    } else {
        echo "   ⏭️  Skipped: No honor type found in database\n";
    }
    echo "\n";

    // ============================================
    // STEP 7: Test College Honor Approval Notification (to Chairperson)
    // ============================================
    echo "📧 TEST 5: College Honor Approval Notification (to Chairperson)\n";

    if ($honorType) {
        $collegeStudents = User::where('user_role', 'student')->where('year_level', 'college')->limit(5)->get();

        if ($collegeStudents->count() > 0) {
            foreach ($collegeStudents as $index => $student) {
                $honorResult = HonorResult::create([
                    'student_id' => $student->id,
                    'honor_type_id' => $honorType->id,
                    'academic_level_id' => $collegeLevel->id,
                    'school_year' => $testSchoolYear,
                    'gpa' => 92.0 + $index,
                    'approval_status' => 'pending',
                    'remarks' => 'Test college honor result for notification testing',
                ]);
                $testData['honor_results'][] = $honorResult;
            }

            $result = $notificationService->sendPendingHonorApprovalNotification(
                $collegeLevel,
                $testSchoolYear,
                $collegeStudents->count()
            );

            if ($result['success']) {
                echo "   ✅ College honor approval notification sent to Chairperson!\n";
                echo "   📬 Email sent to: {$chairpersonEmail}\n";
                echo "   🆔 Notification ID: {$result['notification_id']}\n";
            } else {
                echo "   ❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
            }
        } else {
            echo "   ⏭️  Skipped: No college students found for testing\n";
        }
    } else {
        echo "   ⏭️  Skipped: No honor type found in database\n";
    }
    echo "\n";

    // ============================================
    // Summary
    // ============================================
    echo "=" . str_repeat("=", 50) . "\n";
    echo "✅ ALL TESTS COMPLETED!\n\n";
    echo "📬 Check your email: {$baseEmail}\n";
    echo "You should have received 5 emails (all delivered to the same inbox via Gmail aliases):\n";
    echo "   1. Instructor Assignment Notification (to: {$instructorEmail})\n";
    echo "   2. Teacher Assignment Notification (to: {$teacherEmail})\n";
    echo "   3. Adviser Assignment Notification (to: {$adviserEmail})\n";
    echo "   4. Elementary Honor Approval (to: {$principalEmail})\n";
    echo "   5. College Honor Approval (to: {$chairpersonEmail})\n\n";

    // Count notifications created during this test
    $notificationCount = \App\Models\Notification::where('created_at', '>=', now()->subMinute())->count();
    echo "🗄️  Database notifications created: {$notificationCount}\n\n";

    // ============================================
    // Cleanup Prompt
    // ============================================
    echo "⚠️  TEST DATA CREATED - READY FOR CLEANUP\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    echo "To clean up test data, run:\n";
    echo "   php cleanup_test_notifications.php\n\n";

    // Save test data IDs for cleanup
    file_put_contents(__DIR__.'/test_data_ids.json', json_encode([
        'users' => array_map(fn($u) => $u->id ?? null, $testUsers),
        'instructor_assignment' => $testData['instructor_assignment']->id ?? null,
        'teacher_assignment' => $testData['teacher_assignment']->id ?? null,
        'adviser_assignment' => $testData['adviser_assignment']->id ?? null,
        'honor_results' => array_map(fn($h) => $h->id, $testData['honor_results'] ?? []),
        'principal_original_email' => $testUsers['principal_original_email'] ?? null,
        'chairperson_original_email' => $testUsers['chairperson_original_email'] ?? null,
        'principal_id' => $testUsers['principal']->id ?? null,
        'chairperson_id' => $testUsers['chairperson']->id ?? null,
    ], JSON_PRETTY_PRINT));

} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
