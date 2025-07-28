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
        return self::create([
            'user_id' => $user?->id,
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
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