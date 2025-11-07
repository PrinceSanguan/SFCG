<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradingPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'academic_level_id',
        'parent_id',
        'period_type',
        'semester_number',
        'weight',
        'is_calculated',
        'start_date',
        'end_date',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'is_calculated' => 'boolean',
        'sort_order' => 'integer',
        'semester_number' => 'integer',
        'weight' => 'decimal:2',
    ];

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(GradingPeriod::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(GradingPeriod::class, 'parent_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForLevel($query, $academicLevelId)
    {
        return $query->where('academic_level_id', $academicLevelId);
    }

    public function scopeQuarters($query)
    {
        return $query->where('type', 'quarter');
    }

    public function scopeSemesters($query)
    {
        return $query->where('type', 'semester');
    }

    public function scopeRootPeriods($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeSubPeriods($query)
    {
        return $query->whereNotNull('parent_id');
    }

    public function scopeForSemester($query, $semesterNumber)
    {
        return $query->where('semester_number', $semesterNumber);
    }

    public function scopeByPeriodType($query, $periodType)
    {
        return $query->where('period_type', $periodType);
    }

    public function isQuarter(): bool
    {
        return $this->type === 'quarter';
    }

    public function isSemester(): bool
    {
        return $this->type === 'semester';
    }

    public function isRootPeriod(): bool
    {
        return is_null($this->parent_id);
    }

    public function isSubPeriod(): bool
    {
        return !is_null($this->parent_id);
    }

    public function getFullNameAttribute(): string
    {
        if ($this->isSemester() && $this->isRootPeriod()) {
            return "{$this->name} (Semester {$this->semester_number})";
        }
        
        if ($this->isSubPeriod()) {
            $parentName = $this->parent?->name ?? 'Unknown Parent';
            return "{$parentName} - {$this->name}";
        }
        
        return $this->name;
    }
}
