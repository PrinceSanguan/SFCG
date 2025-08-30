<?php

namespace App\Console\Commands;

use App\Services\CertificateGenerationService;
use Illuminate\Console\Command;

class GenerateHonorCertificates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:generate-honors 
                            {--school-year= : School year to generate certificates for (e.g., 2024-2025)}
                            {--level= : Academic level to generate certificates for (elementary, junior_highschool, senior_highschool, college)}
                            {--all : Generate certificates for all school years and levels}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate honor certificates for students who qualified for honors';

    /**
     * Execute the console command.
     */
    public function handle(CertificateGenerationService $service): int
    {
        $this->info('🎓 Starting Honor Certificate Generation...');

        if ($this->option('all')) {
            return $this->generateAllCertificates($service);
        }

        $schoolYear = $this->option('school-year');
        $level = $this->option('level');

        if (!$schoolYear) {
            $schoolYear = $this->ask('Enter school year (e.g., 2024-2025):');
        }

        if (!$level) {
            $level = $this->choice(
                'Select academic level:',
                ['elementary', 'junior_highschool', 'senior_highschool', 'college', 'all']
            );
        }

        if ($level === 'all') {
            return $this->generateForAllLevels($service, $schoolYear);
        }

        return $this->generateForSpecificLevel($service, $level, $schoolYear);
    }

    private function generateAllCertificates(CertificateGenerationService $service): int
    {
        $this->info('🔄 Generating certificates for all school years and levels...');

        // Get all unique school years from honor results
        $schoolYears = \App\Models\HonorResult::distinct()->pluck('school_year')->toArray();
        
        if (empty($schoolYears)) {
            $this->warn('No honor results found in the system.');
            return 1;
        }

        $totalSuccess = 0;
        $totalFailed = 0;

        foreach ($schoolYears as $schoolYear) {
            $this->info("\n📅 Processing school year: {$schoolYear}");
            
            $results = $service->generateCertificatesForSchoolYear($schoolYear);
            
            $totalSuccess += $results['success'];
            $totalFailed += $results['failed'];
            
            $this->displayResults($results, $schoolYear);
        }

        $this->info("\n🎉 Certificate generation completed!");
        $this->info("Total successful: {$totalSuccess}");
        $this->info("Total failed: {$totalFailed}");

        return 0;
    }

    private function generateForAllLevels(CertificateGenerationService $service, string $schoolYear): int
    {
        $this->info("🔄 Generating certificates for all levels in school year: {$schoolYear}");

        $levels = ['elementary', 'junior_highschool', 'senior_highschool', 'college'];
        $totalSuccess = 0;
        $totalFailed = 0;

        foreach ($levels as $level) {
            $this->info("\n📚 Processing level: {$level}");
            
            $results = $service->generateCertificatesForLevel($level, $schoolYear);
            
            $totalSuccess += $results['success'];
            $totalFailed += $results['failed'];
            
            $this->displayResults($results, $level);
        }

        $this->info("\n🎉 Certificate generation completed for all levels!");
        $this->info("Total successful: {$totalSuccess}");
        $this->info("Total failed: {$totalFailed}");

        return 0;
    }

    private function generateForSpecificLevel(CertificateGenerationService $service, string $level, string $schoolYear): int
    {
        $this->info("🔄 Generating certificates for {$level} level in school year: {$schoolYear}");

        $results = $service->generateCertificatesForLevel($level, $schoolYear);
        
        $this->displayResults($results, $level);

        if ($results['success'] > 0) {
            $this->info("🎉 Successfully generated {$results['success']} certificates!");
        }

        if ($results['failed'] > 0) {
            $this->warn("⚠️  Failed to generate {$results['failed']} certificates.");
        }

        return $results['failed'] === 0 ? 0 : 1;
    }

    private function displayResults(array $results, string $context): void
    {
        $this->info("📊 Results for {$context}:");
        $this->info("  ✅ Successful: {$results['success']}");
        $this->info("  ❌ Failed: {$results['failed']}");
        
        if (!empty($results['errors'])) {
            $this->warn("  ⚠️  Errors encountered:");
            foreach ($results['errors'] as $error) {
                $this->warn("     Student {$error['student_id']}: {$error['error']}");
            }
        }
    }
}

