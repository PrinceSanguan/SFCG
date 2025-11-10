<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSectionEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'section_id',
        'school_year',
        'enrolled_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    /**
     * Get the student (user) associated with this enrollment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the section associated with this enrollment.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
