<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
            'instructor' => 'Instructor',
            'teacher' => 'Teacher',
            'adviser' => 'Adviser',
            'chairperson' => 'Chairperson',
            'principal' => 'Principal',
            'student' => 'Student',
            'parent' => 'Parent',
        ];
    }
}
