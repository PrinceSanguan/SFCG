<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HonorResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'honor_type_id',
        'academic_level_id',
        'school_year',
        'gpa',
        'is_overridden',
        'override_reason',
        'overridden_by',
    ];

    protected $casts = [
        'gpa' => 'float',
        'is_overridden' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function honorType(): BelongsTo
    {
        return $this->belongsTo(HonorType::class);
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }
}


