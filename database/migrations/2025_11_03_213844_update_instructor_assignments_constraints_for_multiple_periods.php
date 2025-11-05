<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration updates unique constraints on instructor assignment tables
     * to support multiple grading periods for the same instructor-course-year combination.
     */
    public function up(): void
    {
        // Step 1: Handle existing data conflicts in instructor_course_assignments
        $this->consolidateInstructorCourseAssignments();

        // Step 2: Drop foreign keys first (required before dropping unique constraints)
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['academic_level_id']);
            $table->dropForeign(['subject_id']);
        });

        // Step 3: Drop the old unique constraint (includes subject_id)
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_course_subject_assignment');
        });

        // Step 4: Recreate foreign keys and add new unique constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('set null');

            // Add new unique constraint that includes grading_period_id
            // This allows the same instructor-course-subject-year for different grading periods
            $table->unique(
                ['instructor_id', 'course_id', 'academic_level_id', 'subject_id', 'grading_period_id', 'school_year'],
                'unique_instructor_course_subject_period_assignment'
            );
        });

        Log::info('[MIGRATION] Updated instructor_course_assignments unique constraint to include grading_period_id');

        // Step 5: Handle existing data conflicts in instructor_subject_assignments
        $this->consolidateInstructorSubjectAssignments();

        // Step 6: Drop foreign keys first (required before dropping unique constraints)
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['subject_id']);
            $table->dropForeign(['academic_level_id']);
            $table->dropForeign(['section_id']);
        });

        // Step 7: Drop the old unique constraint
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_subject_section_assignment');
        });

        // Step 8: Recreate foreign keys and add new unique constraint
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');

            // Add new unique constraint that includes grading_period_id
            $table->unique(
                ['instructor_id', 'subject_id', 'academic_level_id', 'section_id', 'grading_period_id', 'school_year'],
                'unique_instructor_subject_section_period_assignment'
            );
        });

        Log::info('[MIGRATION] Updated instructor_subject_assignments unique constraint to include grading_period_id');
    }

    /**
     * Consolidate duplicate instructor course assignments
     *
     * Finds assignments with same instructor_id, course_id, academic_level_id, and school_year
     * but different grading_period_id. Keeps the most recent, deactivates older ones.
     */
    private function consolidateInstructorCourseAssignments(): void
    {
        // Find potential duplicates (same instructor-course-year, different or null grading_period_id)
        $duplicates = DB::table('instructor_course_assignments')
            ->select('instructor_id', 'course_id', 'academic_level_id', 'school_year', DB::raw('COUNT(*) as count'))
            ->groupBy('instructor_id', 'course_id', 'academic_level_id', 'school_year')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        $consolidatedCount = 0;

        foreach ($duplicates as $duplicate) {
            // Get all assignments for this combination
            $assignments = DB::table('instructor_course_assignments')
                ->where('instructor_id', $duplicate->instructor_id)
                ->where('course_id', $duplicate->course_id)
                ->where('academic_level_id', $duplicate->academic_level_id)
                ->where('school_year', $duplicate->school_year)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the most recent, set others to inactive
            $keepId = $assignments->first()->id;
            $deactivateIds = $assignments->skip(1)->pluck('id')->toArray();

            if (!empty($deactivateIds)) {
                DB::table('instructor_course_assignments')
                    ->whereIn('id', $deactivateIds)
                    ->update(['is_active' => false]);

                $consolidatedCount += count($deactivateIds);

                Log::info('[MIGRATION] Consolidated instructor_course_assignments', [
                    'kept_id' => $keepId,
                    'deactivated_ids' => $deactivateIds,
                    'instructor_id' => $duplicate->instructor_id,
                    'course_id' => $duplicate->course_id,
                    'school_year' => $duplicate->school_year,
                ]);
            }
        }

        if ($consolidatedCount > 0) {
            Log::warning('[MIGRATION] Consolidated ' . $consolidatedCount . ' duplicate instructor_course_assignments. Check logs for details.');
        } else {
            Log::info('[MIGRATION] No duplicate instructor_course_assignments found');
        }
    }

    /**
     * Consolidate duplicate instructor subject assignments
     *
     * Finds assignments with same instructor_id, subject_id, academic_level_id, section_id, and school_year
     * but different grading_period_id. Keeps the most recent, deactivates older ones.
     */
    private function consolidateInstructorSubjectAssignments(): void
    {
        // Find potential duplicates
        $duplicates = DB::table('instructor_subject_assignments')
            ->select(
                'instructor_id',
                'subject_id',
                'academic_level_id',
                'section_id',
                'school_year',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('instructor_id', 'subject_id', 'academic_level_id', 'section_id', 'school_year')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        $consolidatedCount = 0;

        foreach ($duplicates as $duplicate) {
            // Get all assignments for this combination
            $assignments = DB::table('instructor_subject_assignments')
                ->where('instructor_id', $duplicate->instructor_id)
                ->where('subject_id', $duplicate->subject_id)
                ->where('academic_level_id', $duplicate->academic_level_id)
                ->where('section_id', $duplicate->section_id)
                ->where('school_year', $duplicate->school_year)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the most recent, set others to inactive
            $keepId = $assignments->first()->id;
            $deactivateIds = $assignments->skip(1)->pluck('id')->toArray();

            if (!empty($deactivateIds)) {
                DB::table('instructor_subject_assignments')
                    ->whereIn('id', $deactivateIds)
                    ->update(['is_active' => false]);

                $consolidatedCount += count($deactivateIds);

                Log::info('[MIGRATION] Consolidated instructor_subject_assignments', [
                    'kept_id' => $keepId,
                    'deactivated_ids' => $deactivateIds,
                    'instructor_id' => $duplicate->instructor_id,
                    'subject_id' => $duplicate->subject_id,
                    'section_id' => $duplicate->section_id,
                    'school_year' => $duplicate->school_year,
                ]);
            }
        }

        if ($consolidatedCount > 0) {
            Log::warning('[MIGRATION] Consolidated ' . $consolidatedCount . ' duplicate instructor_subject_assignments. Check logs for details.');
        } else {
            Log::info('[MIGRATION] No duplicate instructor_subject_assignments found');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert instructor_subject_assignments constraint
        // Step 1: Drop foreign keys first
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['subject_id']);
            $table->dropForeign(['academic_level_id']);
            $table->dropForeign(['section_id']);
        });

        // Step 2: Drop the new unique constraint
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_subject_section_period_assignment');
        });

        // Step 3: Recreate foreign keys and restore old constraint
        Schema::table('instructor_subject_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');

            // Restore the old unique constraint (without grading_period_id)
            $table->unique(
                ['instructor_id', 'subject_id', 'academic_level_id', 'section_id', 'school_year'],
                'unique_instructor_subject_section_assignment'
            );
        });

        // Revert instructor_course_assignments constraint
        // Step 4: Drop foreign keys first
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['academic_level_id']);
            $table->dropForeign(['subject_id']);
        });

        // Step 5: Drop the new unique constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            $table->dropUnique('unique_instructor_course_subject_period_assignment');
        });

        // Step 6: Recreate foreign keys and restore old constraint
        Schema::table('instructor_course_assignments', function (Blueprint $table) {
            // Recreate foreign keys
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('academic_level_id')->references('id')->on('academic_levels')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('set null');

            // Restore the old unique constraint (without grading_period_id, includes subject_id)
            $table->unique(
                ['instructor_id', 'course_id', 'academic_level_id', 'subject_id', 'school_year'],
                'unique_instructor_course_subject_assignment'
            );
        });

        Log::info('[MIGRATION] Reverted instructor assignment unique constraints to original state');
    }
};
