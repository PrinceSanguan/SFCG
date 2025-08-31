<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\Department;
use App\Models\Course;
use App\Models\Subject;
use App\Models\GradingPeriod;

class BasicStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Academic Levels
        $academicLevels = [
            ['key' => 'elementary', 'name' => 'Elementary', 'sort_order' => 1],
            ['key' => 'junior_highschool', 'name' => 'Junior High School', 'sort_order' => 2],
            ['key' => 'senior_highschool', 'name' => 'Senior High School', 'sort_order' => 3],
            ['key' => 'college', 'name' => 'College', 'sort_order' => 4],
        ];

        foreach ($academicLevels as $level) {
            AcademicLevel::updateOrCreate(
                ['key' => $level['key']], // Search by key
                $level
            );
        }

        // Create Departments
        $departments = [
            ['name' => 'Computer Department', 'code' => 'COMP', 'academic_level_id' => 4], // College
            ['name' => 'Business Department', 'code' => 'BUS', 'academic_level_id' => 4], // College
            ['name' => 'Education Department', 'code' => 'EDU', 'academic_level_id' => 4], // College
            ['name' => 'Elementary Department', 'code' => 'ELEM', 'academic_level_id' => 1], // Elementary
            ['name' => 'Junior High Department', 'code' => 'JHS', 'academic_level_id' => 2], // Junior High
            ['name' => 'Senior High Department', 'code' => 'SHS', 'academic_level_id' => 3], // Senior High
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                ['code' => $dept['code']], // Search by code
                $dept
            );
        }

        // Create Courses
        $courses = [
            ['name' => 'Bachelor of Science in Computer Science', 'code' => 'BSCS', 'department_id' => 1],
            ['name' => 'Bachelor of Science in Information Technology', 'code' => 'BSIT', 'department_id' => 1],
            ['name' => 'Bachelor of Science in Business Administration', 'code' => 'BSBA', 'department_id' => 2],
            ['name' => 'Bachelor of Elementary Education', 'code' => 'BEED', 'department_id' => 3],
        ];

        foreach ($courses as $course) {
            Course::updateOrCreate(
                ['code' => $course['code']], // Search by code
                $course
            );
        }

        // Create Subjects with proper academic_level_id
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH101', 'units' => 3, 'course_id' => 1, 'academic_level_id' => 4], // College
            ['name' => 'Programming Fundamentals', 'code' => 'PROG101', 'units' => 3, 'course_id' => 1, 'academic_level_id' => 4], // College
            ['name' => 'Database Management', 'code' => 'DB101', 'units' => 3, 'course_id' => 1, 'academic_level_id' => 4], // College
            ['name' => 'Business Ethics', 'code' => 'BUS101', 'units' => 3, 'course_id' => 3, 'academic_level_id' => 4], // College
            ['name' => 'Teaching Methods', 'code' => 'TCH101', 'units' => 3, 'course_id' => 4, 'academic_level_id' => 4], // College
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']], // Search by code
                $subject
            );
        }

        // Create Grading Periods for College
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        if ($collegeLevel) {
            $gradingPeriods = [
                ['name' => 'Prelim', 'code' => 'COL_PRELIM', 'sort_order' => 1, 'academic_level_id' => $collegeLevel->id, 'start_date' => '2024-08-01', 'end_date' => '2024-10-31'],
                ['name' => 'Midterm', 'code' => 'COL_MIDTERM', 'sort_order' => 2, 'academic_level_id' => $collegeLevel->id, 'start_date' => '2024-11-01', 'end_date' => '2025-01-31'],
                ['name' => 'Final', 'code' => 'COL_FINAL', 'sort_order' => 3, 'academic_level_id' => $collegeLevel->id, 'start_date' => '2025-02-01', 'end_date' => '2025-05-31'],
            ];

            foreach ($gradingPeriods as $period) {
                GradingPeriod::updateOrCreate(
                    ['name' => $period['name'], 'academic_level_id' => $period['academic_level_id']], // Search by name and level
                    $period
                );
            }
        }

        // Create Grading Periods for Basic Education
        $basicLevels = AcademicLevel::whereIn('key', ['elementary', 'junior_highschool', 'senior_highschool'])->get();
        foreach ($basicLevels as $level) {
            $levelCode = strtoupper(substr($level->key, 0, 3)); // ELE, JUN, SEN
            $gradingPeriods = [
                ['name' => 'First Quarter', 'code' => $levelCode . '_Q1', 'sort_order' => 1, 'academic_level_id' => $level->id, 'start_date' => '2024-08-01', 'end_date' => '2024-10-31'],
                ['name' => 'Second Quarter', 'code' => $levelCode . '_Q2', 'sort_order' => 2, 'academic_level_id' => $level->id, 'start_date' => '2024-11-01', 'end_date' => '2025-01-31'],
                ['name' => 'Third Quarter', 'code' => $levelCode . '_Q3', 'sort_order' => 3, 'academic_level_id' => $level->id, 'start_date' => '2025-02-01', 'end_date' => '2025-04-30'],
                ['name' => 'Fourth Quarter', 'code' => $levelCode . '_Q4', 'sort_order' => 4, 'academic_level_id' => $level->id, 'start_date' => '2025-05-01', 'end_date' => '2025-07-31'],
            ];

            foreach ($gradingPeriods as $period) {
                GradingPeriod::updateOrCreate(
                    ['name' => $period['name'], 'academic_level_id' => $period['academic_level_id']], // Search by name and level
                    $period
                );
            }
        }

        $this->command->info('Basic academic structure created/updated successfully!');
    }
}
