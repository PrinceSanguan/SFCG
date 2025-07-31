<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'first_name',
        'middle_name',
        'last_name',
        'birth_date',
        'gender',
        'address',
        'contact_number',
        'academic_level_id',
        'academic_strand_id',
        'college_course_id',
        'year_level',
        'semester',
        'grade_level',
        'section',
        'enrollment_status',
        'date_enrolled',
        'guardian_name',
        'guardian_contact',
        'emergency_contact',
        'class_adviser_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'date_enrolled' => 'date',
        'year_level' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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

    public function classAdviser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'class_adviser_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id', 'user_id');
    }

    public function honors(): HasMany
    {
        return $this->hasMany(StudentHonor::class, 'student_id', 'user_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('enrollment_status', 'active');
    }

    public function scopeByLevel($query, $levelId)
    {
        return $query->where('academic_level_id', $levelId);
    }

    public function scopeByStrand($query, $strandId)
    {
        return $query->where('academic_strand_id', $strandId);
    }

    public function scopeByCourse($query, $courseId)
    {
        return $query->where('college_course_id', $courseId);
    }

    public function scopeByYearLevel($query, $yearLevel)
    {
        return $query->where('year_level', $yearLevel);
    }

    public function scopeBySemester($query, $semester)
    {
        return $query->where('semester', $semester);
    }

    public function scopeK12Students($query)
    {
        return $query->whereNotNull('academic_level_id')
                    ->whereNull('college_course_id');
    }

    public function scopeCollegeStudents($query)
    {
        return $query->whereNotNull('college_course_id');
    }

    // Helper methods
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name
        ]);
        
        return implode(' ', $parts) ?: $this->user->name ?? '';
    }

    public function getFullStudentIdAttribute(): string
    {
        return $this->student_id ?: 'STU-' . str_pad($this->user_id, 6, '0', STR_PAD_LEFT);
    }

    public function getYearLevelDisplayAttribute(): string
    {
        if (!$this->year_level) return '';

        if ($this->isCollegeStudent()) {
            return match($this->year_level) {
                1 => '1st Year',
                2 => '2nd Year', 
                3 => '3rd Year',
                4 => '4th Year',
                5 => '5th Year',
                6 => '6th Year',
                default => $this->year_level . 'th Year',
            };
        } else {
            // For K-12, year_level might represent grade level
            return 'Grade ' . $this->year_level;
        }
    }

    public function getSemesterDisplayAttribute(): string
    {
        return match($this->semester) {
            '1st' => '1st Semester',
            '2nd' => '2nd Semester',
            'summer' => 'Summer Term',
            default => $this->semester ?? '',
        };
    }

    public function getAcademicInfoAttribute(): string
    {
        if ($this->isCollegeStudent()) {
            $course = $this->collegeCourse->name ?? '';
            $year = $this->year_level_display;
            $semester = $this->semester_display;
            return "{$course} - {$year}" . ($semester ? " ({$semester})" : '');
        } else {
            $level = $this->academicLevel->name ?? '';
            $strand = $this->academicStrand ? " - {$this->academicStrand->name}" : '';
            $section = $this->section ? " - {$this->section}" : '';
            return "{$level}{$strand}{$section}";
        }
    }

    public function isCollegeStudent(): bool
    {
        return !is_null($this->college_course_id);
    }

    public function isK12Student(): bool
    {
        return !is_null($this->academic_level_id) && is_null($this->college_course_id);
    }

    public function getStudentTypeAttribute(): string
    {
        return $this->isCollegeStudent() ? 'College' : 'K-12';
    }

    public function canEnrollInSubject(Subject $subject): bool
    {
        if ($this->isCollegeStudent() && $subject->isCollegeSubject()) {
            return $subject->college_course_id === $this->college_course_id &&
                   $subject->year_level === $this->year_level &&
                   $subject->semester === $this->semester;
        } elseif ($this->isK12Student() && $subject->isK12Subject()) {
            return $subject->academic_level_id === $this->academic_level_id &&
                   ($subject->academic_strand_id === $this->academic_strand_id || 
                    is_null($subject->academic_strand_id));
        }
        
        return false;
    }
} 