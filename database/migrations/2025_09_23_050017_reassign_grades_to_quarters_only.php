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
        // Get only quarter periods for college level, excluding finals and calculated periods
        $quarterPeriods = DB::table('grading_periods')
            ->join('academic_levels', 'grading_periods.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->where('grading_periods.is_active', true)
            ->where('grading_periods.is_calculated', false)
            ->whereNotIn('grading_periods.period_type', ['final', 'calculated'])
            ->whereIn('grading_periods.period_type', ['quarter', 'midterm', 'prefinal'])
            ->orderBy('grading_periods.sort_order')
            ->get(['grading_periods.id', 'grading_periods.name', 'grading_periods.code', 'grading_periods.period_type', 'grading_periods.sort_order']);

        if ($quarterPeriods->isEmpty()) {
            echo "No quarter grading periods found. Skipping grade reassignment.\n";
            return;
        }

        echo "Found " . $quarterPeriods->count() . " quarter grading periods:\n";
        foreach ($quarterPeriods as $period) {
            echo "- {$period->id}: {$period->name} ({$period->code}) - {$period->period_type}\n";
        }

        // Get all student grades for college level
        $collegeGrades = DB::table('student_grades')
            ->join('subjects', 'student_grades.subject_id', '=', 'subjects.id')
            ->join('academic_levels', 'subjects.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->where('student_grades.school_year', '2024-2025')
            ->orderBy('student_grades.student_id')
            ->orderBy('student_grades.subject_id')
            ->orderBy('student_grades.created_at')
            ->get(['student_grades.id', 'student_grades.student_id', 'student_grades.subject_id', 'student_grades.grade', 'student_grades.created_at', 'student_grades.grading_period_id']);

        echo "\nFound " . $collegeGrades->count() . " college grades to reassign\n";

        if ($collegeGrades->isEmpty()) {
            echo "No grades to update.\n";
            return;
        }

        // Group grades by student and subject
        $groupedGrades = $collegeGrades->groupBy(function ($grade) {
            return $grade->student_id . '_' . $grade->subject_id;
        });

        $updatedCount = 0;

        foreach ($groupedGrades as $groupKey => $grades) {
            $gradesArray = $grades->toArray();
            $gradeCount = count($gradesArray);
            
            echo "\nStudent {$gradesArray[0]->student_id}, Subject {$gradesArray[0]->subject_id}: {$gradeCount} grades\n";
            
            // Only use the first N quarter periods based on number of grades
            $periodsToUse = $quarterPeriods->take($gradeCount);
            
            foreach ($gradesArray as $index => $grade) {
                if ($index < $periodsToUse->count()) {
                    $period = $periodsToUse->values()[$index];
                    
                    DB::table('student_grades')
                        ->where('id', $grade->id)
                        ->update(['grading_period_id' => $period->id]);
                    
                    echo "  - Grade {$grade->id} (grade: {$grade->grade}) reassigned to {$period->name} ({$period->code})\n";
                    $updatedCount++;
                }
            }
        }

        echo "\nReassigned {$updatedCount} grades to quarter periods only.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "This migration cannot be safely reversed as it would remove grading period assignments.\n";
        echo "If you need to reverse this, you would need to manually set grading_period_id to null for the affected grades.\n";
    }
};