<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeacherSubjectAssignment;
use App\Models\User;
use App\Models\StudentSubjectAssignment;
use Illuminate\Support\Facades\Log;

class SyncTeacherStudentAssignments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:teacher-students {--school-year=2024-2025} {--level=senior_highschool}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync students for existing teacher assignments (auto-enroll students in subjects)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $schoolYear = $this->option('school-year');
        $level = $this->option('level');

        $this->info("Starting sync for {$level} - School Year: {$schoolYear}");

        // Get academic level ID
        $academicLevelMap = [
            'elementary' => 1,
            'junior_highschool' => 2,
            'senior_highschool' => 3,
            'college' => 4,
        ];

        if (!isset($academicLevelMap[$level])) {
            $this->error("Invalid level: {$level}. Use: elementary, junior_highschool, senior_highschool, or college");
            return 1;
        }

        $academicLevelId = $academicLevelMap[$level];

        // Get all teacher assignments for this level
        $assignments = TeacherSubjectAssignment::where('school_year', $schoolYear)
            ->where('academic_level_id', $academicLevelId)
            ->with('subject', 'teacher')
            ->get();

        $this->info("Found {$assignments->count()} teacher assignments to process");

        $totalEnrolled = 0;
        $processedAssignments = 0;

        $bar = $this->output->createProgressBar($assignments->count());
        $bar->start();

        foreach ($assignments as $assignment) {
            if (!$assignment->subject) {
                $bar->advance();
                continue;
            }

            $this->line("\n\nProcessing: {$assignment->teacher->name} - {$assignment->subject->name}");

            $enrolled = $this->enrollStudentsInSubject(
                $assignment->subject,
                $schoolYear,
                [
                    'grade_level' => $assignment->grade_level,
                    'strand_id' => $assignment->strand_id,
                    'track_id' => $assignment->track_id,
                    'department_id' => $assignment->department_id,
                    'course_id' => $assignment->course_id,
                ]
            );

            $totalEnrolled += $enrolled;
            $processedAssignments++;

            $this->info("  → Enrolled {$enrolled} student(s)");

            $bar->advance();
        }

        $bar->finish();

        $this->newLine(2);
        $this->info("✓ Sync completed!");
        $this->info("  - Processed assignments: {$processedAssignments}");
        $this->info("  - Total students enrolled: {$totalEnrolled}");

        return 0;
    }

    /**
     * Enroll students in a subject
     */
    private function enrollStudentsInSubject($subject, string $schoolYear, array $criteria = []): int
    {
        $enrolledCount = 0;

        // Get academic level
        $academicLevel = \App\Models\AcademicLevel::find($subject->academic_level_id);
        if (!$academicLevel) {
            $this->warn("  ⚠ Academic level not found for subject {$subject->id}");
            return 0;
        }

        // Build student query
        $studentsQuery = User::where('user_role', 'student')
            ->where('year_level', $academicLevel->key);

        $this->line("  Finding students with:");
        $this->line("    - year_level: {$academicLevel->key}");

        // Apply filters
        if ($subject->section_id) {
            $studentsQuery->where('section_id', $subject->section_id);
            $this->line("    - section_id: {$subject->section_id}");
        }

        if (isset($criteria['grade_level']) && $criteria['grade_level']) {
            $studentsQuery->where('specific_year_level', $criteria['grade_level']);
            $this->line("    - grade_level: {$criteria['grade_level']}");
        }

        if (isset($criteria['strand_id']) && $criteria['strand_id']) {
            $studentsQuery->where('strand_id', $criteria['strand_id']);
            $this->line("    - strand_id: {$criteria['strand_id']}");
        }

        // Note: track_id is on subjects/assignments, not students - students only have strand_id

        if (isset($criteria['department_id']) && $criteria['department_id']) {
            $studentsQuery->where('department_id', $criteria['department_id']);
            $this->line("    - department_id: {$criteria['department_id']}");
        }

        if (isset($criteria['course_id']) && $criteria['course_id']) {
            $studentsQuery->where('course_id', $criteria['course_id']);
            $this->line("    - course_id: {$criteria['course_id']}");
        }

        $students = $studentsQuery->get();
        $this->line("  Found {$students->count()} matching student(s)");

        foreach ($students as $student) {
            // Check if already enrolled
            $existingAssignment = StudentSubjectAssignment::where([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $schoolYear,
            ])->first();

            if ($existingAssignment) {
                if (!$existingAssignment->is_active) {
                    $existingAssignment->update(['is_active' => true]);
                    $this->line("    ↻ Reactivated: {$student->name}");
                }
                $enrolledCount++;
                continue;
            }

            // Create new enrollment
            StudentSubjectAssignment::create([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'school_year' => $schoolYear,
                'is_active' => true,
                'enrolled_by' => 1, // System/Admin
            ]);

            $this->line("    ✓ Enrolled: {$student->name}");
            $enrolledCount++;
        }

        return $enrolledCount;
    }
}
