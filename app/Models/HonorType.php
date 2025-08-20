<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HonorType extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'scope',
    ];

    public function criteria(): HasMany
    {
        return $this->hasMany(HonorCriterion::class, 'honor_type_id');
    }
}


