<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSubjectAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'school_year',
        'semester',
        'is_active',
        'enrolled_by',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'enrolled_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForSchoolYear($query, $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    public function scopeForSemester($query, $semester)
    {
        return $query->where('semester', $semester);
    }
}
