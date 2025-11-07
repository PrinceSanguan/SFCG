<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subject;
use App\Models\StudentSubjectAssignment;
use App\Models\InstructorSubjectAssignment;
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

        // Get school year from student's section (NEW LOGIC)
        $currentSchoolYear = $student->getEffectiveSchoolYear();

        // Log the school year being used
        ActivityLogService::logSectionSchoolYearUsage(
            studentId: $student->id,
            sectionId: $student->section_id ?? 0,
            sectionSchoolYear: $currentSchoolYear,
            context: 'assignSubjectsToStudent',
            additionalDetails: [
                'student_name' => $student->name,
                'year_level' => $student->year_level,
                'has_section' => $student->section_id ? true : false,
            ]
        );

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

                    // Log enrollment using ActivityLogService
                    ActivityLogService::logStudentEnrollment(
                        studentId: $student->id,
                        subjectId: $subject->id,
                        schoolYear: $currentSchoolYear,
                        source: 'automatic',
                        additionalDetails: [
                            'student_name' => $student->name,
                            'subject_name' => $subject->name,
                            'academic_level' => $student->year_level,
                            'section_id' => $student->section_id,
                        ]
                    );

                    // Check if there's a teacher/adviser/instructor assigned to this subject
                    // and log the student-teacher relationship
                    $this->logTeacherStudentRelationship($student, $subject);
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
     * Get subjects for a student based on their academic level, grade, course, and section.
     * This method uses a unified logic for all academic levels.
     */
    private function getSubjectsForStudent(User $student, int $academicLevelId): \Illuminate\Database\Eloquent\Collection
    {
        $query = Subject::where('academic_level_id', $academicLevelId)
            ->where('is_active', true);

        // Apply unified filtering logic based on student's characteristics
        $query->where(function ($q) use ($student) {

            // 1. Always include core subjects for the academic level
            $q->where('is_core', true);

            // 2. Include subjects specific to the student's grade/year level
            if ($student->specific_year_level) {
                switch ($student->year_level) {
                    case 'elementary':
                        // Elementary: check grade_levels JSON array
                        $q->orWhereJsonContains('grade_levels', $student->specific_year_level);
                        break;

                    case 'junior_highschool':
                        // JHS: check jhs_year_level field
                        $q->orWhere('jhs_year_level', $student->specific_year_level);
                        break;

                    case 'senior_highschool':
                        // SHS: check shs_year_level field
                        $q->orWhere('shs_year_level', $student->specific_year_level);
                        break;

                    case 'college':
                        // College: use specific_year_level for year-specific subjects if needed
                        // You can add a college_year_level field to subjects table if needed
                        break;
                }
            }

            // 3. Include course-specific subjects (primarily for college)
            if ($student->course_id) {
                $q->orWhere('course_id', $student->course_id);
            }

            // 4. Include strand-specific subjects (primarily for SHS)
            if ($student->strand_id) {
                $q->orWhere('strand_id', $student->strand_id);
            }

            // 5. Include section-specific subjects (for all levels)
            if ($student->section_id) {
                $q->orWhere('section_id', $student->section_id);
            }

            // 6. Include subjects with no specific requirements (general subjects)
            // These are subjects that don't have specific grade, course, strand, or section requirements
            $q->orWhere(function ($generalQuery) {
                $generalQuery->whereNull('grade_levels')
                    ->whereNull('jhs_year_level')
                    ->whereNull('shs_year_level')
                    ->whereNull('course_id')
                    ->whereNull('strand_id')
                    ->whereNull('section_id')
                    ->where('is_core', false); // Exclude core subjects as they're already included above
            });
        });

        return $query->get();
    }

    /**
     * Get academic level ID based on year level string.
     */
    private function getAcademicLevelId(string $yearLevel): ?int
    {
        // Use the database to get the actual academic level ID
        $academicLevel = \App\Models\AcademicLevel::where('key', $yearLevel)->first();
        return $academicLevel ? $academicLevel->id : null;
    }

    /**
     * Get current school year for a student.
     * Uses the student's section's school_year if available, otherwise generates based on calendar.
     *
     * @param User $student
     * @return string School year in format "YYYY-YYYY"
     * @deprecated Use $student->getEffectiveSchoolYear() instead
     */
    private function getCurrentSchoolYear(?User $student = null): string
    {
        if ($student) {
            return $student->getEffectiveSchoolYear();
        }

        // Fallback: Generate current academic year based on calendar
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // If we're in Aug-Dec, academic year is current-next (e.g., 2025-2026)
        // If we're in Jan-Jul, academic year is previous-current (e.g., 2024-2025)
        if ($currentMonth >= 8) {
            return "{$currentYear}-" . ($currentYear + 1);
        } else {
            return ($currentYear - 1) . "-{$currentYear}";
        }
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

    /**
     * Automatically enroll student in subjects based on their section assignment.
     * Gets subjects from InstructorSubjectAssignment for the student's section.
     */
    public function enrollStudentInSectionSubjects(User $student): array
    {
        $enrolledSubjects = [];

        // Get school year from student's section (NEW LOGIC)
        $currentSchoolYear = $student->getEffectiveSchoolYear();

        // Log the school year being used
        ActivityLogService::logSectionSchoolYearUsage(
            studentId: $student->id,
            sectionId: $student->section_id ?? 0,
            sectionSchoolYear: $currentSchoolYear,
            context: 'enrollStudentInSectionSubjects',
            additionalDetails: [
                'student_name' => $student->name,
                'year_level' => $student->year_level,
                'has_section' => $student->section_id ? true : false,
            ]
        );

        // Check if student has a section assigned
        if (!$student->section_id) {
            Log::warning('Student has no section assigned, using academic level assignment instead', [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'school_year' => $currentSchoolYear,
            ]);
            // Fall back to academic level-based assignment
            return $this->assignSubjectsToStudent($student);
        }

        // Get all subjects assigned to instructors for this section
        $instructorAssignments = InstructorSubjectAssignment::where('section_id', $student->section_id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->with('subject')
            ->get();

        $sectionSubjects = $instructorAssignments->pluck('subject')->filter();

        // Also get subjects based on academic level, grade, course, etc.
        $academicLevelId = $this->getAcademicLevelId($student->year_level);
        $academicSubjects = collect();

        if ($academicLevelId) {
            $academicSubjects = $this->getSubjectsForStudent($student, $academicLevelId);
        }

        // Combine both sets of subjects and remove duplicates
        $allSubjects = $sectionSubjects->merge($academicSubjects)->unique('id');

        if ($allSubjects->isEmpty()) {
            Log::info('No subjects found for student', [
                'student_id' => $student->id,
                'section_id' => $student->section_id,
                'academic_level' => $student->year_level,
                'specific_year_level' => $student->specific_year_level,
                'school_year' => $currentSchoolYear,
            ]);
            return $enrolledSubjects;
        }

        foreach ($allSubjects as $subject) {
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
                        'notes' => 'Automatically enrolled based on academic level and section',
                    ]);

                    $enrolledSubjects[] = $assignment;

                    // Log enrollment using ActivityLogService
                    ActivityLogService::logStudentEnrollment(
                        studentId: $student->id,
                        subjectId: $subject->id,
                        schoolYear: $currentSchoolYear,
                        source: 'section_assignment',
                        additionalDetails: [
                            'student_name' => $student->name,
                            'subject_name' => $subject->name,
                            'section_id' => $student->section_id,
                            'academic_level' => $student->year_level,
                            'specific_year_level' => $student->specific_year_level,
                        ]
                    );

                    // Check if there's a teacher/adviser/instructor assigned to this subject
                    // and log the student-teacher relationship
                    $this->logTeacherStudentRelationship($student, $subject);

                    Log::info('Student automatically enrolled in subject', [
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subject->id,
                        'subject_name' => $subject->name,
                        'section_id' => $student->section_id,
                        'academic_level' => $student->year_level,
                        'specific_year_level' => $student->specific_year_level,
                        'school_year' => $currentSchoolYear,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to enroll student in subject', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'section_id' => $student->section_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $enrolledSubjects;
    }

    /**
     * Comprehensive method to enroll student in all applicable subjects.
     * This method combines section-based and academic-level-based enrollment.
     */
    public function enrollStudentInAllApplicableSubjects(User $student): array
    {
        // This is essentially the same as enrollStudentInSectionSubjects now
        // but with a clearer name that indicates it handles all types
        return $this->enrollStudentInSectionSubjects($student);
    }

    /**
     * Log the teacher-student relationship when a student is assigned to a subject.
     */
    private function logTeacherStudentRelationship(User $student, Subject $subject): void
    {
        try {
            $teacherService = new \App\Services\TeacherStudentAssignmentService();
            $teacher = $teacherService->getTeacherForStudentSubject($student, $subject);

            if ($teacher) {
                Log::info('Student-teacher relationship established through subject assignment', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'teacher_id' => $teacher->id,
                    'teacher_name' => $teacher->name,
                    'teacher_role' => $teacher->user_role,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'academic_level' => $student->year_level,
                    'specific_year_level' => $student->specific_year_level,
                    'relationship_method' => 'automatic_through_subject_assignment',
                ]);

                // Also create an activity log for this relationship
                ActivityLog::create([
                    'user_id' => Auth::id() ?? 1,
                    'target_user_id' => $student->id,
                    'action' => 'student_teacher_relationship_established',
                    'entity_type' => 'subject',
                    'entity_id' => $subject->id,
                    'details' => [
                        'student' => $student->name,
                        'teacher' => $teacher->name,
                        'teacher_role' => $teacher->user_role,
                        'subject' => $subject->name,
                        'academic_level' => $student->year_level,
                        'relationship_method' => 'automatic_through_subject_assignment',
                    ],
                ]);
            } else {
                Log::info('No teacher assigned to subject for student', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'note' => 'Consider assigning a teacher/adviser/instructor to this subject',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to check teacher-student relationship', [
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
