<?php

namespace App\Services;

use App\Models\User;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class GradeManagementService
{
    /**
     * Input or update grades for students
     */
    public function inputGrades(array $gradesData, User $instructor, AcademicPeriod $period)
    {
        $results = [];
        
        try {
            DB::beginTransaction();

            foreach ($gradesData as $gradeData) {
                $result = $this->inputSingleGrade($gradeData, $instructor, $period);
                if ($result) {
                    $results[] = $result;
                }
            }

            DB::commit();
            
            Log::info('Grades input completed', [
                'instructor_id' => $instructor->id,
                'period_id' => $period->id,
                'grades_processed' => count($results)
            ]);

            return $results;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Grade input failed', [
                'instructor_id' => $instructor->id,
                'period_id' => $period->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Input a single grade
     */
    private function inputSingleGrade(array $gradeData, User $instructor, AcademicPeriod $period)
    {
        // Validate required fields
        if (!isset($gradeData['student_id'], $gradeData['subject_id'])) {
            throw new \InvalidArgumentException('Student ID and Subject ID are required');
        }

        // Check if instructor is assigned to this subject
        if (!$this->canInstructorGradeSubject($instructor, $gradeData['subject_id'], $period)) {
            throw new UnauthorizedHttpException('', 'Instructor not assigned to this subject');
        }

        // Find existing grade or create new one
        $grade = Grade::firstOrCreate([
            'student_id' => $gradeData['student_id'],
            'subject_id' => $gradeData['subject_id'],
            'instructor_id' => $instructor->id,
            'academic_period_id' => $period->id,
        ]);

        // Store old values for logging
        $oldValues = $grade->toArray();

        // Update grade values
        if (isset($gradeData['prelim_grade'])) {
            $grade->prelim_grade = $gradeData['prelim_grade'];
        }
        if (isset($gradeData['midterm_grade'])) {
            $grade->midterm_grade = $gradeData['midterm_grade'];
        }
        if (isset($gradeData['final_grade'])) {
            $grade->final_grade = $gradeData['final_grade'];
        }
        if (isset($gradeData['remarks'])) {
            $grade->remarks = $gradeData['remarks'];
        }

        // Calculate overall grade
        $grade->updateOverallGrade();

        // Reset status to draft if it was submitted/approved
        if ($grade->status !== 'draft') {
            $grade->status = 'draft';
            $grade->submitted_by = null;
            $grade->submitted_at = null;
            $grade->approved_by = null;
            $grade->approved_at = null;
        }

        $grade->save();

        // Log activity
        ActivityLog::logActivity(
            $instructor,
            $grade->wasRecentlyCreated ? 'created' : 'updated',
            'Grade',
            $grade->id,
            $grade->wasRecentlyCreated ? null : $oldValues,
            $grade->toArray()
        );

        return $grade;
    }

    /**
     * Submit grades for approval
     */
    public function submitGrades(array $gradeIds, User $submitter)
    {
        $grades = Grade::whereIn('id', $gradeIds)
            ->where('status', 'draft')
            ->get();

        $submitted = [];

        foreach ($grades as $grade) {
            if ($grade->canBeSubmitted()) {
                $grade->update([
                    'status' => 'submitted',
                    'submitted_by' => $submitter->id,
                    'submitted_at' => now(),
                ]);

                // Log activity
                ActivityLog::logActivity(
                    $submitter,
                    'submitted',
                    'Grade',
                    $grade->id
                );

                // Notify approvers
                $this->notifyApprovers($grade, $submitter);

                $submitted[] = $grade;
            }
        }

        return $submitted;
    }

    /**
     * Approve grades
     */
    public function approveGrades(array $gradeIds, User $approver)
    {
        if (!$approver->canApproveGrades()) {
            throw new UnauthorizedHttpException('', 'User cannot approve grades');
        }

        $grades = Grade::whereIn('id', $gradeIds)
            ->where('status', 'submitted')
            ->get();

        $approved = [];

        foreach ($grades as $grade) {
            if ($grade->canBeApproved()) {
                $grade->update([
                    'status' => 'approved',
                    'approved_by' => $approver->id,
                    'approved_at' => now(),
                ]);

                // Log activity
                ActivityLog::logActivity(
                    $approver,
                    'approved',
                    'Grade',
                    $grade->id
                );

                // Notify instructor and student
                $this->notifyGradeApproval($grade, $approver);

                $approved[] = $grade;
            }
        }

        return $approved;
    }

    /**
     * Finalize grades (make them immutable)
     */
    public function finalizeGrades(array $gradeIds, User $finalizer)
    {
        if (!$finalizer->canApproveGrades()) {
            throw new UnauthorizedHttpException('', 'User cannot finalize grades');
        }

        $grades = Grade::whereIn('id', $gradeIds)
            ->where('status', 'approved')
            ->get();

        $finalized = [];

        foreach ($grades as $grade) {
            $grade->update([
                'status' => 'finalized',
            ]);

            // Log activity
            ActivityLog::logActivity(
                $finalizer,
                'finalized',
                'Grade',
                $grade->id
            );

            $finalized[] = $grade;
        }

        return $finalized;
    }

    /**
     * Import grades from CSV
     */
    public function importGradesFromCSV(string $filePath, User $instructor, AcademicPeriod $period, Subject $subject)
    {
        $csvData = $this->parseCsvFile($filePath);
        $results = [];
        $errors = [];

        try {
            DB::beginTransaction();

            foreach ($csvData as $rowIndex => $row) {
                try {
                    // Map CSV columns to grade data
                    $gradeData = $this->mapCsvRowToGradeData($row, $subject->id);
                    
                    if ($gradeData) {
                        $grade = $this->inputSingleGrade($gradeData, $instructor, $period);
                        $results[] = $grade;
                    }
                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $rowIndex + 1,
                        'error' => $e->getMessage(),
                        'data' => $row
                    ];
                }
            }

            if (empty($errors)) {
                DB::commit();
            } else {
                DB::rollBack();
            }

            return [
                'imported' => $results,
                'errors' => $errors,
                'total_rows' => count($csvData),
                'success_count' => count($results),
                'error_count' => count($errors)
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get grade summary for instructor
     */
    public function getInstructorGradeSummary(User $instructor, AcademicPeriod $period)
    {
        $assignments = $instructor->subjectAssignments()
            ->where('academic_period_id', $period->id)
            ->with(['subject', 'academicPeriod'])
            ->get();

        $summary = [];

        foreach ($assignments as $assignment) {
            $grades = Grade::where('instructor_id', $instructor->id)
                ->where('subject_id', $assignment->subject_id)
                ->where('academic_period_id', $period->id)
                ->get();

            $summary[] = [
                'subject' => $assignment->subject,
                'section' => $assignment->section,
                'total_students' => $this->getAssignmentStudentCount($assignment),
                'grades_input' => $grades->whereNotNull('overall_grade')->count(),
                'grades_submitted' => $grades->where('status', 'submitted')->count(),
                'grades_approved' => $grades->where('status', 'approved')->count(),
                'grades_finalized' => $grades->where('status', 'finalized')->count(),
                'average_grade' => $grades->whereNotNull('overall_grade')->avg('overall_grade'),
                'passing_rate' => $this->calculatePassingRate($grades),
            ];
        }

        return $summary;
    }

    /**
     * Get grades pending approval
     */
    public function getPendingApprovals(User $approver, AcademicPeriod $period = null)
    {
        $query = Grade::where('status', 'submitted')
            ->with(['student.studentProfile', 'subject', 'instructor', 'academicPeriod']);

        if ($period) {
            $query->where('academic_period_id', $period->id);
        }

        // Filter based on approver role
        if ($approver->isChairperson()) {
            // Chairperson can approve grades in their department
            $query->whereHas('subject', function ($q) {
                // Add department filtering logic here
            });
        } elseif ($approver->isPrincipal()) {
            // Principal can approve grades for their academic level
            $query->whereHas('student.studentProfile', function ($q) {
                // Add level filtering logic here
            });
        }

        return $query->orderBy('submitted_at', 'desc')->get();
    }

    /**
     * Check if instructor can grade a subject
     */
    private function canInstructorGradeSubject(User $instructor, int $subjectId, AcademicPeriod $period)
    {
        return $instructor->subjectAssignments()
            ->where('subject_id', $subjectId)
            ->where('academic_period_id', $period->id)
            ->exists();
    }

    /**
     * Notify approvers about submitted grades
     */
    private function notifyApprovers(Grade $grade, User $submitter)
    {
        // Get potential approvers (chairpersons, principals, admins)
        $approvers = User::whereIn('user_role', ['chairperson', 'principal', 'admin'])->get();

        foreach ($approvers as $approver) {
            Notification::createForUser(
                $approver->id,
                'grade_submitted',
                'Grade Submitted for Approval',
                "Grade for {$grade->student->name} in {$grade->subject->name} has been submitted by {$submitter->name}.",
                [
                    'grade_id' => $grade->id,
                    'student_name' => $grade->student->name,
                    'subject_name' => $grade->subject->name,
                    'instructor_name' => $submitter->name,
                ]
            );
        }
    }

    /**
     * Notify about grade approval
     */
    private function notifyGradeApproval(Grade $grade, User $approver)
    {
        // Notify instructor
        Notification::createForUser(
            $grade->instructor_id,
            'grade_approved',
            'Grade Approved',
            "Your grade for {$grade->student->name} in {$grade->subject->name} has been approved by {$approver->name}.",
            [
                'grade_id' => $grade->id,
                'student_name' => $grade->student->name,
                'subject_name' => $grade->subject->name,
                'approver_name' => $approver->name,
            ]
        );

        // Notify student
        Notification::createForUser(
            $grade->student_id,
            'grade_approved',
            'Grade Available',
            "Your grade for {$grade->subject->name} has been finalized: {$grade->overall_grade}",
            [
                'grade_id' => $grade->id,
                'subject_name' => $grade->subject->name,
                'grade' => $grade->overall_grade,
            ]
        );
    }

    /**
     * Parse CSV file
     */
    private function parseCsvFile(string $filePath)
    {
        $data = [];
        if (($handle = fopen($filePath, 'r')) !== false) {
            $header = fgetcsv($handle);
            while (($row = fgetcsv($handle)) !== false) {
                $data[] = array_combine($header, $row);
            }
            fclose($handle);
        }
        return $data;
    }

    /**
     * Map CSV row to grade data
     */
    private function mapCsvRowToGradeData(array $row, int $subjectId)
    {
        // This should be configurable based on CSV format
        return [
            'student_id' => $row['student_id'] ?? null,
            'subject_id' => $subjectId,
            'prelim_grade' => $row['prelim_grade'] ?? null,
            'midterm_grade' => $row['midterm_grade'] ?? null,
            'final_grade' => $row['final_grade'] ?? null,
            'remarks' => $row['remarks'] ?? null,
        ];
    }

    /**
     * Get student count for assignment
     */
    private function getAssignmentStudentCount($assignment)
    {
        return User::students()
            ->whereHas('studentProfile', function ($query) use ($assignment) {
                $query->where('section', $assignment->section)
                    ->where('academic_level_id', $assignment->subject->academic_level_id);
                
                if ($assignment->subject->academic_strand_id) {
                    $query->where('academic_strand_id', $assignment->subject->academic_strand_id);
                }
            })
            ->count();
    }

    /**
     * Calculate passing rate
     */
    private function calculatePassingRate(Collection $grades, $passingGrade = 75)
    {
        $gradesWithScores = $grades->whereNotNull('overall_grade');
        if ($gradesWithScores->isEmpty()) {
            return 0;
        }

        $passingCount = $gradesWithScores->where('overall_grade', '>=', $passingGrade)->count();
        return ($passingCount / $gradesWithScores->count()) * 100;
    }
} 