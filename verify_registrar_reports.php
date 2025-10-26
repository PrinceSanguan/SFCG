#!/usr/bin/env php
<?php

/**
 * Registrar Reports - Verification Script
 *
 * This script verifies that all Registrar report functionalities are properly configured
 */

echo "\n";
echo "================================================================\n";
echo "  Registrar Reports - Implementation Verification\n";
echo "================================================================\n\n";

$results = [];
$errors = [];
$warnings = [];

// Test 1: Check Registrar\ReportsController exists
echo "Test 1: Checking Registrar\\ReportsController file...\n";
$controller = __DIR__ . '/app/Http/Controllers/Registrar/ReportsController.php';
if (file_exists($controller)) {
    echo "   ✅ PASS: Registrar\\ReportsController exists\n";
    $results['registrar_controller'] = 'PASS';

    $content = file_get_contents($controller);

    // Check for all required methods
    $methods = [
        'generateGradeReport',
        'generateHonorStatistics',
        'archiveAcademicRecords',
        'generateClassSectionReport',
        'generateGradePDF',
        'generateHonorStatisticsPDF',
        'generateClassSectionPDF',
        'calculateGradeStatistics',
        'calculateHonorStatistics'
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
    $count = substr_count($content, '[REGISTRAR]');
    if ($count > 0) {
        echo "   ✅ [REGISTRAR] log prefix found ($count occurrences)\n";
    } else {
        echo "   ❌ [REGISTRAR] log prefix NOT FOUND\n";
        $errors[] = "[REGISTRAR] log prefix not found";
    }

    // Check file size
    $fileSize = filesize($controller);
    echo "   📊 File size: " . number_format($fileSize) . " bytes\n";

    if ($fileSize < 10000) {
        $warnings[] = "Controller file seems small (< 10KB), might be incomplete";
    }
} else {
    echo "   ❌ FAIL: Registrar\\ReportsController does NOT exist\n";
    $results['registrar_controller'] = 'FAIL';
    $errors[] = "Registrar\\ReportsController file not found";
}
echo "\n";

// Test 2: Check routes are registered
echo "Test 2: Checking routes are registered...\n";
exec('cd ' . escapeshellarg(__DIR__) . ' && php artisan route:list --json 2>&1', $output, $return_code);

if ($return_code === 0) {
    $routes = json_decode(implode('', $output), true);
    if ($routes) {
        $requiredRoutes = [
            'registrar.reports.grade-report',
            'registrar.reports.honor-statistics',
            'registrar.reports.archive-records',
            'registrar.reports.class-section-report'
        ];

        foreach ($requiredRoutes as $routeName) {
            $found = false;
            foreach ($routes as $route) {
                if (isset($route['name']) && $route['name'] === $routeName) {
                    $found = true;
                    echo "   ✅ Route '$routeName' registered\n";

                    // Check if it points to Registrar controller
                    if (isset($route['action']) && strpos($route['action'], 'Registrar\\ReportsController') !== false) {
                        echo "      → Points to Registrar\\ReportsController ✅\n";
                    } else {
                        echo "      ⚠️  WARNING: Points to " . ($route['action'] ?? 'unknown') . "\n";
                        $warnings[] = "Route $routeName doesn't point to Registrar\\ReportsController";
                    }
                    break;
                }
            }

            if (!$found) {
                echo "   ❌ Route '$routeName' NOT FOUND\n";
                $errors[] = "Route $routeName is not registered";
            }
        }
        $results['routes'] = count($errors) === 0 ? 'PASS' : 'FAIL';
    } else {
        echo "   ❌ Could not parse route list\n";
        $errors[] = "Could not parse route list";
    }
} else {
    echo "   ❌ Could not run route:list command\n";
    $errors[] = "Could not execute php artisan route:list";
}
echo "\n";

// Test 3: Check views exist
echo "Test 3: Checking required views exist...\n";
$views = [
    'grade-report' => 'resources/views/reports/grade-report.blade.php',
    'honor-statistics' => 'resources/views/reports/honor-statistics.blade.php',
    'class-section' => 'resources/views/reports/class-section.blade.php',
];

foreach ($views as $name => $path) {
    $fullPath = __DIR__ . '/' . $path;
    if (file_exists($fullPath)) {
        echo "   ✅ $name view exists\n";
    } else {
        echo "   ❌ $name view NOT FOUND\n";
        $errors[] = "View $name not found at: $path";
    }
}
echo "\n";

// Test 4: Check export classes exist
echo "Test 4: Checking export classes exist...\n";
$exports = [
    'GradeReportExport' => 'app/Exports/GradeReportExport.php',
    'HonorStatisticsExport' => 'app/Exports/HonorStatisticsExport.php',
    'AcademicRecordsExport' => 'app/Exports/AcademicRecordsExport.php',
    'ClassSectionReportExport' => 'app/Exports/ClassSectionReportExport.php',
];

foreach ($exports as $name => $path) {
    $fullPath = __DIR__ . '/' . $path;
    if (file_exists($fullPath)) {
        echo "   ✅ $name exists\n";

        // Check for syntax errors
        exec('php -l ' . escapeshellarg($fullPath) . ' 2>&1', $syntaxOutput, $syntaxCode);
        if ($syntaxCode === 0) {
            echo "      → No syntax errors ✅\n";
        } else {
            echo "      ⚠️  Syntax errors found\n";
            $warnings[] = "Syntax errors in $name";
        }
    } else {
        echo "   ❌ $name NOT FOUND\n";
        $errors[] = "Export class $name not found at: $path";
    }
}
echo "\n";

// Test 5: Check frontend page exists
echo "Test 5: Checking frontend page exists...\n";
$frontendPath = __DIR__ . '/resources/js/pages/Registrar/Reports/Index.tsx';
if (file_exists($frontendPath)) {
    echo "   ✅ Registrar Reports page exists\n";
    $content = file_get_contents($frontendPath);

    // Check for required routes
    $routes = [
        'registrar.reports.grade-report',
        'registrar.reports.honor-statistics',
        'registrar.reports.archive-records',
        'registrar.reports.class-section-report'
    ];

    foreach ($routes as $route) {
        if (strpos($content, $route) !== false) {
            echo "      ✅ Calls route: $route\n";
        } else {
            echo "      ⚠️  Route not found in frontend: $route\n";
            $warnings[] = "Frontend doesn't call route: $route";
        }
    }
} else {
    echo "   ❌ Registrar Reports page NOT FOUND\n";
    $errors[] = "Frontend page not found";
}
echo "\n";

// Test 6: Check documentation exists
echo "Test 6: Checking documentation exists...\n";
$docs = [
    'REGISTRAR_REPORTS_TESTING.md' => 'Testing guide for Registrar reports',
    'CLASS_SECTION_REPORTS_TESTING_GUIDE.md' => 'General testing guide',
    'CLASS_SECTION_REPORTS_FIX_SUMMARY.md' => 'Fix summary',
];

foreach ($docs as $filename => $description) {
    $path = __DIR__ . '/' . $filename;
    if (file_exists($path)) {
        $size = filesize($path);
        echo "   ✅ $description exists (" . number_format($size) . " bytes)\n";
    } else {
        echo "   ⚠️  $description not found\n";
        $warnings[] = "$description not found";
    }
}
echo "\n";

// Summary
echo "================================================================\n";
echo "  VERIFICATION SUMMARY\n";
echo "================================================================\n\n";

$totalTests = 6;
$passed = count(array_filter($results, fn($r) => $r === 'PASS'));
$failed = count(array_filter($results, fn($r) => $r === 'FAIL'));

echo "Tests Run: $totalTests\n";
echo "Errors Found: " . count($errors) . ($errors ? " ❌" : " ✅") . "\n";
echo "Warnings: " . count($warnings) . ($warnings ? " ⚠️" : "") . "\n";
echo "\n";

if (count($errors) > 0) {
    echo "❌ VERIFICATION FAILED\n\n";
    echo "Errors:\n";
    foreach ($errors as $i => $error) {
        echo "  " . ($i + 1) . ". $error\n";
    }
    echo "\n";
} else {
    echo "✅ VERIFICATION PASSED!\n\n";
    echo "All Registrar report components are in place and ready for testing.\n\n";
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

if (count($errors) > 0) {
    echo "1. Fix the errors listed above\n";
    echo "2. Re-run this verification script\n";
    echo "3. Once all tests pass, proceed with manual testing\n";
} else {
    echo "1. Start the development server:\n";
    echo "   composer dev\n\n";
    echo "2. Monitor Registrar logs in real-time:\n";
    echo "   tail -f storage/logs/laravel.log | grep \"\\[REGISTRAR\\]\"\n\n";
    echo "3. Test Grade Reports:\n";
    echo "   - Navigate to: http://127.0.0.1:8000/registrar/reports\n";
    echo "   - Click \"Grade Reports\" tab\n";
    echo "   - Fill form and generate report\n";
    echo "   - Verify logs show [REGISTRAR] prefix\n\n";
    echo "4. Test all report types:\n";
    echo "   - Grade Reports (PDF, Excel, CSV)\n";
    echo "   - Honor Statistics\n";
    echo "   - Archive Records\n";
    echo "   - Class Section Reports\n\n";
    echo "5. Follow the comprehensive testing guide:\n";
    echo "   REGISTRAR_REPORTS_TESTING.md\n";
}

echo "\n";
echo "================================================================\n\n";

// Exit with appropriate code
exit(count($errors) > 0 ? 1 : 0);
