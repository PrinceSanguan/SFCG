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
        'units',
        'academic_level_id',
        'academic_strand_id',
        'college_course_id',
        'year_level',
        'semester',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'units' => 'integer',
        'year_level' => 'integer',
    ];

    // Relationships
    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function academicStrand(): BelongsTo
    {
        return $this->belongsTo(AcademicStrand::class);
    }

    public function collegeCourse(): BelongsTo
    {
        return $this->belongsTo(CollegeCourse::class);
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorSubjectAssignment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForK12($query)
    {
        return $query->whereNotNull('academic_level_id')
                    ->whereNull('college_course_id');
    }

    public function scopeForCollege($query)
    {
        return $query->whereNotNull('college_course_id');
    }

    public function scopeByYearLevel($query, $yearLevel)
    {
        return $query->where('year_level', $yearLevel);
    }

    public function scopeBySemester($query, $semester)
    {
        return $query->where('semester', $semester);
    }

    // Helper methods
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->code})";
    }

    public function getFullNameAttribute(): string
    {
        if ($this->college_course_id) {
            // College subject
            $course = $this->collegeCourse->name ?? '';
            $yearLevel = $this->year_level ? " - {$this->getYearLevelName()}" : '';
            $semester = $this->semester ? " ({$this->getSemesterName()})" : '';
            return "{$this->name} ({$this->code}) - {$course}{$yearLevel}{$semester}";
        } else {
            // K-12 subject
            $level = $this->academicLevel->name ?? '';
            $strand = $this->academicStrand ? " - {$this->academicStrand->name}" : '';
            return "{$this->name} ({$this->code}) - {$level}{$strand}";
        }
    }

    public function getYearLevelName(): string
    {
        if (!$this->year_level) return '';
        
        return match($this->year_level) {
            1 => '1st Year',
            2 => '2nd Year',
            3 => '3rd Year',
            4 => '4th Year',
            5 => '5th Year',
            6 => '6th Year',
            default => $this->year_level . 'th Year',
        };
    }

    public function getSemesterName(): string
    {
        return match($this->semester) {
            '1st' => '1st Semester',
            '2nd' => '2nd Semester',
            'summer' => 'Summer Term',
            default => $this->semester ?? '',
        };
    }

    public function isCollegeSubject(): bool
    {
        return !is_null($this->college_course_id);
    }

    public function isK12Subject(): bool
    {
        return !is_null($this->academic_level_id) && is_null($this->college_course_id);
    }

    public function getSubjectTypeAttribute(): string
    {
        return $this->isCollegeSubject() ? 'College' : 'K-12';
    }
} 