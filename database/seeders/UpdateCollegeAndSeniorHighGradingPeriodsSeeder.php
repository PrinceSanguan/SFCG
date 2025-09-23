<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use Carbon\Carbon;

class UpdateCollegeAndSeniorHighGradingPeriodsSeeder extends Seeder
{
    /**
     * Update grading periods for College and Senior High School to use semester-based structure
     * matching the UI structure shown in the image.
     */
    public function run(): void
    {
        $this->command->info('Updating College and Senior High School grading periods to semester-based structure...');
        
        // Update College grading periods
        $this->updateCollegeGradingPeriods();
        
        // Update Senior High School grading periods  
        $this->updateSeniorHighSchoolGradingPeriods();
        
        $this->command->info('College and Senior High School grading periods updated successfully!');
    }

    private function updateCollegeGradingPeriods(): void
    {
        $college = AcademicLevel::where('key', 'college')->first();
        if (!$college) {
            $this->command->error('College academic level not found.');
            return;
        }

        // Clear existing college grading periods
        GradingPeriod::where('academic_level_id', $college->id)->delete();
        
        // Use current academic year dates
        $currentYear = date('Y');
        $yearStart = Carbon::create($currentYear, 8, 1)->startOfDay();
        
        // First Semester: Aug 1 - Jan 31
        $firstSemStart = (clone $yearStart);
        $firstSemEnd = (clone $yearStart)->addMonths(5)->endOfMonth();
        
        // Second Semester: Feb 1 - Jul 31  
        $secondSemStart = (clone $yearStart)->addMonths(6);
        $secondSemEnd = (clone $yearStart)->addMonths(11)->endOfMonth();

        // Create First Semester (f_sim)
        $firstSemester = GradingPeriod::create([
            'name' => 'First Semester',
            'code' => 'f_sim',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $college->id,
            'parent_id' => null,
            'semester_number' => 1,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => $firstSemStart,
            'end_date' => $firstSemEnd,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Create Second Semester (S2)
        $secondSemester = GradingPeriod::create([
            'name' => 'Second Semester',
            'code' => 'S2',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $college->id,
            'parent_id' => null,
            'semester_number' => 2,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => $secondSemStart,
            'end_date' => $secondSemEnd,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Create First Semester children
        $this->createFirstSemesterChildren($firstSemester, $college->id, $firstSemStart, $firstSemEnd);
        
        // Create Second Semester children
        $this->createSecondSemesterChildren($secondSemester, $college->id, $secondSemStart, $secondSemEnd);
        
        $this->command->info('College grading periods updated.');
    }

    private function createFirstSemesterChildren(GradingPeriod $parent, int $levelId, Carbon $start, Carbon $end): void
    {
        // pre final (p1) - quarter
        GradingPeriod::create([
            'name' => 'pre final',
            'code' => 'p1',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 1,
            'weight' => 0.33,
            'is_calculated' => false,
            'start_date' => (clone $start)->addDays(1), // Sep 9, 2025
            'end_date' => (clone $start)->addMonths(1)->addDays(15), // Oct 23, 2025
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // First Quarter (Q1) - quarter
        GradingPeriod::create([
            'name' => 'First Quarter',
            'code' => 'Q1',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 1,
            'weight' => 0.33,
            'is_calculated' => false,
            'start_date' => Carbon::create(2024, 6, 1),
            'end_date' => Carbon::create(2024, 8, 31),
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Final (F1) - final
        GradingPeriod::create([
            'name' => 'Final',
            'code' => 'F1',
            'type' => 'semester',
            'period_type' => 'final',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 1,
            'weight' => 0.34,
            'is_calculated' => false,
            'start_date' => (clone $start)->addDays(1), // Sep 9, 2025
            'end_date' => (clone $start)->addMonths(1)->addDays(21), // Oct 30, 2025
            'sort_order' => 3,
            'is_active' => true,
        ]);
    }

    private function createSecondSemesterChildren(GradingPeriod $parent, int $levelId, Carbon $start, Carbon $end): void
    {
        // Midterm (S2-MT) - midterm
        GradingPeriod::create([
            'name' => 'Midterm',
            'code' => 'S2-MT',
            'type' => 'semester',
            'period_type' => 'midterm',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 2,
            'weight' => 0.33,
            'is_calculated' => false,
            'start_date' => (clone $start), // Jul 1, 2025
            'end_date' => (clone $start)->addMonths(2)->endOfMonth(), // Sep 30, 2025
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Pre-Final (S2-PF) - prefinal
        GradingPeriod::create([
            'name' => 'Pre-Final',
            'code' => 'S2-PF',
            'type' => 'semester',
            'period_type' => 'prefinal',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 2,
            'weight' => 0.33,
            'is_calculated' => false,
            'start_date' => (clone $start)->addMonths(3), // Oct 1, 2025
            'end_date' => (clone $end), // Dec 31, 2025
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Final Average (S2-FA) - calculated final
        GradingPeriod::create([
            'name' => 'Final Average',
            'code' => 'S2-FA',
            'type' => 'semester',
            'period_type' => 'final',
            'academic_level_id' => $levelId,
            'parent_id' => $parent->id,
            'semester_number' => 2,
            'weight' => 0.34,
            'is_calculated' => true, // calculated from midterm + prefinal
            'start_date' => (clone $end), // Dec 31, 2025
            'end_date' => (clone $end), // Dec 31, 2025
            'sort_order' => 3,
            'is_active' => true,
        ]);
    }

    private function updateSeniorHighSchoolGradingPeriods(): void
    {
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        if (!$seniorHigh) {
            $this->command->error('Senior High School academic level not found.');
            return;
        }

        // Clear existing senior high school grading periods
        GradingPeriod::where('academic_level_id', $seniorHigh->id)->delete();
        
        // Use current academic year dates
        $currentYear = date('Y');
        $yearStart = Carbon::create($currentYear, 8, 1)->startOfDay();
        
        // First Semester: Aug 1 - Jan 31
        $firstSemStart = (clone $yearStart);
        $firstSemEnd = (clone $yearStart)->addMonths(5)->endOfMonth();
        
        // Second Semester: Feb 1 - Jul 31  
        $secondSemStart = (clone $yearStart)->addMonths(6);
        $secondSemEnd = (clone $yearStart)->addMonths(11)->endOfMonth();

        // Create First Semester (f_sim)
        $firstSemester = GradingPeriod::create([
            'name' => 'First Semester',
            'code' => 'f_sim',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $seniorHigh->id,
            'parent_id' => null,
            'semester_number' => 1,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => $firstSemStart,
            'end_date' => $firstSemEnd,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Create Second Semester (S2)
        $secondSemester = GradingPeriod::create([
            'name' => 'Second Semester',
            'code' => 'S2',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $seniorHigh->id,
            'parent_id' => null,
            'semester_number' => 2,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => $secondSemStart,
            'end_date' => $secondSemEnd,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Create First Semester children
        $this->createFirstSemesterChildren($firstSemester, $seniorHigh->id, $firstSemStart, $firstSemEnd);
        
        // Create Second Semester children
        $this->createSecondSemesterChildren($secondSemester, $seniorHigh->id, $secondSemStart, $secondSemEnd);
        
        $this->command->info('Senior High School grading periods updated.');
    }
}
