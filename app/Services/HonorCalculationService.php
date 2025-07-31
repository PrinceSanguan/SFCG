<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\HonorCriterion;
use App\Models\User;
use App\Models\AcademicPeriod;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HonorCalculationService
{
    public function calculateStudentHonors($studentId, $academicPeriodId)
    {
        try {
            DB::transaction(function () use ($studentId, $academicPeriodId) {
                // Get all approved grades for this student in this period
                $grades = Grade::where('student_id', $studentId)
                              ->where('academic_period_id', $academicPeriodId)
                              ->where('status', 'approved')
                              ->get();

                if ($grades->isEmpty()) {
                    return;
                }

                // Calculate GPA
                $totalGradePoints = $grades->sum('final_grade');
                $totalSubjects = $grades->count();
                $gpa = $totalGradePoints / $totalSubjects;

                // Get honor criteria
                $honorCriteria = HonorCriterion::where('is_active', true)
                                               ->orderBy('minimum_grade', 'desc')
                                               ->get();

                // Find applicable honor
                $applicableHonor = null;
                foreach ($honorCriteria as $criterion) {
                    if ($gpa >= $criterion->minimum_grade && 
                        ($criterion->maximum_grade === null || $gpa <= $criterion->maximum_grade)) {
                        $applicableHonor = $criterion;
                        break;
                    }
                }

                // Remove existing honor for this period
                StudentHonor::where('student_id', $studentId)
                           ->where('academic_period_id', $academicPeriodId)
                           ->delete();

                // Award new honor if applicable
                if ($applicableHonor) {
                    $studentHonor = StudentHonor::create([
                        'student_id' => $studentId,
                        'honor_criterion_id' => $applicableHonor->id,
                        'academic_period_id' => $academicPeriodId,
                        'gpa' => $gpa,
                        'awarded_date' => now(),
                        'is_active' => true,
                    ]);

                    // Create notification for student
                    $this->createHonorNotification($studentId, $applicableHonor, $gpa);

                    Log::info("Honor awarded", [
                        'student_id' => $studentId,
                        'honor_type' => $applicableHonor->honor_type,
                        'gpa' => $gpa
                    ]);
                }
            });
        } catch (\Exception $e) {
            Log::error("Error calculating student honors", [
                'student_id' => $studentId,
                'academic_period_id' => $academicPeriodId,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function calculateAllStudentHonors($academicPeriodId)
    {
        $students = User::where('user_role', 'student')
                       ->whereHas('grades', function ($query) use ($academicPeriodId) {
                           $query->where('academic_period_id', $academicPeriodId)
                                 ->where('status', 'approved');
                       })
                       ->get();

        $processed = 0;
        foreach ($students as $student) {
            $this->calculateStudentHonors($student->id, $academicPeriodId);
            $processed++;
        }

        Log::info("Bulk honor calculation completed", [
            'academic_period_id' => $academicPeriodId,
            'students_processed' => $processed
        ]);

        return $processed;
    }

    public function getHonorRollByPeriod($academicPeriodId)
    {
        return StudentHonor::with(['student.studentProfile', 'honorCriterion', 'academicPeriod'])
                          ->where('academic_period_id', $academicPeriodId)
                          ->where('is_active', true)
                          ->orderBy('gpa', 'desc')
                          ->get()
                          ->groupBy('honorCriterion.honor_type');
    }

    public function getStudentHonorHistory($studentId)
    {
        return StudentHonor::with(['honorCriterion', 'academicPeriod'])
                          ->where('student_id', $studentId)
                          ->where('is_active', true)
                          ->orderBy('awarded_date', 'desc')
                          ->get();
    }

    public function generateHonorStatistics($academicPeriodId = null)
    {
        $query = StudentHonor::with(['honorCriterion', 'academicPeriod'])
                            ->where('is_active', true);

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        $honors = $query->get();

        $statistics = [
            'total_honors' => $honors->count(),
            'average_gpa' => $honors->avg('gpa'),
            'highest_gpa' => $honors->max('gpa'),
            'by_honor_type' => $honors->groupBy('honorCriterion.honor_type')->map->count(),
            'by_period' => $honors->groupBy('academicPeriod.name')->map->count(),
        ];

        return $statistics;
    }

    private function createHonorNotification($studentId, $honorCriterion, $gpa)
    {
        try {
            $student = User::find($studentId);
            
            Notification::create([
                'user_id' => $studentId,
                'title' => 'Congratulations! Honor Roll Achievement',
                'message' => "You have been awarded {$honorCriterion->honor_type} with a GPA of " . number_format($gpa, 2) . "!",
                'type' => 'honor_achievement',
                'data' => [
                    'honor_type' => $honorCriterion->honor_type,
                    'gpa' => $gpa,
                    'criteria_description' => $honorCriterion->criteria_description
                ],
                'is_read' => false,
            ]);

            // Also notify parents if they exist
            if ($student->studentProfile) {
                $parents = $student->studentProfile->parents;
                foreach ($parents as $parent) {
                    Notification::create([
                        'user_id' => $parent->id,
                        'title' => 'Your Child Achieved Honor Roll',
                        'message' => "{$student->name} has been awarded {$honorCriterion->honor_type} with a GPA of " . number_format($gpa, 2) . "!",
                        'type' => 'child_honor_achievement',
                        'data' => [
                            'student_name' => $student->name,
                            'honor_type' => $honorCriterion->honor_type,
                            'gpa' => $gpa
                        ],
                        'is_read' => false,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error creating honor notification", [
                'student_id' => $studentId,
                'error' => $e->getMessage()
            ]);
        }
    }
} 