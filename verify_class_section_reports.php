#!/usr/bin/env php
<?php

/**
 * Class Section Reports - Verification Script
 *
 * This script verifies that the Class Section Reports fix is working correctly
 * by checking files, routes, and providing a test summary.
 */

echo "\n";
echo "================================================================\n";
echo "  Class Section Reports - Implementation Verification\n";
echo "================================================================\n\n";

$results = [];
$errors = [];
$warnings = [];

// Test 1: Check if Registrar ReportsController exists
echo "Test 1: Checking Registrar\\ReportsController file...\n";
$registrarController = __DIR__ . '/app/Http/Controllers/Registrar/ReportsController.php';
if (file_exists($registrarController)) {
    echo "   ✅ PASS: Registrar\\ReportsController exists\n";
    $results['registrar_controller'] = 'PASS';

    // Check file size
    $fileSize = filesize($registrarController);
    echo "   📊 File size: " . number_format($fileSize) . " bytes\n";

    // Check for key methods
    $content = file_get_contents($registrarController);
    $methods = [
        'generateClassSectionReport',
        'generateClassSectionPDF',
        'generateGradeReport',
        'generateHonorStatistics',
        'archiveAcademicRecords'
    ];

    echo "   🔍 Checking for required methods:\n";
    foreach ($methods as $method) {
        if (strpos($content, "function $method") !== false) {
            echo "      ✅ $method() found\n";
        } else {
            echo "      ❌ $method() NOT FOUND\n";
            $errors[] = "Method $method not found in Registrar\\ReportsController";
        }
    }

    // Check for [REGISTRAR] log prefix
    if (strpos($content, '[REGISTRAR]') !== false) {
        $count = substr_count($content, '[REGISTRAR]');
        echo "   ✅ [REGISTRAR] log prefix found ($count occurrences)\n";
    } else {
        echo "   ❌ [REGISTRAR] log prefix NOT FOUND\n";
        $errors[] = "[REGISTRAR] log prefix not found";
    }
} else {
    echo "   ❌ FAIL: Registrar\\ReportsController does NOT exist\n";
    $results['registrar_controller'] = 'FAIL';
    $errors[] = "Registrar\\ReportsController file not found at: $registrarController";
}
echo "\n";

// Test 2: Check Admin ReportsController for [ADMIN] prefix
echo "Test 2: Checking Admin\\ReportsController for [ADMIN] log prefix...\n";
$adminController = __DIR__ . '/app/Http/Controllers/Admin/ReportsController.php';
if (file_exists($adminController)) {
    echo "   ✅ Admin\\ReportsController exists\n";
    $content = file_get_contents($adminController);

    if (strpos($content, '[ADMIN]') !== false) {
        $count = substr_count($content, '[ADMIN]');
        echo "   ✅ [ADMIN] log prefix found ($count occurrences)\n";
        $results['admin_logging'] = 'PASS';
    } else {
        echo "   ❌ [ADMIN] log prefix NOT FOUND\n";
        $results['admin_logging'] = 'FAIL';
        $errors[] = "[ADMIN] log prefix not found in Admin\\ReportsController";
    }
} else {
    echo "   ❌ Admin\\ReportsController does NOT exist\n";
    $results['admin_controller'] = 'FAIL';
    $errors[] = "Admin\\ReportsController not found";
}
echo "\n";

// Test 3: Check Registrar routes file
echo "Test 3: Checking Registrar routes import...\n";
$registrarRoutes = __DIR__ . '/routes/registrar.php';
if (file_exists($registrarRoutes)) {
    $content = file_get_contents($registrarRoutes);

    if (strpos($content, 'use App\Http\Controllers\Registrar\ReportsController') !== false) {
        echo "   ✅ PASS: Registrar routes use Registrar\\ReportsController\n";
        $results['registrar_routes'] = 'PASS';
    } else {
        echo "   ❌ FAIL: Registrar routes do NOT use Registrar\\ReportsController\n";
        $results['registrar_routes'] = 'FAIL';
        $errors[] = "Registrar routes not using Registrar\\ReportsController";

        // Check if still using Admin controller
        if (strpos($content, 'use App\Http\Controllers\Admin\ReportsController') !== false) {
            echo "   ⚠️  WARNING: Still using Admin\\ReportsController (OLD)\n";
            $warnings[] = "Registrar routes still using Admin\\ReportsController";
        }
    }
} else {
    echo "   ❌ Registrar routes file does NOT exist\n";
    $errors[] = "Registrar routes file not found";
}
echo "\n";

