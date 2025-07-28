<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'template_content',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function generatedCertificates()
    {
        return $this->hasMany(GeneratedCertificate::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helper methods
    public function getTypeDisplayName()
    {
        return match($this->type) {
            'honor_roll' => 'Honor Roll Certificate',
            'graduation' => 'Graduation Certificate',
            'achievement' => 'Achievement Certificate',
            default => 'Certificate'
        };
    }

    public function getAvailableVariables()
    {
        return $this->variables ?? [
            '{{student_name}}',
            '{{student_id}}',
            '{{honor_type}}',
            '{{gpa}}',
            '{{school_year}}',
            '{{date}}',
            '{{academic_level}}',
            '{{section}}',
        ];
    }

    public function renderTemplate($data)
    {
        $content = $this->template_content;
        
        foreach ($data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }
        
        return $content;
    }
} 