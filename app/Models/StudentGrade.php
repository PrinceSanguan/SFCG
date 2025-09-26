<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Services\AutomaticHonorCalculationService;

class StudentGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'academic_level_id',
        'grading_period_id',
        'school_year',
        'year_of_study',
        'grade',
        'is_submitted_for_validation',
        'submitted_at',
        'validated_at',
        'validated_by',
        'is_approved',
        'approved_at',
        'approved_by',
        'is_returned',
        'returned_at',
        'returned_by',
        'return_reason',
    ];

    protected $casts = [
        'grade' => 'float',
        'year_of_study' => 'integer',
        'is_submitted_for_validation' => 'boolean',
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'is_returned' => 'boolean',
        'returned_at' => 'datetime',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function academicLevel(): BelongsTo { return $this->belongsTo(AcademicLevel::class); }
    public function gradingPeriod(): BelongsTo { return $this->belongsTo(GradingPeriod::class); }
    public function validatedBy(): BelongsTo { return $this->belongsTo(User::class, 'validated_by'); }
    public function approvedBy(): BelongsTo { return $this->belongsTo(User::class, 'approved_by'); }
    public function returnedBy(): BelongsTo { return $this->belongsTo(User::class, 'returned_by'); }

    protected static function booted(): void
    {
        // Trigger honor calculation when a grade is approved
        static::updated(function (StudentGrade $grade) {
            // Only trigger if grade was just approved (final grades)
            if ($grade->wasChanged('is_approved') && $grade->is_approved && $grade->grade_type === 'final') {
                try {
                    $student = $grade->student;
                    if ($student) {
                        $honorCalculationService = new AutomaticHonorCalculationService();
                        $honorCalculationService->calculateHonorsForStudent($student, $grade->school_year);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to trigger automatic honor calculation after grade approval', [
                        'grade_id' => $grade->id,
                        'student_id' => $grade->student_id,
                        'subject_id' => $grade->subject_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });
    }

    public function teacherSubjectAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherSubjectAssignment::class, 'subject_id', 'subject_id')
            ->where('school_year', $this->school_year);
    }
}


