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

    /**
     * Convert percentage grade (75-100) to college scale (1.0-5.0)
     * College scale: 1.0 is highest, 5.0 is lowest, 3.0 is passing
     *
     * @param float $percentage Grade in percentage format (75-100)
     * @return float Grade in college scale (1.0-5.0)
     */
    public static function percentageToCollegeScale(float $percentage): float
    {
        // Mapping based on standard Philippine college grading scale
        if ($percentage >= 97) return 1.1;
        if ($percentage >= 95) return 1.2;
        if ($percentage >= 93) return 1.3;
        if ($percentage >= 91) return 1.4;
        if ($percentage >= 90) return 1.5;
        if ($percentage >= 89) return 1.6;
        if ($percentage >= 88) return 1.7;
        if ($percentage >= 87) return 1.8;
        if ($percentage >= 86) return 1.9;
        if ($percentage >= 85) return 2.0;
        if ($percentage >= 84) return 2.1;
        if ($percentage >= 83) return 2.2;
        if ($percentage >= 82) return 2.3;
        if ($percentage >= 81) return 2.4;
        if ($percentage >= 80) return 2.5;
        if ($percentage >= 79) return 2.6;
        if ($percentage >= 78) return 2.7;
        if ($percentage >= 77) return 2.8;
        if ($percentage >= 76) return 2.9;
        if ($percentage >= 75) return 3.0; // Passing grade
        if ($percentage >= 74) return 3.1;
        if ($percentage >= 73) return 3.2;
        if ($percentage >= 72) return 3.3;
        if ($percentage >= 71) return 3.4;
        if ($percentage >= 70) return 3.5;

        return 5.0; // Below 70 is failing
    }

    /**
     * Convert college scale grade (1.0-5.0) to percentage (75-100)
     *
     * @param float $collegeGrade Grade in college scale (1.0-5.0)
     * @return float Grade in percentage format (70-100)
     */
    public static function collegeScaleToPercentage(float $collegeGrade): float
    {
        $scaleMap = [
            1.1 => 97.5, 1.2 => 95.5, 1.3 => 93.5, 1.4 => 91.5,
            1.5 => 90, 1.6 => 89, 1.7 => 88, 1.8 => 87, 1.9 => 86,
            2.0 => 85, 2.1 => 84, 2.2 => 83, 2.3 => 82, 2.4 => 81,
            2.5 => 80, 2.6 => 79, 2.7 => 78, 2.8 => 77, 2.9 => 76,
            3.0 => 75, 3.1 => 74, 3.2 => 73, 3.3 => 72, 3.4 => 71,
            3.5 => 70,
        ];

        if ($collegeGrade >= 5.0) return 65; // Below passing

        return $scaleMap[$collegeGrade] ?? 75; // Default to passing
    }

    /**
     * Get the grade converted to college scale if applicable
     *
     * @return float Grade in appropriate scale for the academic level
     */
    public function getCollegeScaleGrade(): float
    {
        // Load academic level if not already loaded
        if (!$this->relationLoaded('academicLevel')) {
            $this->load('academicLevel');
        }

        // Only convert if college level AND grade is in percentage range
        if ($this->academicLevel &&
            $this->academicLevel->key === 'college' &&
            $this->grade >= 70 &&
            $this->grade <= 100) {

            $converted = self::percentageToCollegeScale($this->grade);

            \Log::info('[COLLEGE SCALE] Grade conversion applied', [
                'grade_id' => $this->id,
                'student_id' => $this->student_id,
                'subject_id' => $this->subject_id,
                'percentage' => $this->grade,
                'college_scale' => $converted,
            ]);

            return $converted;
        }

        // Return as-is for non-college or already converted grades
        return $this->grade;
    }

    /**
     * Format college grade for display (shows both scales)
     *
     * @return string Formatted grade string
     */
    public function getFormattedCollegeGrade(): string
    {
        if ($this->academicLevel &&
            $this->academicLevel->key === 'college' &&
            $this->grade >= 70 &&
            $this->grade <= 100) {

            $collegeScale = $this->getCollegeScaleGrade();
            return number_format($collegeScale, 1) . ' (' . number_format($this->grade, 0) . '%)';
        }

        return number_format($this->grade, 2);
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