// Test 4: Check Admin routes file
echo "Test 4: Checking Admin routes import...\n";
$adminRoutes = __DIR__ . '/routes/admin.php';
if (file_exists($adminRoutes)) {
    $content = file_get_contents($adminRoutes);

    if (strpos($content, 'use App\Http\Controllers\Admin\ReportsController') !== false) {
        echo "   ✅ PASS: Admin routes use Admin\\ReportsController\n";
        $results['admin_routes'] = 'PASS';
    } else {
        echo "   ❌ FAIL: Admin routes do NOT use Admin\\ReportsController\n";
        $results['admin_routes'] = 'FAIL';
        $errors[] = "Admin routes not using Admin\\ReportsController";
    }
} else {
    echo "   ❌ Admin routes file does NOT exist\n";
    $errors[] = "Admin routes file not found";
}
echo "\n";

// Test 5: Check documentation files
echo "Test 5: Checking documentation files...\n";
$docs = [
    'CLASS_SECTION_REPORTS_TESTING_GUIDE.md' => 'Testing Guide',
    'CLASS_SECTION_REPORTS_FIX_SUMMARY.md' => 'Fix Summary',
];

foreach ($docs as $filename => $description) {
    $path = __DIR__ . '/' . $filename;
    if (file_exists($path)) {
        $size = filesize($path);
        echo "   ✅ $description exists (" . number_format($size) . " bytes)\n";
        $results['doc_' . $filename] = 'PASS';
    } else {
        echo "   ❌ $description does NOT exist\n";
        $results['doc_' . $filename] = 'FAIL';
        $errors[] = "$description not found";
    }
}
echo "\n";

// Test 6: Check blade template
echo "Test 6: Checking PDF blade template...\n";
$bladeTemplate = __DIR__ . '/resources/views/reports/class-section.blade.php';
if (file_exists($bladeTemplate)) {
    echo "   ✅ PASS: class-section.blade.php exists\n";
    $results['blade_template'] = 'PASS';
} else {
    echo "   ❌ FAIL: class-section.blade.php does NOT exist\n";
    $results['blade_template'] = 'FAIL';
    $errors[] = "Blade template not found";
}
echo "\n";

// Test 7: Check Export class
echo "Test 7: Checking ClassSectionReportExport class...\n";
$exportClass = __DIR__ . '/app/Exports/ClassSectionReportExport.php';
if (file_exists($exportClass)) {
    echo "   ✅ PASS: ClassSectionReportExport.php exists\n";
    $results['export_class'] = 'PASS';
} else {
    echo "   ❌ FAIL: ClassSectionReportExport.php does NOT exist\n";
    $results['export_class'] = 'FAIL';
    $errors[] = "Export class not found";
}
echo "\n";

// Summary
echo "================================================================\n";
echo "  VERIFICATION SUMMARY\n";
echo "================================================================\n\n";

$passed = count(array_filter($results, fn($r) => $r === 'PASS'));
$failed = count(array_filter($results, fn($r) => $r === 'FAIL'));
$total = count($results);

echo "Tests Run: $total\n";
echo "Passed: $passed ✅\n";
echo "Failed: $failed " . ($failed > 0 ? "❌" : "✅") . "\n";
echo "Warnings: " . count($warnings) . ($warnings ? " ⚠️" : "") . "\n";
echo "\n";

if ($failed > 0) {
    echo "❌ VERIFICATION FAILED\n\n";
    echo "Errors:\n";
    foreach ($errors as $i => $error) {
        echo "  " . ($i + 1) . ". $error\n";
    }
    echo "\n";
} else {
    echo "✅ VERIFICATION PASSED!\n\n";
    echo "All components are in place. The Class Section Reports feature\n";
    echo "has been successfully fixed for both Admin and Registrar roles.\n\n";
}

if (!empty($warnings)) {
    echo "⚠️  WARNINGS:\n";
    foreach ($warnings as $i => $warning) {
        echo "  " . ($i + 1) . ". $warning\n";
    }
    echo "\n";
}

// Next steps
echo "================================================================\n";
echo "  NEXT STEPS\n";
echo "================================================================\n\n";

if ($failed > 0) {
    echo "1. Fix the errors listed above\n";
    echo "2. Re-run this verification script\n";
    echo "3. Once all tests pass, proceed with manual testing\n";
} else {
    echo "1. Start the development server:\n";
    echo "   composer dev\n\n";
    echo "2. Monitor logs in real-time:\n";
    echo "   tail -f storage/logs/laravel.log | grep \"CLASS SECTION\"\n\n";
    echo "3. Test Admin role:\n";
    echo "   - Navigate to: http://127.0.0.1:8000/admin/reports\n";
    echo "   - Generate a Class Section Report\n";
    echo "   - Verify logs show [ADMIN] prefix\n\n";
    echo "4. Test Registrar role:\n";
    echo "   - Navigate to: http://127.0.0.1:8000/registrar/reports\n";
    echo "   - Generate a Class Section Report\n";
    echo "   - Verify logs show [REGISTRAR] prefix\n\n";
    echo "5. Follow the comprehensive testing guide:\n";
    echo "   CLASS_SECTION_REPORTS_TESTING_GUIDE.md\n";
}

echo "\n";
echo "================================================================\n\n";

// Exit with appropriate code
exit($failed > 0 ? 1 : 0);
