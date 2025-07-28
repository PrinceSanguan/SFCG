<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->is_read = true;
            $this->read_at = now();
            return $this->save();
        }
        return true;
    }

    public function markAsUnread()
    {
        if ($this->is_read) {
            $this->is_read = false;
            $this->read_at = null;
            return $this->save();
        }
        return true;
    }

    public function getTypeDisplayName()
    {
        return match($this->type) {
            'honor_achievement' => 'Honor Achievement',
            'grade_submitted' => 'Grade Submitted',
            'grade_approved' => 'Grade Approved',
            'certificate_generated' => 'Certificate Generated',
            'system_announcement' => 'System Announcement',
            default => ucfirst(str_replace('_', ' ', $this->type))
        };
    }

    public function getTimeAgo()
    {
        return $this->created_at->diffForHumans();
    }

    public static function createForUser($userId, $type, $title, $message, $data = null)
    {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function createHonorNotification($userId, $honorType, $gpa, $period)
    {
        return static::createForUser(
            $userId,
            'honor_achievement',
            'Honor Achievement',
            "Congratulations! You've achieved {$honorType} with a GPA of {$gpa} for {$period}.",
            [
                'honor_type' => $honorType,
                'gpa' => $gpa,
                'period' => $period,
            ]
        );
    }
} 