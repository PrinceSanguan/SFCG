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

    /**
     * Check if the grade is editable by teacher/instructor
     * Edit window: 5 days from created_at AND not submitted for validation
     */
    public function isEditableByInstructor(): bool
    {
        // If grade is submitted for validation, it's locked
        if ($this->is_submitted_for_validation) {
            \Log::info('Grade edit check: Grade is locked (submitted for validation)', [
                'grade_id' => $this->id,
                'student_id' => $this->student_id,
                'subject_id' => $this->subject_id,
                'submitted_at' => $this->submitted_at,
            ]);
            return false;
        }

        // Check if within 5-day edit window from created_at
        $createdDate = $this->created_at;
        $fiveDaysAgo = now()->subDays(5);
        $isWithinWindow = $createdDate->isAfter($fiveDaysAgo);

        \Log::info('Grade edit check: Time window validation', [
            'grade_id' => $this->id,
            'student_id' => $this->student_id,
            'subject_id' => $this->subject_id,
            'created_at' => $createdDate->toDateTimeString(),
            'five_days_ago' => $fiveDaysAgo->toDateTimeString(),
            'is_within_window' => $isWithinWindow,
            'days_since_creation' => $createdDate->diffInDays(now()),
        ]);

        return $isWithinWindow;
    }

    /**
     * Get the number of days remaining for editing
     * Returns 0 if edit window has expired or grade is submitted
     */
    public function getDaysRemainingForEdit(): int
    {
        if ($this->is_submitted_for_validation) {
            return 0;
        }

        $createdDate = $this->created_at;
        $expiryDate = $createdDate->copy()->addDays(5);
        $daysRemaining = now()->diffInDays($expiryDate, false);

        // Return 0 if negative (expired)
        return max(0, (int) ceil($daysRemaining));
    }

    /**
     * Get the edit status for frontend display
     * Returns: 'editable', 'locked', or 'expired'
     */
    public function getEditStatus(): string
    {
        if ($this->is_submitted_for_validation) {
            return 'locked';
        }

        if ($this->isEditableByInstructor()) {
            return 'editable';
        }

        return 'expired';
    }

    /**
     * Check if the grade is editable by adviser
     * Edit window: 3 days from created_at AND not submitted for validation
     */
    public function isEditableByAdviser(): bool
    {
        // If grade is submitted for validation, it's locked
        if ($this->is_submitted_for_validation) {
            \Log::info('[ADVISER GRADE EDIT] Grade is locked (submitted for validation)', [
                'grade_id' => $this->id,
                'student_id' => $this->student_id,
                'subject_id' => $this->subject_id,
                'submitted_at' => $this->submitted_at,
            ]);
            return false;
        }

        // Check if within 3-day edit window from created_at
        $createdDate = $this->created_at;
        $threeDaysAgo = now()->subDays(3);
        $isWithinWindow = $createdDate->isAfter($threeDaysAgo);

        \Log::info('[ADVISER GRADE EDIT] Time window validation', [
            'grade_id' => $this->id,
            'student_id' => $this->student_id,
            'subject_id' => $this->subject_id,
            'created_at' => $createdDate->toDateTimeString(),
            'three_days_ago' => $threeDaysAgo->toDateTimeString(),
            'is_within_window' => $isWithinWindow,
            'days_since_creation' => $createdDate->diffInDays(now()),
        ]);

        return $isWithinWindow;
    }

    /**
     * Get the number of days remaining for editing by adviser
     * Returns 0 if edit window has expired or grade is submitted
     */
    public function getDaysRemainingForEditByAdviser(): int
    {
        if ($this->is_submitted_for_validation) {
            return 0;
        }

        $createdDate = $this->created_at;
        $expiryDate = $createdDate->copy()->addDays(3);
        $daysRemaining = now()->diffInDays($expiryDate, false);

        // Return 0 if negative (expired)
        return max(0, (int) ceil($daysRemaining));
    }

    /**
     * Get the edit status for adviser frontend display
     * Returns: 'editable', 'locked', or 'expired'
     */
    public function getEditStatusForAdviser(): string
    {
        if ($this->is_submitted_for_validation) {
            return 'locked';
        }

        if ($this->isEditableByAdviser()) {
            return 'editable';
        }

        return 'expired';
    }

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


