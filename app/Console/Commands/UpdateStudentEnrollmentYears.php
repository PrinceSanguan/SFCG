<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\StudentSubjectAssignment;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateStudentEnrollmentYears extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:update-enrollment-years {--dry-run : Preview changes without applying them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update student_subject_assignments school_year to match student section school_year';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 DRY RUN MODE - No changes will be made to the database');
            $this->newLine();
        }

        $this->info('🚀 Starting student enrollment year update...');
        $this->newLine();

        // Get all student_subject_assignments
        $assignments = StudentSubjectAssignment::with(['student.section'])->get();

        $this->info("📊 Found {$assignments->count()} total enrollment records");
        $this->newLine();

        $updated = 0;
        $skipped = 0;
        $noSection = 0;
        $noSectionSchoolYear = 0;
        $alreadyCorrect = 0;
        $errors = [];

        $progressBar = $this->output->createProgressBar($assignments->count());
        $progressBar->start();

        foreach ($assignments as $assignment) {
            $progressBar->advance();

            $student = $assignment->student;

            if (!$student) {
                $skipped++;
                $errors[] = "Assignment {$assignment->id}: Student not found";
                continue;
            }

            // Get student's section
            if (!$student->section_id || !$student->section) {
                $noSection++;
                $this->logWarning(
                    $dryRun,
                    "Assignment {$assignment->id}: Student {$student->id} ({$student->name}) has no section",
                    $assignment
                );
                continue;
            }

            $section = $student->section;
            $sectionSchoolYear = $section->school_year;

            // If section doesn't have school_year, generate one
            if (!$sectionSchoolYear) {
                $noSectionSchoolYear++;
                $sectionSchoolYear = $section->getEffectiveSchoolYear();
                $this->logWarning(
                    $dryRun,
                    "Assignment {$assignment->id}: Section {$section->id} ({$section->name}) has no school_year, using generated: {$sectionSchoolYear}",
                    $assignment
                );
            }

            // Check if update is needed
            if ($assignment->school_year === $sectionSchoolYear) {
                $alreadyCorrect++;
                continue;
            }

            // Perform update
            $oldSchoolYear = $assignment->school_year;

            if (!$dryRun) {
                try {
                    $assignment->school_year = $sectionSchoolYear;
                    $assignment->save();

                    // Log the change
                    ActivityLogService::logEnrollmentYearUpdate(
                        assignmentId: $assignment->id,
                        studentId: $student->id,
                        oldSchoolYear: $oldSchoolYear,
                        newSchoolYear: $sectionSchoolYear,
                        source: 'migration_command',
                        additionalDetails: [
                            'student_name' => $student->name,
                            'section_id' => $section->id,
                            'section_name' => $section->name,
                            'subject_id' => $assignment->subject_id,
                        ]
                    );

                    $updated++;
                } catch (\Exception $e) {
                    $errors[] = "Assignment {$assignment->id}: Failed to update - {$e->getMessage()}";
                    Log::error("Failed to update enrollment year", [
                        'assignment_id' => $assignment->id,
                        'student_id' => $student->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            } else {
                // Dry run: just count
                $updated++;
                $this->logChange(
                    $assignment->id,
                    $student->id,
                    $student->name,
                    $section->name,
                    $oldSchoolYear,
                    $sectionSchoolYear
                );
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $this->displaySummary($dryRun, $updated, $alreadyCorrect, $noSection, $noSectionSchoolYear, $skipped, $errors);

        return Command::SUCCESS;
    }

    /**
     * Log a warning message
     */
    private function logWarning(bool $dryRun, string $message, StudentSubjectAssignment $assignment)
    {
        if ($dryRun && $this->output->isVerbose()) {
            $this->warn("  ⚠️  {$message}");
        }

        Log::warning($message, [
            'assignment_id' => $assignment->id,
            'student_id' => $assignment->student_id,
            'context' => 'enrollment_year_update',
        ]);
    }

    /**
     * Log a change (for dry-run mode)
     */
    private function logChange(int $assignmentId, int $studentId, string $studentName, string $sectionName, string $oldYear, string $newYear)
    {
        if ($this->output->isVerbose()) {
            $this->line("  📝 Assignment {$assignmentId}: Student {$studentId} ({$studentName}) in section {$sectionName}");
            $this->line("     Old: {$oldYear} → New: {$newYear}");
        }
    }

    /**
     * Display summary of results
     */
    private function displaySummary(bool $dryRun, int $updated, int $alreadyCorrect, int $noSection, int $noSectionSchoolYear, int $skipped, array $errors)
    {
        $this->info('📋 Summary:');
        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        if ($dryRun) {
            $this->line("  🔍 Would update: {$updated} records");
        } else {
            $this->line("  ✅ Successfully updated: {$updated} records");
        }

        $this->line("  ✓  Already correct: {$alreadyCorrect} records");
        $this->line("  ⚠️  Students without section: {$noSection} records");
        $this->line("  ⚠️  Sections without school_year: {$noSectionSchoolYear} records");
        $this->line("  ❌ Skipped (errors): {$skipped} records");

        if (!empty($errors)) {
            $this->newLine();
            $this->error('⚠️  Errors encountered:');
            foreach (array_slice($errors, 0, 10) as $error) {
                $this->line("     {$error}");
            }
            if (count($errors) > 10) {
                $this->line("     ... and " . (count($errors) - 10) . " more errors");
            }
        }

        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        if ($dryRun) {
            $this->newLine();
            $this->info('💡 Run without --dry-run flag to apply these changes');
            $this->info('💡 Use -v flag for verbose output showing each change');
        } else {
            $this->newLine();
            $this->info('✅ Migration completed successfully!');
            $this->info('📊 Check activity_logs table for detailed change history');
        }
    }
}
