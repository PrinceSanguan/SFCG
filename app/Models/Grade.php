<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'instructor_id',
        'academic_period_id',
        'section',
        'quarterly_grades',
        'semester_grades',
        'college_grades',
        'student_type',
        '1st_grading',
        '2nd_grading',
        '3rd_grading',
        '4th_grading',
        '1st_semester_midterm',
        '1st_semester_pre_final',
        '1st_semester_final',
        '2nd_semester_midterm',
        '2nd_semester_pre_final',
        '2nd_semester_final',
        'prelim_grade',
        'midterm_grade',
        'final_grade',
        'overall_grade',
        'status',
        'submitted_by',
        'submitted_at',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'quarterly_grades' => 'array',
        'semester_grades' => 'array',
        'college_grades' => 'array',
        'prelim_grade' => 'decimal:2',
        'midterm_grade' => 'decimal:2',
        'final_grade' => 'decimal:2',
        'overall_grade' => 'decimal:2',
        '1st_grading' => 'decimal:2',
        '2nd_grading' => 'decimal:2',
        '3rd_grading' => 'decimal:2',
        '4th_grading' => 'decimal:2',
        '1st_semester_midterm' => 'decimal:2',
        '1st_semester_pre_final' => 'decimal:2',
        '1st_semester_final' => 'decimal:2',
        '2nd_semester_midterm' => 'decimal:2',
        '2nd_semester_pre_final' => 'decimal:2',
        '2nd_semester_final' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFinalized($query)
    {
        return $query->where('status', 'finalized');
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('academic_period_id', $periodId);
    }

    // Helper methods
    public function calculateOverallGrade()
    {
        switch ($this->student_type) {
            case 'elementary':
            case 'junior_high':
                return $this->calculateQuarterlyGrade();
            case 'senior_high':
                return $this->calculateSemesterGrade();
            case 'college':
                return $this->calculateCollegeGrade();
            default:
                // Fallback to old method
                $grades = array_filter([$this->prelim_grade, $this->midterm_grade, $this->final_grade]);
                return count($grades) > 0 ? array_sum($grades) / count($grades) : null;
        }
    }

    public function calculateQuarterlyGrade()
    {
        $grades = array_filter([
            $this->{'1st_grading'},
            $this->{'2nd_grading'},
            $this->{'3rd_grading'},
            $this->{'4th_grading'}
        ]);
        
        return count($grades) > 0 ? array_sum($grades) / count($grades) : null;
    }

    public function calculateSemesterGrade()
    {
        // 1st Semester: (1st Grading + 2nd Grading) / 2
        $firstSemester = null;
        if ($this->{'1st_grading'} && $this->{'2nd_grading'}) {
            $firstSemester = ($this->{'1st_grading'} + $this->{'2nd_grading'}) / 2;
        }

        // 2nd Semester: (3rd Grading + 4th Grading) / 2
        $secondSemester = null;
        if ($this->{'3rd_grading'} && $this->{'4th_grading'}) {
            $secondSemester = ($this->{'3rd_grading'} + $this->{'4th_grading'}) / 2;
        }

        // Overall: (1st Semester + 2nd Semester) / 2
        if ($firstSemester && $secondSemester) {
            return ($firstSemester + $secondSemester) / 2;
        } elseif ($firstSemester) {
            return $firstSemester;
        } elseif ($secondSemester) {
            return $secondSemester;
        }

        return null;
    }

    public function calculateCollegeGrade()
    {
        // 1st Semester: (Midterm + Pre-Final) / 2
        $firstSemester = null;
        if ($this->{'1st_semester_midterm'} && $this->{'1st_semester_pre_final'}) {
            $firstSemester = ($this->{'1st_semester_midterm'} + $this->{'1st_semester_pre_final'}) / 2;
        }

        // 2nd Semester: (Midterm + Pre-Final) / 2
        $secondSemester = null;
        if ($this->{'2nd_semester_midterm'} && $this->{'2nd_semester_pre_final'}) {
            $secondSemester = ($this->{'2nd_semester_midterm'} + $this->{'2nd_semester_pre_final'}) / 2;
        }

        // Overall: (1st Semester + 2nd Semester) / 2
        if ($firstSemester && $secondSemester) {
            return ($firstSemester + $secondSemester) / 2;
        } elseif ($firstSemester) {
            return $firstSemester;
        } elseif ($secondSemester) {
            return $secondSemester;
        }

        return null;
    }

    public function updateOverallGrade()
    {
        $this->overall_grade = $this->calculateOverallGrade();
        return $this->save();
    }

    public function getStudentTypeFromProfile()
    {
        $studentProfile = $this->student->studentProfile;
        
        if (!$studentProfile) {
            return null;
        }

        if ($studentProfile->isCollegeStudent()) {
            return 'college';
        }

        // Check academic level for K-12 students
        $academicLevel = $studentProfile->academicLevel;
        if (!$academicLevel) {
            return null;
        }

        return match(strtolower($academicLevel->name)) {
            'elementary' => 'elementary',
            'junior high', 'junior high school' => 'junior_high',
            'senior high', 'senior high school' => 'senior_high',
            default => null,
        };
    }

    public function setStudentType()
    {
        $this->student_type = $this->getStudentTypeFromProfile();
        return $this->save();
    }

    public function isPassing($passingGrade = 75)
    {
        return $this->overall_grade && $this->overall_grade >= $passingGrade;
    }

    public function canBeSubmitted()
    {
        return $this->status === 'draft' && $this->overall_grade !== null;
    }

    public function canBeApproved()
    {
        return $this->status === 'submitted';
    }
} 