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

        $results = [];
        foreach ($students as $student) {
            $honor = $this->calculateStudentHonor($student, $period);
            if ($honor) {
                $results[] = $honor;
            }
        }

        return $results;
    }

    /**
     * Calculate honor for a specific student based on the new requirements
     * Returns the highest applicable honor only
     */
    public function calculateStudentHonor(User $student, AcademicPeriod $period)
    {
        try {
            $studentProfile = $student->studentProfile;
            if (!$studentProfile) {
                return null;
            }

            $academicLevel = $studentProfile->academicLevel;
            $isCollege = $studentProfile->college_course_id !== null;

            // Get all grades for the student in the given period
            $grades = Grade::where('student_id', $student->id)
                ->where('academic_period_id', $period->id)
                ->get();

            if ($grades->isEmpty()) {
                return null;
            }

            // Calculate GPA
            $gpa = $this->calculateGPA($grades);
            
            // Get all individual grades
            $individualGrades = $grades->map(function ($grade) {
                return $grade->final_grade ?? $grade->overall_grade;
            })->filter(function ($grade) {
                return $grade !== null && $grade > 0;
            })->toArray();

            // Determine honor based on education level
            if ($isCollege) {
                $honor = $this->calculateCollegeHonor($student, $gpa, $individualGrades, $studentProfile);
            } else {
                $honor = $this->calculateBasicEducationHonor($gpa, $individualGrades);
            }

            if ($honor !== 'No Honors') {
                // Save to database
                $this->saveStudentHonor($student, $honor, $gpa, $period, $isCollege);
            }

            return [
                'student_id' => $student->id,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'gpa' => $gpa,
                'honor' => $honor,
                'certificate_title' => $this->getCertificateTitle($honor, $isCollege),
                'academic_level' => $academicLevel->name ?? 'Unknown',
                'year_level' => $studentProfile->grade_level ?? 'Unknown'
            ];

        } catch (\Exception $e) {
            Log::error("Error calculating honors for student {$student->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate Basic Education honor (Elementary to Senior High School)
     */
    private function calculateBasicEducationHonor($gpa, $individualGrades)
    {
        // Check for With Highest Honors: GPA 98-100, no grade below 93
        if ($gpa >= 98 && $gpa <= 100) {
            $hasGradeBelowNinetyThree = collect($individualGrades)->contains(function ($grade) {
                return $grade < 93;
            });
            
            if (!$hasGradeBelowNinetyThree) {
                return 'With Highest Honors';
            }
        }

        // Check for With High Honors: GPA 95-97, no grade below 90
        if ($gpa >= 95 && $gpa <= 97) {
            $hasGradeBelowNinety = collect($individualGrades)->contains(function ($grade) {
                return $grade < 90;
            });
            
            if (!$hasGradeBelowNinety) {
                return 'With High Honors';
            }
        }

        // Check for With Honors: GPA 90 or above
        if ($gpa >= 90) {
            return 'With Honors';
        }

        return 'No Honors';
    }

    /**
     * Calculate College honor
     */
    private function calculateCollegeHonor($student, $gpa, $individualGrades, $studentProfile)
    {
        $yearLevel = $studentProfile->grade_level ?? '';
        
        // Check for Summa Cum Laude: No grade below 95 in all subjects from 1st to 4th year
        $hasGradeBelowNinetyFive = collect($individualGrades)->contains(function ($grade) {
            return $grade < 95;
        });
        
        if (!$hasGradeBelowNinetyFive) {
            return 'Summa Cum Laude';
        }

        // Check for Magna Cum Laude: No grade below 93 in any subject from 1st to 4th year
        $hasGradeBelowNinetyThree = collect($individualGrades)->contains(function ($grade) {
            return $grade < 93;
        });
        
        if (!$hasGradeBelowNinetyThree) {
            return 'Magna Cum Laude';
        }

        // Check for Dean's List: 2nd or 3rd year, GPA ≥ 92, no grade below 90, consistent honor status
        $isSecondOrThirdYear = preg_match('/(2nd|3rd|second|third)/i', $yearLevel);
        if ($isSecondOrThirdYear && $gpa >= 92) {
            $hasGradeBelowNinety = collect($individualGrades)->contains(function ($grade) {
                return $grade < 90;
            });
            
            if (!$hasGradeBelowNinety && $this->hasConsistentHonorStatus($student)) {
                return "Dean's List";
            }
        }

        // Check for Cum Laude: No grade below 87 in any subject from 1st to 4th year
        $hasGradeBelowEightyNine = collect($individualGrades)->contains(function ($grade) {
            return $grade < 87;
        });
        
        if (!$hasGradeBelowEightyNine) {
            return 'Cum Laude';
        }

        // Check for College Honors: No grade below 87 from 1st to 2nd semester
        $hasGradeBelowEightySeven = collect($individualGrades)->contains(function ($grade) {
            return $grade < 87;
        });
        
        if (!$hasGradeBelowEightySeven) {
            return 'College Honors';
        }

        return 'No Honors';
    }

    /**
     * Check if student has consistent honor status (for Dean's List)
     * This is a placeholder - you may need to implement based on your specific requirements
     */
    private function hasConsistentHonorStatus($student)
    {
        // Get previous honors for this student
        $previousHonors = StudentHonor::where('student_id', $student->id)
            ->where('is_approved', true)
            ->count();

        // For demonstration, consider consistent if student has at least 1 previous honor
        // You can modify this logic based on your specific requirements
        return $previousHonors >= 1;
    }

    /**
     * Get certificate title for college honors
     */
    private function getCertificateTitle($honor, $isCollege)
    {
        if (!$isCollege || $honor === 'No Honors') {
            return null;
        }

        switch ($honor) {
            case 'College Honors':
                return 'Certificate of College Honors';
            case "Dean's List":
                return 'Certificate of Inclusion in the Dean\'s List';
            case 'Cum Laude':
                return 'Certificate of Academic Distinction: Cum Laude';
            case 'Magna Cum Laude':
                return 'Certificate of Academic Excellence: Magna Cum Laude';
            case 'Summa Cum Laude':
                return 'Certificate of Highest Academic Distinction: Summa Cum Laude';
            default:
                return null;
        }
    }

    /**
     * Save student honor to database
     */
    private function saveStudentHonor($student, $honor, $gpa, $period, $isCollege)
    {
        // Remove any existing honors for this student and period to ensure only highest honor is kept
        StudentHonor::where('student_id', $student->id)
            ->where('academic_period_id', $period->id)
            ->delete();

        // Find the appropriate honor criterion
        $honorType = $this->getHonorTypeSlug($honor);
        $academicLevelId = $student->studentProfile->academic_level_id;
        
        $honorCriterion = HonorCriterion::where('honor_type', $honorType)
            ->where('academic_level_id', $academicLevelId)
            ->where('is_active', true)
            ->first();

        // Create new honor record
        StudentHonor::create([
            'student_id' => $student->id,
            'honor_type' => $honorType,
            'honor_criterion_id' => $honorCriterion ? $honorCriterion->id : null,
            'gpa' => $gpa,
            'is_approved' => false,
            'awarded_date' => now(),
            'academic_period_id' => $period->id,
            'certificate_title' => $this->getCertificateTitle($honor, $isCollege),
            'remarks' => "Automatically calculated based on criteria",
        ]);
    }

    /**
     * Convert honor display name to database slug
     */
    private function getHonorTypeSlug($honor)
    {
        switch ($honor) {
            case 'With Honors':
                return 'with_honors';
            case 'With High Honors':
                return 'with_high_honors';
            case 'With Highest Honors':
                return 'with_highest_honors';
            case "Dean's List":
                return 'deans_list';
            case 'Cum Laude':
                return 'cum_laude';
            case 'Magna Cum Laude':
                return 'magna_cum_laude';
            case 'Summa Cum Laude':
                return 'summa_cum_laude';
            case 'College Honors':
                return 'college_honors';
            default:
                return 'no_honors';
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

        return $gradeCount > 0 ? round($totalGrade / $gradeCount, 2) : 0;
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
                return 'GPA is 90 or above.';
            case 'with_high_honors':
                return 'GPA is between 95 and 97, and no grade is below 90.';
            case 'with_highest_honors':
                return 'GPA is between 98 and 100, and no grade is below 93.';
            case 'deans_list':
                return "Student must be in 2nd or 3rd year. GPA must be 92 or above. No grade below 90. Must have consistent honor status.";
            case 'cum_laude':
                return 'No grade is below 87 in any subject from 1st to 4th year.';
            case 'magna_cum_laude':
                return 'No grade is below 93 in any subject from 1st to 4th year.';
            case 'summa_cum_laude':
                return 'No grade is below 95 in all subjects from 1st to 4th year.';
            case 'college_honors':
                return 'No grade is below 87 from 1st to 2nd semester.';
            default:
                return 'Honor achievement based on academic performance.';
        }
    }

    /**
     * Calculate honors for a specific student by ID (legacy method for compatibility)
     */
    public function calculateStudentHonors($studentId, $academicPeriodId)
    {
        $student = User::find($studentId);
        $period = AcademicPeriod::find($academicPeriodId);
        
        if (!$student || !$period) {
            return null;
        }
        
        return $this->calculateStudentHonor($student, $period);
    }

    /**
     * Generate honor statistics
     */
    public function generateHonorStatistics($academicPeriodId = null)
    {
        $query = StudentHonor::with(['academicPeriod', 'student.studentProfile.academicLevel']);

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        $honors = $query->get();

        $averageGpa = $honors->avg('gpa');
        $highestGpa = $honors->max('gpa');
        $statistics = [
            'total_honors' => $honors->count(),
            'average_gpa' => $averageGpa ? round((float)$averageGpa, 2) : 0,
            'highest_gpa' => $highestGpa ? round((float)$highestGpa, 2) : 0,
            'by_honor_type' => $honors->groupBy('honor_type')->map->count(),
            'by_period' => $honors->groupBy(function ($honor) {
                return $honor->academicPeriod->name ?? 'Unknown';
            })->map->count(),
            'by_education_level' => $honors->groupBy(function ($honor) {
                return $honor->student->studentProfile->academicLevel->name ?? 'Unknown';
            })->map->count(),
            'approved_honors' => $honors->where('is_approved', true)->count(),
            'pending_honors' => $honors->where('is_approved', false)->count(),
            'certificates_eligible' => $honors->whereNotNull('certificate_title')->count(),
        ];

        return $statistics;
    }

    /**
     * Get honor roll by period
     */
    public function getHonorRollByPeriod($academicPeriodId)
    {
        $query = StudentHonor::with(['student.studentProfile', 'academicPeriod'])
            ->orderBy('gpa', 'desc');

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        return $query->get()->groupBy('honor_type');
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

    /**
     * Generate sample honor data for demonstration
     */
    public function generateSampleHonorData()
    {
        return [
            [
                'student_id' => 1,
                'student_name' => 'Maria Santos',
                'gpa' => 98.5,
                'honor' => 'With Highest Honors',
                'certificate_title' => null,
                'academic_level' => 'Senior High School',
                'year_level' => 'Grade 12',
                'individual_grades' => [98, 99, 97, 98, 99]
            ],
            [
                'student_id' => 2,
                'student_name' => 'Juan dela Cruz',
                'gpa' => 96.2,
                'honor' => 'With High Honors',
                'certificate_title' => null,
                'academic_level' => 'Junior High School',
                'year_level' => 'Grade 10',
                'individual_grades' => [95, 97, 96, 98, 95]
            ],
            [
                'student_id' => 3,
                'student_name' => 'Anna Reyes',
                'gpa' => 92.8,
                'honor' => 'With Honors',
                'certificate_title' => null,
                'academic_level' => 'Elementary',
                'year_level' => 'Grade 6',
                'individual_grades' => [90, 94, 93, 95, 92]
            ],
            [
                'student_id' => 4,
                'student_name' => 'Carlos Mendoza',
                'gpa' => 97.1,
                'honor' => 'Summa Cum Laude',
                'certificate_title' => 'Certificate of Highest Academic Distinction: Summa Cum Laude',
                'academic_level' => 'College',
                'year_level' => '4th Year',
                'individual_grades' => [96, 97, 98, 97, 98]
            ],
            [
                'student_id' => 5,
                'student_name' => 'Sofia Garcia',
                'gpa' => 94.5,
                'honor' => 'Magna Cum Laude',
                'certificate_title' => 'Certificate of Academic Excellence: Magna Cum Laude',
                'academic_level' => 'College',
                'year_level' => '4th Year',
                'individual_grades' => [93, 95, 94, 96, 94]
            ],
            [
                'student_id' => 6,
                'student_name' => 'Miguel Torres',
                'gpa' => 93.2,
                'honor' => "Dean's List",
                'certificate_title' => 'Certificate of Inclusion in the Dean\'s List',
                'academic_level' => 'College',
                'year_level' => '3rd Year',
                'individual_grades' => [92, 94, 93, 95, 92]
            ],
            [
                'student_id' => 7,
                'student_name' => 'Elena Castillo',
                'gpa' => 89.8,
                'honor' => 'Cum Laude',
                'certificate_title' => 'Certificate of Academic Distinction: Cum Laude',
                'academic_level' => 'College',
                'year_level' => '4th Year',
                'individual_grades' => [87, 90, 89, 92, 91]
            ],
            [
                'student_id' => 8,
                'student_name' => 'David Ramos',
                'gpa' => 88.5,
                'honor' => 'College Honors',
                'certificate_title' => 'Certificate of College Honors',
                'academic_level' => 'College',
                'year_level' => '2nd Year',
                'individual_grades' => [87, 89, 88, 90, 89]
            ],
            [
                'student_id' => 9,
                'student_name' => 'Isabella Cruz',
                'gpa' => 85.2,
                'honor' => 'No Honors',
                'certificate_title' => null,
                'academic_level' => 'Senior High School',
                'year_level' => 'Grade 11',
                'individual_grades' => [83, 87, 85, 88, 86]
            ]
        ];
    }
}