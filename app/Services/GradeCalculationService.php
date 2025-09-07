<?php

namespace App\Services;

use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use Illuminate\Support\Facades\DB;

class GradeCalculationService
{
    /**
     * Calculate final average for a semester based on midterm and prefinal grades
     * Formula: (midterm + prefinal) / 2
     */
    public function calculateSemesterFinalAverage(int $studentId, int $subjectId, int $semesterId, string $schoolYear): ?float
    {
        // Get the semester grading period
        $semester = GradingPeriod::find($semesterId);
        if (!$semester || !$semester->isSemester()) {
            return null;
        }

        // Get midterm and prefinal periods for this semester
        $midtermPeriod = GradingPeriod::where('parent_id', $semesterId)
            ->where('period_type', 'midterm')
            ->first();

        $prefinalPeriod = GradingPeriod::where('parent_id', $semesterId)
            ->where('period_type', 'prefinal')
            ->first();

        if (!$midtermPeriod || !$prefinalPeriod) {
            return null;
        }

        // Get grades for midterm and prefinal
        $midtermGrade = StudentGrade::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->where('grading_period_id', $midtermPeriod->id)
            ->where('school_year', $schoolYear)
            ->first();

        $prefinalGrade = StudentGrade::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->where('grading_period_id', $prefinalPeriod->id)
            ->where('school_year', $schoolYear)
            ->first();

        if (!$midtermGrade || !$prefinalGrade) {
            return null;
        }

        // Calculate final average: (midterm + prefinal) / 2
        $finalAverage = ($midtermGrade->grade + $prefinalGrade->grade) / 2;

        return round($finalAverage, 2);
    }

    /**
     * Update or create final average grade for a semester
     */
    public function updateSemesterFinalAverage(int $studentId, int $subjectId, int $semesterId, string $schoolYear): bool
    {
        $finalAverage = $this->calculateSemesterFinalAverage($studentId, $subjectId, $semesterId, $schoolYear);
        
        if ($finalAverage === null) {
            return false;
        }

        // Get the final average grading period
        $finalPeriod = GradingPeriod::where('parent_id', $semesterId)
            ->where('period_type', 'final')
            ->first();

        if (!$finalPeriod) {
            return false;
        }

        // Update or create the final average grade
        StudentGrade::updateOrCreate(
            [
                'student_id' => $studentId,
                'subject_id' => $subjectId,
                'grading_period_id' => $finalPeriod->id,
                'school_year' => $schoolYear,
            ],
            [
                'grade' => $finalAverage,
                'is_submitted_for_validation' => false,
                'submitted_at' => null,
                'validated_at' => null,
                'validated_by' => null,
            ]
        );

        return true;
    }

    /**
     * Recalculate all final averages for a specific semester
     */
    public function recalculateSemesterFinalAverages(int $semesterId, string $schoolYear): int
    {
        $updated = 0;

        // Get all students with grades in this semester
        $studentGrades = StudentGrade::whereHas('gradingPeriod', function ($query) use ($semesterId) {
            $query->where('parent_id', $semesterId)
                  ->whereIn('period_type', ['midterm', 'prefinal']);
        })
        ->where('school_year', $schoolYear)
        ->get()
        ->groupBy(['student_id', 'subject_id']);

        foreach ($studentGrades as $studentId => $subjects) {
            foreach ($subjects as $subjectId => $grades) {
                if ($this->updateSemesterFinalAverage($studentId, $subjectId, $semesterId, $schoolYear)) {
                    $updated++;
                }
            }
        }

        return $updated;
    }

    /**
     * Recalculate all final averages for all semesters in a school year
     */
    public function recalculateAllSemesterFinalAverages(string $schoolYear): int
    {
        $totalUpdated = 0;

        // Get all semester grading periods
        $semesters = GradingPeriod::where('type', 'semester')
            ->whereNull('parent_id')
            ->get();

        foreach ($semesters as $semester) {
            $totalUpdated += $this->recalculateSemesterFinalAverages($semester->id, $schoolYear);
        }

        return $totalUpdated;
    }

    /**
     * Get calculated grade for a specific period
     */
    public function getCalculatedGrade(int $studentId, int $subjectId, int $gradingPeriodId, string $schoolYear): ?float
    {
        $gradingPeriod = GradingPeriod::find($gradingPeriodId);
        
        if (!$gradingPeriod || !$gradingPeriod->is_calculated) {
            return null;
        }

        // If it's a final average, calculate it
        if ($gradingPeriod->period_type === 'final' && $gradingPeriod->parent_id) {
            return $this->calculateSemesterFinalAverage($studentId, $subjectId, $gradingPeriod->parent_id, $schoolYear);
        }

        return null;
    }

    /**
     * Check if a grade needs to be recalculated
     */
    public function needsRecalculation(int $gradingPeriodId): bool
    {
        $gradingPeriod = GradingPeriod::find($gradingPeriodId);
        
        if (!$gradingPeriod) {
            return false;
        }

        // If it's a midterm or prefinal period, we need to recalculate the final average
        if ($gradingPeriod->period_type === 'midterm' || $gradingPeriod->period_type === 'prefinal') {
            return true;
        }

        return false;
    }

    /**
     * Trigger recalculation when a grade is updated
     */
    public function triggerRecalculation(int $studentId, int $subjectId, int $gradingPeriodId, string $schoolYear): void
    {
        $gradingPeriod = GradingPeriod::find($gradingPeriodId);
        
        if (!$gradingPeriod) {
            return;
        }

        // If this is a midterm or prefinal grade, recalculate the final average
        if (($gradingPeriod->period_type === 'midterm' || $gradingPeriod->period_type === 'prefinal') 
            && $gradingPeriod->parent_id) {
            $this->updateSemesterFinalAverage($studentId, $subjectId, $gradingPeriod->parent_id, $schoolYear);
        }
    }
}
