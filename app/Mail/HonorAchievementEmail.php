<?php

namespace App\Mail;

use App\Models\User;
use App\Models\StudentHonor;
use App\Models\AcademicPeriod;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HonorAchievementEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $student;
    public $honor;
    public $period;
    public $isParentNotification;

    /**
     * Create a new message instance.
     */
    public function __construct(User $student, StudentHonor $honor, AcademicPeriod $period, bool $isParentNotification = false)
    {
        $this->student = $student;
        $this->honor = $honor;
        $this->period = $period;
        $this->isParentNotification = $isParentNotification;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->isParentNotification 
            ? "Student Honor Achievement - {$this->student->name}"
            : "Congratulations on Your Honor Achievement!";

        return $this->subject($subject)
            ->view('emails.honor-achievement')
            ->with([
                'student' => $this->student,
                'honor' => $this->honor,
                'period' => $this->period,
                'isParentNotification' => $this->isParentNotification,
                'honorDisplayName' => $this->honor->getHonorDisplayName(),
                'gpa' => number_format($this->honor->gpa, 2),
                'schoolYear' => $this->period->school_year,
                'periodName' => $this->period->name,
            ]);
    }
} 