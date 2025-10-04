<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use Illuminate\Support\Facades\DB;

class SeniorHighSchoolHonorCalculationService
{
    /**
     * Calculate honor qualification for senior high school students using quarter-based formula
     * Formula: (Sum of all quarter grades) / (Number of quarters) = Average
     * Then compare this average against honor criteria
     */
    public function calculateSeniorHighSchoolHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        \Log::info("=== SHS Honor Calculation START ===", [
            'student_id' => $studentId,
            'academic_level_id' => $academicLevelId,
            'school_year' => $schoolYear
        ]);

        $academicLevel = AcademicLevel::find($academicLevelId);

        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            \Log::warning('SHS Honor: Invalid academic level', ['academic_level_id' => $academicLevelId]);
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not senior high school level'
            ];
        }

        $student = User::find($studentId);
        if (!$student || $student->user_role !== 'student') {
            \Log::warning('SHS Honor: Student not found or invalid role', ['student_id' => $studentId]);
            return [
                'qualified' => false,
                'reason' => 'Student not found'
            ];
        }

        // Use active quarter-level periods and group them into semesters (same layout as College)
        $periods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('is_active', true)
            ->where('is_calculated', false)
            ->whereIn('period_type', ['quarter', 'midterm', 'prefinal'])
            ->orderBy('sort_order')
            ->get();

        \Log::info('SHS Honor: Found grading periods', [
            'count' => $periods->count(),
            'periods' => $periods->pluck('name', 'id')->toArray()
        ]);

        if ($periods->isEmpty()) {
            \Log::warning('SHS Honor: No grading periods found');
            return [
                'qualified' => false,
                'reason' => 'No grading periods found for senior high school level'
            ];
        }

        // Map semester groups
        $semesterGroups = [
            'first_semester' => [
                'label' => 'First Semester',
                'codes' => ['Q1' => 'First Quarter', 'Q2' => 'Second Quarter'],
            ],
            'second_semester' => [
                'label' => 'Second Semester',
                'codes' => ['Q3' => 'Third Quarter', 'Q4' => 'Fourth Quarter'],
            ],
        ];

        // Get all grades for the student across all selected periods
        $grades = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->whereIn('grading_period_id', $periods->pluck('id'))
            ->get();

        \Log::info('SHS Honor: Found grades', [
            'count' => $grades->count(),
            'grades' => $grades->map(fn($g) => [
                'subject_id' => $g->subject_id,
                'period_id' => $g->grading_period_id,
                'grade' => $g->grade
            ])->toArray()
        ]);

        if ($grades->isEmpty()) {
            \Log::warning('SHS Honor: No grades found for student');
            return [
                'qualified' => false,
                'reason' => 'No grades found for the student in the specified school year'
            ];
        }

        // Calculate the average using the semester formula
        // Calculate weighted average based on semester period weights
        $totalWeightedGrade = 0;
        $totalWeight = 0;
        $allGrades = [];
        
        foreach ($periods as $period) {
            $periodGrades = $grades->where('grading_period_id', $period->id);
            if ($periodGrades->isNotEmpty()) {
                $periodAverage = $periodGrades->avg('grade');
                $weight = $period->weight ?? 1.0;
                
                $totalWeightedGrade += ($periodAverage * $weight);
                $totalWeight += $weight;
                
                // Collect all individual grades for minimum grade calculation
                $allGrades = array_merge($allGrades, $periodGrades->pluck('grade')->toArray());
            }
        }
        
        if ($totalWeight == 0) {
            \Log::warning('SHS Honor: No semester averages could be calculated');
            return [
                'qualified' => false,
                'reason' => 'No semester averages could be calculated'
            ];
        }

        $averageGrade = $totalWeightedGrade / $totalWeight;
        $averageGrade = round($averageGrade, 2);

        // Get minimum grade across all periods for criteria checking
        $minGrade = !empty($allGrades) ? min($allGrades) : 0;

        \Log::info('SHS Honor: Calculated averages', [
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'total_grades' => count($allGrades)
        ]);

        // Get all honor criteria for senior high school level
        $criteria = HonorCriterion::where('academic_level_id', $academicLevelId)
            ->with('honorType')
            ->get();

        \Log::info('SHS Honor: Found criteria', [
            'count' => $criteria->count(),
            'criteria' => $criteria->map(fn($c) => [
                'honor_type' => $c->honorType->name ?? 'Unknown',
                'min_gpa' => $c->min_gpa,
                'max_gpa' => $c->max_gpa,
                'min_grade' => $c->min_grade,
                'min_grade_all' => $c->min_grade_all
            ])->toArray()
        ]);

        $qualifications = [];

        foreach ($criteria as $criterion) {
            $qualifies = true;
            $reason = '';

            // Check GPA requirements
            if ($criterion->min_gpa && $averageGrade < $criterion->min_gpa) {
                $qualifies = false;
                $reason .= "GPA {$averageGrade} below minimum {$criterion->min_gpa}. ";
            }

            if ($criterion->max_gpa && $averageGrade > $criterion->max_gpa) {
                $qualifies = false;
                $reason .= "GPA {$averageGrade} above maximum {$criterion->max_gpa}. ";
            }

            // Check minimum grade requirements
            if ($criterion->min_grade && $minGrade < $criterion->min_grade) {
                $qualifies = false;
                $reason .= "Minimum grade {$minGrade} below required {$criterion->min_grade}. ";
            }

            if ($criterion->min_grade_all && $minGrade < $criterion->min_grade_all) {
                $qualifies = false;
                $reason .= "Minimum grade {$minGrade} below required {$criterion->min_grade_all} for all subjects. ";
            }

            // Check if student has consistent honor performance (if required)
            if ($criterion->require_consistent_honor) {
                $consistentHonor = $this->checkConsistentHonorPerformance($studentId, $academicLevelId, $schoolYear);
                if (!$consistentHonor) {
                    $qualifies = false;
                    $reason .= "Student does not have consistent honor performance. ";
                }
            }

            if ($qualifies) {
                \Log::info('SHS Honor: Student qualifies for honor', [
                    'honor_type' => $criterion->honorType->name ?? 'Unknown',
                    'average_grade' => $averageGrade,
                    'min_grade' => $minGrade
                ]);
                $qualifications[] = [
                    'honor_type' => $criterion->honorType,
                    'criterion' => $criterion,
                    'gpa' => $averageGrade,
                    'min_grade' => $minGrade,
                    'semester_periods' => $periods->pluck('name', 'code')->toArray(),
                    'quarter_averages' => $periods->map(function($period) use ($grades) {
                        $periodGrades = $grades->where('grading_period_id', $period->id);
                        return $periodGrades->isNotEmpty() ? round($periodGrades->avg('grade'), 2) : null;
                    })->filter()->values()->toArray()
                ];
            } else {
                \Log::info('SHS Honor: Student does not qualify for honor', [
                    'honor_type' => $criterion->honorType->name ?? 'Unknown',
                    'reason' => $reason
                ]);
            }
        }

        // Calculate quarter averages for display
        $quarterAverages = $periods->map(function($period) use ($grades) {
            $periodGrades = $grades->where('grading_period_id', $period->id);
            return $periodGrades->isNotEmpty() ? round($periodGrades->avg('grade'), 2) : null;
        })->filter()->values()->toArray();

        $result = [
            'qualified' => !empty($qualifications),
            'qualifications' => $qualifications,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'quarter_averages' => $quarterAverages,
            'semester_periods' => $periods->pluck('name', 'code')->toArray(),
            'total_subjects' => $grades->groupBy('subject_id')->count(),
            'grades_breakdown' => $this->getGradesBreakdown($grades, $periods, $semesterGroups),
            'semester_groups' => [
                'first_semester' => $semesterGroups['first_semester'],
                'second_semester' => $semesterGroups['second_semester'],
            ],
            'reason' => empty($qualifications) ? 'No honor criteria met' : 'Qualified for honors'
        ];

        \Log::info("=== SHS Honor Calculation END ===", [
            'qualified' => $result['qualified'],
            'qualifications_count' => count($qualifications),
            'average_grade' => $averageGrade,
            'reason' => $result['reason']
        ]);

        return $result;
    }

    /**
     * Check if student has consistent honor performance across all semester periods
     */
    private function checkConsistentHonorPerformance(int $studentId, int $academicLevelId, string $schoolYear): bool
    {
        $semesterPeriods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('type', 'semester')
            ->where('is_active', true)
            ->where('is_calculated', false) // Exclude calculated periods
            ->orderBy('sort_order')
            ->get();

        foreach ($semesterPeriods as $period) {
            $periodGrades = StudentGrade::where('student_id', $studentId)
                ->where('academic_level_id', $academicLevelId)
                ->where('school_year', $schoolYear)
                ->where('grading_period_id', $period->id)
                ->get();

            if ($periodGrades->isNotEmpty()) {
                $periodAverage = $periodGrades->avg('grade');
                // Consider consistent honor as maintaining at least 90 GPA in each period
                if ($periodAverage < 90) {
                    return false;
                }
            }
        }

        return true;
    }

    private function getGradesBreakdown($grades, $periods, array $semesterGroups): array
    {
        $periodBreakdown = [];
        foreach ($periods as $period) {
            $pGrades = $grades->where('grading_period_id', $period->id);
            $avg = $pGrades->avg('grade');
            $periodBreakdown[] = [
                'period' => $period->name,
                'period_code' => $period->code,
                'grade' => $avg ? round($avg, 2) : null,
                'count' => $pGrades->count(),
            ];
        }

        $subjectBreakdown = [];
        $subjects = $grades->groupBy('subject_id');
        foreach ($subjects as $subjectId => $subjectGrades) {
            $subject = $subjectGrades->first()->subject ?? null;
            if (!$subject) { continue; }

            $entry = [
                'periods' => []
            ];

            foreach ($periods as $period) {
                $gradeRow = $subjectGrades->where('grading_period_id', $period->id)->first();
                $entry['periods'][$period->code] = $gradeRow ? $gradeRow->grade : null;
            }

            $periodGrades = collect($entry['periods'])->filter()->values();
            $entry['average'] = $periodGrades->isNotEmpty() ? round($periodGrades->avg(), 2) : null;

            $subjectBreakdown[$subject->name] = $entry['periods'];
            $subjectBreakdown[$subject->name]['average'] = $entry['average'];
        }

        $semesterSummaries = [];
        foreach ($semesterGroups as $key => $group) {
            $codes = array_keys($group['codes']);
            $gradesForCodes = collect($periodBreakdown)
                ->filter(fn($p) => in_array($p['period_code'], $codes, true) && !is_null($p['grade']))
                ->pluck('grade');
            $semesterSummaries[$key] = [
                'label' => $group['label'],
                'average' => $gradesForCodes->isNotEmpty() ? round($gradesForCodes->avg(), 2) : null,
            ];
        }

        return [
            'periods' => $periodBreakdown,
            'subjects' => $subjectBreakdown,
            'semester_summaries' => $semesterSummaries,
        ];
    }

    /**
     * Get all qualified senior high school students for honor calculation
     */
    public function getQualifiedSeniorHighSchoolStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null): array
    {
        $seniorHighSchoolLevel = \App\Models\AcademicLevel::where('key', 'senior_highschool')->first();
        
        if (!$seniorHighSchoolLevel) {
            return [];
        }

        // Build query for senior high school students with filters
        $studentsQuery = \App\Models\User::where('user_role', 'student')
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
     */
    public function generateSeniorHighSchoolHonorResults(int $academicLevelId, string $schoolYear): array
    {
        \Log::info('=== GENERATE SHS HONOR RESULTS START ===', [
            'academic_level_id' => $academicLevelId,
            'school_year' => $schoolYear
        ]);

        $academicLevel = AcademicLevel::find($academicLevelId);

        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            \Log::warning('SHS Honor Generation: Invalid academic level');
            return [
                'success' => false,
                'message' => 'Invalid academic level or not senior high school level'
            ];
        }

        $students = User::where('user_role', 'student')
            ->where('year_level', 'senior_highschool')
            ->get();

        \Log::info('SHS Honor Generation: Processing students', ['count' => $students->count()]);

        $results = [];
        $totalProcessed = 0;
        $totalQualified = 0;

        foreach ($students as $student) {
            $qualification = $this->calculateSeniorHighSchoolHonorQualification(
                $student->id,
                $academicLevelId,
                $schoolYear
            );

            $totalProcessed++;

            if ($qualification['qualified']) {
                $totalQualified++;

                // Store honor results in database
                foreach ($qualification['qualifications'] as $qual) {
                    $honorResult = HonorResult::updateOrCreate([
                        'student_id' => $student->id,
                        'honor_type_id' => $qual['honor_type']->id,
                        'academic_level_id' => $academicLevelId,
                        'school_year' => $schoolYear,
                    ], [
                        'gpa' => $qualification['average_grade'],
                        'is_overridden' => false,
                        'is_pending_approval' => true,
                        'is_approved' => false,
                        'is_rejected' => false,
                    ]);

                    \Log::info('SHS Honor Generation: Created/Updated honor result', [
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'honor_type' => $qual['honor_type']->name,
                        'gpa' => $qualification['average_grade'],
                        'is_pending_approval' => true,
                        'honor_result_id' => $honorResult->id
                    ]);
                }

                $results[] = [
                    'student' => $student,
                    'qualification' => $qualification
                ];
            }
        }

        \Log::info('=== GENERATE SHS HONOR RESULTS END ===', [
            'total_processed' => $totalProcessed,
            'total_qualified' => $totalQualified,
            'message' => "Processed {$totalProcessed} students, {$totalQualified} qualified for honors"
        ]);

        return [
            'success' => true,
            'message' => "Processed {$totalProcessed} students, {$totalQualified} qualified for honors",
            'total_processed' => $totalProcessed,
            'total_qualified' => $totalQualified,
            'results' => $results
        ];
    }
}
