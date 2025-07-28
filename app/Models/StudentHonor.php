<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentHonor extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'academic_period_id',
        'honor_type',
        'gpa',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'gpa' => 'decimal:2',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    public function scopeByHonorType($query, $type)
    {
        return $query->where('honor_type', $type);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('academic_period_id', $periodId);
    }

    // Helper methods
    public function getHonorDisplayName()
    {
        return match($this->honor_type) {
            'with_honors' => 'With Honors',
            'with_high_honors' => 'With High Honors',
            'with_highest_honors' => 'With Highest Honors',
            default => 'Honor'
        };
    }

    public function canBeApproved()
    {
        return !$this->is_approved;
    }

    public function approve($approvedBy)
    {
        $this->is_approved = true;
        $this->approved_by = $approvedBy;
        $this->approved_at = now();
        return $this->save();
    }
} 