<?php

namespace App\Services;

use App\Models\User;
use App\Models\Grade;
use App\Models\HonorCriterion;
use App\Models\StudentHonor;
use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\Log;

class HonorCalculationService
{
    /**
     * Calculate honors for all students in a given academic period
     */
    public function calculateAllStudentHonors(AcademicPeriod $period)
    {
        $students = User::with(['studentProfile.academicLevel', 'studentProfile.collegeCourse'])
            ->where('user_role', 'student')
            ->whereHas('studentProfile')
            ->get();

        foreach ($students as $student) {
            $this->calculateStudentHonors($student, $period);
        }
    }

    /**
     * Calculate honors for a specific student
     */
    public function calculateStudentHonors(User $student, AcademicPeriod $period)
    {
        try {
            $studentProfile = $student->studentProfile;
            if (!$studentProfile) {
                return;
            }

            $academicLevel = $studentProfile->academicLevel;
            $isCollege = $studentProfile->college_course_id !== null;

            // Get all grades for the student in the given period
            $grades = Grade::where('student_id', $student->id)
                ->where('academic_period_id', $period->id)
                ->get();

            if ($grades->isEmpty()) {
                return;
            }

            // Calculate GPA
            $gpa = $this->calculateGPA($grades);
            
            // Get applicable honor criteria based on education level
            $honorCriteria = $this->getApplicableHonorCriteria($academicLevel, $isCollege, $studentProfile);

            // Check each honor criterion
            foreach ($honorCriteria as $criterion) {
                if ($this->qualifiesForHonor($student, $grades, $criterion, $gpa, $isCollege)) {
                    $this->awardHonor($student, $criterion, $gpa, $period);
                }
            }

        } catch (\Exception $e) {
            Log::error("Error calculating honors for student {$student->id}: " . $e->getMessage());
        }
    }

    /**
     * Calculate GPA from grades
     */
    private function calculateGPA($grades)
    {
        $totalGrade = 0;
        $gradeCount = 0;

        foreach ($grades as $grade) {
            $finalGrade = $grade->final_grade ?? $grade->overall_grade;
            if ($finalGrade !== null && $finalGrade > 0) {
                $totalGrade += $finalGrade;
                $gradeCount++;
            }
        }

        return $gradeCount > 0 ? $totalGrade / $gradeCount : 0;
    }

    /**
     * Get applicable honor criteria based on education level
     */
    private function getApplicableHonorCriteria($academicLevel, $isCollege, $studentProfile)
    {
        if ($isCollege) {
            // College honor criteria
            $criteria = HonorCriterion::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->get();

            // Filter Dean's List for 2nd and 3rd year students only
            $gradeLevel = $studentProfile->grade_level ?? '';
            $isSecondOrThirdYear = preg_match('/(2nd|3rd|second|third)/i', $gradeLevel);
            
            return $criteria->filter(function ($criterion) use ($isSecondOrThirdYear) {
                if ($criterion->honor_type === 'deans_list') {
                    return $isSecondOrThirdYear;
                }
                return true;
            });
        } else {
            // Basic Education honor criteria
            return HonorCriterion::where('academic_level_id', $academicLevel->id)
                ->where('is_active', true)
                ->whereIn('honor_type', ['with_honors', 'with_high_honors', 'with_highest_honors'])
                ->get();
        }
    }

