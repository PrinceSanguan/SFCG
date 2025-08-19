<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',       // e.g., elementary, junior_highschool, senior_highschool, college
        'name',      // display name
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function strands()
    {
        return $this->hasMany(Strand::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function gradingPeriods(): HasMany
    {
        return $this->hasMany(GradingPeriod::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function teacherAssignments(): HasMany
    {
        return $this->hasMany(TeacherSubjectAssignment::class);
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorCourseAssignment::class);
    }

    public function classAdviserAssignments(): HasMany
    {
        return $this->hasMany(ClassAdviserAssignment::class);
    }
}


