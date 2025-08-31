<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HonorResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'honor_type_id',
        'academic_level_id',
        'school_year',
        'gpa',
        'is_overridden',
        'override_reason',
        'overridden_by',
        'is_pending_approval',
        'is_approved',
        'approved_at',
        'approved_by',
        'is_rejected',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
    ];

    protected $casts = [
        'gpa' => 'float',
        'is_overridden' => 'boolean',
        'is_pending_approval' => 'boolean',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'is_rejected' => 'boolean',
        'rejected_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function honorType(): BelongsTo
    {
        return $this->belongsTo(HonorType::class);
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}


