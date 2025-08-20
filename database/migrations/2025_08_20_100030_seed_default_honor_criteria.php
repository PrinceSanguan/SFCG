<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $levels = DB::table('academic_levels')->pluck('id', 'key');
        $types = DB::table('honor_types')->pluck('id', 'key');

        $basicLevels = ['elementary', 'junior_highschool', 'senior_highschool'];

        foreach ($basicLevels as $key) {
            if (!isset($levels[$key])) continue;
            $levelId = $levels[$key];
            // With Honors – GPA ≥ 90
            if (isset($types['with_honors'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $levelId,
                    'honor_type_id' => $types['with_honors'],
                ], [
                    'min_gpa' => 90,
                    'max_gpa' => null,
                    'min_grade' => null,
                    'min_grade_all' => null,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // With High Honors – GPA 95–97, no grade below 90
            if (isset($types['with_high_honors'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $levelId,
                    'honor_type_id' => $types['with_high_honors'],
                ], [
                    'min_gpa' => 95,
                    'max_gpa' => 97,
                    'min_grade' => 90,
                    'min_grade_all' => 90,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // With Highest Honors – GPA 98–100, no grade below 93
            if (isset($types['with_highest_honors'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $levelId,
                    'honor_type_id' => $types['with_highest_honors'],
                ], [
                    'min_gpa' => 98,
                    'max_gpa' => 100,
                    'min_grade' => 93,
                    'min_grade_all' => 93,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // College
        if (isset($levels['college'])) {
            $collegeId = $levels['college'];
            // Dean's List – GPA ≥ 92, no grade below 90, 2nd & 3rd year only, consistent honor standing
            if (isset($types['deans_list'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $collegeId,
                    'honor_type_id' => $types['deans_list'],
                ], [
                    'min_gpa' => 92,
                    'min_grade' => 90,
                    'min_grade_all' => 90,
                    'min_year' => 2,
                    'max_year' => 3,
                    'require_consistent_honor' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // College Honors – No grade below 85 from 1st semester to 2nd semester
            if (isset($types['college_honors'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $collegeId,
                    'honor_type_id' => $types['college_honors'],
                ], [
                    'min_gpa' => null,
                    'min_grade' => 85,
                    'min_grade_all' => 85,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // Cum Laude – no grade below 87 in any subject from 1st to 4th year
            if (isset($types['cum_laude'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $collegeId,
                    'honor_type_id' => $types['cum_laude'],
                ], [
                    'min_grade' => 87,
                    'min_grade_all' => 87,
                    'min_year' => 1,
                    'max_year' => 4,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // Magna Cum Laude – no grade below 93 from 1st to 4th year
            if (isset($types['magna_cum_laude'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $collegeId,
                    'honor_type_id' => $types['magna_cum_laude'],
                ], [
                    'min_grade' => 93,
                    'min_grade_all' => 93,
                    'min_year' => 1,
                    'max_year' => 4,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // Summa Cum Laude – no grade below 95 in all subjects from 1st to 4th year
            if (isset($types['summa_cum_laude'])) {
                DB::table('honor_criteria')->updateOrInsert([
                    'academic_level_id' => $collegeId,
                    'honor_type_id' => $types['summa_cum_laude'],
                ], [
                    'min_grade' => 95,
                    'min_grade_all' => 95,
                    'min_year' => 1,
                    'max_year' => 4,
                    'require_consistent_honor' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // optional cleanup
    }
};


