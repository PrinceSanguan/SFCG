<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'recipients',
        'status',
        'sent_at',
        'metadata',
        'email_subject',
        'email_body',
    ];

    protected $casts = [
        'recipients' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
    ];

    // Notification types
    const TYPE_GRADE_UPDATE = 'grade_update';
    const TYPE_HONOR_QUALIFICATION = 'honor_qualification';
    const TYPE_GENERAL_ANNOUNCEMENT = 'general_announcement';
    const TYPE_ASSIGNMENT_NOTIFICATION = 'assignment_notification';
    const TYPE_PENDING_HONOR_APPROVAL = 'pending_honor_approval';

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_FAILED = 'failed';

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function markAsSent()
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed()
    {
        $this->update([
            'status' => self::STATUS_FAILED,
        ]);
    }
}
