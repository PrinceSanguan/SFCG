<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollegeCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'degree_type',
        'years_duration',
        'department',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'years_duration' => 'integer',
    ];

    // Relationships
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function studentProfiles(): HasMany
    {
        return $this->hasMany(StudentProfile::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDegreeType($query, $degreeType)
    {
        return $query->where('degree_type', $degreeType);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    // Helper methods
    public function setDegreeTypeAttribute($value): void
    {
        if (is_string($value)) {
            $this->attributes['degree_type'] = strtolower($value);
            return;
        }
        $this->attributes['degree_type'] = $value;
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->code})";
    }

    public function getFullNameAttribute(): string
    {
        $degreeType = ucfirst($this->degree_type);
        return "{$degreeType} - {$this->name} ({$this->code})";
    }

    public function getDegreeTypeDisplayAttribute(): string
    {
        return match($this->degree_type) {
            'bachelor' => 'Bachelor\'s Degree',
            'master' => 'Master\'s Degree',
            'doctorate' => 'Doctorate Degree',
            'diploma' => 'Diploma',
            'certificate' => 'Certificate',
            default => ucfirst($this->degree_type),
        };
    }

    public function getYearLevels(): array
    {
        $levels = [];
        for ($i = 1; $i <= $this->years_duration; $i++) {
            $levels[$i] = $this->getYearLevelName($i);
        }
        return $levels;
    }

    public function getYearLevelName(int $year): string
    {
        return match($year) {
            1 => '1st Year',
            2 => '2nd Year',
            3 => '3rd Year',
            4 => '4th Year',
            5 => '5th Year',
            6 => '6th Year',
            default => $year . 'th Year',
        };
    }

    public static function getDegreeTypes(): array
    {
        return [
            'bachelor' => 'Bachelor\'s Degree',
            'master' => 'Master\'s Degree',
            'doctorate' => 'Doctorate Degree',
            'diploma' => 'Diploma',
            'certificate' => 'Certificate',
        ];
    }

    public static function getSemesters(): array
    {
        return [
            '1st' => '1st Semester',
            '2nd' => '2nd Semester',
            'summer' => 'Summer Term',
        ];
    }
} 