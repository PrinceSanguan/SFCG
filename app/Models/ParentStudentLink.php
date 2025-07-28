<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentStudentLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'student_id',
        'relationship',
    ];

    // Relationships
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Helper methods
    public function getRelationshipDisplayAttribute(): string
    {
        return ucfirst($this->relationship);
    }

    public static function getRelationshipTypes(): array
    {
        return [
            'father' => 'Father',
            'mother' => 'Mother',
            'guardian' => 'Guardian',
            'grandfather' => 'Grandfather',
            'grandmother' => 'Grandmother',
            'uncle' => 'Uncle',
            'aunt' => 'Aunt',
            'other' => 'Other',
        ];
    }
} 