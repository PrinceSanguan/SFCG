<?php
/**
 * Senior High School Honor Diagnostic Tool
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HonorResult;
use App\Models\AcademicLevel;

echo "=====================================\n";
echo "SHS Honor Diagnostic Tool\n";
echo "=====================================\n\n";

$shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
if (!$shsLevel) {
    echo "❌ Senior High School level not found!\n";
    exit(1);
}

$honorResults = HonorResult::with(['student', 'honorType', 'gradingPeriod'])
    ->where('academic_level_id', $shsLevel->id)
    ->get();

echo "📊 Total SHS Honor Results: " . $honorResults->count() . "\n\n";

if ($honorResults->isEmpty()) {
    echo "✅ No honor results found. Database is clean.\n";
    echo "   Generate new results from Admin > Honor Tracking > SHS\n";
    exit(0);
}

$duplicates = [];
$wrongHonors = [];

echo "🔍 Checking for issues...\n\n";

// Check for duplicates
$grouped = $honorResults->groupBy(function($hr) {
    return $hr->student_id . '-' . $hr->grading_period_id;
});

foreach ($grouped as $key => $group) {
    if ($group->count() > 1) {
        $duplicates[] = [
            'student' => $group->first()->student->name,
            'period' => $group->first()->gradingPeriod->name ?? 'N/A',
            'count' => $group->count(),
            'honors' => $group->pluck('honorType.name')->toArray()
        ];
    }
}

// Check for incorrect assignments
foreach ($honorResults as $hr) {
    $gpa = $hr->gpa;
    $honorName = $hr->honorType->name ?? 'Unknown';
    
    $expectedHonor = null;
    if ($gpa >= 98 && $gpa <= 100) {
        $expectedHonor = 'With Highest Honors';
    } elseif ($gpa >= 95 && $gpa < 98) {
        $expectedHonor = 'With High Honors';
    } elseif ($gpa >= 90 && $gpa < 95) {
        $expectedHonor = 'With Honors';
    }
    
    if ($expectedHonor && $expectedHonor !== $honorName) {
        $wrongHonors[] = [
            'student' => $hr->student->name,
            'period' => $hr->gradingPeriod->name ?? 'N/A',
            'gpa' => $gpa,
            'current_honor' => $honorName,
            'expected_honor' => $expectedHonor
        ];
    }
}

echo "=====================================\n";
echo "DIAGNOSTIC RESULTS\n";
echo "=====================================\n\n";

if (!empty($duplicates)) {
    echo "❌ DUPLICATES FOUND (" . count($duplicates) . "):\n";
    foreach ($duplicates as $dup) {
        echo "   • Student: {$dup['student']}\n";
        echo "     Period: {$dup['period']}\n";
        echo "     Count: {$dup['count']} results\n";
        echo "     Honors: " . implode(', ', $dup['honors']) . "\n\n";
    }
} else {
    echo "✅ No duplicates found\n\n";
}

if (!empty($wrongHonors)) {
    echo "❌ INCORRECT HONOR ASSIGNMENTS (" . count($wrongHonors) . "):\n";
    foreach ($wrongHonors as $wrong) {
        echo "   • Student: {$wrong['student']}\n";
        echo "     Period: {$wrong['period']}\n";
        echo "     GPA: {$wrong['gpa']}\n";
        echo "     Current: {$wrong['current_honor']}\n";
        echo "     Expected: {$wrong['expected_honor']}\n\n";
    }
} else {
    echo "✅ All honor assignments are correct\n\n";
}

if (empty($duplicates) && empty($wrongHonors)) {
    echo "🎉 No issues found! Honor results are correct.\n";
} else {
    echo "=====================================\n";
    echo "TO FIX: Run these commands\n";
    echo "=====================================\n";
    echo "php artisan tinker\n";
    echo "\\App\\Models\\HonorResult::whereHas('academicLevel', fn(\$q) => \$q->where('key', 'senior_highschool'))->delete();\n";
    echo "exit\n\n";
    echo "Then: Admin > Honor Tracking > SHS > Submit for Approval\n";
}
