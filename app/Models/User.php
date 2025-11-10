<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'user_role',
        'year_level',
        'specific_year_level',
        'strand_id',
        'course_id',
        'department_id',
        'section_id',
        'student_number',
        'last_login_at',
        // Personal Information
        'birth_date',
        'gender',
        'phone_number',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Default model attributes.
     */
    protected $attributes = [
        'user_role' => 'student',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if ($user->user_role === 'student' && empty($user->student_number)) {
                $user->student_number = static::generateStudentNumber($user);
            }
        });

        static::created(function (User $user) {
            if ($user->user_role === 'student') {
                // Automatically assign subjects to the student after creation
                try {
                    $subjectAssignmentService = new \App\Services\StudentSubjectAssignmentService();
                    $assignedSubjects = $subjectAssignmentService->enrollStudentInAllApplicableSubjects($user);

                    \Log::info('Student automatically assigned to subjects after creation', [
                        'student_id' => $user->id,
                        'student_name' => $user->name,
                        'academic_level' => $user->year_level,
                        'specific_year_level' => $user->specific_year_level,
                        'section_id' => $user->section_id,
                        'course_id' => $user->course_id,
                        'strand_id' => $user->strand_id,
                        'assigned_subjects_count' => count($assignedSubjects),
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to automatically assign subjects to new student', [
                        'student_id' => $user->id,
                        'student_name' => $user->name,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        });

        static::updated(function (User $user) {
            if ($user->user_role === 'student') {
                // Check if section, year_level, or specific_year_level has changed
                $sectionChanged = $user->isDirty('section_id');
                $yearLevelChanged = $user->isDirty('year_level');
                $specificYearLevelChanged = $user->isDirty('specific_year_level');
                $strandChanged = $user->isDirty('strand_id');
                $courseChanged = $user->isDirty('course_id');

                if ($sectionChanged || $yearLevelChanged || $specificYearLevelChanged || $strandChanged || $courseChanged) {
                    try {
                        // Use the StudentSubjectAssignmentService for more comprehensive enrollment
                        $studentService = new \App\Services\StudentSubjectAssignmentService();
                        $assignedSubjects = $studentService->enrollStudentInAllApplicableSubjects($user);

                        \Log::info('Student re-enrolled in subjects after section/level change', [
                            'student_id' => $user->id,
                            'student_name' => $user->name,
                            'section_id' => $user->section_id,
                            'year_level' => $user->year_level,
                            'specific_year_level' => $user->specific_year_level,
                            'strand_id' => $user->strand_id,
                            'course_id' => $user->course_id,
                            'enrolled_subjects_count' => count($assignedSubjects),
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to re-enroll student in subjects after update', [
                            'student_id' => $user->id,
                            'student_name' => $user->name,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                }
            }
        });
    }

    public static function generateStudentNumber(User $user): string
    {
        $prefixMap = [
            'elementary' => 'EL',
            'junior_highschool' => 'JH',
            'senior_highschool' => 'SH',
            'college' => 'CO',
        ];

        $level = $user->year_level ?: 'college';
        $prefix = $prefixMap[$level] ?? 'ST';
        $year = now()->format('Y');

        do {
            $sequence = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $candidate = $prefix . '-' . $year . '-' . $sequence;
        } while (static::where('student_number', $candidate)->exists());

        return $candidate;
    }

    public static function getYearLevels(): array
    {
        return [
            'elementary' => 'Elementary',
            'junior_highschool' => 'Junior High School',
            'senior_highschool' => 'Senior High School',
            'college' => 'College',
        ];
    }

    /**
     * Get specific year levels for each academic level.
     */
    public static function getSpecificYearLevels(): array
    {
        return [
            'elementary' => [
                'grade_1' => 'Grade 1',
                'grade_2' => 'Grade 2',
                'grade_3' => 'Grade 3',
                'grade_4' => 'Grade 4',
                'grade_5' => 'Grade 5',
                'grade_6' => 'Grade 6',
            ],
            'junior_highschool' => [
                'grade_7' => 'Grade 7',
                'grade_8' => 'Grade 8',
                'grade_9' => 'Grade 9',
                'grade_10' => 'Grade 10',
            ],
            'senior_highschool' => [
                'grade_11' => 'Grade 11',
                'grade_12' => 'Grade 12',
            ],
            'college' => [
                'first_year' => 'First Year',
                'second_year' => 'Second Year',
                'third_year' => 'Third Year',
                'fourth_year' => 'Fourth Year',
            ],
        ];
    }

    /**
     * Get the activity logs for the user (actions performed by this user).
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    /**
     * Get the activity logs where this user was the target (actions performed on this user).
     */
    public function targetActivityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'target_user_id');
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->user_role === 'admin';
    }

    /**
     * Check if the user has the specified role.
     */
    public function hasRole(string $role): bool
    {
        return $this->user_role === $role;
    }

    /**
     * Get the user's role display name.
     */
    public function getRoleDisplayName(): string
    {
        return match($this->user_role) {
            'admin' => 'Administrator',
            'registrar' => 'Registrar',
            'instructor' => 'Instructor',
            'teacher' => 'Teacher',
            'adviser' => 'Adviser',
            'chairperson' => 'Chairperson',
            'principal' => 'Principal',
            'student' => 'Student',
            'parent' => 'Parent',
            default => ucfirst($this->user_role),
        };
    }

    /**
     * Get available user roles.
     */
    public static function getAvailableRoles(): array
    {
        return [
            'admin' => 'Administrator',
            'registrar' => 'Registrar',
            'instructor' => 'Instructor',
            'teacher' => 'Teacher',
            'adviser' => 'Adviser',
            'chairperson' => 'Chairperson',
            'principal' => 'Principal',
            'student' => 'Student',
            'parent' => 'Parent',
        ];
    }

    /**
     * Get the parent-student relationships where this user is the parent.
     */
    public function parentRelationships(): HasMany
    {
        return $this->hasMany(ParentStudentRelationship::class, 'parent_id');
    }

    /**
     * Get the parent-student relationships where this user is the student.
     */
    public function studentRelationships(): HasMany
    {
        return $this->hasMany(ParentStudentRelationship::class, 'student_id');
    }

    /**
     * Get the students linked to this parent.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_student_relationships', 'parent_id', 'student_id')
                    ->withPivot(['relationship_type', 'emergency_contact', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Get the parents linked to this student.
     */
    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_student_relationships', 'student_id', 'parent_id')
                    ->withPivot(['relationship_type', 'emergency_contact', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Check if this user is a parent of the given student.
     */
    public function isParentOf(User $student): bool
    {
        return $this->students()->where('student_id', $student->id)->exists();
    }

    /**
     * Check if this user is a student of the given parent.
     */
    public function isStudentOf(User $parent): bool
    {
        return $this->parents()->where('parent_id', $parent->id)->exists();
    }

    /**
     * Get teacher subject assignments for this user.
     */
    public function teacherSubjectAssignments(): HasMany
    {
        return $this->hasMany(\App\Models\TeacherSubjectAssignment::class, 'teacher_id');
    }

    /**
     * Get instructor course assignments for this user.
     */
    public function instructorCourseAssignments(): HasMany
    {
        return $this->hasMany(\App\Models\InstructorCourseAssignment::class, 'instructor_id');
    }

    /**
     * Get instructor subject assignments for this user.
     */
    public function instructorSubjectAssignments(): HasMany
    {
        return $this->hasMany(\App\Models\InstructorSubjectAssignment::class, 'instructor_id');
    }

    /**
     * Get class adviser assignments for this user.
     */
    public function classAdviserAssignments(): HasMany
    {
        return $this->hasMany(\App\Models\ClassAdviserAssignment::class, 'adviser_id');
    }

    /**
     * Check if this user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->user_role === 'teacher';
    }

    /**
     * Check if this user is an instructor.
     */
    public function isInstructor(): bool
    {
        return $this->user_role === 'instructor';
    }

    /**
     * Check if this user is an adviser.
     */
    public function isAdviser(): bool
    {
        return $this->user_role === 'adviser';
    }

    /**
     * Get the strand for this user (for Senior High School students).
     */
    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    /**
     * Get the course for this user (for College students).
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the department for this user (for chairpersons and other staff).
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Section for this user (students only).
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Grades for this user when they are a student.
     */
    public function studentGrades(): HasMany
    {
        return $this->hasMany(StudentGrade::class, 'student_id');
    }

    /**
     * Subject assignments for this user when they are a student.
     */
    public function studentSubjectAssignments(): HasMany
    {
        return $this->hasMany(StudentSubjectAssignment::class, 'student_id');
    }

    /**
     * Honor results for this user when they are a student.
     */
    public function honorResults(): HasMany
    {
        return $this->hasMany(HonorResult::class, 'student_id');
    }

    /**
     * Certificates for this user when they are a student.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'student_id');
    }

    /**
     * Section enrollments for this student.
     */
    public function sectionEnrollments(): HasMany
    {
        return $this->hasMany(StudentSectionEnrollment::class, 'student_id');
    }

    /**
     * Get students assigned to this teacher/adviser/instructor through subjects.
     */
    public function getStudentsThroughSubjects(): \Illuminate\Support\Collection
    {
        $service = new \App\Services\TeacherStudentAssignmentService();
        return $service->getStudentsForTeacher($this);
    }

    /**
     * Get teacher/adviser/instructor for this student's subject.
     */
    public function getTeacherForSubject(Subject $subject): ?User
    {
        $service = new \App\Services\TeacherStudentAssignmentService();
        return $service->getTeacherForStudentSubject($this, $subject);
    }

    /**
     * Get all subjects this user teaches/advises/instructs.
     */
    public function getAssignedSubjects(): \Illuminate\Support\Collection
    {
        $currentSchoolYear = "2024-2025";

        if ($this->isAdviser()) {
            return Subject::whereHas('classAdviserAssignments', function ($query) use ($currentSchoolYear) {
                $query->where('adviser_id', $this->id)
                    ->where('school_year', $currentSchoolYear)
                    ->where('is_active', true);
            })->get();
        } elseif ($this->isTeacher()) {
            return Subject::whereHas('teacherAssignments', function ($query) use ($currentSchoolYear) {
                $query->where('teacher_id', $this->id)
                    ->where('school_year', $currentSchoolYear)
                    ->where('is_active', true);
            })->get();
        } elseif ($this->isInstructor()) {
            return Subject::whereHas('instructorAssignments', function ($query) use ($currentSchoolYear) {
                $query->where('instructor_id', $this->id)
                    ->where('school_year', $currentSchoolYear)
                    ->where('is_active', true);
            })->get();
        }

        return collect();
    }

    /**
     * Check if this user teaches/advises/instructs a specific subject.
     */
    public function teachesSubject(Subject $subject): bool
    {
        return $this->getAssignedSubjects()->contains('id', $subject->id);
    }

    /**
     * Get the effective school year for this student.
     * Returns the school year from the student's section, or generates a default.
     * Only applicable for users with user_role = 'student'.
     *
     * @return string|null The school year in format "YYYY-YYYY" (e.g., "2025-2026"), or null if not a student
     */
    public function getEffectiveSchoolYear(): ?string
    {
        // Only students have school years
        if ($this->user_role !== 'student') {
            return null;
        }

        // If student has a section, use the section's school year
        if ($this->section_id && $this->section) {
            return $this->section->getEffectiveSchoolYear();
        }

        // If no section, generate current academic year based on calendar
        // Academic year typically starts in August/September
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // If we're in Aug-Dec, academic year is current-next (e.g., 2025-2026)
        // If we're in Jan-Jul, academic year is previous-current (e.g., 2024-2025)
        if ($currentMonth >= 8) {
            $startYear = $currentYear;
            $endYear = $currentYear + 1;
        } else {
            $startYear = $currentYear - 1;
            $endYear = $currentYear;
        }

        return "{$startYear}-{$endYear}";
    }
}
