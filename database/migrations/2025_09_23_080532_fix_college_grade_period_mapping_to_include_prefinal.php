<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Load the specific period ids for College by code
        $codes = ['P1', 'Q1', 'S2-MT', 'S2-PF'];
        $periods = DB::table('grading_periods')
            ->join('academic_levels', 'grading_periods.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->whereIn(DB::raw('UPPER(grading_periods.code)'), $codes)
            ->select('grading_periods.id', DB::raw('UPPER(grading_periods.code) as code_upper'))
            ->pluck('grading_periods.id', 'code_upper');

        foreach ($codes as $c) {
            if (!isset($periods[$c])) {
                echo "Missing grading period code {$c} for college. Aborting.\n";
                return;
            }
        }

        // Fetch grades grouped by student+subject for current SY
        $grades = DB::table('student_grades')
            ->join('subjects', 'student_grades.subject_id', '=', 'subjects.id')
            ->join('academic_levels', 'subjects.academic_level_id', '=', 'academic_levels.id')
            ->where('academic_levels.key', 'college')
            ->where('student_grades.school_year', '2024-2025')
            ->orderBy('student_grades.student_id')
            ->orderBy('student_grades.subject_id')
            ->orderBy('student_grades.created_at')
            ->get([
                'student_grades.id',
                'student_grades.student_id',
                'student_grades.subject_id',
                'student_grades.grade',
                'student_grades.grading_period_id',
                'student_grades.created_at',
            ])
            ->groupBy(function ($g) {
                return $g->student_id . '_' . $g->subject_id;
            });

        $updated = 0;
        $inserted = 0;

        foreach ($grades as $key => $rows) {
            $rows = $rows->values();

            // Map existing rows by target slot index
            // Ensure deterministic mapping: first->P1, second->Q1, third->S2-MT, fourth->S2-PF
            for ($i = 0; $i < min(4, $rows->count()); $i++) {
                $targetCode = $codes[$i];
                $targetPeriodId = $periods[$targetCode];
                $row = $rows[$i];
                if ($row->grading_period_id !== $targetPeriodId) {
                    DB::table('student_grades')->where('id', $row->id)->update(['grading_period_id' => $targetPeriodId]);
                    $updated++;
                }
            }

            // If exactly three rows, create missing Pre-Final (S2-PF) as empty placeholder (NULL grade)
            if ($rows->count() === 3) {
                $last = $rows[2];
                DB::table('student_grades')->insert([
                    'student_id' => $last->student_id,
                    'subject_id' => $last->subject_id,
                    'grade' => null,
                    'grading_period_id' => $periods['S2-PF'],
                    'school_year' => '2024-2025',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $inserted++;
            }
        }

        echo "Updated {$updated} rows and inserted {$inserted} Pre-Final placeholders.\n";
    }

    public function down(): void
    {
        // Not easily reversible
        echo "This migration is not reversible.\n";
    }
};
