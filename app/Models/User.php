<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'last_login_at',
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
        ];
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
}
