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
        $academicLevel = AcademicLevel::find($academicLevelId);
        
        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not senior high school level'
            ];
        }

        $student = User::find($studentId);
        if (!$student || $student->user_role !== 'student') {
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

        if ($periods->isEmpty()) {
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

        if ($grades->isEmpty()) {
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
            return [
                'qualified' => false,
                'reason' => 'No semester averages could be calculated'
            ];
        }
        
        $averageGrade = $totalWeightedGrade / $totalWeight;
        $averageGrade = round($averageGrade, 2);
        
        // Get minimum grade across all periods for criteria checking
        $minGrade = !empty($allGrades) ? min($allGrades) : 0;

        // Get all honor criteria for senior high school level
        $criteria = HonorCriterion::where('academic_level_id', $academicLevelId)
            ->with('honorType')
            ->get();

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
                $qualifications[] = [
                    'honor_type' => $criterion->honorType,
                    'criterion' => $criterion,
                    'gpa' => $averageGrade,
                    'min_grade' => $minGrade,
                    'semester_periods' => $periods->pluck('name', 'code')->toArray()
                ];
            }
        }

        return [
            'qualified' => !empty($qualifications),
            'qualifications' => $qualifications,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'semester_periods' => $periods->pluck('name', 'code')->toArray(),
            'total_subjects' => $grades->groupBy('subject_id')->count(),
            'grades_breakdown' => $this->getGradesBreakdown($grades, $periods, $semesterGroups),
            'semester_groups' => [
                'first_semester' => $semesterGroups['first_semester'],
                'second_semester' => $semesterGroups['second_semester'],
            ],
            'reason' => empty($qualifications) ? 'No honor criteria met' : 'Qualified for honors'
        ];
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
}
