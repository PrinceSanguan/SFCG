<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    public function strands()
    {
        return $this->hasMany(Strand::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
