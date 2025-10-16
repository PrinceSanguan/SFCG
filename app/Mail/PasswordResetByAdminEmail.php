<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetByAdminEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $newPassword;
    public $resetBy;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $newPassword, $resetBy = null)
    {
        $this->user = $user;
        $this->newPassword = $newPassword;
        $this->resetBy = $resetBy;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = 'Your Password Has Been Reset - ' . config('app.name');

        return $this->subject($subject)
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.password-reset-by-admin');
    }
}
