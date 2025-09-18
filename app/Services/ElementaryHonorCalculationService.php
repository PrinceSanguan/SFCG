<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use Illuminate\Support\Facades\DB;

class ElementaryHonorCalculationService
{
    /**
     * Calculate honor qualification for elementary students using quarter-based formula
     * Formula: (Sum of all quarter grades) / (Number of quarters) = Average
     * Then compare this average against honor criteria
     */
    public function calculateElementaryHonorQualification(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        $academicLevel = AcademicLevel::find($academicLevelId);
        
        if (!$academicLevel || $academicLevel->key !== 'elementary') {
            return [
                'qualified' => false,
                'reason' => 'Invalid academic level or not elementary level'
            ];
        }

        $student = User::find($studentId);
        if (!$student || $student->user_role !== 'student') {
            return [
                'qualified' => false,
                'reason' => 'Student not found'
            ];
        }

        // Get all quarter grading periods for elementary - use only Q1, Q2, Q3, Q4
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
                'reason' => 'No quarter grading periods found for elementary level'
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

        // Get all honor criteria for elementary level
        $criteria = HonorCriterion::where('academic_level_id', $academicLevelId)
            ->with('honorType')
            ->get();

        $qualifications = [];

        foreach ($criteria as $criterion) {
            $qualifies = $this->checkCriterionQualification($criterion, $averageGrade, $minGrade, $grades);
            
            if ($qualifies) {
                $qualifications[] = [
                    'criterion' => $criterion,
                    'honor_type' => $criterion->honorType,
                    'average_grade' => $averageGrade,
                    'min_grade' => $minGrade,
                    'total_quarters' => count($quarterAverages),
                    'grades_breakdown' => $this->getGradesBreakdown($grades, $quarterPeriods)
                ];
            }
        }

        $qualified = !empty($qualifications);
        
        return [
            'qualified' => $qualified,
            'student' => $student,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'total_quarters' => count($quarterAverages),
            'qualifications' => $qualifications,
            'grades_breakdown' => $this->getGradesBreakdown($grades, $quarterPeriods),
            'reason' => $qualified ? 'Student qualifies for honors' : 'Student does not meet any honor criteria'
        ];
    }

    /**
     * Check if student qualifies for a specific honor criterion
     */
    private function checkCriterionQualification(HonorCriterion $criterion, float $averageGrade, float $minGrade, $grades): bool
    {
        $qualifies = true;

        // Check GPA requirements (using average grade)
        if ($criterion->min_gpa && $averageGrade < $criterion->min_gpa) {
            $qualifies = false;
        }
        
        if ($criterion->max_gpa && $averageGrade > $criterion->max_gpa) {
            $qualifies = false;
        }

        // Check minimum grade requirements
        if ($criterion->min_grade && $minGrade < $criterion->min_grade) {
            $qualifies = false;
        }

        // Check minimum grade for all subjects requirement
        if ($criterion->min_grade_all) {
            $allGradesMeetRequirement = $grades->every(function ($grade) use ($criterion) {
                return $grade->grade >= $criterion->min_grade_all;
            });
            
            if (!$allGradesMeetRequirement) {
                $qualifies = false;
            }
        }

        // Check consistent honor standing requirement
        if ($criterion->require_consistent_honor) {
            $previousHonors = HonorResult::where('student_id', $grades->first()->student_id)
                ->where('academic_level_id', $criterion->academic_level_id)
                ->where('is_overridden', false)
                ->where('is_approved', true)
                ->exists();
            
            if (!$previousHonors) {
                $qualifies = false;
            }
        }

        return $qualifies;
    }

    /**
     * Get detailed breakdown of grades by quarter
     */
    private function getGradesBreakdown($grades, $quarterPeriods): array
    {
        $breakdown = [];
        
        foreach ($quarterPeriods as $quarter) {
            $quarterGrade = $grades->where('grading_period_id', $quarter->id)->first();
            $breakdown[] = [
                'quarter' => $quarter->name,
                'quarter_code' => $quarter->code,
                'grade' => $quarterGrade ? $quarterGrade->grade : null,
                'subject' => $quarterGrade ? $quarterGrade->subject->name ?? 'Unknown' : null
            ];
        }

        return $breakdown;
    }

    /**
     * Generate honor results for all elementary students
     */
    public function generateElementaryHonorResults(int $academicLevelId, string $schoolYear): array
    {
        $academicLevel = AcademicLevel::find($academicLevelId);
        
        if (!$academicLevel || $academicLevel->key !== 'elementary') {
            return [
                'success' => false,
                'message' => 'Invalid academic level or not elementary level'
            ];
        }

        $students = User::where('user_role', 'student')
            ->where('year_level', 'elementary')
            ->get();

        $results = [];
        $totalProcessed = 0;
        $totalQualified = 0;

        foreach ($students as $student) {
            $qualification = $this->calculateElementaryHonorQualification(
                $student->id, 
                $academicLevelId, 
                $schoolYear
            );

            $totalProcessed++;

            if ($qualification['qualified']) {
                $totalQualified++;
                
                // Store honor results in database
                foreach ($qualification['qualifications'] as $qual) {
                    HonorResult::updateOrCreate([
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
                }

                $results[] = [
                    'student' => $student,
                    'qualification' => $qualification
                ];
            }
        }

        return [
            'success' => true,
            'message' => "Processed {$totalProcessed} students, {$totalQualified} qualified for honors",
            'total_processed' => $totalProcessed,
            'total_qualified' => $totalQualified,
            'results' => $results
        ];
    }

    /**
     * Get detailed honor calculation for a specific student
     */
    public function getStudentHonorCalculation(int $studentId, int $academicLevelId, string $schoolYear): array
    {
        return $this->calculateElementaryHonorQualification($studentId, $academicLevelId, $schoolYear);
    }
}
