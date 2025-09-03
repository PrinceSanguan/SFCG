<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HonorQualificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $honorResult;
    public $schoolYear;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $honorResult, $schoolYear)
    {
        $this->user = $user;
        $this->honorResult = $honorResult;
        $this->schoolYear = $schoolYear;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Honor Qualification Achievement - ' . $this->schoolYear . ' - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.honor-qualification');
    }
}
