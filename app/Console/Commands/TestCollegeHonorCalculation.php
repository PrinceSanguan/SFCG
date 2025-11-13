<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Services\CollegeHonorCalculationService;
use Illuminate\Support\Facades\DB;

class TestCollegeHonorCalculation extends Command
{
    protected $signature = 'test:college-honors
                            {school_year=2024-2025 : School year to test}
                            {--student_id= : Test specific student ID}
                            {--department_id= : Filter by department}
                            {--limit=10 : Number of students to test}';

    protected $description = 'Test college honor calculation with real data and show detailed results';

    private $collegeService;

    public function __construct(CollegeHonorCalculationService $collegeService)
    {
        parent::__construct();
        $this->collegeService = $collegeService;
    }

    public function handle()
    {
        $schoolYear = $this->argument('school_year');
        $studentId = $this->option('student_id');
        $departmentId = $this->option('department_id');
        $limit = $this->option('limit');

        $this->info('=== COLLEGE HONOR CALCULATION TEST ===');
        $this->info("School Year: {$schoolYear}");
        $this->newLine();

        // Get college academic level
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        if (!$collegeLevel) {
            $this->error('College academic level not found!');
            return 1;
        }

        $this->info("College Level ID: {$collegeLevel->id}");

        // Build student query - students are Users with user_role = 'student'
        $query = User::with(['course', 'department', 'section'])
            ->where('user_role', 'student')
            ->where('academic_level_id', $collegeLevel->id)
            ->where('enrollment_status', 'enrolled');

        if ($studentId) {
            $query->where('id', $studentId);
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $students = $query->limit($limit)->get();

        if ($students->isEmpty()) {
            $this->warn('No students found with the given criteria.');
            return 0;
        }

        $this->info("Found {$students->count()} student(s) to test");
        $this->newLine();

        $qualifiedCount = 0;
        $notQualifiedCount = 0;

        foreach ($students as $student) {
            $this->line(str_repeat('=', 80));
            $this->info("Testing Student: {$student->name}");
            $this->line("Student ID: {$student->id}");
            $this->line("Student Number: {$student->student_number}");
            $this->line("Department: " . ($student->department->name ?? 'N/A'));
            $this->line("Course: " . ($student->course->name ?? 'N/A'));
            $this->line("Year Level: {$student->specific_year_level}");
            $this->newLine();

            // Check if student has grades
            $gradesCount = DB::table('student_grades')
                ->where('student_id', $student->id)
                ->where('school_year', $schoolYear)
                ->count();

            $this->line("Grades Count: {$gradesCount}");

            if ($gradesCount === 0) {
                $this->warn('⚠️  No grades found for this student');
                $this->newLine();
                continue;
            }

            // Run honor calculation
            try {
                $result = $this->collegeService->calculateCollegeHonorQualification(
                    $student->id,
                    $collegeLevel->id,
                    $schoolYear
                );

                // Display result
                if ($result['qualified']) {
                    $qualifiedCount++;
                    $this->info('✅ QUALIFIED FOR HONORS');
                    $this->newLine();

                    $this->line('Qualification Details:');
                    $this->line("  Average GPA: " . number_format($result['average_grade'], 2));
                    $this->line("  Best Grade (Min): " . number_format($result['min_grade'], 2));
                    $this->line("  Worst Grade (Max): " . number_format($result['max_grade'] ?? 0, 2));
                    $this->line("  Total Subjects: {$result['total_subjects']}");
                    $this->line("  Total Quarters: {$result['total_quarters']}");
                    $this->newLine();

                    if (!empty($result['qualifications'])) {
                        $this->line('Honor Types Qualified For:');
                        foreach ($result['qualifications'] as $qualification) {
                            $honorName = $qualification['honor_type']['name'] ?? 'Unknown';
                            $gpa = number_format($qualification['gpa'], 2);
                            $this->line("  • {$honorName} (GPA: {$gpa})");
                        }
                    }
                } else {
                    $notQualifiedCount++;
                    $this->error('❌ NOT QUALIFIED');
                    $this->newLine();

                    $this->line('Reason: ' . $result['reason']);
                    $this->newLine();

                    $this->line('Student Statistics:');
                    $this->line("  Average GPA: " . number_format($result['average_grade'] ?? 0, 2));
                    $this->line("  Best Grade (Min): " . number_format($result['min_grade'] ?? 0, 2));
                    $this->line("  Worst Grade (Max): " . number_format($result['max_grade'] ?? 0, 2));
                    $this->line("  Total Subjects: " . ($result['total_subjects'] ?? 0));
                    $this->line("  Total Quarters: " . ($result['total_quarters'] ?? 0));
                }

                $this->newLine();

            } catch (\Exception $e) {
                $this->error('❌ ERROR during calculation');
                $this->error("Error: " . $e->getMessage());
                $this->error("File: " . $e->getFile());
                $this->error("Line: " . $e->getLine());
                $this->newLine();
            }
        }

        // Summary
        $this->line(str_repeat('=', 80));
        $this->info('=== SUMMARY ===');
        $this->line("Total Students Tested: {$students->count()}");
        $this->line("Qualified: {$qualifiedCount}");
        $this->line("Not Qualified: {$notQualifiedCount}");
        $this->newLine();

        return 0;
    }
}
