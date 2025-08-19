<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',       // e.g., elementary, junior_highschool, senior_highschool, college
        'name',      // display name
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function strands()
    {
        return $this->hasMany(Strand::class);
    }
}


