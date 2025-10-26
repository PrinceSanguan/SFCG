<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\SeniorHighSchoolHonorCalculationService;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\HonorResult;
use Illuminate\Support\Facades\Log;

echo "\n";
echo "================================================================\n";
echo "  SHS Honor Calculation - Test Verification\n";
echo "================================================================\n\n";

$service = new SeniorHighSchoolHonorCalculationService();
$shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();

if (!$shsLevel) {
    echo "❌ ERROR: Senior High School level not found\n";
    exit(1);
}

$schoolYear = '2024-2025';

// Get test students
$testStudents = [
    User::where('email', 'shs.perfect.honor@test.edu')->first(),
    User::where('email', 'shs.early.failure@test.edu')->first(),
    User::where('email', 'shs.midyear.failure@test.edu')->first(),
    User::where('email', 'shs.varying.honors@test.edu')->first(),
];

echo "Running honor calculation for 4 test scenarios...\n\n";

foreach ($testStudents as $index => $student) {
    if (!$student) {
        echo "⚠️  Test student " . ($index + 1) . " not found\n";
        continue;
    }

    echo "================================================================\n";
    echo "Scenario " . ($index + 1) . ": " . $student->name . "\n";
    echo "================================================================\n\n";

    $result = $service->calculateSeniorHighSchoolHonorQualification(
        $student->id,
        $shsLevel->id,
        $schoolYear
    );

    echo "Overall Qualified: " . ($result['qualified'] ? '✅ YES' : '❌ NO') . "\n";
    echo "Qualified Periods: " . count($result['qualified_periods']) . "\n\n";

    if (!empty($result['period_results'])) {
        echo "Period-by-Period Results:\n";
        echo "─────────────────────────────────────────────────────────────\n";

        foreach ($result['period_results'] as $periodResult) {
            $qualified = $periodResult['qualified'] ? '✅' : '❌';
            $periodName = $periodResult['period_name'] ?? ($periodResult['period_id'] ?? 'Unknown');
            $average = $periodResult['period_average'] ?? 'N/A';
            $honorType = $periodResult['honor_type_name'] ?? 'None';
            $reason = $periodResult['reason'] ?? 'Unknown reason';

            echo "{$qualified} {$periodName}: Average {$average} - {$honorType}\n";
            echo "   Reason: {$reason}\n\n";
        }
    }

    echo "\n";
}

echo "================================================================\n";
echo "  Generating Honor Results in Database\n";
echo "================================================================\n\n";

$generateResult = $service->generateSeniorHighSchoolHonorResults($shsLevel->id, $schoolYear);

if ($generateResult['success']) {
    echo "✅ SUCCESS: " . $generateResult['message'] . "\n\n";
    echo "Total Processed: " . $generateResult['total_processed'] . "\n";
    echo "Total Qualified: " . $generateResult['total_qualified'] . "\n";
    echo "Total Honor Records Created: " . $generateResult['total_honor_records'] . "\n\n";
} else {
    echo "❌ FAILED: " . $generateResult['message'] . "\n\n";
}

echo "================================================================\n";
echo "  Verifying Honor Results in Database\n";
echo "================================================================\n\n";

foreach ($testStudents as $index => $student) {
    if (!$student) {
        continue;
    }

    $honorResults = HonorResult::with(['honorType', 'gradingPeriod'])
        ->where('student_id', $student->id)
        ->where('school_year', $schoolYear)
        ->get();

    echo "Scenario " . ($index + 1) . ": " . $student->name . "\n";
    echo "   Honor Records in DB: " . $honorResults->count() . "\n";

    if ($honorResults->isNotEmpty()) {
        foreach ($honorResults as $honor) {
            $period = $honor->gradingPeriod->name ?? 'Unknown';
            $type = $honor->honorType->name ?? 'Unknown';
            $gpa = $honor->gpa;

            echo "   - {$period}: {$type} (Average: {$gpa})\n";
        }
    } else {
        echo "   - No honor records found\n";
    }

    echo "\n";
}

echo "================================================================\n";
echo "  Expected vs Actual Results\n";
echo "================================================================\n\n";

$expectedResults = [
    1 => ['name' => 'Perfect Honor', 'expected_records' => 4, 'description' => 'Should qualify all 4 periods'],
    2 => ['name' => 'Early Failure', 'expected_records' => 0, 'description' => 'Grade <85 in Period 1 disqualifies all'],
    3 => ['name' => 'Mid-Year Failure', 'expected_records' => 1, 'description' => 'Only Period 1 qualifies'],
    4 => ['name' => 'Varying Honors', 'expected_records' => 4, 'description' => 'All periods with different levels'],
];

$allPassed = true;

foreach ($testStudents as $index => $student) {
    if (!$student) {
        continue;
    }

    $scenarioNum = $index + 1;
    $expected = $expectedResults[$scenarioNum];

    $actualRecords = HonorResult::where('student_id', $student->id)
        ->where('school_year', $schoolYear)
        ->count();

    $passed = ($actualRecords === $expected['expected_records']);
    $allPassed = $allPassed && $passed;

    $status = $passed ? '✅ PASS' : '❌ FAIL';

    echo "Scenario {$scenarioNum}: {$expected['name']}\n";
    echo "   {$status} - Expected: {$expected['expected_records']}, Actual: {$actualRecords}\n";
    echo "   {$expected['description']}\n\n";
}

echo "================================================================\n";
echo "  Final Result\n";
echo "================================================================\n\n";

if ($allPassed) {
    echo "✅ ALL TESTS PASSED!\n";
    echo "   The SHS honor calculation is working correctly.\n";
    echo "   All scenarios produced expected results.\n\n";
    exit(0);
} else {
    echo "❌ SOME TESTS FAILED!\n";
    echo "   Please review the logs and results above.\n\n";
    exit(1);
}
