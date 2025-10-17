<?php

namespace App\Mail;

use App\Models\User;
use App\Models\AcademicLevel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PendingHonorApprovalEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $recipient;
    public $academicLevel;
    public $schoolYear;
    public $honorCount;

    /**
     * Create a new message instance.
     */
    public function __construct(User $recipient, AcademicLevel $academicLevel, $schoolYear, $honorCount)
    {
        $this->recipient = $recipient;
        $this->academicLevel = $academicLevel;
        $this->schoolYear = $schoolYear;
        $this->honorCount = $honorCount;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pending Honor Results - ' . $this->academicLevel->name . ' - ' . $this->schoolYear,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.pending-honor-approval',
            with: [
                'recipient' => $this->recipient,
                'academicLevel' => $this->academicLevel,
                'schoolYear' => $this->schoolYear,
                'honorCount' => $this->honorCount,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
