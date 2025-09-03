<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ParentHonorNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $parent;
    public $student;
    public $honorResult;
    public $schoolYear;

    /**
     * Create a new message instance.
     */
    public function __construct($parent, $student, $honorResult, $schoolYear)
    {
        $this->parent = $parent;
        $this->student = $student;
        $this->honorResult = $honorResult;
        $this->schoolYear = $schoolYear;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Honor Qualification Achievement - ' . $this->student->name . ' - ' . $this->schoolYear . ' - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.parent-honor-notification');
    }
}
