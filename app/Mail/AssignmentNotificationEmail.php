<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssignmentNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $assignmentType;
    public $assignmentDetails;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $assignmentType, $assignmentDetails)
    {
        $this->user = $user;
        $this->assignmentType = $assignmentType;
        $this->assignmentDetails = $assignmentDetails;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: ucfirst($this->assignmentType) . ' Assignment Notification',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.assignment-notification',
            with: [
                'user' => $this->user,
                'assignmentType' => $this->assignmentType,
                'assignmentDetails' => $this->assignmentDetails,
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
