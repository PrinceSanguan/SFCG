<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\AcademicLevel;
use App\Models\ActivityLog;
use App\Services\ElementaryHonorCalculationService;
use App\Services\JuniorHighSchoolHonorCalculationService;
use App\Services\SeniorHighSchoolHonorCalculationService;
use App\Services\CollegeHonorCalculationService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AutomaticHonorCalculationService
{
    /**
     * Automatically calculate honors for a student when grades are submitted.
     * This is triggered when a teacher/adviser/instructor submits grades.
     */
    public function calculateHonorsForStudent(User $student, string $schoolYear = null): array
    {
        $schoolYear = $schoolYear ?? $this->getCurrentSchoolYear();
        $results = [];

        try {
            // Get the student's academic level
            $academicLevel = AcademicLevel::where('key', $student->year_level)->first();

            if (!$academicLevel) {
                Log::warning('Academic level not found for student', [
                    'student_id' => $student->id,
                    'year_level' => $student->year_level,
                ]);
                return [];
            }

            // Check if student has enough grades to calculate honors
            if (!$this->hasEnoughGradesForHonorCalculation($student, $academicLevel->id, $schoolYear)) {
                Log::info('Student does not have enough grades for honor calculation yet', [
                    'student_id' => $student->id,
                    'academic_level' => $student->year_level,
                    'school_year' => $schoolYear,
                ]);
                return [];
            }

            // Use the appropriate honor calculation service based on academic level
            $calculationService = $this->getHonorCalculationService($student->year_level);

            if (!$calculationService) {
                Log::warning('Honor calculation service not found for academic level', [
                    'academic_level' => $student->year_level,
                ]);
                return [];
            }

            // Calculate honors using the appropriate service
            $honorResults = $this->performHonorCalculation($calculationService, $student->id, $academicLevel->id, $schoolYear);

            // Process each honor result
            $newHonorsCreated = false;
            foreach ($honorResults as $honorData) {
                if ($honorData['qualified']) {
                    $result = $this->createOrUpdateHonorResult($student, $academicLevel, $honorData, $schoolYear);
                    $results[] = $result;

                    // Track if this is a new honor (not an update)
                    if ($result->wasRecentlyCreated) {
                        $newHonorsCreated = true;
                    }

                    Log::info('Student qualified for honor', [
                        'student_id' => $student->id,
                        'honor_type' => $honorData['honor_type'] ?? 'Unknown',
                        'gpa' => $honorData['gpa'] ?? 'N/A',
                        'school_year' => $schoolYear,
                    ]);
                }
            }

            // Send notification if new honors were created
            if ($newHonorsCreated && !empty($results)) {
                $this->sendHonorApprovalNotification($academicLevel, $schoolYear);
            }

        } catch (\Exception $e) {
            Log::error('Error calculating honors for student', [
                'student_id' => $student->id,
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return $results;
    }

    /**
     * Check if a student has enough grades to calculate honors.
     */
    private function hasEnoughGradesForHonorCalculation(User $student, int $academicLevelId, string $schoolYear): bool
    {
        // Check if student has final grades (approved grades) for this school year
        $gradeCount = StudentGrade::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->where('is_approved', true) // Only approved grades count
            ->where('grade_type', 'final') // Only final grades count for honors
            ->count();

        // For elementary students, they need grades in at least 6 subjects
        // For other levels, they need grades in at least 5 subjects
        $minimumSubjects = ($student->year_level === 'elementary') ? 6 : 5;

        return $gradeCount >= $minimumSubjects;
    }

    /**
     * Get the appropriate honor calculation service for the academic level.
     */
    private function getHonorCalculationService(string $academicLevel)
    {
        switch ($academicLevel) {
            case 'elementary':
                return new ElementaryHonorCalculationService();
            case 'junior_highschool':
                return new JuniorHighSchoolHonorCalculationService();
            case 'senior_highschool':
                return new SeniorHighSchoolHonorCalculationService();
            case 'college':
                return new CollegeHonorCalculationService();
            default:
                return null;
        }
    }

    /**
     * Perform the actual honor calculation using the service.
     */
    private function performHonorCalculation($calculationService, int $studentId, int $academicLevelId, string $schoolYear): array
    {
        $results = [];

        // Each calculation service has different method names, so we need to call the appropriate one
        if ($calculationService instanceof ElementaryHonorCalculationService) {
            $result = $calculationService->calculateElementaryHonorQualification($studentId, $academicLevelId, $schoolYear);
            if ($result['qualified']) {
                $results = $result['qualifications'] ?? [];
            }
        } elseif ($calculationService instanceof JuniorHighSchoolHonorCalculationService) {
            // Add method call for JHS honor calculation
            $result = $calculationService->calculateJuniorHighSchoolHonorQualification($studentId, $academicLevelId, $schoolYear);
            if ($result['qualified']) {
                $results = $result['qualifications'] ?? [];
            }
        } elseif ($calculationService instanceof SeniorHighSchoolHonorCalculationService) {
            // Add method call for SHS honor calculation
            $result = $calculationService->calculateSeniorHighSchoolHonorQualification($studentId, $academicLevelId, $schoolYear);
            if ($result['qualified']) {
                $results = $result['qualifications'] ?? [];
            }
        } elseif ($calculationService instanceof CollegeHonorCalculationService) {
            // Add method call for College honor calculation
            $result = $calculationService->calculateCollegeHonorQualification($studentId, $academicLevelId, $schoolYear);
            if ($result['qualified']) {
                $results = $result['qualifications'] ?? [];
            }
        }

        return $results;
    }

    /**
     * Create or update a honor result record.
     */
    private function createOrUpdateHonorResult(User $student, AcademicLevel $academicLevel, array $honorData, string $schoolYear): HonorResult
    {
        // Find the honor type
        $honorType = HonorType::where('key', $honorData['honor_type']['key'] ?? '')->first();

        if (!$honorType) {
            throw new \Exception('Honor type not found: ' . ($honorData['honor_type']['key'] ?? 'unknown'));
        }

        // Check if honor result already exists
        $existingResult = HonorResult::where([
            'student_id' => $student->id,
            'honor_type_id' => $honorType->id,
            'academic_level_id' => $academicLevel->id,
            'school_year' => $schoolYear,
        ])->first();

        $honorResultData = [
            'student_id' => $student->id,
            'honor_type_id' => $honorType->id,
            'academic_level_id' => $academicLevel->id,
            'school_year' => $schoolYear,
            'gpa' => $honorData['gpa'] ?? 0,
            'is_pending_approval' => true, // Always requires approval
            'is_approved' => false,
            'is_rejected' => false,
        ];

        if ($existingResult) {
            // Update existing result
            $existingResult->update($honorResultData);
            $honorResult = $existingResult;
        } else {
            // Create new result
            $honorResult = HonorResult::create($honorResultData);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id() ?? 1, // System user if no auth
            'target_user_id' => $student->id,
            'action' => $existingResult ? 'updated_honor_qualification' : 'created_honor_qualification',
            'entity_type' => 'honor_result',
            'entity_id' => $honorResult->id,
            'details' => [
                'student' => $student->name,
                'honor_type' => $honorType->name,
                'academic_level' => $academicLevel->name,
                'gpa' => $honorData['gpa'] ?? 0,
                'school_year' => $schoolYear,
                'requires_approval' => true,
            ],
        ]);

        return $honorResult;
    }

    /**
     * Recalculate honors for all students in a specific academic level and school year.
     * This can be used for batch processing.
     */
    public function recalculateHonorsForAcademicLevel(string $academicLevelKey, string $schoolYear = null): array
    {
        $schoolYear = $schoolYear ?? $this->getCurrentSchoolYear();
        $results = [];

        $students = User::where('user_role', 'student')
            ->where('year_level', $academicLevelKey)
            ->get();

        foreach ($students as $student) {
            $studentResults = $this->calculateHonorsForStudent($student, $schoolYear);
            if (!empty($studentResults)) {
                $results[$student->id] = $studentResults;
            }
        }

        return $results;
    }

    /**
     * Get the current school year.
     */
    private function getCurrentSchoolYear(): string
    {
        return "2024-2025";
    }

    /**
     * Manually trigger honor calculation for a specific student.
     * This can be called from admin interface or when grades are finalized.
     */
    public function triggerHonorCalculationForStudent(int $studentId, string $schoolYear = null): array
    {
        $student = User::find($studentId);

        if (!$student || $student->user_role !== 'student') {
            throw new \Exception('Student not found or invalid user role');
        }

        return $this->calculateHonorsForStudent($student, $schoolYear);
    }

    /**
     * Send notification to chairperson/principal about pending honor approvals
     */
    private function sendHonorApprovalNotification(AcademicLevel $academicLevel, string $schoolYear): void
    {
        try {
            // Count pending honors for this academic level and school year
            $honorCount = HonorResult::where('academic_level_id', $academicLevel->id)
                ->where('school_year', $schoolYear)
                ->where('is_pending_approval', true)
                ->where('is_approved', false)
                ->where('is_rejected', false)
                ->count();

            if ($honorCount > 0) {
                $notificationService = new NotificationService();
                $result = $notificationService->sendPendingHonorApprovalNotification(
                    $academicLevel,
                    $schoolYear,
                    $honorCount
                );

                if ($result['success']) {
                    Log::info('Honor approval notification sent successfully', [
                        'academic_level' => $academicLevel->name,
                        'school_year' => $schoolYear,
                        'honor_count' => $honorCount,
                    ]);
                } else {
                    Log::warning('Failed to send honor approval notification', [
                        'academic_level' => $academicLevel->name,
                        'school_year' => $schoolYear,
                        'message' => $result['message'] ?? 'Unknown error',
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error sending honor approval notification', [
                'academic_level' => $academicLevel->name,
                'school_year' => $schoolYear,
                'error' => $e->getMessage(),
            ]);
        }
    }
}