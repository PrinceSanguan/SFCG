<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GradeUpdateEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $grades;
    public $schoolYear;
    public $academicLevel;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $grades, $schoolYear, $academicLevel)
    {
        $this->user = $user;
        $this->grades = $grades;
        $this->schoolYear = $schoolYear;
        $this->academicLevel = $academicLevel;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Grade Update Notification - ' . $this->schoolYear . ' - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.grade-update');
    }
}
