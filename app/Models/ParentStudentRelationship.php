<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentStudentRelationship extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_id',
        'student_id',
        'relationship_type',
        'emergency_contact',
        'notes',
    ];

    /**
     * Get the parent user.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the student user.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the available relationship types.
     */
    public static function getRelationshipTypes(): array
    {
        return [
            'father' => 'Father',
            'mother' => 'Mother',
            'guardian' => 'Guardian',
            'other' => 'Other',
        ];
    }

    /**
     * Get the relationship type display name.
     */
    public function getRelationshipTypeDisplayName(): string
    {
        return match($this->relationship_type) {
            'father' => 'Father',
            'mother' => 'Mother',
            'guardian' => 'Guardian',
            'other' => 'Other',
            default => ucfirst($this->relationship_type),
        };
    }
}
