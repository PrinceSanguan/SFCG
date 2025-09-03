<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\StudentGrade;

class GradeUpdateEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $grades;
    public $schoolYear;
    public $academicLevel;

    public function __construct(User $user, $grades, $schoolYear, $academicLevel)
    {
        $this->user = $user;
        $this->grades = $grades;
        $this->schoolYear = $schoolYear;
        $this->academicLevel = $academicLevel;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Grade Update Notification - ' . $this->schoolYear,
            from: 'hansel.canete24@gmail.com',
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.grade-update',
        );
    }

    public function attachments()
    {
        return [];
    }
}
