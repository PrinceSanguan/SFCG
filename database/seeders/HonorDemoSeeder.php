<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\StudentGrade;

class HonorDemoSeeder extends Seeder
{
    public function run(): void
    {
        $schoolYear = '2024-2025';

        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $shs = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // pick some seeded students
        $elemStudent = User::where('user_role', 'student')->where('year_level', 'elementary')->first();
        $shsStudent = User::where('user_role', 'student')->where('year_level', 'senior_highschool')->first();
        $collegeStudent = User::where('user_role', 'student')->where('year_level', 'college')->first();

        // subjects for each level (from AcademicManagementSeeder)
        $elemSubjects = Subject::where('academic_level_id', $elementary?->id)->take(5)->get();
        $shsSubjects = Subject::where('academic_level_id', $shs?->id)->take(5)->get();
        $collegeSubjects = Subject::where('academic_level_id', $college?->id)->take(6)->get();

        // Elementary student with GPA 96 and all grades >= 93 to qualify for With Highest Honors
        if ($elemStudent && $elementary && $elemSubjects->count() > 0) {
            foreach ($elemSubjects as $subj) {
                StudentGrade::updateOrCreate([
                    'student_id' => $elemStudent->id,
                    'subject_id' => $subj->id,
                    'school_year' => $schoolYear,
                ], [
                    'academic_level_id' => $elementary->id,
                    'grading_period_id' => $subj->grading_period_id,
                    'grade' => 96, // consistent high grades
                ]);
            }
        }

        // SHS student with GPA 96 and min grade 90 => With High Honors
        if ($shsStudent && $shs && $shsSubjects->count() > 0) {
            $grades = [96, 95, 97, 93, 91];
            foreach ($shsSubjects as $i => $subj) {
                StudentGrade::updateOrCreate([
                    'student_id' => $shsStudent->id,
                    'subject_id' => $subj->id,
                    'school_year' => $schoolYear,
                ], [
                    'academic_level_id' => $shs->id,
                    'grading_period_id' => $subj->grading_period_id,
                    'grade' => $grades[$i % count($grades)],
                ]);
            }
        }

        // College student with no grade below 95 across years 1-4 => Summa Cum Laude
        if ($collegeStudent && $college && $collegeSubjects->count() > 0) {
            foreach (range(1, 4) as $year) {
                foreach ($collegeSubjects as $subj) {
                    StudentGrade::updateOrCreate([
                        'student_id' => $collegeStudent->id,
                        'subject_id' => $subj->id,
                        'school_year' => $schoolYear,
                        'year_of_study' => $year,
                    ], [
                        'academic_level_id' => $college->id,
                        'grading_period_id' => $subj->grading_period_id,
                        'grade' => 96,
                    ]);
                }
            }
        }
    }
}


