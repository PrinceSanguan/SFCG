<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subject;
use App\Models\StudentSubjectAssignment;
use App\Models\TeacherSubjectAssignment;
use App\Models\InstructorSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class TeacherStudentAssignmentService
{
    /**
     * Assign an adviser to a subject and automatically link them to students in that subject.
     */
    public function assignAdviserToSubject(User $adviser, Subject $subject, array $assignmentData = []): ?ClassAdviserAssignment
    {
        try {
            $currentSchoolYear = $this->getCurrentSchoolYear();

            // Check if assignment already exists for this adviser
            $existingAssignment = ClassAdviserAssignment::where([
                'adviser_id' => $adviser->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment && $existingAssignment->is_active) {
                Log::info('Adviser already assigned to subject', [
                    'adviser_id' => $adviser->id,
                    'subject_id' => $subject->id,
                ]);
                return $existingAssignment;
            }

            // Check if another adviser is already assigned to this subject
            $otherAssignment = ClassAdviserAssignment::where('subject_id', $subject->id)
                ->where('school_year', $currentSchoolYear)
                ->where('is_active', true)
                ->where('adviser_id', '!=', $adviser->id)
                ->with('adviser')
                ->first();

            if ($otherAssignment) {
                Log::warning('Cannot assign adviser - subject already assigned to another adviser', [
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'attempted_adviser' => $adviser->name,
                    'current_adviser' => $otherAssignment->adviser->name,
                ]);
                throw new \Exception("This subject is already assigned to {$otherAssignment->adviser->name} for this section. Each subject can only have one teacher per section.");
            }

            // Create the adviser assignment
            $assignment = ClassAdviserAssignment::create([
                'adviser_id' => $adviser->id,
                'subject_id' => $subject->id,
                'academic_level_id' => $subject->academic_level_id,
                'grade_level' => $assignmentData['grade_level'] ?? $this->getGradeLevelFromSubject($subject),
                'section' => $assignmentData['section'] ?? $this->getSectionFromSubject($subject),
                'grading_period_ids' => $assignmentData['grading_period_ids'] ?? null,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => Auth::id() ?? 1,
                'notes' => $assignmentData['notes'] ?? 'Automatically assigned for student-subject linking',
            ]);

            // Find and link students enrolled in this subject
            $this->linkAdviserToStudentsThroughSubject($adviser, $subject);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id() ?? 1,
                'target_user_id' => $adviser->id,
                'action' => 'assigned_adviser_to_subject',
                'entity_type' => 'class_adviser_assignment',
                'entity_id' => $assignment->id,
                'details' => [
                    'adviser' => $adviser->name,
                    'subject' => $subject->name,
                    'grade_level' => $assignment->grade_level,
                    'section' => $assignment->section,
                    'school_year' => $currentSchoolYear,
                ],
            ]);

            Log::info('Adviser assigned to subject successfully', [
                'adviser_id' => $adviser->id,
                'adviser_name' => $adviser->name,
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'assignment_id' => $assignment->id,
            ]);

            return $assignment;
        } catch (\Exception $e) {
            // Re-throw validation errors so they can be displayed to the user
            if (str_contains($e->getMessage(), 'already assigned to')) {
                throw $e;
            }

            Log::error('Failed to assign adviser to subject', [
                'adviser_id' => $adviser->id,
                'subject_id' => $subject->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Assign a teacher to a subject and automatically link them to students in that subject.
     */
    public function assignTeacherToSubject(User $teacher, Subject $subject, array $assignmentData = []): ?TeacherSubjectAssignment
    {
        try {
            $currentSchoolYear = $this->getCurrentSchoolYear();

            // Check if assignment already exists for this teacher
            $existingAssignment = TeacherSubjectAssignment::where([
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment && $existingAssignment->is_active) {
                Log::info('Teacher already assigned to subject', [
                    'teacher_id' => $teacher->id,
                    'subject_id' => $subject->id,
                ]);
                return $existingAssignment;
            }

            // Check if another teacher is already assigned to this subject
            $otherAssignment = TeacherSubjectAssignment::where('subject_id', $subject->id)
                ->where('school_year', $currentSchoolYear)
                ->where('is_active', true)
                ->where('teacher_id', '!=', $teacher->id)
                ->with('teacher')
                ->first();

            if ($otherAssignment) {
                Log::warning('Cannot assign teacher - subject already assigned to another teacher', [
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'attempted_teacher' => $teacher->name,
                    'current_teacher' => $otherAssignment->teacher->name,
                ]);
                throw new \Exception("This subject is already assigned to {$otherAssignment->teacher->name} for this section. Each subject can only have one teacher per section.");
            }

            // Create the teacher assignment
            $assignment = TeacherSubjectAssignment::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'academic_level_id' => $subject->academic_level_id,
                'track_id' => $subject->track_id ?? null,
                'grade_level' => $assignmentData['grade_level'] ?? $this->getGradeLevelFromSubject($subject),
                'strand_id' => $subject->strand_id,
                'department_id' => $assignmentData['department_id'] ?? null,
                'course_id' => $subject->course_id,
                'grading_period_id' => $subject->grading_period_id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => Auth::id() ?? 1,
                'notes' => $assignmentData['notes'] ?? 'Automatically assigned for student-subject linking',
            ]);

            // Find and link students enrolled in this subject
            $this->linkTeacherToStudentsThroughSubject($teacher, $subject);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id() ?? 1,
                'target_user_id' => $teacher->id,
                'action' => 'assigned_teacher_to_subject',
                'entity_type' => 'teacher_subject_assignment',
                'entity_id' => $assignment->id,
                'details' => [
                    'teacher' => $teacher->name,
                    'subject' => $subject->name,
                    'grade_level' => $assignment->grade_level,
                    'school_year' => $currentSchoolYear,
                ],
            ]);

            Log::info('Teacher assigned to subject successfully', [
                'teacher_id' => $teacher->id,
                'teacher_name' => $teacher->name,
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'assignment_id' => $assignment->id,
            ]);

            return $assignment;
        } catch (\Exception $e) {
            // Re-throw validation errors so they can be displayed to the user
            if (str_contains($e->getMessage(), 'already assigned to')) {
                throw $e;
            }

            Log::error('Failed to assign teacher to subject', [
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Assign an instructor to a subject and automatically link them to students in that subject.
     */
    public function assignInstructorToSubject(User $instructor, Subject $subject, array $assignmentData = []): ?InstructorSubjectAssignment
    {
        try {
            $currentSchoolYear = $this->getCurrentSchoolYear();

            // Check if assignment already exists for this instructor
            $existingAssignment = InstructorSubjectAssignment::where([
                'instructor_id' => $instructor->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment && $existingAssignment->is_active) {
                Log::info('Instructor already assigned to subject', [
                    'instructor_id' => $instructor->id,
                    'subject_id' => $subject->id,
                ]);
                return $existingAssignment;
            }

            // Check if another instructor is already assigned to this subject
            $otherAssignment = InstructorSubjectAssignment::where('subject_id', $subject->id)
                ->where('school_year', $currentSchoolYear)
                ->where('is_active', true)
                ->where('instructor_id', '!=', $instructor->id)
                ->with('instructor')
                ->first();

            if ($otherAssignment) {
                Log::warning('Cannot assign instructor - subject already assigned to another instructor', [
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'attempted_instructor' => $instructor->name,
                    'current_instructor' => $otherAssignment->instructor->name,
                ]);
                throw new \Exception("This subject is already assigned to {$otherAssignment->instructor->name} for this section. Each subject can only have one instructor per section.");
            }

            // Create the instructor assignment
            $assignment = InstructorSubjectAssignment::create([
                'instructor_id' => $instructor->id,
                'subject_id' => $subject->id,
                'academic_level_id' => $subject->academic_level_id,
                'grading_period_id' => $subject->grading_period_id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => Auth::id() ?? 1,
                'notes' => $assignmentData['notes'] ?? 'Automatically assigned for student-subject linking',
            ]);

            // Find and link students enrolled in this subject
            $this->linkInstructorToStudentsThroughSubject($instructor, $subject);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id() ?? 1,
                'target_user_id' => $instructor->id,
                'action' => 'assigned_instructor_to_subject',
                'entity_type' => 'instructor_subject_assignment',
                'entity_id' => $assignment->id,
                'details' => [
                    'instructor' => $instructor->name,
                    'subject' => $subject->name,
                    'school_year' => $currentSchoolYear,
                ],
            ]);

            Log::info('Instructor assigned to subject successfully', [
                'instructor_id' => $instructor->id,
                'instructor_name' => $instructor->name,
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'assignment_id' => $assignment->id,
            ]);

            return $assignment;
        } catch (\Exception $e) {
            Log::error('Failed to assign instructor to subject', [
                'instructor_id' => $instructor->id,
                'subject_id' => $subject->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Link adviser to students through subject.
     * Automatically enrolls all students in the section to this subject.
     */
    private function linkAdviserToStudentsThroughSubject(User $adviser, Subject $subject): int
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $linkedCount = 0;

        // Get the academic level key to match with user's year_level
        $academicLevel = \App\Models\AcademicLevel::find($subject->academic_level_id);
        if (!$academicLevel) {
            Log::warning('Academic level not found for subject', [
                'subject_id' => $subject->id,
                'academic_level_id' => $subject->academic_level_id,
            ]);
            return 0;
        }

        // Find all students in the same section and academic level
        $students = User::where('user_role', 'student')
            ->when($subject->section_id, function($query) use ($subject) {
                return $query->where('section_id', $subject->section_id);
            })
            ->when($academicLevel->key, function($query) use ($academicLevel) {
                return $query->where('year_level', $academicLevel->key);
            })
            ->get();

        foreach ($students as $student) {
            // Check if student is already enrolled in this subject
            $existingAssignment = StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment) {
                // Update existing assignment to active
                if (!$existingAssignment->is_active) {
                    $existingAssignment->update(['is_active' => true]);
                    Log::info('Reactivated student subject assignment', [
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subject->id,
                        'subject_name' => $subject->name,
                    ]);
                }
                $linkedCount++;
                continue;
            }

            // Create new student subject assignment
            try {
                StudentSubjectAssignment::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'school_year' => $currentSchoolYear,
                    'is_active' => true,
                    'enrolled_by' => Auth::id() ?? 1,
                ]);

                Log::info('Auto-enrolled student in subject when adviser assigned', [
                    'adviser_id' => $adviser->id,
                    'adviser_name' => $adviser->name,
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'section_id' => $subject->section_id,
                    'section_name' => $subject->section ? $subject->section->name : null,
                ]);

                $linkedCount++;
            } catch (\Exception $e) {
                Log::error('Failed to auto-enroll student in subject', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Completed auto-enrollment for subject', [
            'subject_id' => $subject->id,
            'subject_name' => $subject->name,
            'students_enrolled' => $linkedCount,
        ]);

        return $linkedCount;
    }

    /**
     * Link teacher to students through subject.
     */
    private function linkTeacherToStudentsThroughSubject(User $teacher, Subject $subject): int
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $linkedCount = 0;

        // Find all students enrolled in this subject AND in the same section
        $studentAssignments = StudentSubjectAssignment::where([
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear,
            'is_active' => true,
        ])->with('student')->get();

        foreach ($studentAssignments as $studentAssignment) {
            $student = $studentAssignment->student;
            if (!$student) continue;

            // Check if student is in the same section as the subject
            if ($subject->section_id && $student->section_id !== $subject->section_id) {
                Log::info('Student skipped - not in the same section as subject', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'student_section_id' => $student->section_id,
                    'subject_section_id' => $subject->section_id,
                    'subject_name' => $subject->name,
                ]);
                continue;
            }

            // Log the relationship
            Log::info('Teacher linked to student through subject', [
                'teacher_id' => $teacher->id,
                'teacher_name' => $teacher->name,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'section_id' => $subject->section_id,
                'section_name' => $subject->section ? $subject->section->name : null,
                'link_method' => 'section_specific_subject_assignment',
            ]);

            $linkedCount++;
        }

        return $linkedCount;
    }

    /**
     * Link instructor to students through subject.
     */
    private function linkInstructorToStudentsThroughSubject(User $instructor, Subject $subject): int
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $linkedCount = 0;

        // Find all students enrolled in this subject AND in the same section
        $studentAssignments = StudentSubjectAssignment::where([
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear,
            'is_active' => true,
        ])->with('student')->get();

        foreach ($studentAssignments as $studentAssignment) {
            $student = $studentAssignment->student;
            if (!$student) continue;

            // Check if student is in the same section as the subject
            if ($subject->section_id && $student->section_id !== $subject->section_id) {
                Log::info('Student skipped - not in the same section as subject', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'student_section_id' => $student->section_id,
                    'subject_section_id' => $subject->section_id,
                    'subject_name' => $subject->name,
                ]);
                continue;
            }

            // Log the relationship
            Log::info('Instructor linked to student through subject', [
                'instructor_id' => $instructor->id,
                'instructor_name' => $instructor->name,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'section_id' => $subject->section_id,
                'section_name' => $subject->section ? $subject->section->name : null,
                'link_method' => 'section_specific_subject_assignment',
            ]);

            $linkedCount++;
        }

        return $linkedCount;
    }

    /**
     * Get grade level from subject (for elementary/high school subjects).
     */
    private function getGradeLevelFromSubject(Subject $subject): ?string
    {
        // For elementary subjects, check grade_levels array
        if ($subject->grade_levels && !empty($subject->grade_levels)) {
            return $subject->grade_levels[0] ?? null; // Take first grade level
        }

        // For JHS subjects
        if ($subject->jhs_year_level) {
            return $subject->jhs_year_level;
        }

        // For SHS subjects
        if ($subject->shs_year_level) {
            return $subject->shs_year_level;
        }

        return null;
    }

    /**
     * Get section from subject.
     */
    private function getSectionFromSubject(Subject $subject): ?string
    {
        if ($subject->section_id && $subject->section) {
            return $subject->section->name;
        }
        return 'General';
    }

    /**
     * Get current school year.
     */
    private function getCurrentSchoolYear(): string
    {
        return "2024-2025";
    }

    /**
     * Get students for a teacher/adviser/instructor based on their subject assignments.
     */
    public function getStudentsForTeacher(User $teacher): Collection
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();

        if ($teacher->isAdviser()) {
            $subjectIds = ClassAdviserAssignment::where([
                'adviser_id' => $teacher->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->pluck('subject_id');
        } elseif ($teacher->isTeacher()) {
            $subjectIds = TeacherSubjectAssignment::where([
                'teacher_id' => $teacher->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->pluck('subject_id');
        } elseif ($teacher->isInstructor()) {
            $subjectIds = InstructorSubjectAssignment::where([
                'instructor_id' => $teacher->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->pluck('subject_id');
        } else {
            return collect();
        }

        if ($subjectIds->isEmpty()) {
            return collect();
        }

        // Get students enrolled in these subjects
        $studentIds = StudentSubjectAssignment::whereIn('subject_id', $subjectIds)
            ->where([
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])
            ->pluck('student_id')
            ->unique();

        return User::whereIn('id', $studentIds)
            ->where('user_role', 'student')
            ->get();
    }

    /**
     * Get teacher/adviser/instructor for a student's subject.
     */
    public function getTeacherForStudentSubject(User $student, Subject $subject): ?User
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();

        // Check for adviser assignment (elementary/high school)
        $adviserAssignment = ClassAdviserAssignment::where([
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear,
            'is_active' => true,
        ])->first();

        if ($adviserAssignment) {
            return $adviserAssignment->adviser;
        }

        // Check for teacher assignment (senior high)
        $teacherAssignment = TeacherSubjectAssignment::where([
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear,
            'is_active' => true,
        ])->first();

        if ($teacherAssignment) {
            return $teacherAssignment->teacher;
        }

        // Check for instructor assignment (college)
        $instructorAssignment = InstructorSubjectAssignment::where([
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear,
            'is_active' => true,
        ])->first();

        if ($instructorAssignment) {
            return $instructorAssignment->instructor;
        }

        return null;
    }

    /**
     * Get teachers/instructors for a student's subject grouped by semester (parent grading period).
     * Returns an array keyed by parent grading period ID (semester ID).
     *
     * @param User $student
     * @param Subject $subject
     * @return array<int, User|null> Array keyed by parent_id (semester ID) -> Teacher/Instructor
     */
    public function getTeachersForStudentSubjectBySemester(User $student, Subject $subject): array
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $teachersBySemester = [];

        Log::info('[TeacherStudentAssignmentService] Getting teachers by semester', [
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'school_year' => $currentSchoolYear
        ]);

        // Get all grading periods for this subject's academic level to find parent semesters
        $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $subject->academic_level_id)
            ->where('is_active', true)
            ->get();

        // Find parent semesters (periods with parent_id = null and type = 'semester')
        $parentSemesters = $gradingPeriods->filter(fn($p) => $p->parent_id === null && $p->type === 'semester');

        Log::info('[TeacherStudentAssignmentService] Found parent semesters', [
            'count' => $parentSemesters->count(),
            'semesters' => $parentSemesters->map(fn($s) => ['id' => $s->id, 'name' => $s->name])->values()->toArray()
        ]);

        // Check for instructor assignments (college) - they have grading_period_id
        $instructorAssignments = InstructorSubjectAssignment::with(['instructor', 'gradingPeriod'])
            ->where([
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->get();

        Log::info('[TeacherStudentAssignmentService] Instructor assignments found', [
            'count' => $instructorAssignments->count(),
            'assignments' => $instructorAssignments->map(fn($a) => [
                'id' => $a->id,
                'instructor_id' => $a->instructor_id,
                'instructor_name' => $a->instructor?->name,
                'grading_period_id' => $a->grading_period_id,
                'grading_period_name' => $a->gradingPeriod?->name,
                'grading_period_parent_id' => $a->gradingPeriod?->parent_id
            ])->toArray()
        ]);

        foreach ($instructorAssignments as $assignment) {
            if (!$assignment->instructor) continue;

            // Determine which semester this assignment belongs to
            $semesterId = null;
            if ($assignment->gradingPeriod) {
                // If the assignment's grading period IS a parent semester
                if ($assignment->gradingPeriod->parent_id === null && $assignment->gradingPeriod->type === 'semester') {
                    $semesterId = $assignment->gradingPeriod->id;
                }
                // If the assignment's grading period has a parent (is a child period like Midterm/Pre-Final)
                elseif ($assignment->gradingPeriod->parent_id) {
                    $semesterId = $assignment->gradingPeriod->parent_id;
                }
            }

            if ($semesterId) {
                $teachersBySemester[$semesterId] = $assignment->instructor;
                Log::info('[TeacherStudentAssignmentService] Mapped instructor to semester', [
                    'instructor_name' => $assignment->instructor->name,
                    'semester_id' => $semesterId,
                    'grading_period_id' => $assignment->grading_period_id
                ]);
            }
        }

        // Check for teacher assignments (senior high) - they have grading_period_id
        $teacherAssignments = TeacherSubjectAssignment::with(['teacher', 'gradingPeriod'])
            ->where([
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->get();

        foreach ($teacherAssignments as $assignment) {
            if (!$assignment->teacher) continue;

            $semesterId = null;
            if ($assignment->gradingPeriod) {
                if ($assignment->gradingPeriod->parent_id === null && $assignment->gradingPeriod->type === 'semester') {
                    $semesterId = $assignment->gradingPeriod->id;
                } elseif ($assignment->gradingPeriod->parent_id) {
                    $semesterId = $assignment->gradingPeriod->parent_id;
                }
            }

            if ($semesterId) {
                $teachersBySemester[$semesterId] = $assignment->teacher;
            }
        }

        // Check for adviser assignments (elementary/high school) - they may have grading_period_ids array
        $adviserAssignments = ClassAdviserAssignment::with('adviser')
            ->where([
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
                'is_active' => true,
            ])->get();

        foreach ($adviserAssignments as $assignment) {
            if (!$assignment->adviser) continue;

            // For advisers, assign to all semesters if no specific period is set
            if (!empty($assignment->grading_period_ids)) {
                // Map each grading period to its parent semester
                foreach ($assignment->grading_period_ids as $periodId) {
                    $period = $gradingPeriods->find($periodId);
                    if ($period && $period->parent_id) {
                        $teachersBySemester[$period->parent_id] = $assignment->adviser;
                    }
                }
            } else {
                // If no specific periods, assign to all semesters
                foreach ($parentSemesters as $semester) {
                    if (!isset($teachersBySemester[$semester->id])) {
                        $teachersBySemester[$semester->id] = $assignment->adviser;
                    }
                }
            }
        }

        Log::info('[TeacherStudentAssignmentService] Final teachers by semester', [
            'result' => collect($teachersBySemester)->map(fn($t, $k) => [
                'semester_id' => $k,
                'teacher_name' => $t?->name
            ])->values()->toArray()
        ]);

        return $teachersBySemester;
    }

    /**
     * Automatically enroll a student in all subjects for their section/academic level.
     * This should be called when a student is assigned to a section.
     */
    public function autoEnrollStudentInSectionSubjects(User $student): int
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $enrolledCount = 0;

        if (!$student->section_id || !$student->year_level) {
            Log::warning('Cannot auto-enroll student - missing section or year level', [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'section_id' => $student->section_id,
                'year_level' => $student->year_level,
            ]);
            return 0;
        }

        // Get academic level ID from year_level
        $academicLevel = \App\Models\AcademicLevel::where('key', $student->year_level)->first();
        if (!$academicLevel) {
            Log::warning('Academic level not found for student year level', [
                'student_id' => $student->id,
                'year_level' => $student->year_level,
            ]);
            return 0;
        }

        // Find all subjects for this section and academic level
        $subjects = Subject::where('section_id', $student->section_id)
            ->where('academic_level_id', $academicLevel->id)
            ->where('is_active', true)
            ->get();

        foreach ($subjects as $subject) {
            // Check if student is already enrolled
            $existingAssignment = StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment) {
                // Reactivate if inactive
                if (!$existingAssignment->is_active) {
                    $existingAssignment->update(['is_active' => true]);
                    Log::info('Reactivated student subject assignment', [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                    ]);
                }
                $enrolledCount++;
                continue;
            }

            // Create new enrollment
            try {
                StudentSubjectAssignment::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'school_year' => $currentSchoolYear,
                    'is_active' => true,
                    'enrolled_by' => Auth::id() ?? 1,
                ]);

                Log::info('Auto-enrolled student in subject based on section', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'section_id' => $student->section_id,
                    'academic_level_id' => $student->academic_level_id,
                ]);

                $enrolledCount++;
            } catch (\Exception $e) {
                Log::error('Failed to auto-enroll student in subject', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Completed auto-enrollment for student in section subjects', [
            'student_id' => $student->id,
            'student_name' => $student->name,
            'section_id' => $student->section_id,
            'subjects_enrolled' => $enrolledCount,
        ]);

        return $enrolledCount;
    }

    /**
     * Sync a student with all subjects in their section.
     * Called when a student is added to or changes section.
     */
    public function syncStudentSubjects(User $student): int
    {
        if ($student->user_role !== 'student') {
            return 0;
        }

        if (!$student->section_id || !$student->year_level) {
            Log::warning('Student missing section or year level', [
                'student_id' => $student->id,
                'section_id' => $student->section_id,
                'year_level' => $student->year_level,
            ]);
            return 0;
        }

        $currentSchoolYear = $this->getCurrentSchoolYear();
        $enrolledCount = 0;

        // Get the academic level for this student
        $academicLevel = \App\Models\AcademicLevel::where('key', $student->year_level)->first();
        if (!$academicLevel) {
            Log::warning('Academic level not found for student', [
                'student_id' => $student->id,
                'year_level' => $student->year_level,
            ]);
            return 0;
        }

        // Get all subjects for this section
        $subjects = Subject::where('section_id', $student->section_id)
            ->where('academic_level_id', $academicLevel->id)
            ->where('is_active', true)
            ->get();

        foreach ($subjects as $subject) {
            // Check if already enrolled
            $existingAssignment = StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($existingAssignment) {
                // Reactivate if inactive
                if (!$existingAssignment->is_active) {
                    $existingAssignment->update(['is_active' => true]);
                    Log::info('Reactivated student subject assignment', [
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                    ]);
                }
                $enrolledCount++;
                continue;
            }

            // Create new enrollment
            try {
                StudentSubjectAssignment::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'school_year' => $currentSchoolYear,
                    'is_active' => true,
                    'enrolled_by' => Auth::id() ?? 1,
                ]);

                Log::info('Auto-enrolled student in subject based on section', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'section_id' => $student->section_id,
                ]);

                $enrolledCount++;
            } catch (\Exception $e) {
                Log::error('Failed to auto-enroll student in subject', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Completed auto-enrollment for student in section subjects', [
            'student_id' => $student->id,
            'student_name' => $student->name,
            'section_id' => $student->section_id,
            'subjects_enrolled' => $enrolledCount,
        ]);

        return $enrolledCount;
    }

    /**
     * Remove a student from all subjects when they leave a section.
     */
    public function unsyncStudentSubjects(User $student, $oldSectionId): int
    {
        $currentSchoolYear = $this->getCurrentSchoolYear();
        $unenrolledCount = 0;

        // Get all subjects for the old section
        $subjects = Subject::where('section_id', $oldSectionId)
            ->where('is_active', true)
            ->get();

        foreach ($subjects as $subject) {
            $assignment = StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $currentSchoolYear,
            ])->first();

            if ($assignment && $assignment->is_active) {
                $assignment->update(['is_active' => false]);
                $unenrolledCount++;

                Log::info('Deactivated student subject assignment on section change', [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'old_section_id' => $oldSectionId,
                ]);
            }
        }

        return $unenrolledCount;
    }
}