<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'instructor_id',
        'academic_period_id',
        'prelim_grade',
        'midterm_grade',
        'final_grade',
        'overall_grade',
        'status',
        'submitted_by',
        'submitted_at',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'prelim_grade' => 'decimal:2',
        'midterm_grade' => 'decimal:2',
        'final_grade' => 'decimal:2',
        'overall_grade' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFinalized($query)
    {
        return $query->where('status', 'finalized');
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('academic_period_id', $periodId);
    }

    // Helper methods
    public function calculateOverallGrade()
    {
        $grades = array_filter([$this->prelim_grade, $this->midterm_grade, $this->final_grade]);
        return count($grades) > 0 ? array_sum($grades) / count($grades) : null;
    }

    public function updateOverallGrade()
    {
        $this->overall_grade = $this->calculateOverallGrade();
        return $this->save();
    }

    public function isPassing($passingGrade = 75)
    {
        return $this->overall_grade && $this->overall_grade >= $passingGrade;
    }

    public function canBeSubmitted()
    {
        return $this->status === 'draft' && $this->overall_grade !== null;
    }

    public function canBeApproved()
    {
        return $this->status === 'submitted';
    }
} 