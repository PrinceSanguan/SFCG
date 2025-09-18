<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ElementaryHonorCalculationService;
use App\Models\User;
use App\Models\AcademicLevel;

class TestElementaryHonorCalculation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:elementary-honor-calculation {student_id?} {school_year=2024-2025}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the elementary honor calculation service';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $studentId = $this->argument('student_id');
        $schoolYear = $this->argument('school_year');

        $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
        
        if (!$elementaryLevel) {
            $this->error('Elementary academic level not found!');
            return 1;
        }

        $service = new ElementaryHonorCalculationService();

        if ($studentId) {
            // Test specific student
            $student = User::find($studentId);
            if (!$student) {
                $this->error("Student with ID {$studentId} not found!");
                return 1;
            }

            $this->info("Testing honor calculation for student: {$student->name} (ID: {$student->id})");
            $this->info("School Year: {$schoolYear}");
            $this->line('');

            $result = $service->getStudentHonorCalculation($studentId, $elementaryLevel->id, $schoolYear);

            if ($result['qualified']) {
                $this->info('✅ Student QUALIFIES for honors!');
                $this->line("Average Grade: {$result['average_grade']}");
                $this->line("Min Grade: {$result['min_grade']}");
                $this->line("Total Quarters: {$result['total_quarters']}");
                $this->line("Qualified Honor Types: " . count($result['qualifications']));
                
                foreach ($result['qualifications'] as $qual) {
                    $this->line("  - {$qual['honor_type']->name} ({$qual['honor_type']->scope})");
                }
            } else {
                $this->warn('❌ Student does NOT qualify for honors');
                $this->line("Reason: {$result['reason']}");
                
                if (isset($result['average_grade'])) {
                    $this->line("Average Grade: {$result['average_grade']}");
                    $this->line("Min Grade: {$result['min_grade']}");
                    $this->line("Total Quarters: {$result['total_quarters']}");
                }
            }
        } else {
            // Test all elementary students
            $this->info("Testing honor calculation for all elementary students...");
            $this->info("School Year: {$schoolYear}");
            $this->line('');

            $result = $service->generateElementaryHonorResults($elementaryLevel->id, $schoolYear);

            if ($result['success']) {
                $this->info("✅ Honor calculation completed successfully!");
                $this->line("Total Students Processed: {$result['total_processed']}");
                $this->line("Total Students Qualified: {$result['total_qualified']}");
                
                if ($result['total_qualified'] > 0) {
                    $this->line('');
                    $this->info('Qualified Students:');
                    foreach ($result['results'] as $studentResult) {
                        $student = $studentResult['student'];
                        $qualification = $studentResult['qualification'];
                        $this->line("  - {$student->name} (ID: {$student->id}) - Average: {$qualification['average_grade']}");
                    }
                }
            } else {
                $this->error("❌ Honor calculation failed: {$result['message']}");
                return 1;
            }
        }

        return 0;
    }
}
