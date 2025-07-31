<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Static logging method
    public static function logActivity(
        ?User $user,
        string $action,
        string $model,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        // For system activities, create a system user if none exists
        $userId = $user?->id;
        if (!$userId && in_array($action, ['automated_backup_success', 'automated_backup_failed', 'created_backup', 'backup_failed'])) {
            // Use the first admin user for system activities, or create a system record
            $systemUser = User::where('user_role', 'admin')->first();
            $userId = $systemUser?->id ?? 1; // Fallback to user ID 1
        }

        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'model' => $model,
            'model_type' => strtolower($model), // Auto-populate model_type
            'model_id' => $modelId ?? 0, // Default to 0 for system activities
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'System',
        ]);
    }

    // Helper methods for display
    public function getActionDisplayName(): string
    {
        return match($this->action) {
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'viewed' => 'Viewed',
            'exported' => 'Exported',
            'imported' => 'Imported',
            default => ucfirst($this->action),
        };
    }

    public function getModelDisplayName(): string
    {
        return match($this->model) {
            'User' => 'user',
            'AcademicLevel' => 'academic level',
            'AcademicStrand' => 'academic strand',
            'AcademicPeriod' => 'academic period',
            'Subject' => 'subject',
            'Grade' => 'grade',
            'StudentHonor' => 'student honor',
            'GeneratedCertificate' => 'certificate',
            'InstructorSubjectAssignment' => 'instructor assignment',
            'StudentProfile' => 'student profile',
            default => strtolower($this->model),
        };
    }

    public function getDescriptionAttribute(): string
    {
        $user = $this->user ? $this->user->name : 'System';
        $action = $this->getActionDisplayName();
        $model = $this->getModelDisplayName();
        
        return "{$user} {$action} {$model}";
    }
} 