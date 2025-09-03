<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\HonorResult;

class ParentHonorNotificationEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $parent;
    public $student;
    public $honorResult;
    public $schoolYear;

    public function __construct(User $parent, User $student, HonorResult $honorResult, $schoolYear)
    {
        $this->parent = $parent;
        $this->student = $student;
        $this->honorResult = $honorResult;
        $this->schoolYear = $schoolYear;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Honor Qualification Achievement - ' . $this->student->name . ' - ' . $this->schoolYear,
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.parent-honor-notification',
        );
    }

    public function attachments()
    {
        return [];
    }
}
