<?php

namespace App\Mail;

use App\Models\User;
use App\Models\GeneratedCertificate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CertificateGeneratedEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $student;
    public $certificate;
    public $isParentNotification;

    /**
     * Create a new message instance.
     */
    public function __construct(User $student, GeneratedCertificate $certificate, bool $isParentNotification = false)
    {
        $this->student = $student;
        $this->certificate = $certificate;
        $this->isParentNotification = $isParentNotification;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->isParentNotification 
            ? "Certificate Generated for {$this->student->name}"
            : "Your Certificate is Ready for Download";

        return $this->subject($subject)
            ->view('emails.certificate-generated')
            ->with([
                'student' => $this->student,
                'certificate' => $this->certificate,
                'isParentNotification' => $this->isParentNotification,
                'certificateType' => $this->certificate->getTypeDisplayName(),
                'periodName' => $this->certificate->academicPeriod->name,
                'downloadUrl' => route('certificates.download', $this->certificate->id),
            ]);
    }
} 