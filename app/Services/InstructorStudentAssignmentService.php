<?php

namespace App\Services;

use App\Models\User;
use App\Models\InstructorSubjectAssignment;
use App\Models\StudentSubjectAssignment;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InstructorStudentAssignmentService
{
    /**
     * Automatically enroll all students in a section when an instructor is assigned to a subject for that section.
     */
    public function enrollSectionStudentsInSubject(InstructorSubjectAssignment $instructorAssignment): array
    {
        $enrolledStudents = [];

        if (!$instructorAssignment->section_id) {
            Log::warning('Instructor assignment has no section, skipping student enrollment', [
                'assignment_id' => $instructorAssignment->id,
                'instructor_id' => $instructorAssignment->instructor_id,
                'subject_id' => $instructorAssignment->subject_id,
            ]);
            return $enrolledStudents;
        }

        // Get all students in this section
        $students = User::where('user_role', 'student')
            ->where('section_id', $instructorAssignment->section_id)
            ->where('is_active', true)
            ->get();

        if ($students->isEmpty()) {
            Log::info('No students found in section for instructor assignment', [
                'assignment_id' => $instructorAssignment->id,
                'section_id' => $instructorAssignment->section_id,
                'subject_id' => $instructorAssignment->subject_id,
            ]);
            return $enrolledStudents;
        }

        foreach ($students as $student) {
            try {
                // Check if student is already enrolled in this subject
                $existingAssignment = StudentSubjectAssignment::where([
                    'student_id' => $student->id,
                    'subject_id' => $instructorAssignment->subject_id,
                    'school_year' => $instructorAssignment->school_year,
                ])->first();

                if (!$existingAssignment) {
                    $assignment = StudentSubjectAssignment::create([
                        'student_id' => $student->id,
                        'subject_id' => $instructorAssignment->subject_id,
                        'school_year' => $instructorAssignment->school_year,
                        'semester' => $this->getSemesterForLevel($student->year_level),
                        'is_active' => true,
                        'enrolled_by' => Auth::id() ?? 1,
                        'notes' => 'Automatically enrolled when instructor was assigned to section',
                    ]);

                    $enrolledStudents[] = $assignment;

                    // Log activity
                    ActivityLog::create([
                        'user_id' => Auth::id() ?? 1,
                        'target_user_id' => $student->id,
                        'action' => 'auto_enrolled_student_via_instructor_assignment',
                        'entity_type' => 'student_subject_assignment',
                        'entity_id' => $assignment->id,
                        'details' => [
                            'student' => $student->name,
                            'subject' => $instructorAssignment->subject->name ?? 'Unknown',
                            'instructor' => $instructorAssignment->instructor->name ?? 'Unknown',
                            'section_id' => $instructorAssignment->section_id,
                            'school_year' => $instructorAssignment->school_year,
                            'trigger' => 'instructor_section_assignment',
                        ],
                    ]);

                    Log::info('Student auto-enrolled via instructor assignment', [
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $instructorAssignment->subject_id,
                        'subject_name' => $instructorAssignment->subject->name ?? 'Unknown',
                        'instructor_id' => $instructorAssignment->instructor_id,
                        'section_id' => $instructorAssignment->section_id,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to enroll student via instructor assignment', [
                    'student_id' => $student->id,
                    'subject_id' => $instructorAssignment->subject_id,
                    'instructor_assignment_id' => $instructorAssignment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $enrolledStudents;
    }

    /**
     * Get all students assigned to an instructor through section-subject assignments.
     */
    public function getStudentsForInstructor(int $instructorId, ?string $schoolYear = null): \Illuminate\Database\Eloquent\Collection
    {
        $schoolYear = $schoolYear ?? $this->getCurrentSchoolYear();

        // Get all instructor subject assignments for this instructor
        $instructorAssignments = InstructorSubjectAssignment::where('instructor_id', $instructorId)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereNotNull('section_id')
            ->get();

        $studentIds = collect();

        foreach ($instructorAssignments as $assignment) {
            // Get all students in this section
            $sectionStudentIds = User::where('user_role', 'student')
                ->where('section_id', $assignment->section_id)
                ->where('is_active', true)
                ->pluck('id');

            $studentIds = $studentIds->merge($sectionStudentIds);
        }

        // Remove duplicates and get student models
        $uniqueStudentIds = $studentIds->unique();

        return User::whereIn('id', $uniqueStudentIds)->get();
    }

    /**
     * Get all subjects a student has through instructor assignments for their section.
     */
    public function getSubjectsForStudent(int $studentId): \Illuminate\Database\Eloquent\Collection
    {
        $student = User::find($studentId);

        if (!$student || !$student->section_id) {
            return collect();
        }

        $currentSchoolYear = $this->getCurrentSchoolYear();

        // Get all instructor assignments for this student's section
        $instructorAssignments = InstructorSubjectAssignment::where('section_id', $student->section_id)
            ->where('school_year', $currentSchoolYear)
            ->where('is_active', true)
            ->with(['subject', 'instructor'])
            ->get();

        return $instructorAssignments->pluck('subject')->filter();
    }

    /**
     * Get current school year.
     */
    private function getCurrentSchoolYear(): string
    {
        return "2024-2025";
    }

    /**
     * Get semester for the academic level.
     */
    private function getSemesterForLevel(string $yearLevel): string
    {
        return '1st Semester';
    }
}
