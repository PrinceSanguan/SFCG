<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subject;
use App\Models\StudentSubjectAssignment;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentSubjectAssignmentService
{
    /**
     * Automatically assign subjects to a student based on their academic level and program.
     */
    public function assignSubjectsToStudent(User $student): array
    {
        $assignedSubjects = [];
        $currentSchoolYear = $this->getCurrentSchoolYear();
        
        // Get academic level ID based on student's year level
        $academicLevelId = $this->getAcademicLevelId($student->year_level);
        
        if (!$academicLevelId) {
            Log::warning('Could not determine academic level for student', [
                'student_id' => $student->id,
                'year_level' => $student->year_level,
            ]);
            return $assignedSubjects;
        }

        // Get subjects based on student's academic level and program
        $subjects = $this->getSubjectsForStudent($student, $academicLevelId);
        
        foreach ($subjects as $subject) {
            try {
                // Check if student is already enrolled in this subject
                $existingAssignment = StudentSubjectAssignment::where([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'school_year' => $currentSchoolYear,
                ])->first();

                if (!$existingAssignment) {
                    $assignment = StudentSubjectAssignment::create([
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'school_year' => $currentSchoolYear,
                        'semester' => $this->getSemesterForLevel($student->year_level),
                        'is_active' => true,
                        'enrolled_by' => Auth::id() ?? 1, // Fallback to admin user
                        'notes' => 'Automatically assigned based on academic level and program',
                    ]);

                    $assignedSubjects[] = $assignment;

                    // Log activity
                    ActivityLog::create([
                        'user_id' => Auth::id() ?? 1,
                        'target_user_id' => $student->id,
                        'action' => 'auto_enrolled_student_subject',
                        'entity_type' => 'student_subject_assignment',
                        'entity_id' => $assignment->id,
                        'details' => [
                            'student' => $student->name,
                            'subject' => $subject->name,
                            'academic_level' => $student->year_level,
                            'school_year' => $currentSchoolYear,
                        ],
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to assign subject to student', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $assignedSubjects;
    }

    /**
     * Get subjects for a student based on their academic level and program.
     */
    private function getSubjectsForStudent(User $student, int $academicLevelId): \Illuminate\Database\Eloquent\Collection
    {
        $query = Subject::where('academic_level_id', $academicLevelId)
            ->where('is_active', true);

        // For College students, get subjects by course
        if ($student->year_level === 'college' && $student->course_id) {
            $query->where('course_id', $student->course_id);
        }
        // For Senior High School students, get subjects by strand
        elseif ($student->year_level === 'senior_highschool' && $student->strand_id) {
            // Get subjects that are either core subjects for the academic level
            // or specific to the strand (if we add strand_id to subjects table later)
            $query->where(function ($q) use ($student) {
                $q->where('is_core', true)
                  ->orWhere('strand_id', $student->strand_id);
            });
        }
        // For Elementary students, get subjects for their specific grade level
        elseif ($student->year_level === 'elementary' && $student->specific_year_level) {
            $query->where(function ($q) use ($student) {
                // Include subjects that either have no grade levels specified (apply to all grades)
                // or have the student's specific grade level in their grade_levels array
                $q->whereNull('grade_levels')
                  ->orWhereJsonContains('grade_levels', $student->specific_year_level);
            });
        }
        // For Junior High School, get core subjects for the specific grade
        else {
            $query->where('is_core', true);
        }

        return $query->get();
    }

    /**
     * Get academic level ID based on year level string.
     */
    private function getAcademicLevelId(string $yearLevel): ?int
    {
        $levelMap = [
            'elementary' => 1,
            'junior_highschool' => 2,
            'senior_highschool' => 3,
            'college' => 4,
        ];

        return $levelMap[$yearLevel] ?? null;
    }

    /**
     * Get current school year.
     */
    private function getCurrentSchoolYear(): string
    {
        // Use 2024-2025 as the current school year for this system
        return "2024-2025";
    }

    /**
     * Get semester for the academic level.
     */
    private function getSemesterForLevel(string $yearLevel): string
    {
        // For now, all levels use 1st Semester
        // This can be enhanced later to handle different semester systems
        return '1st Semester';
    }

    /**
     * Remove all subject assignments for a student.
     */
    public function removeAllSubjectAssignments(User $student): int
    {
        $deletedCount = StudentSubjectAssignment::where('student_id', $student->id)->delete();
        
        if ($deletedCount > 0) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? 1,
                'target_user_id' => $student->id,
                'action' => 'removed_all_student_subjects',
                'entity_type' => 'student',
                'entity_id' => $student->id,
                'details' => [
                    'student' => $student->name,
                    'removed_count' => $deletedCount,
                ],
            ]);
        }

        return $deletedCount;
    }

    /**
     * Reassign subjects for a student (remove old, assign new).
     */
    public function reassignSubjectsToStudent(User $student): array
    {
        // Remove existing assignments
        $this->removeAllSubjectAssignments($student);
        
        // Assign new subjects
        return $this->assignSubjectsToStudent($student);
    }
}
