<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use Illuminate\Support\Facades\DB;

class JuniorHighSchoolHonorCalculationService
{
    /**
     * Calculate honor qualification for junior high school students using quarter-based formula
     * Formula: (Sum of all quarter grades) / (Number of quarters) = Average
     * Then compare this average against honor criteria
     */
    public function calculateJuniorHighSchoolHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        $academicLevel = AcademicLevel::find($academicLevelId);
        
        if (!$academicLevel || $academicLevel->key !== 'junior_highschool') {
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not junior high school level'
            ];
        }

        $student = User::find($studentId);
        if (!$student || $student->user_role !== 'student') {
            return [
                'qualified' => false,
                'reason' => 'Student not found'
            ];
        }

        // Get all quarter grading periods for junior high school - use only Q1, Q2, Q3, Q4
        $quarterPeriods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('type', 'quarter')
            ->where('period_type', 'quarter')
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        if ($quarterPeriods->isEmpty()) {
            return [
                'qualified' => false,
                'reason' => 'No quarter grading periods found for junior high school level'
            ];
        }

        // Get all grades for the student across all quarters
        $grades = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->whereIn('grading_period_id', $quarterPeriods->pluck('id'))
            ->get();

        if ($grades->isEmpty()) {
            return [
                'qualified' => false,
                'reason' => 'No grades found for the student in the specified school year'
            ];
        }

        // Calculate the average using the quarter formula
        // First, calculate average grade per quarter, then average those quarter averages
        $quarterAverages = [];
        $quarterMinGrades = [];
        
        foreach ($quarterPeriods as $quarter) {
            $quarterGrades = $grades->where('grading_period_id', $quarter->id);
            if ($quarterGrades->isNotEmpty()) {
                $quarterAverage = $quarterGrades->avg('grade');
                $quarterAverages[] = $quarterAverage;
                $quarterMinGrades[] = $quarterGrades->min('grade');
            }
        }
        
        if (empty($quarterAverages)) {
            return [
                'qualified' => false,
                'reason' => 'No quarter averages could be calculated'
            ];
        }
        
        $averageGrade = array_sum($quarterAverages) / count($quarterAverages);
        $averageGrade = round($averageGrade, 2);
        
        // Get minimum grade across all quarters for criteria checking
        $minGrade = min($quarterMinGrades);

        // Get all honor criteria for junior high school level
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
                    'quarter_averages' => $quarterAverages
                ];
            }
        }

        return [
            'qualified' => !empty($qualifications),
            'qualifications' => $qualifications,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'quarter_averages' => $quarterAverages,
            'total_subjects' => $grades->groupBy('subject_id')->count(),
            'reason' => empty($qualifications) ? 'No honor criteria met' : 'Qualified for honors'
        ];
    }

    /**
     * Check if student has consistent honor performance across all quarters
     */
    private function checkConsistentHonorPerformance(int $studentId, int $academicLevelId, string $schoolYear): bool
    {
        $quarterPeriods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('type', 'quarter')
            ->where('period_type', 'quarter')
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        foreach ($quarterPeriods as $quarter) {
            $quarterGrades = StudentGrade::where('student_id', $studentId)
                ->where('academic_level_id', $academicLevelId)
                ->where('school_year', $schoolYear)
                ->where('grading_period_id', $quarter->id)
                ->get();

            if ($quarterGrades->isNotEmpty()) {
                $quarterAverage = $quarterGrades->avg('grade');
                // Consider consistent honor as maintaining at least 90 GPA in each quarter
                if ($quarterAverage < 90) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get all qualified junior high school students for honor calculation
     */
    public function getQualifiedJuniorHighSchoolStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null): array
    {
        $juniorHighSchoolLevel = \App\Models\AcademicLevel::where('key', 'junior_highschool')->first();
        
        if (!$juniorHighSchoolLevel) {
            return [];
        }

        // Build query for junior high school students with filters
        $studentsQuery = \App\Models\User::where('user_role', 'student')
            ->where('year_level', 'junior_highschool')
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
            $result = $this->calculateJuniorHighSchoolHonorQualification(
                $student->id,
                $juniorHighSchoolLevel->id,
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
