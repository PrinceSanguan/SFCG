<?php

namespace App\Mail;

use App\Models\User;
use App\Models\HonorResult;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentHonorQualificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $parent;
    public $honorResult;
    public $schoolName;

    /**
     * Create a new message instance.
     */
    public function __construct(User $student, User $parent, HonorResult $honorResult)
    {
        $this->student = $student;
        $this->parent = $parent;
        $this->honorResult = $honorResult;
        $this->schoolName = config('app.name', 'San Francisco College Gapan');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Academic Honor Qualification - ' . $this->student->name,
            to: [$this->parent->email],
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.student-honor-qualification',
            with: [
                'studentName' => $this->student->name,
                'parentName' => $this->parent->name,
                'honorType' => $this->honorResult->honorType->name,
                'academicLevel' => $this->honorResult->academicLevel->name,
                'gpa' => $this->honorResult->gpa,
                'schoolYear' => $this->honorResult->school_year,
                'schoolName' => $this->schoolName,
                'approvalStatus' => $this->getApprovalStatusText(),
                'nextSteps' => $this->getNextStepsText(),
            ],
        );
    }

    /**
     * Get approval status text based on the honor result status.
     */
    private function getApprovalStatusText(): string
    {
        if ($this->honorResult->is_approved) {
            return 'This honor qualification has been officially approved and is now part of your child\'s academic record.';
        } elseif ($this->honorResult->is_rejected) {
            return 'This honor qualification was reviewed but not approved at this time.';
        } elseif ($this->honorResult->is_pending_approval) {
            $approver = $this->getApproverRole();
            return "This honor qualification is currently pending approval from the {$approver}. You will be notified once the review is complete.";
        }

        return 'Status unknown. Please contact the school for more information.';
    }

    /**
     * Get the appropriate approver role based on academic level.
     */
    private function getApproverRole(): string
    {
        switch ($this->honorResult->academicLevel->key) {
            case 'college':
                return 'Chairperson';
            case 'elementary':
            case 'junior_highschool':
            case 'senior_highschool':
                return 'Principal';
            default:
                return 'School Administrator';
        }
    }

    /**
     * Get next steps text based on the honor result status.
     */
    private function getNextStepsText(): string
    {
        if ($this->honorResult->is_approved) {
            return 'Please visit the school office to complete the necessary documentation and arrange for any recognition ceremonies. Bring a valid ID and this email notification.';
        } elseif ($this->honorResult->is_pending_approval) {
            return 'No action is required at this time. We will notify you once the approval process is complete.';
        } elseif ($this->honorResult->is_rejected) {
            $reason = $this->honorResult->rejection_reason ?? 'Please contact the academic office for details.';
            return "For more information about this decision: {$reason}";
        }

        return 'Please contact the school office if you have any questions or concerns.';
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}