    /**
     * Check if student qualifies for a specific honor
     */
    private function qualifiesForHonor($student, $grades, $criterion, $gpa, $isCollege)
    {
        // Check GPA requirement
        if ($gpa < $criterion->minimum_grade || $gpa > $criterion->maximum_grade) {
            return false;
        }

        // Check individual grade requirements based on honor type
        $minGradeRequirement = $this->getMinGradeRequirement($criterion->honor_type, $isCollege);
        
        foreach ($grades as $grade) {
            $finalGrade = $grade->final_grade ?? $grade->overall_grade;
            if ($finalGrade !== null && $finalGrade < $minGradeRequirement) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get minimum grade requirement for each honor type
     */
    private function getMinGradeRequirement($honorType, $isCollege)
    {
        if ($isCollege) {
            switch ($honorType) {
                case 'deans_list':
                    return 90;
                case 'cum_laude':
                    return 87;
                case 'magna_cum_laude':
                    return 93;
                case 'summa_cum_laude':
                    return 95;
                case 'college_honors':
                    return 85;
                default:
                    return 85;
            }
        } else {
            switch ($honorType) {
                case 'with_honors':
                    return 85;
                case 'with_high_honors':
                    return 90;
                case 'with_highest_honors':
                    return 93;
                default:
                    return 85;
            }
        }
    }

    /**
     * Award honor to student
     */
    private function awardHonor($student, $criterion, $gpa, $period)
    {
        // Check if honor already exists for this student and period
        $existingHonor = StudentHonor::where('student_id', $student->id)
            ->where('honor_type', $criterion->honor_type)
            ->where('academic_period_id', $period->id)
            ->first();

        if ($existingHonor) {
            // Update existing honor
            $existingHonor->update([
                'gpa' => $gpa,
                'is_approved' => false, // Reset approval status for new calculation
                'awarded_date' => now(),
                'remarks' => "Recalculated on " . now()->format('Y-m-d H:i:s'),
            ]);
        } else {
            // Create new honor
            StudentHonor::create([
                'student_id' => $student->id,
                'honor_type' => $criterion->honor_type,
                'gpa' => $gpa,
                'is_approved' => false,
                'awarded_date' => now(),
                'academic_period_id' => $period->id,
                'remarks' => "Automatically calculated based on criteria: " . $criterion->criteria_description,
            ]);
        }
    }

    /**
     * Get honor display name
     */
    public function getHonorDisplayName($honorType)
    {
        switch ($honorType) {
            case 'with_honors':
                return 'With Honors';
            case 'with_high_honors':
                return 'With High Honors';
            case 'with_highest_honors':
                return 'With Highest Honors';
            case 'deans_list':
                return "Dean's List";
            case 'cum_laude':
                return 'Cum Laude';
            case 'magna_cum_laude':
                return 'Magna Cum Laude';
            case 'summa_cum_laude':
                return 'Summa Cum Laude';
            case 'college_honors':
                return 'College Honors';
            default:
                return ucwords(str_replace('_', ' ', $honorType));
        }
    }

    /**
     * Get honor description
     */
    public function getHonorDescription($honorType)
    {
        switch ($honorType) {
            case 'with_honors':
                return 'GPA ≥ 90. No grade below 85 in any subject.';
            case 'with_high_honors':
                return 'GPA 95-97. No grade below 90 in any subject.';
            case 'with_highest_honors':
                return 'GPA 98-100. No grade below 93 in any subject.';
            case 'deans_list':
                return "Dean's List: Exclusive to 2nd and 3rd year students. GPA ≥ 92, no grade below 90, consistent honor student standing.";
            case 'cum_laude':
                return 'Cum Laude: No grade below 87 in any subject from 1st to 4th year.';
            case 'magna_cum_laude':
                return 'Magna Cum Laude: No grade below 93 from 1st to 4th year.';
            case 'summa_cum_laude':
                return 'Summa Cum Laude: No grade below 95 in all subjects from 1st to 4th year.';
            case 'college_honors':
                return 'College Honors: No grade below 85 from 1st semester to 2nd semester.';
            default:
                return 'Honor achievement based on academic performance.';
        }
    }

    /**
     * Generate honor statistics
     */
    public function generateHonorStatistics($academicPeriodId = null)
    {
        $query = StudentHonor::with(['academicPeriod', 'student.studentProfile']);

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        $honors = $query->get();

        $statistics = [
            'total_honors' => $honors->count(),
            'average_gpa' => $honors->avg('gpa'),
            'highest_gpa' => $honors->max('gpa'),
            'by_honor_type' => $honors->groupBy('honor_type')->map->count(),
            'by_period' => $honors->groupBy('academicPeriod.name')->map->count(),
            'by_education_level' => $honors->groupBy('student.studentProfile.academic_level.name')->map->count(),
            'approved_honors' => $honors->where('is_approved', true)->count(),
            'pending_honors' => $honors->where('is_approved', false)->count(),
        ];

        return $statistics;
    }

    /**
     * Get honor roll by period
     */
    public function getHonorRollByPeriod($academicPeriodId)
    {
        return StudentHonor::with(['student.studentProfile', 'academicPeriod'])
            ->where('academic_period_id', $academicPeriodId)
            ->where('is_approved', true)
            ->orderBy('gpa', 'desc')
            ->get()
            ->groupBy('honor_type');
    }

    /**
     * Get student honor history
     */
    public function getStudentHonorHistory($studentId)
    {
        return StudentHonor::with(['academicPeriod'])
            ->where('student_id', $studentId)
            ->where('is_approved', true)
            ->orderBy('awarded_date', 'desc')
            ->get();
    }
} 