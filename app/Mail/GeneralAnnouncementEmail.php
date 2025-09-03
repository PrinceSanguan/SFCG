<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GeneralAnnouncementEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $announcementTitle;
    public $announcementMessage;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($title, $message, $recipientEmail)
    {
        $this->announcementTitle = $title;
        $this->announcementMessage = $message;
        $this->recipientEmail = $recipientEmail;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->announcementTitle . ' - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.general-announcement')
            ->with([
                'title' => $this->announcementTitle,
                'message' => $this->announcementMessage,
            ]);
    }
}
