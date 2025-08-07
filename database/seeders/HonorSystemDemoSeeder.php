<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\HonorCalculationService;

class HonorSystemDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Honor System Demonstration');
        
        // Get the honor calculation service
        $honorService = new HonorCalculationService();
        
        // Generate sample honor data for demonstration
        $sampleData = $honorService->generateSampleHonorData();
        
        $this->command->info("\n=== HONOR SYSTEM DEMONSTRATION RESULTS ===\n");
        
        foreach ($sampleData as $student) {
            $certificateNote = $student['certificate_title'] ? ' 🏆 Certificate: ' . $student['certificate_title'] : '';
            
            $this->command->line(sprintf(
                "📚 %s (%s %s) - GPA: %.1f - Honor: %s%s",
                $student['student_name'],
                $student['academic_level'],
                $student['year_level'],
                $student['gpa'],
                $student['honor'],
                $certificateNote
            ));
            
            if (!empty($student['individual_grades'])) {
                $this->command->line("   Individual Grades: " . implode(', ', $student['individual_grades']));
            }
            
            $this->command->line('');
        }
        
        // Count honors
        $honorCounts = [];
        $certificateCount = 0;
        
        foreach ($sampleData as $student) {
            $honor = $student['honor'];
            $honorCounts[$honor] = ($honorCounts[$honor] ?? 0) + 1;
            
            if ($student['certificate_title']) {
                $certificateCount++;
            }
        }
        
        $this->command->info("=== HONOR DISTRIBUTION ===");
        foreach ($honorCounts as $honor => $count) {
            $this->command->line("$honor: $count students");
        }
        
        $this->command->info("\n=== CERTIFICATE SUMMARY ===");
        $this->command->line("Students eligible for certificates: $certificateCount");
        
        $this->command->info("\n=== HONOR CRITERIA ===");
        $this->command->line("📖 Basic Education (Elementary to Senior High):");
        $this->command->line("   • With Honors: GPA ≥ 90");
        $this->command->line("   • With High Honors: GPA 95-97, no grade < 90");
        $this->command->line("   • With Highest Honors: GPA 98-100, no grade < 93");
        
        $this->command->line("\n📖 College:");
        $this->command->line("   • College Honors: No grade < 87 (1st-2nd semester)");
        $this->command->line("   • Cum Laude: No grade < 87 (1st-4th year)");
        $this->command->line("   • Magna Cum Laude: No grade < 93 (1st-4th year)");
        $this->command->line("   • Summa Cum Laude: No grade < 95 (1st-4th year)");
        $this->command->line("   • Dean's List: 2nd/3rd year, GPA ≥ 92, no grade < 90");
        
        $this->command->info("\n✅ Honor system demonstration completed successfully!");
    }
}