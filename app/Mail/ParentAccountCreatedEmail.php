<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ParentAccountCreatedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $parent;
    public $plainPassword;

    /**
     * Create a new message instance.
     */
    public function __construct($parent, $plainPassword)
    {
        $this->parent = $parent;
        $this->plainPassword = $plainPassword;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Parent Account Has Been Created - ' . config('app.name'))
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->view('emails.parent-account-created');
    }
}


