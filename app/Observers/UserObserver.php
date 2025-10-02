<?php

namespace App\Observers;

use App\Models\User;
use App\Services\TeacherStudentAssignmentService;

class UserObserver
{
    protected $assignmentService;

    public function __construct(TeacherStudentAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Handle the User "created" event.
     * Auto-enroll student in all subjects for their section.
     */
    public function created(User $user): void
    {
        if ($user->user_role === 'student' && $user->section_id) {
            $this->assignmentService->syncStudentSubjects($user);
        }
    }

    /**
     * Handle the User "updated" event.
     * Sync subjects when section changes.
     */
    public function updated(User $user): void
    {
        if ($user->user_role === 'student') {
            // Check if section changed
            if ($user->isDirty('section_id')) {
                $oldSectionId = $user->getOriginal('section_id');
                $newSectionId = $user->section_id;

                // Unenroll from old section subjects
                if ($oldSectionId) {
                    $this->assignmentService->unsyncStudentSubjects($user, $oldSectionId);
                }

                // Enroll in new section subjects
                if ($newSectionId) {
                    $this->assignmentService->syncStudentSubjects($user);
                }
            }
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
