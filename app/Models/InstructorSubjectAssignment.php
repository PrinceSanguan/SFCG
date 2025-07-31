<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstructorSubjectAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'subject_id',
        'academic_period_id',
        'section',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    // Scopes
    public function scopeForInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeForSubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('academic_period_id', $periodId);
    }

    public function scopeForSection($query, $section)
    {
        return $query->where('section', $section);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper methods
    public function getStudents()
    {
        return User::students()
            ->whereHas('studentProfile', function ($query) {
                $query->where('section', $this->section)
                    ->where('academic_level_id', $this->subject->academic_level_id);
                
                if ($this->subject->academic_strand_id) {
                    $query->where('academic_strand_id', $this->subject->academic_strand_id);
                }
            });
    }
} 