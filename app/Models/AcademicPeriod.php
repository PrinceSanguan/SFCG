<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'school_year',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorSubjectAssignment::class);
    }

    public function studentHonors(): HasMany
    {
        return $this->hasMany(StudentHonor::class);
    }

    public function generatedCertificates(): HasMany
    {
        return $this->hasMany(GeneratedCertificate::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now)
                    ->where('is_active', true);
    }

    // Helper methods
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->school_year})";
    }

    public function isCurrentPeriod(): bool
    {
        $now = now();
        return $this->start_date <= $now && 
               $this->end_date >= $now && 
               $this->is_active;
    }

    public function getDurationAttribute(): string
    {
        return "{$this->start_date->format('M j, Y')} - {$this->end_date->format('M j, Y')}";
    }
} 