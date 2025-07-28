<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HonorCriterion extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_level_id',
        'honor_type',
        'minimum_grade',
        'maximum_grade',
        'criteria_description',
        'is_active',
    ];

    protected $casts = [
        'minimum_grade' => 'decimal:2',
        'maximum_grade' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function academicLevel()
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForLevel($query, $levelId)
    {
        return $query->where('academic_level_id', $levelId);
    }

    public function scopeByHonorType($query, $type)
    {
        return $query->where('honor_type', $type);
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

    public function qualifiesForHonor($gpa)
    {
        return $gpa >= $this->minimum_grade && $gpa <= $this->maximum_grade;
    }

    public static function getHonorForGPA($gpa, $academicLevelId)
    {
        return static::active()
            ->forLevel($academicLevelId)
            ->where('minimum_grade', '<=', $gpa)
            ->where('maximum_grade', '>=', $gpa)
            ->orderBy('minimum_grade', 'desc')
            ->first();
    }
} 