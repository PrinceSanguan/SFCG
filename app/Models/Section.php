<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'academic_level_id',
        'specific_year_level',
        'track_id',
        'strand_id',
        'department_id',
        'course_id',
        'max_students',
        'school_year',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_students' => 'integer',
    ];

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'section_id');
    }

    /**
     * Student enrollments in this section.
     */
    public function studentEnrollments(): HasMany
    {
        return $this->hasMany(StudentSectionEnrollment::class);
    }

    /**
     * Get the effective school year for this section.
     * Returns the section's school_year or a default current year if not set.
     *
     * @return string The school year in format "YYYY-YYYY" (e.g., "2025-2026")
     */
    public function getEffectiveSchoolYear(): string
    {
        if ($this->school_year) {
            return $this->school_year;
        }

        // If section doesn't have a school year, generate current one based on calendar
        // Academic year typically starts in August/September
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // If we're in Aug-Dec, academic year is current-next (e.g., 2025-2026)
        // If we're in Jan-Jul, academic year is previous-current (e.g., 2024-2025)
        if ($currentMonth >= 8) {
            $startYear = $currentYear;
            $endYear = $currentYear + 1;
        } else {
            $startYear = $currentYear - 1;
            $endYear = $currentYear;
        }

        return "{$startYear}-{$endYear}";
    }
}


