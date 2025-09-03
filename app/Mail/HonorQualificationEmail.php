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

class HonorQualificationEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $honorResult;
    public $schoolYear;

    public function __construct(User $user, HonorResult $honorResult, $schoolYear)
    {
        $this->user = $user;
        $this->honorResult = $honorResult;
        $this->schoolYear = $schoolYear;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Honor Qualification Achievement - ' . $this->schoolYear,
            from: config('mail.from.address'),
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.honor-qualification',
        );
    }

    public function attachments()
    {
        return [];
    }
}
