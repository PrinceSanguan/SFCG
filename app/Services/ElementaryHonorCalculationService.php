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

        // Get all quarter grading periods for elementary - use only Q1, Q2, Q3, Q4/F4
        // Note: We don't filter by is_active to ensure all quarters are included in calculations
        // Note: Fourth Quarter might be coded as 'Q4' or 'F4' depending on configuration
        $periods = GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('type', 'quarter')
            ->where('period_type', 'quarter')
            ->whereIn('code', ['Q1', 'Q2', 'Q3', 'Q4', 'F4'])
            ->orderBy('sort_order')
            ->get();

        if ($periods->isEmpty()) {
            return [
                'qualified' => false,
                'reason' => 'No quarter grading periods found for elementary level'
            ];
        }

        // Group quarters into semesters (Q1, Q2 = First Semester; Q3, Q4/F4 = Second Semester)
        $semesterGroups = [
            'first_semester' => $periods->whereIn('code', ['Q1', 'Q2'])->values(),
            'second_semester' => $periods->whereIn('code', ['Q3', 'Q4', 'F4'])->values(),
        ];

        // Get all grades for the student across all quarters
        $grades = StudentGrade::where('student_id', $studentId)
            ->where('academic_level_id', $academicLevelId)
            ->where('school_year', $schoolYear)
            ->whereIn('grading_period_id', $periods->pluck('id'))
            ->with('subject')
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
        
        foreach ($periods as $quarter) {
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
                    'status' => 'qualified',
                    'average_grade' => $averageGrade,
                    'min_grade' => $minGrade,
                    'total_quarters' => count($quarterAverages),
                    'grades_breakdown' => $this->getGradesBreakdown($grades, $periods, $semesterGroups)
                ];
            }
        }

        // For elementary, return only the highest honor achieved
        if (!empty($qualifications)) {
            // Sort by min_grade in descending order to get the highest honor first
            usort($qualifications, function($a, $b) {
                return $b['criterion']->min_grade <=> $a['criterion']->min_grade;
            });
            
            // Return only the highest honor
            $qualifications = [array_shift($qualifications)];
        }

        $qualified = !empty($qualifications);
        
        // Get grades breakdown with semester grouping
        $gradesBreakdown = $this->getGradesBreakdown($grades, $periods, $semesterGroups);
        
        return [
            'qualified' => $qualified,
            'qualifications' => $qualifications,
            'average_grade' => $averageGrade,
            'min_grade' => $minGrade,
            'quarter_averages' => $quarterAverages,
            'total_subjects' => $grades->groupBy('subject_id')->count(),
            'semester_periods' => [
                'Q1' => 'First Quarter',
                'Q2' => 'Second Quarter',
                'Q3' => 'Third Quarter',
                'Q4' => 'Fourth Quarter',
            ],
            'semester_groups' => [
                'first_semester' => ['Q1', 'Q2'],
                'second_semester' => ['Q3', 'Q4'],
            ],
            'grades_breakdown' => $gradesBreakdown,
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
     * Get detailed breakdown of grades by quarter and by subject
     */
    private function getGradesBreakdown($grades, $periods, $semesterGroups): array
    {
        // Simple quarter breakdown (for backward compatibility)
        $periodBreakdown = [];
        foreach ($periods as $period) {
            $periodGrades = $grades->where('grading_period_id', $period->id);
            $averageGrade = $periodGrades->avg('grade');
            $periodBreakdown[] = [
                'period' => $period->name,
                'period_code' => $period->code,
                'grade' => $averageGrade ? round($averageGrade, 2) : null,
                'count' => $periodGrades->count()
            ];
        }

        // Detailed subject breakdown
        $subjectBreakdown = [];
        $subjects = $grades->groupBy('subject_id');
        
        foreach ($subjects as $subjectId => $subjectGrades) {
            $subject = $subjectGrades->first()->subject ?? null;
            if (!$subject) continue;
            
            $entry = [
                'subject_name' => $subject->name,
                'subject_code' => $subject->code ?? '',
                'periods' => []
            ];
            
            // Get grades for each quarter for this subject
            foreach ($periods as $period) {
                $periodGrade = $subjectGrades->where('grading_period_id', $period->id)->first();
                $entry['periods'][$period->code] = $periodGrade ? $periodGrade->grade : null;
            }
            
            // Calculate subject average
            $periodGrades = collect($entry['periods'])->filter()->values();
            $entry['average'] = $periodGrades->isNotEmpty() ? round($periodGrades->avg(), 2) : null;
            
            $subjectBreakdown[$subject->name] = $entry['periods'];
            $subjectBreakdown[$subject->name]['average'] = $entry['average'];
        }

        // Calculate semester summaries
        $firstSemesterGrades = $grades->whereIn('grading_period_id', collect($semesterGroups['first_semester'])->pluck('id'));
        $secondSemesterGrades = $grades->whereIn('grading_period_id', collect($semesterGroups['second_semester'])->pluck('id'));

        $firstSemesterAverage = $firstSemesterGrades->isNotEmpty() ? round($firstSemesterGrades->avg('grade'), 2) : null;
        $secondSemesterAverage = $secondSemesterGrades->isNotEmpty() ? round($secondSemesterGrades->avg('grade'), 2) : null;

        return [
            'periods' => $periodBreakdown,
            'subjects' => $subjectBreakdown,
            'semester_summaries' => [
                'first_semester' => [
                    'label' => 'First Semester',
                    'average' => $firstSemesterAverage,
                ],
                'second_semester' => [
                    'label' => 'Second Semester',
                    'average' => $secondSemesterAverage,
                ],
            ],
        ];
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
