<?php

namespace App\Services;

use App\Models\User;
use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\HonorCriterion;
use App\Models\AcademicPeriod;
use App\Models\Notification;
use App\Mail\HonorAchievementEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class HonorCalculationService
{
    /**
     * Calculate honors for all students in a given academic period
     */
    public function calculateHonorsForPeriod(AcademicPeriod $period, bool $autoApprove = false, User $calculatedBy = null)
    {
        $results = [];

        try {
            DB::beginTransaction();

            // Get all students with finalized grades for this period
            $students = User::students()
                ->whereHas('receivedGrades', function ($query) use ($period) {
                    $query->where('academic_period_id', $period->id)
                        ->where('status', 'finalized');
                })
                ->with(['studentProfile.academicLevel', 'receivedGrades' => function ($query) use ($period) {
                    $query->where('academic_period_id', $period->id)
                        ->where('status', 'finalized');
                }])
                ->get();

            foreach ($students as $student) {
                $result = $this->calculateStudentHonor($student, $period, $autoApprove, $calculatedBy?->id);
                if ($result) {
                    $results[] = $result;
                }
            }

            DB::commit();
            
            Log::info('Honor calculation completed', [
                'period_id' => $period->id,
                'students_processed' => count($students),
                'honors_awarded' => count($results)
            ]);

            return $results;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Honor calculation failed', [
                'period_id' => $period->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Calculate honor for a specific student in a period
     */
    public function calculateStudentHonor(User $student, AcademicPeriod $period, bool $autoApprove = false, $approvedById = null)
    {
        // Calculate GPA
        $gpa = $this->calculateGPA($student, $period);
        
        if ($gpa === null) {
            return null; // No grades or incomplete grades
        }

        // Get student's academic level
        $academicLevel = $student->studentProfile?->academicLevel;
        if (!$academicLevel) {
            return null;
        }

        // Find honor criteria that matches the GPA
        $honorCriterion = HonorCriterion::getHonorForGPA($gpa, $academicLevel->id);
        
        if (!$honorCriterion) {
            return null; // No honor achieved
        }

        // Check if honor already exists for this student and period
        $existingHonor = StudentHonor::where('student_id', $student->id)
            ->where('academic_period_id', $period->id)
            ->first();

        if ($existingHonor) {
            // Update existing honor
            $existingHonor->update([
                'honor_type' => $honorCriterion->honor_type,
                'gpa' => $gpa,
                'is_approved' => $autoApprove,
                'approved_by' => $autoApprove ? $approvedById : null,
                'approved_at' => $autoApprove ? now() : null,
            ]);
            $honor = $existingHonor;
        } else {
            // Create new honor
            $honor = StudentHonor::create([
                'student_id' => $student->id,
                'academic_period_id' => $period->id,
                'honor_type' => $honorCriterion->honor_type,
                'gpa' => $gpa,
                'is_approved' => $autoApprove,
                'approved_by' => $autoApprove ? $approvedById : null,
                'approved_at' => $autoApprove ? now() : null,
            ]);
        }

        // Send notification
        if ($honor && ($autoApprove || !$existingHonor)) {
            $this->sendHonorNotification($student, $honor, $period);
        }

        return $honor;
    }

    /**
     * Calculate GPA for a student in a specific period
     */
    public function calculateGPA(User $student, AcademicPeriod $period)
    {
        $grades = Grade::where('student_id', $student->id)
            ->where('academic_period_id', $period->id)
            ->where('status', 'finalized')
            ->whereNotNull('overall_grade')
            ->get();

        if ($grades->isEmpty()) {
            return null;
        }

        $totalGradePoints = $grades->sum(function ($grade) {
            return $grade->overall_grade * ($grade->subject->units ?? 3);
        });

        $totalUnits = $grades->sum(function ($grade) {
            return $grade->subject->units ?? 3;
        });

        return $totalUnits > 0 ? round($totalGradePoints / $totalUnits, 2) : null;
    }

    /**
     * Approve honors for a specific academic level/period
     */
    public function approveHonors(array $honorIds, $approvedBy)
    {
        $honors = StudentHonor::whereIn('id', $honorIds)
            ->where('is_approved', false)
            ->get();

        foreach ($honors as $honor) {
            $honor->approve($approvedBy);
            
            // Send approval notification
            $this->sendHonorApprovalNotification($honor);
        }

        return $honors;
    }

    /**
     * Send honor achievement notification
     */
    private function sendHonorNotification(User $student, StudentHonor $honor, AcademicPeriod $period)
    {
        // Create in-app notification for student
        Notification::createHonorNotification(
            $student->id,
            $honor->getHonorDisplayName(),
            $honor->gpa,
            $period->name
        );

        // Send email to student
        if ($student->email) {
            Mail::to($student->email)->queue(
                new HonorAchievementEmail($student, $honor, $period, false)
            );
        }

        // Notify linked parents
        foreach ($student->linkedParents as $parent) {
            // Create in-app notification
            Notification::createForUser(
                $parent->id,
                'honor_achievement',
                'Student Honor Achievement',
                "Your child {$student->name} has achieved {$honor->getHonorDisplayName()} with a GPA of {$honor->gpa} for {$period->name}.",
                [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'honor_type' => $honor->honor_type,
                    'gpa' => $honor->gpa,
                    'period' => $period->name,
                ]
            );

            // Send email to parent
            if ($parent->email) {
                Mail::to($parent->email)->queue(
                    new HonorAchievementEmail($student, $honor, $period, true)
                );
            }
        }
    }

    /**
     * Send honor approval notification
     */
    private function sendHonorApprovalNotification(StudentHonor $honor)
    {
        $student = $honor->student;
        $period = $honor->academicPeriod;

        Notification::createForUser(
            $student->id,
            'honor_approved',
            'Honor Achievement Approved',
            "Your {$honor->getHonorDisplayName()} for {$period->name} has been officially approved!",
            [
                'honor_type' => $honor->honor_type,
                'gpa' => $honor->gpa,
                'period' => $period->name,
            ]
        );
    }

    /**
     * Get honor statistics for a period
     */
    public function getHonorStatistics(AcademicPeriod $period, $academicLevelId = null)
    {
        $query = StudentHonor::where('academic_period_id', $period->id);
        
        if ($academicLevelId) {
            $query->whereHas('student.studentProfile', function ($q) use ($academicLevelId) {
                $q->where('academic_level_id', $academicLevelId);
            });
        }

        $honors = $query->get();

        return [
            'total_students_with_honors' => $honors->count(),
            'with_honors' => $honors->where('honor_type', 'with_honors')->count(),
            'with_high_honors' => $honors->where('honor_type', 'with_high_honors')->count(),
            'with_highest_honors' => $honors->where('honor_type', 'with_highest_honors')->count(),
            'approved' => $honors->where('is_approved', true)->count(),
            'pending_approval' => $honors->where('is_approved', false)->count(),
            'average_gpa' => $honors->avg('gpa'),
        ];
    }

    /**
     * Get students eligible for honors but not yet calculated
     */
    public function getEligibleStudents(AcademicPeriod $period)
    {
        return User::students()
            ->whereHas('receivedGrades', function ($query) use ($period) {
                $query->where('academic_period_id', $period->id)
                    ->where('status', 'finalized');
            })
            ->whereDoesntHave('honors', function ($query) use ($period) {
                $query->where('academic_period_id', $period->id);
            })
            ->with(['studentProfile.academicLevel'])
            ->get();
    }
} 