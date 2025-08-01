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
        'template_image_path',
        'image_description',
        'education_level',
        'template_type',
        'created_by',
        'image_uploaded_at',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'image_uploaded_at' => 'datetime',
    ];

    // Relationships
    public function generatedCertificates()
    {
        return $this->hasMany(GeneratedCertificate::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
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

    public function getEducationLevelDisplayName()
    {
        return match($this->education_level) {
            'elementary' => 'Elementary',
            'junior_high' => 'Junior High School',
            'senior_high' => 'Senior High School',
            'college' => 'College',
            default => 'All Levels'
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
        // For image templates, we return the image path and data
        return [
            'image_path' => $this->template_image_path,
            'data' => $data,
        ];
    }

    public function hasImage()
    {
        return !empty($this->template_image_path) && file_exists(storage_path('app/public/' . $this->template_image_path));
    }

    public function getImageUrl()
    {
        return $this->hasImage() ? route('certificate-templates.image', $this->id) : null;
    }


} 