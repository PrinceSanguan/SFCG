<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneratedCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'certificate_template_id',
        'academic_period_id',
        'certificate_type',
        'certificate_data',
        'file_path',
        'certificate_image_path',
        'upload_status',
        'upload_notes',
        'uploaded_at',
        'uploaded_by',
        'approved_by',
        'approved_at',
        'usage_type',
        'usage_notes',
        'certificate_number',
        'generated_by',
        'generated_at',
        'is_digitally_signed',
        'printed_at',
        'print_count',
        'issued_at',
        'issued_to',
        'issued_by',
    ];

    protected $casts = [
        'certificate_data' => 'array',
        'generated_at' => 'datetime',
        'printed_at' => 'datetime',
        'issued_at' => 'datetime',
        'uploaded_at' => 'datetime',
        'approved_at' => 'datetime',
        'is_digitally_signed' => 'boolean',
        'print_count' => 'integer',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function certificateTemplate()
    {
        return $this->belongsTo(CertificateTemplate::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('certificate_type', $type);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('academic_period_id', $periodId);
    }

    public function scopeDigitallySigned($query)
    {
        return $query->where('is_digitally_signed', true);
    }

    // Helper methods
    public function getTypeDisplayName()
    {
        return match($this->certificate_type) {
            'honor_roll' => 'Honor Roll Certificate',
            'graduation' => 'Graduation Certificate',
            'achievement' => 'Achievement Certificate',
            default => 'Certificate'
        };
    }

    public function hasFile()
    {
        return !empty($this->file_path) && file_exists(storage_path('app/' . $this->file_path));
    }

    public function hasImage()
    {
        return !empty($this->certificate_image_path) && file_exists(storage_path('app/' . $this->certificate_image_path));
    }

    public function getDownloadUrl()
    {
        return $this->hasFile() ? route('certificates.download', $this->id) : null;
    }

    public function getImageUrl()
    {
        return $this->hasImage() ? route('certificates.image', $this->id) : null;
    }

    public function canBeUploaded()
    {
        return $this->upload_status === 'pending' || $this->upload_status === 'rejected';
    }

    public function canBeApproved()
    {
        return $this->upload_status === 'uploaded';
    }

    public function isApproved()
    {
        return $this->upload_status === 'approved';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificate) {
            if (empty($certificate->certificate_number)) {
                $certificate->certificate_number = static::generateCertificateNumber();
            }
        });
    }

    protected static function generateCertificateNumber()
    {
        $year = date('Y');
        $month = date('m');
        $count = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;
        
        return sprintf('CERT-%s%s-%04d', $year, $month, $count);
    }
} 