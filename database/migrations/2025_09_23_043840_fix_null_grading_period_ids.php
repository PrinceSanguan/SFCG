<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all grading periods for college level, ordered by sort_order
        $collegePeriods = DB::table('grading_periods')
            ->join('academic_levels', 'grading_periods.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->where('grading_periods.is_active', true)
            ->orderBy('grading_periods.sort_order')
            ->get(['grading_periods.id', 'grading_periods.name', 'grading_periods.code', 'grading_periods.period_type']);

        if ($collegePeriods->isEmpty()) {
            echo "No college grading periods found. Skipping grade assignment.\n";
            return;
        }

        echo "Found " . $collegePeriods->count() . " college grading periods:\n";
        foreach ($collegePeriods as $period) {
            echo "- {$period->id}: {$period->name} ({$period->code}) - {$period->period_type}\n";
        }

        // Get all student grades with null grading_period_id for college level
        $nullGrades = DB::table('student_grades')
            ->join('subjects', 'student_grades.subject_id', '=', 'subjects.id')
            ->join('academic_levels', 'subjects.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->whereNull('student_grades.grading_period_id')
            ->where('student_grades.school_year', '2024-2025')
            ->orderBy('student_grades.student_id')
            ->orderBy('student_grades.subject_id')
            ->orderBy('student_grades.created_at')
            ->get(['student_grades.id', 'student_grades.student_id', 'student_grades.subject_id', 'student_grades.grade', 'student_grades.created_at']);

        echo "\nFound " . $nullGrades->count() . " grades with null grading_period_id\n";

        if ($nullGrades->isEmpty()) {
            echo "No grades to update.\n";
            return;
        }

        // Group grades by student and subject
        $groupedGrades = $nullGrades->groupBy(function ($grade) {
            return $grade->student_id . '_' . $grade->subject_id;
        });

        $updatedCount = 0;

        foreach ($groupedGrades as $groupKey => $grades) {
            $gradesArray = $grades->toArray();
            $gradeCount = count($gradesArray);
            
            echo "\nStudent {$gradesArray[0]->student_id}, Subject {$gradesArray[0]->subject_id}: {$gradeCount} grades\n";
            
            // Assign periods based on the number of grades and available periods
            $periodsToUse = $collegePeriods->take($gradeCount);
            
            foreach ($gradesArray as $index => $grade) {
                if ($index < $periodsToUse->count()) {
                    $period = $periodsToUse->values()[$index];
                    
                    DB::table('student_grades')
                        ->where('id', $grade->id)
                        ->update(['grading_period_id' => $period->id]);
                    
                    echo "  - Grade {$grade->id} (grade: {$grade->grade}) assigned to {$period->name} ({$period->code})\n";
                    $updatedCount++;
                }
            }
        }

        echo "\nUpdated {$updatedCount} grades with grading period assignments.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Set grading_period_id back to null for grades that were updated
        // This is a destructive operation, so we'll just log it
        echo "This migration cannot be safely reversed as it would remove grading period assignments.\n";
        echo "If you need to reverse this, you would need to manually set grading_period_id to null for the affected grades.\n";
    }
};