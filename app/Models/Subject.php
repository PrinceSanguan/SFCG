<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'academic_level_id',
        'strand_id',
        'grade_levels',
        'grading_period_id',
        'grading_period_ids',
        'course_id',
        'shs_year_level',
        'jhs_year_level',
        'units',
        'hours_per_week',
        'is_core',
        'is_active',
        'section_id',
        'selected_grade_level',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_active' => 'boolean',
        'units' => 'decimal:1',
        'hours_per_week' => 'integer',
        'grade_levels' => 'array',
        'grading_period_ids' => 'array',
        'shs_year_level' => 'string',
        'jhs_year_level' => 'string',
    ];

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    public function gradingPeriod(): BelongsTo
    {
        return $this->belongsTo(GradingPeriod::class);
    }

    /**
     * Get all grading periods for this subject.
     * Returns a collection of GradingPeriod models.
     */
    public function gradingPeriods()
    {
        if (!$this->grading_period_ids || empty($this->grading_period_ids)) {
            return collect([]);
        }
        return GradingPeriod::whereIn('id', $this->grading_period_ids)->get();
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function teacherAssignments(): HasMany
    {
        return $this->hasMany(TeacherSubjectAssignment::class);
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorSubjectAssignment::class);
    }

    public function classAdviserAssignments(): HasMany
    {
        return $this->hasMany(ClassAdviserAssignment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(StudentGrade::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForLevel($query, $academicLevelId)
    {
        return $query->where('academic_level_id', $academicLevelId);
    }

    public function scopeCore($query)
    {
        return $query->where('is_core', true);
    }

    /**
     * Scope to filter subjects by grade level for elementary subjects.
     */
    public function scopeForGradeLevel($query, $gradeLevel)
    {
        return $query->whereJsonContains('grade_levels', $gradeLevel);
    }

    /**
     * Check if this subject applies to a specific grade level.
     */
    public function appliesToGradeLevel($gradeLevel): bool
    {
        if (!$this->grade_levels) {
            return false;
        }
        
        return in_array($gradeLevel, $this->grade_levels);
    }

    /**
     * Get the display name for grade levels.
     */
    public function getGradeLevelsDisplayAttribute(): string
    {
        if (!$this->grade_levels || empty($this->grade_levels)) {
            return 'All Grades';
        }

        $gradeNames = [
            'grade_1' => 'Grade 1',
            'grade_2' => 'Grade 2', 
            'grade_3' => 'Grade 3',
            'grade_4' => 'Grade 4',
            'grade_5' => 'Grade 5',
            'grade_6' => 'Grade 6',
        ];

        $displayNames = array_map(function($grade) use ($gradeNames) {
            return $gradeNames[$grade] ?? $grade;
        }, $this->grade_levels);

        return implode(', ', $displayNames);
    }

    /**
     * Get available grade levels for elementary.
     */
    public static function getElementaryGradeLevels(): array
    {
        return [
            'grade_1' => 'Grade 1',
            'grade_2' => 'Grade 2',
            'grade_3' => 'Grade 3', 
            'grade_4' => 'Grade 4',
            'grade_5' => 'Grade 5',
            'grade_6' => 'Grade 6',
        ];
    }
}
