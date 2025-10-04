<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HonorCriterion extends Model
{
    use HasFactory;

    protected $table = 'honor_criteria';

    protected $fillable = [
        'academic_level_id',
        'honor_type_id',
        'min_gpa',
        'max_gpa',
        'min_grade',
        'min_grade_all',
        'min_year',
        'max_year',
        'require_consistent_honor',
        'additional_rules',
    ];

    protected $casts = [
        'min_gpa' => 'float',
        'max_gpa' => 'float',
        'min_grade' => 'float',  // Changed to float to support SHS 1.0-5.0 grading scale
        'min_grade_all' => 'float',  // Changed to float to support SHS 1.0-5.0 grading scale
        'min_year' => 'integer',
        'max_year' => 'integer',
        'require_consistent_honor' => 'boolean',
        'additional_rules' => 'array',
    ];

    public function honorType(): BelongsTo
    {
        return $this->belongsTo(HonorType::class);
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }
}


