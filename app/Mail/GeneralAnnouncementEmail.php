<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GeneralAnnouncementEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $announcementTitle;
    public $announcementMessage;
    public $recipientEmail;

    public function __construct($title, $message, $recipientEmail)
    {
        $this->announcementTitle = $title;
        $this->announcementMessage = $message;
        $this->recipientEmail = $recipientEmail;
    }

    public function envelope()
    {
        return new Envelope(
            subject: $this->announcementTitle,
            from: 'hansel.canete24@gmail.com',
        );
    }

    public function build()
    {
        return $this->view('emails.general-announcement')
                    ->with([
                        'title' => $this->announcementTitle,
                        'message' => $this->announcementMessage,
                    ]);
    }

    public function attachments()
    {
        return [];
    }
}
