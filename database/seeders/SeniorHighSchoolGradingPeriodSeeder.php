<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;

class SeniorHighSchoolGradingPeriodSeeder extends Seeder
{
    public function run(): void
    {
        // Get Senior High School academic level
        $shs = AcademicLevel::where('key', 'senior_highschool')->first();

        if (!$shs) {
            $this->command->error('Senior High School academic level not found!');
            return;
        }

        // Check if grading periods already exist
        $existingCount = GradingPeriod::where('academic_level_id', $shs->id)->count();
        if ($existingCount > 0) {
            $this->command->warn('Senior High School grading periods already exist. Skipping...');
            return;
        }

        $this->command->info('Creating Senior High School grading periods...');

        // First Semester
        $firstSemester = GradingPeriod::create([
            'name' => 'First Semester',
            'code' => 'SHS_S1',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $shs->id,
            'parent_id' => null,
            'semester_number' => 1,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => '2025-08-01',
            'end_date' => '2026-01-31',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // First Semester - Midterm
        GradingPeriod::create([
            'name' => 'Midterm',
            'code' => 'SHS_S1_MT',
            'type' => 'quarter',
            'period_type' => 'midterm',
            'academic_level_id' => $shs->id,
            'parent_id' => $firstSemester->id,
            'semester_number' => null,
            'weight' => 0.50,
            'is_calculated' => false,
            'start_date' => '2025-08-01',
            'end_date' => '2025-10-31',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // First Semester - Pre-Final
        GradingPeriod::create([
            'name' => 'Pre-Final',
            'code' => 'SHS_S1_PF',
            'type' => 'quarter',
            'period_type' => 'prefinal',
            'academic_level_id' => $shs->id,
            'parent_id' => $firstSemester->id,
            'semester_number' => null,
            'weight' => 0.50,
            'is_calculated' => false,
            'start_date' => '2025-11-01',
            'end_date' => '2025-12-31',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // First Semester - Final Average
        GradingPeriod::create([
            'name' => 'Final Average',
            'code' => 'SHS_S1_FA',
            'type' => 'quarter',
            'period_type' => 'final',
            'academic_level_id' => $shs->id,
            'parent_id' => $firstSemester->id,
            'semester_number' => null,
            'weight' => 1.00,
            'is_calculated' => true,
            'start_date' => '2026-01-31',
            'end_date' => '2026-01-31',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // Second Semester
        $secondSemester = GradingPeriod::create([
            'name' => 'Second Semester',
            'code' => 'SHS_S2',
            'type' => 'semester',
            'period_type' => 'quarter',
            'academic_level_id' => $shs->id,
            'parent_id' => null,
            'semester_number' => 2,
            'weight' => 1.00,
            'is_calculated' => false,
            'start_date' => '2026-02-01',
            'end_date' => '2026-07-31',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Second Semester - Midterm
        GradingPeriod::create([
            'name' => 'Midterm',
            'code' => 'SHS_S2_MT',
            'type' => 'quarter',
            'period_type' => 'midterm',
            'academic_level_id' => $shs->id,
            'parent_id' => $secondSemester->id,
            'semester_number' => null,
            'weight' => 0.50,
            'is_calculated' => false,
            'start_date' => '2026-02-01',
            'end_date' => '2026-04-30',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Second Semester - Pre-Final
        GradingPeriod::create([
            'name' => 'Pre-Final',
            'code' => 'SHS_S2_PF',
            'type' => 'quarter',
            'period_type' => 'prefinal',
            'academic_level_id' => $shs->id,
            'parent_id' => $secondSemester->id,
            'semester_number' => null,
            'weight' => 0.50,
            'is_calculated' => false,
            'start_date' => '2026-05-01',
            'end_date' => '2026-07-31',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Second Semester - Final Average
        GradingPeriod::create([
            'name' => 'Final Average',
            'code' => 'SHS_S2_FA',
            'type' => 'quarter',
            'period_type' => 'final',
            'academic_level_id' => $shs->id,
            'parent_id' => $secondSemester->id,
            'semester_number' => null,
            'weight' => 1.00,
            'is_calculated' => true,
            'start_date' => '2026-07-31',
            'end_date' => '2026-07-31',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $this->command->info('✅ Successfully created Senior High School grading periods!');
        $this->command->info('   - First Semester (SHS_S1) with Midterm, Pre-Final, and Final Average');
        $this->command->info('   - Second Semester (SHS_S2) with Midterm, Pre-Final, and Final Average');
    }
}