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

        // Get all semester grading periods for senior high school - use semester-based periods
        $semesterPeriods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('type', 'semester')
            ->where('is_active', true)
            ->where('is_calculated', false) // Exclude calculated periods like Final Average
            ->orderBy('sort_order')
            ->get();

        if ($semesterPeriods->isEmpty()) {
            return [
                'qualified' => false,
                'reason' => 'No semester grading periods found for senior high school level'
            ];
        }

        // Get all grades for the student across all semester periods
        $grades = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->whereIn('grading_period_id', $semesterPeriods->pluck('id'))
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
        
        foreach ($semesterPeriods as $period) {
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
                    'semester_periods' => $semesterPeriods->pluck('name', 'code')->toArray()
                ];
            }
        }

        return [
            'qualified' => !empty($qualifications),
            'qualifications' => $qualifications,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'semester_periods' => $semesterPeriods->pluck('name', 'code')->toArray(),
            'total_subjects' => $grades->groupBy('subject_id')->count(),
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
