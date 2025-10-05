<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorSubjectAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'subject_id',
        'section_id',
        'academic_level_id',
        'grading_period_id',
        'school_year',
        'is_active',
        'assigned_at',
        'assigned_by',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function gradingPeriod(): BelongsTo
    {
        return $this->belongsTo(GradingPeriod::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForSchoolYear($query, $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    public function scopeForSubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeForInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    protected static function booted(): void
    {
        static::created(function (InstructorSubjectAssignment $assignment) {
            // Auto-enroll all students in the section when instructor is assigned
            if ($assignment->section_id) {
                try {
                    $instructorStudentService = new \App\Services\InstructorStudentAssignmentService();
                    $enrolledStudents = $instructorStudentService->enrollSectionStudentsInSubject($assignment);

                    \Log::info('Students auto-enrolled when instructor assigned to section', [
                        'assignment_id' => $assignment->id,
                        'instructor_id' => $assignment->instructor_id,
                        'subject_id' => $assignment->subject_id,
                        'section_id' => $assignment->section_id,
                        'school_year' => $assignment->school_year,
                        'enrolled_students_count' => count($enrolledStudents),
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to auto-enroll students via instructor assignment', [
                        'assignment_id' => $assignment->id,
                        'instructor_id' => $assignment->instructor_id,
                        'subject_id' => $assignment->subject_id,
                        'section_id' => $assignment->section_id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        });

        static::updated(function (InstructorSubjectAssignment $assignment) {
            // Re-enroll students if section_id or is_active status changed
            $sectionChanged = $assignment->isDirty('section_id');
            $activeChanged = $assignment->isDirty('is_active');

            if (($sectionChanged || $activeChanged) && $assignment->section_id && $assignment->is_active) {
                try {
                    $instructorStudentService = new \App\Services\InstructorStudentAssignmentService();
                    $enrolledStudents = $instructorStudentService->enrollSectionStudentsInSubject($assignment);

                    \Log::info('Students re-enrolled after instructor assignment update', [
                        'assignment_id' => $assignment->id,
                        'instructor_id' => $assignment->instructor_id,
                        'subject_id' => $assignment->subject_id,
                        'section_id' => $assignment->section_id,
                        'section_changed' => $sectionChanged,
                        'active_changed' => $activeChanged,
                        'enrolled_students_count' => count($enrolledStudents),
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to re-enroll students after instructor assignment update', [
                        'assignment_id' => $assignment->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });
    }
}
