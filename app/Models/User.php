<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'last_login_at',
        'contact_number',
        'department',
        'specialization',
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
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    // ==================== ROLE CHECKING METHODS ====================

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->user_role === 'admin';
    }

    /**
     * Check if user is a registrar
     */
    public function isRegistrar(): bool
    {
        return $this->user_role === 'registrar';
    }

    /**
     * Check if user is an instructor
     */
    public function isInstructor(): bool
    {
        return $this->user_role === 'instructor';
    }

    /**
     * Check if user is a teacher (K-12)
     */
    public function isTeacher(): bool
    {
        return $this->user_role === 'teacher';
    }

    /**
     * Check if user is a class adviser
     */
    public function isClassAdviser(): bool
    {
        return $this->user_role === 'class_adviser';
    }

    /**
     * Check if user is a chairperson
     */
    public function isChairperson(): bool
    {
        return $this->user_role === 'chairperson';
    }

    /**
     * Check if user is a principal
     */
    public function isPrincipal(): bool
    {
        return $this->user_role === 'principal';
    }

    /**
     * Check if user is a student
     */
    public function isStudent(): bool
    {
        return $this->user_role === 'student';
    }

    /**
     * Check if user is a parent
     */
    public function isParent(): bool
    {
        return $this->user_role === 'parent';
    }

    /**
     * Check if user is a regular user
     */
    public function isUser(): bool
    {
        return $this->user_role === 'user';
    }

    /**
     * Check if user can manage users (admin or registrar)
     */
    public function canManageUsers(): bool
    {
        return in_array($this->user_role, ['admin', 'registrar']);
    }

    /**
     * Check if user can input grades
     */
    public function canInputGrades(): bool
    {
        return in_array($this->user_role, ['instructor', 'teacher', 'class_adviser']);
    }

    /**
     * Check if user can approve grades
     */
    public function canApproveGrades(): bool
    {
        return in_array($this->user_role, ['chairperson', 'principal', 'admin']);
    }

    /**
     * Check if user can manage honors
     */
    public function canManageHonors(): bool
    {
        return in_array($this->user_role, ['admin', 'registrar']);
    }

    /**
     * Check if user can generate certificates
     */
    public function canGenerateCertificates(): bool
    {
        return in_array($this->user_role, ['admin', 'registrar']);
    }

    /**
     * Get user role display name
     */
    public function getRoleDisplayName(): string
    {
        return match($this->user_role) {
            'admin' => 'Administrator',
            'registrar' => 'Registrar',
            'instructor' => 'Instructor',
            'teacher' => 'Teacher',
            'class_adviser' => 'Class Adviser',
            'chairperson' => 'Chairperson',
            'principal' => 'Principal',
            'student' => 'Student',
            'parent' => 'Parent',
            'user' => 'User',
            default => 'Unknown'
        };
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Student profile relationship
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * Parent-student links (for parents)
     */
    public function linkedStudents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_student_links', 'parent_id', 'student_id')
            ->withPivot('relationship')
            ->withTimestamps();
    }

    /**
     * Parent-student links (for students)
     */
    public function linkedParents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_student_links', 'student_id', 'parent_id')
            ->withPivot('relationship')
            ->withTimestamps();
    }

    /**
     * Students assigned to this class adviser
     */
    public function advisedStudents(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'class_adviser_id');
    }

    /**
     * Subject assignments (for instructors)
     */
    public function subjectAssignments(): HasMany
    {
        return $this->hasMany(InstructorSubjectAssignment::class, 'instructor_id');
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorSubjectAssignment::class, 'instructor_id');
    }

    public function classAdviserAssignments(): HasMany
    {
        return $this->hasMany(ClassAdviserAssignment::class, 'adviser_id');
    }

    /**
     * Grades submitted by this instructor
     */
    public function submittedGrades(): HasMany
    {
        return $this->hasMany(Grade::class, 'instructor_id');
    }

    /**
     * Grades received by this student
     */
    public function receivedGrades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    /**
     * Alias for receivedGrades - grades for this student
     */
    public function grades(): HasMany
    {
        return $this->receivedGrades();
    }

    /**
     * Honors received by this student
     */
    public function honors(): HasMany
    {
        return $this->hasMany(StudentHonor::class, 'student_id');
    }

    /**
     * Certificates generated for this student
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(GeneratedCertificate::class, 'student_id');
    }

    /**
     * Activity logs for this user
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    /**
     * Notifications for this user
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to get only admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('user_role', 'admin');
    }

    /**
     * Scope to get only regular users
     */
    public function scopeRegularUsers($query)
    {
        return $query->where('user_role', 'user');
    }

    /**
     * Scope to get users by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('user_role', $role);
    }

    /**
     * Scope to get instructors and teachers
     */
    public function scopeEducators($query)
    {
        return $query->whereIn('user_role', ['instructor', 'teacher', 'class_adviser', 'chairperson', 'principal']);
    }

    /**
     * Scope to get students only
     */
    public function scopeStudents($query)
    {
        return $query->where('user_role', 'student');
    }

    /**
     * Scope to get parents only
     */
    public function scopeParents($query)
    {
        return $query->where('user_role', 'parent');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get formatted created at date
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('M d, Y') : '';
    }

    /**
     * Get formatted last login date
     */
    public function getFormattedLastLoginAttribute(): string
    {
        return $this->last_login_at ? $this->last_login_at->format('M d, Y g:i A') : 'Never';
    }

    /**
     * Get user's full dashboard route based on role
     */
    public function getDashboardRoute(): string
    {
        return match($this->user_role) {
            'admin' => '/admin/dashboard',
            'registrar' => '/registrar/dashboard',
            'instructor' => '/instructor/dashboard',
            'teacher' => '/instructor/dashboard', // Teachers use the same dashboard as instructors
            'class_adviser' => '/class-adviser/dashboard',
            'chairperson' => '/chairperson/dashboard',
            'principal' => '/principal/dashboard',
            'student' => '/student/dashboard',
            'parent' => '/parent/dashboard',
            default => '/',
        };
    }

    /**
     * Check if user has unread notifications
     */
    public function hasUnreadNotifications(): bool
    {
        return $this->notifications()->where('is_read', false)->exists();
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCount(): int
    {
        return $this->notifications()->where('is_read', false)->count();
    }
}
