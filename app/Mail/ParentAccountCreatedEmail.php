<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;

class ParentAccountCreatedEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * The parent user instance.
     */
    public User $parent;

    /**
     * The plaintext password to show once.
     */
    public string $plainPassword;

    public function __construct(User $parent, string $plainPassword)
    {
        $this->parent = $parent;
        $this->plainPassword = $plainPassword;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Your Parent Account Has Been Created',
            from: new Address(
                config('mail.from.address', 'no-reply@sfcg.psanguan.com'),
                config('app.name', 'SFCG')
            ),
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.parent-account-created',
        );
    }

    public function attachments()
    {
        return [];
    }
}


