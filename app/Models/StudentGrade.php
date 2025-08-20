<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'grade' => 'float',
        'year_of_study' => 'integer',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function academicLevel(): BelongsTo { return $this->belongsTo(AcademicLevel::class); }
    public function gradingPeriod(): BelongsTo { return $this->belongsTo(GradingPeriod::class); }
}


