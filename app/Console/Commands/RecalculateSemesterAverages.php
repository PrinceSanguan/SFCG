<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GradeCalculationService;

class RecalculateSemesterAverages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'grades:recalculate-semester-averages 
                            {--school-year= : The school year to recalculate (e.g., 2024-2025)}
                            {--semester= : Specific semester ID to recalculate}
                            {--all : Recalculate all semesters}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate semester final averages based on midterm and prefinal grades';

    protected $gradeCalculationService;

    public function __construct(GradeCalculationService $gradeCalculationService)
    {
        parent::__construct();
        $this->gradeCalculationService = $gradeCalculationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $schoolYear = $this->option('school-year') ?? date('Y') . '-' . (date('Y') + 1);
        $semesterId = $this->option('semester');
        $all = $this->option('all');

        $this->info("Recalculating semester final averages for school year: {$schoolYear}");

        if ($semesterId) {
            $this->info("Recalculating specific semester: {$semesterId}");
            $updated = $this->gradeCalculationService->recalculateSemesterFinalAverages($semesterId, $schoolYear);
            $this->info("Updated {$updated} final average grades for semester {$semesterId}");
        } elseif ($all) {
            $this->info("Recalculating all semesters...");
            $updated = $this->gradeCalculationService->recalculateAllSemesterFinalAverages($schoolYear);
            $this->info("Updated {$updated} final average grades across all semesters");
        } else {
            $this->error("Please specify either --semester=ID or --all flag");
            return 1;
        }

        $this->info("Recalculation completed successfully!");
        return 0;
    }
}