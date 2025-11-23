<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use App\Models\HonorType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Senior High School Honor Calculation Service
 *
 * GRADING STRUCTURE:
 * - 2 Semesters per year
 * - 2 Periods per semester (4 total periods)
 * - Semester 1: m1 (Midterm) + Pre-final (Pre-Final)
 * - Semester 2: m2 (Midterm) + pre-final2 (Pre-Final)
 *
 * HONOR CRITERIA:
 * - With Honors: 90-94 average
 * - With High Honors: 95-97 average
 * - With Highest Honors: 98-100 average
 *
 * CRITICAL RULES:
 * 1. Honor calculated PER PERIOD (not cumulative average)
 * 2. Each period uses only that period's average
 * 3. ALL grades in current + ALL previous periods must be ≥ 85
 * 4. If ANY grade < 85 in any previous period, student cannot qualify for current period
 *
 * GRADING SCALE: 75-100 percentage (NOT 1.0-5.0 GPA)
 */
class SeniorHighSchoolHonorCalculationService
{
    /**
     * Calculate honor qualification for a specific grading period
     *
     * @param int $studentId
     * @param int $academicLevelId
     * @param string $schoolYear
     * @param int $periodId The specific grading period to calculate honors for
     * @return array
     */
    public function calculateHonorForPeriod(int $studentId, int $academicLevelId, string $schoolYear, int $periodId): array
    {
        $period = GradingPeriod::find($periodId);

        if (!$period) {
            Log::warning('[SHS HONOR] Grading period not found', ['period_id' => $periodId]);
            return [
                'qualified' => false,
                'reason' => 'Grading period not found',
                'period_id' => $periodId
            ];
        }

        Log::info('[SHS HONOR] === CALCULATING PERIOD: ' . $period->name . ' ===', [
            'student_id' => $studentId,
            'period_id' => $periodId,
            'period_code' => $period->code,
            'school_year' => $schoolYear
        ]);

        $academicLevel = AcademicLevel::find($academicLevelId);

        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            Log::warning('[SHS HONOR] Invalid academic level', ['academic_level_id' => $academicLevelId]);
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not senior high school level'
            ];
        }

        $student = User::find($studentId);
        if (!$student || $student->user_role !== 'student') {
            Log::warning('[SHS HONOR] Student not found or invalid role', ['student_id' => $studentId]);
            return [
                'qualified' => false,
                'reason' => 'Student not found'
            ];
        }

        Log::info('[SHS HONOR] Student: ' . $student->name . ' (ID: ' . $student->id . ')');

        // Get all periods up to and including the current period (for cumulative grade check)
        // Note: We don't filter by is_active to ensure all periods are included in calculations
        $allPeriods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('sort_order', '<=', $period->sort_order)
            ->orderBy('sort_order')
            ->get();

        Log::info('[SHS HONOR] Checking periods for minimum grade rule', [
            'periods' => $allPeriods->pluck('name', 'code')->toArray(),
            'count' => $allPeriods->count()
        ]);

        // Get grades for CURRENT period only (for average calculation)
        $currentPeriodGrades = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->where('grading_period_id', $periodId)
            ->get();

        if ($currentPeriodGrades->isEmpty()) {
            Log::warning('[SHS HONOR] No grades found for current period', [
                'period' => $period->name,
                'period_id' => $periodId
            ]);
            return [
                'qualified' => false,
                'reason' => 'No grades found for period: ' . $period->name
            ];
        }

        // Calculate average for CURRENT period only
        $periodAverage = $currentPeriodGrades->avg('grade');
        $periodAverage = round($periodAverage, 2);

        // Comprehensive logging of all grades in period
        $gradesDetail = $currentPeriodGrades->map(function($grade) {
            return [
                'subject' => $grade->subject->name ?? 'Unknown',
                'grade' => $grade->grade
            ];
        })->toArray();

        Log::info('[SHS_HONOR_CALC] === PERIOD AVERAGE CALCULATED ===', [
            'student_id' => $studentId,
            'student_name' => $student->name,
            'period' => $period->name,
            'period_average' => $periodAverage,
            'grades_count' => $currentPeriodGrades->count(),
            'all_grades_in_period' => $gradesDetail,
            'school_year' => $schoolYear
        ]);

        // Check if period average meets minimum honor requirement (90+)
        if ($periodAverage < 90) {
            Log::info('[SHS HONOR] ❌ NOT QUALIFIED - Period average below 90', [
                'period_average' => $periodAverage,
                'required_minimum' => 90
            ]);
            return [
                'qualified' => false,
                'reason' => 'Period average (' . $periodAverage . ') below minimum honor requirement (90)',
                'period_average' => $periodAverage,
                'period_id' => $periodId
            ];
        }

        // Get ALL grades from current and ALL previous periods for minimum grade check
        $allGradesUpToNow = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->whereIn('grading_period_id', $allPeriods->pluck('id'))
            ->get();

        // Check if ANY grade is below 85 (including previous periods)
        $gradesBelow85 = $allGradesUpToNow->filter(function($grade) {
            return $grade->grade < 85;
        });

        if ($gradesBelow85->isNotEmpty()) {
            $failedGrades = $gradesBelow85->map(function($grade) {
                return [
                    'subject' => $grade->subject->name ?? 'Unknown',
                    'period' => $grade->gradingPeriod->name ?? 'Unknown',
                    'grade' => $grade->grade
                ];
            })->toArray();

            Log::info('[SHS HONOR] ❌ NOT QUALIFIED - Found ' . $gradesBelow85->count() . ' grade(s) below 85', [
                'failed_grades' => $failedGrades
            ]);

            return [
                'qualified' => false,
                'reason' => 'Has ' . $gradesBelow85->count() . ' grade(s) below 85 in current or previous periods',
                'period_average' => $periodAverage,
                'period_id' => $periodId,
                'failed_grades' => $failedGrades
            ];
        }

        Log::info('[SHS HONOR] ✅ All grades are 85 or above (checked ' . $allGradesUpToNow->count() . ' grades across ' . $allPeriods->count() . ' period(s))');

        // Determine honor level based on period average
        $honorLevel = $this->determineHonorLevel($periodAverage);

        if ($honorLevel) {
            Log::info('[SHS_HONOR_CALC] ✅ STUDENT QUALIFIED FOR HONOR', [
                'student_id' => $studentId,
                'student_name' => $student->name,
                'honor_level' => $honorLevel['name'],
                'honor_range' => $honorLevel['range'],
                'period_average' => $periodAverage,
                'period' => $period->name,
                'total_grades_checked' => $allGradesUpToNow->count()
            ]);
        }

        if (!$honorLevel) {
            Log::warning('[SHS_HONOR_CALC] Could not determine honor level for average', [
                'period_average' => $periodAverage,
                'student_id' => $studentId
            ]);
            return [
                'qualified' => false,
                'reason' => 'Could not determine honor level',
                'period_average' => $periodAverage,
                'period_id' => $periodId
            ];
        }

        Log::info('[SHS HONOR] ✅ QUALIFIED for ' . $honorLevel['name'], [
            'honor_type_id' => $honorLevel['id'],
            'period_average' => $periodAverage,
            'range' => $honorLevel['range']
        ]);

        return [
            'qualified' => true,
            'honor_type_id' => $honorLevel['id'],
            'honor_type_name' => $honorLevel['name'],
            'period_average' => $periodAverage,
            'period_id' => $periodId,
            'period_name' => $period->name,
            'period_code' => $period->code,
            'total_grades_checked' => $allGradesUpToNow->count(),
            'periods_checked' => $allPeriods->pluck('name')->toArray(),
            'reason' => 'Qualified for ' . $honorLevel['name']
        ];
    }

    /**
     * Determine honor level based on period average
     *
     * @param float $average
     * @return array|null ['id' => int, 'name' => string, 'range' => string]
     */
    private function determineHonorLevel(float $average): ?array
    {
        // Get SHS honor types (scope is "basic" for basic education levels)
        $withHonors = HonorType::where('name', 'With Honors')
            ->where('scope', 'basic')
            ->first();
        $withHighHonors = HonorType::where('name', 'With High Honors')
            ->where('scope', 'basic')
            ->first();
        $withHighestHonors = HonorType::where('name', 'With Highest Honors')
            ->where('scope', 'basic')
            ->first();

        if ($average >= 98 && $average <= 100 && $withHighestHonors) {
            return ['id' => $withHighestHonors->id, 'name' => 'With Highest Honors', 'range' => '98-100'];
        } elseif ($average >= 95 && $average < 98 && $withHighHonors) {
            return ['id' => $withHighHonors->id, 'name' => 'With High Honors', 'range' => '95-97'];
        } elseif ($average >= 90 && $average < 95 && $withHonors) {
            return ['id' => $withHonors->id, 'name' => 'With Honors', 'range' => '90-94'];
        }

        return null;
    }

    /**
     * Calculate honor qualification for senior high school student across ALL periods
     * (Backward compatibility method - calls calculateHonorForPeriod for each period)
     *
     * @param int $studentId
     * @param int $academicLevelId
     * @param string $schoolYear
     * @return array
     */
    public function calculateSeniorHighSchoolHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        Log::info('[SHS HONOR] === SHS HONOR CALCULATION START (All Periods) ===', [
            'student_id' => $studentId,
            'academic_level_id' => $academicLevelId,
            'school_year' => $schoolYear
        ]);

        $academicLevel = AcademicLevel::find($academicLevelId);

        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            Log::warning('[SHS HONOR] Invalid academic level', ['academic_level_id' => $academicLevelId]);
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not senior high school level',
                'period_results' => []
            ];
        }

        // Get all grading periods for SHS
        // Note: We don't filter by is_active to ensure all periods are included in calculations
        $periods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->orderBy('sort_order')
            ->get();

        Log::info('[SHS HONOR] Found ' . $periods->count() . ' grading periods', [
            'periods' => $periods->pluck('name', 'code')->toArray()
        ]);

        if ($periods->isEmpty()) {
            Log::warning('[SHS HONOR] No grading periods found');
            return [
                'qualified' => false,
                'reason' => 'No grading periods found for senior high school level',
                'period_results' => []
            ];
        }

        $periodResults = [];
        $qualifiedPeriods = [];

        // Calculate honors for each period
        foreach ($periods as $period) {
            $result = $this->calculateHonorForPeriod($studentId, $academicLevelId, $schoolYear, $period->id);
            $periodResults[] = $result;

            if ($result['qualified']) {
                $qualifiedPeriods[] = $period->name;
            }
        }

        $overallQualified = !empty($qualifiedPeriods);

        // Calculate aggregate grade statistics from all periods
        $periodAverages = array_filter(array_column($periodResults, 'period_average'));
        $average_grade = !empty($periodAverages) ? round(array_sum($periodAverages) / count($periodAverages), 2) : 0;
        $min_grade = !empty($periodAverages) ? min($periodAverages) : 0;
        $max_grade = !empty($periodAverages) ? max($periodAverages) : 0;
        $quarter_averages = $periodAverages;

        // Count total subjects checked (from first period with grades)
        $total_subjects = 0;
        foreach ($periodResults as $result) {
            if (isset($result['total_grades_checked']) && $result['total_grades_checked'] > $total_subjects) {
                $total_subjects = $result['total_grades_checked'];
            }
        }

        // Build qualifications array based on OVERALL AVERAGE across all periods
        // NOT the highest honor from individual periods
        $qualifications = [];
        if ($overallQualified && $average_grade > 0) {
            // Determine honor level based on OVERALL average across all periods
            $overallHonorLevel = $this->determineHonorLevel($average_grade);

            Log::info('[SHS HONOR] Determining overall honor based on average across all periods', [
                'overall_average' => $average_grade,
                'period_averages' => $quarter_averages,
                'determined_honor' => $overallHonorLevel ? $overallHonorLevel['name'] : 'None',
                'qualified_periods' => $qualifiedPeriods
            ]);

            if ($overallHonorLevel) {
                $honorType = HonorType::find($overallHonorLevel['id']);

                if ($honorType) {
                    $qualifications[] = [
                        'honor_type' => $honorType,
                        'gpa' => $average_grade,
                        'min_grade' => $min_grade,
                        'max_grade' => $max_grade,
                        'quarter_averages' => $quarter_averages,
                        'qualified_periods_count' => count($qualifiedPeriods),
                        'qualified_periods' => $qualifiedPeriods
                    ];

                    Log::info('[SHS HONOR] ✅ Final honor qualification based on overall average', [
                        'honor_type' => $honorType->name,
                        'overall_average' => $average_grade,
                        'range' => $overallHonorLevel['range']
                    ]);
                }
            } else {
                Log::warning('[SHS HONOR] ⚠️ Student qualified for periods but overall average does not meet honor criteria', [
                    'overall_average' => $average_grade,
                    'qualified_periods' => $qualifiedPeriods,
                    'period_averages' => $quarter_averages
                ]);
            }
        }

        Log::info('[SHS HONOR] === SHS HONOR CALCULATION END ===', [
            'overall_qualified' => $overallQualified,
            'qualified_periods_count' => count($qualifiedPeriods),
            'qualified_periods' => $qualifiedPeriods,
            'average_grade' => $average_grade,
            'min_grade' => $min_grade,
            'max_grade' => $max_grade,
            'quarter_averages' => $quarter_averages,
            'total_subjects' => $total_subjects,
            'qualifications_count' => count($qualifications),
            'highest_honor' => !empty($qualifications) ? $qualifications[0]['honor_type']->name : 'None'
        ]);

        return [
            'qualified' => $overallQualified,
            'qualifications' => $qualifications,
            'period_results' => $periodResults,
            'qualified_periods' => $qualifiedPeriods,
            'average_grade' => $average_grade,
            'min_grade' => $min_grade,
            'max_grade' => $max_grade,
            'quarter_averages' => $quarter_averages,
            'total_subjects' => $total_subjects,
            'reason' => $overallQualified
                ? 'Qualified for honors in ' . count($qualifiedPeriods) . ' period(s)'
                : 'Did not qualify for honors in any period'
        ];
    }

    /**
     * Get all qualified senior high school students for honor calculation
     *
     * @param string $schoolYear
     * @param string|null $gradeLevel
     * @param string|null $sectionId
     * @return array
     */
    public function getQualifiedSeniorHighSchoolStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null): array
    {
        $seniorHighSchoolLevel = AcademicLevel::where('key', 'senior_highschool')->first();

        if (!$seniorHighSchoolLevel) {
            return [];
        }

        // Build query for senior high school students with filters
        $studentsQuery = User::where('user_role', 'student')
            ->where('year_level', 'senior_highschool')
            ->with(['section']); // Load section relationship for display

        // Apply grade level filter
        if ($gradeLevel) {
            $studentsQuery->where('specific_year_level', $gradeLevel);
        }

        // Apply section filter
        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        $students = $studentsQuery->orderBy('name')->get();

        $qualifiedStudents = [];

        foreach ($students as $student) {
            $result = $this->calculateSeniorHighSchoolHonorQualification(
                $student->id,
                $seniorHighSchoolLevel->id,
                $schoolYear
            );

            if ($result['qualified']) {
                $qualifiedStudents[] = [
                    'student' => $student,
                    'result' => $result
                ];
            }
        }

        return $qualifiedStudents;
    }

    /**
     * Generate honor results for all senior high school students
     * Creates one HonorResult record per period per student
     *
     * @param int $academicLevelId
     * @param string $schoolYear
     * @return array
     */
    public function generateSeniorHighSchoolHonorResults(int $academicLevelId, string $schoolYear): array
    {
        Log::info('[SHS HONOR] === GENERATE SHS HONOR RESULTS START ===', [
            'academic_level_id' => $academicLevelId,
            'school_year' => $schoolYear
        ]);

        $academicLevel = AcademicLevel::find($academicLevelId);

        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            Log::warning('[SHS HONOR] Invalid academic level');
            return [
                'success' => false,
                'message' => 'Invalid academic level or not senior high school level'
            ];
        }

        $students = User::where('user_role', 'student')
            ->where('year_level', 'senior_highschool')
            ->get();

        Log::info('[SHS HONOR] Processing ' . $students->count() . ' students');

        $results = [];
        $totalProcessed = 0;
        $totalQualified = 0;
        $totalHonorRecords = 0;

        foreach ($students as $student) {
            $qualification = $this->calculateSeniorHighSchoolHonorQualification(
                $student->id,
                $academicLevelId,
                $schoolYear
            );

            $totalProcessed++;

            if ($qualification['qualified']) {
                $totalQualified++;

                // Store honor result for EACH qualified period
                foreach ($qualification['period_results'] as $periodResult) {
                    if ($periodResult['qualified']) {
                        $honorResult = HonorResult::updateOrCreate([
                            'student_id' => $student->id,
                            'honor_type_id' => $periodResult['honor_type_id'],
                            'academic_level_id' => $academicLevelId,
                            'school_year' => $schoolYear,
                            'grading_period_id' => $periodResult['period_id'],
                        ], [
                            'gpa' => $periodResult['period_average'],
                            'is_overridden' => false,
                            'is_pending_approval' => true,
                            'is_approved' => false,
                            'is_rejected' => false,
                        ]);

                        $totalHonorRecords++;

                        Log::info('[SHS HONOR] Created/Updated honor result for period', [
                            'student_id' => $student->id,
                            'student_name' => $student->name,
                            'period' => $periodResult['period_name'],
                            'honor_type' => $periodResult['honor_type_name'],
                            'average' => $periodResult['period_average'],
                            'honor_result_id' => $honorResult->id
                        ]);
                    }
                }

                $results[] = [
                    'student' => $student,
                    'qualification' => $qualification
                ];
            }
        }

        Log::info('[SHS HONOR] === GENERATE SHS HONOR RESULTS END ===', [
            'total_processed' => $totalProcessed,
            'total_qualified' => $totalQualified,
            'total_honor_records' => $totalHonorRecords,
            'message' => "Processed {$totalProcessed} students, {$totalQualified} qualified for honors, created {$totalHonorRecords} honor records"
        ]);

        return [
            'success' => true,
            'message' => "Processed {$totalProcessed} students, {$totalQualified} qualified for honors in at least one period",
            'total_processed' => $totalProcessed,
            'total_qualified' => $totalQualified,
            'total_honor_records' => $totalHonorRecords,
            'results' => $results
        ];
    }
}
