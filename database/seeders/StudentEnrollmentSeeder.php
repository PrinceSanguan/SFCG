<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\StudentSubjectAssignment;
use App\Models\InstructorSubjectAssignment;

class StudentEnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Student Enrollments...');

        // Get students
        $students = User::where('user_role', 'student')->take(20)->get();
        
        if ($students->isEmpty()) {
            $this->command->error('No students found. Please run UserSeeder first.');
            return;
        }

        // Get instructor assignments
        $instructorAssignments = InstructorSubjectAssignment::where('is_active', true)
            ->where('school_year', '2024-2025')
            ->get();

        if ($instructorAssignments->isEmpty()) {
            $this->command->error('No instructor assignments found. Please run InstructorAssignmentSeeder first.');
            return;
        }

        $schoolYear = '2024-2025';
        $adminUser = User::where('user_role', 'admin')->first();

        if (!$adminUser) {
            $this->command->error('No admin user found for enrollment creation.');
            return;
        }

        $enrollmentCount = 0;

        foreach ($instructorAssignments as $assignment) {
            // Get 3-8 students for each subject
            $studentsForSubject = $students->random(rand(3, 8));
            
            foreach ($studentsForSubject as $student) {
                // Check if student is already enrolled in this subject
                $existingEnrollment = StudentSubjectAssignment::where([
                    'student_id' => $student->id,
                    'subject_id' => $assignment->subject_id,
                    'school_year' => $schoolYear,
                ])->first();

                if (!$existingEnrollment) {
                    StudentSubjectAssignment::create([
                        'student_id' => $student->id,
                        'subject_id' => $assignment->subject_id,
                        'school_year' => $schoolYear,
                        'semester' => '1st',
                        'is_active' => true,
                        'enrolled_by' => $adminUser->id,
                        'notes' => 'Auto-enrolled for testing purposes',
                    ]);

                    $enrollmentCount++;
                    $this->command->info("Enrolled student '{$student->name}' in subject '{$assignment->subject->name}'");
                }
            }
        }

        $this->command->info("Student enrollment completed successfully! Created {$enrollmentCount} enrollments.");
    }
}
