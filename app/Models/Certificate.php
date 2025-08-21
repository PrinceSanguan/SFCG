<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'student_id',
        'academic_level_id',
        'school_year',
        'serial_number',
        'status',
        'generated_at',
        'downloaded_at',
        'printed_at',
        'generated_by',
        'printed_by',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'generated_at' => 'datetime',
        'downloaded_at' => 'datetime',
        'printed_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'template_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function printedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }
}




