<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassAdviserAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'adviser_id',
        'academic_level_id',
        'academic_period_id',
        'year_level',
        'section',
        'strand_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function adviser()
    {
        return $this->belongsTo(User::class, 'adviser_id');
    }

    public function academicLevel()
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function strand()
    {
        return $this->belongsTo(AcademicStrand::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper methods
    public function getDisplayName()
    {
        $display = "{$this->academicLevel->name} - {$this->year_level}";
        if ($this->section) {
            $display .= " ({$this->section})";
        }
        if ($this->strand) {
            $display .= " - {$this->strand->name}";
        }
        return $display;
    }
}
