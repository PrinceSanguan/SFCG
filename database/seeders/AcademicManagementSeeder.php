<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicLevel;
use App\Models\GradingPeriod;
use App\Models\Subject;

class AcademicManagementSeeder extends Seeder
{
    public function run(): void
    {
        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Get grading periods
        $elementaryGrading = GradingPeriod::where('academic_level_id', $elementary->id)->first();
        $juniorHighGrading = GradingPeriod::where('academic_level_id', $juniorHigh->id)->first();
        $seniorHighGrading = GradingPeriod::where('academic_level_id', $seniorHigh->id)->first();
        $collegeGrading = GradingPeriod::where('academic_level_id', $college->id)->first();

        // Create Elementary Subjects
        if ($elementary && $elementaryGrading) {
            $elementarySubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'description' => 'Basic mathematics for elementary students', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'English', 'code' => 'ENG-ELEM', 'description' => 'English language and reading', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'Science', 'code' => 'SCI-ELEM', 'description' => 'Basic science concepts', 'units' => 1, 'hours_per_week' => 3, 'is_core' => true],
                ['name' => 'Social Studies', 'code' => 'SOC-ELEM', 'description' => 'History and geography basics', 'units' => 1, 'hours_per_week' => 3, 'is_core' => true],
                ['name' => 'Physical Education', 'code' => 'PE-ELEM', 'description' => 'Physical activities and health', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
                ['name' => 'Arts and Music', 'code' => 'ART-ELEM', 'description' => 'Creative arts and music appreciation', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
            ];

            foreach ($elementarySubjects as $subjectData) {
                Subject::create([
                    ...$subjectData,
                    'academic_level_id' => $elementary->id,
                    'grading_period_id' => $elementaryGrading->id,
                    'is_active' => true,
                ]);
            }
        }

        // Create Junior High School Subjects
        if ($juniorHigh && $juniorHighGrading) {
            $juniorHighSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'description' => 'Intermediate mathematics', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'English', 'code' => 'ENG-JHS', 'description' => 'English literature and composition', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'Science', 'code' => 'SCI-JHS', 'description' => 'General science', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Social Studies', 'code' => 'SOC-JHS', 'description' => 'Philippine history and world geography', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Filipino', 'code' => 'FIL-JHS', 'description' => 'Filipino language and literature', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Technology and Livelihood Education', 'code' => 'TLE-JHS', 'description' => 'Practical skills and entrepreneurship', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Physical Education', 'code' => 'PE-JHS', 'description' => 'Physical fitness and sports', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
                ['name' => 'Music and Arts', 'code' => 'MAPEH-JHS', 'description' => 'Music, arts, physical education, and health', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
            ];

            foreach ($juniorHighSubjects as $subjectData) {
                Subject::create([
                    ...$subjectData,
                    'academic_level_id' => $juniorHigh->id,
                    'grading_period_id' => $juniorHighGrading->id,
                    'is_active' => true,
                ]);
            }
        }

        // Create Senior High School Subjects
        if ($seniorHigh && $seniorHighGrading) {
            $seniorHighSubjects = [
                ['name' => 'Core Mathematics', 'code' => 'MATH-SHS', 'description' => 'Advanced mathematics for SHS', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'Core English', 'code' => 'ENG-SHS', 'description' => 'English for academic purposes', 'units' => 1, 'hours_per_week' => 5, 'is_core' => true],
                ['name' => 'Core Science', 'code' => 'SCI-SHS', 'description' => 'General biology, chemistry, physics', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Core Social Studies', 'code' => 'SOC-SHS', 'description' => 'Contemporary Philippine issues', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Core Filipino', 'code' => 'FIL-SHS', 'description' => 'Komunikasyon at pananaliksik', 'units' => 1, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Physical Education and Health', 'code' => 'PEH-SHS', 'description' => 'Physical education and health', 'units' => 1, 'hours_per_week' => 2, 'is_core' => true],
                ['name' => 'Personal Development', 'code' => 'PD-SHS', 'description' => 'Personal development and career guidance', 'units' => 1, 'hours_per_week' => 2, 'is_core' => true],
                ['name' => 'Understanding Culture and Society', 'code' => 'UCS-SHS', 'description' => 'Understanding culture, society, and politics', 'units' => 1, 'hours_per_week' => 2, 'is_core' => true],
                ['name' => 'Applied Economics', 'code' => 'ECON-SHS', 'description' => 'Basic economics principles', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
                ['name' => 'Business Mathematics', 'code' => 'BMATH-SHS', 'description' => 'Mathematics for business applications', 'units' => 1, 'hours_per_week' => 2, 'is_core' => false],
            ];

            foreach ($seniorHighSubjects as $subjectData) {
                Subject::create([
                    ...$subjectData,
                    'academic_level_id' => $seniorHigh->id,
                    'grading_period_id' => $seniorHighGrading->id,
                    'is_active' => true,
                ]);
            }
        }

        // Create College Subjects
        if ($college && $collegeGrading) {
            $collegeSubjects = [
                ['name' => 'College Algebra', 'code' => 'MATH101', 'description' => 'Fundamental concepts of algebra', 'units' => 3, 'hours_per_week' => 3, 'is_core' => true],
                ['name' => 'English Composition', 'code' => 'ENG101', 'description' => 'College writing and rhetoric', 'units' => 3, 'hours_per_week' => 3, 'is_core' => true],
                ['name' => 'General Chemistry', 'code' => 'CHEM101', 'description' => 'Introduction to chemistry', 'units' => 4, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'General Physics', 'code' => 'PHYS101', 'description' => 'Introduction to physics', 'units' => 4, 'hours_per_week' => 4, 'is_core' => true],
                ['name' => 'Introduction to Psychology', 'code' => 'PSYCH101', 'description' => 'Basic psychology concepts', 'units' => 3, 'hours_per_week' => 3, 'is_core' => false],
                ['name' => 'Introduction to Sociology', 'code' => 'SOC101', 'description' => 'Basic sociology concepts', 'units' => 3, 'hours_per_week' => 3, 'is_core' => false],
                ['name' => 'Physical Education', 'code' => 'PE101', 'description' => 'College physical education', 'units' => 2, 'hours_per_week' => 2, 'is_core' => false],
                ['name' => 'Computer Fundamentals', 'code' => 'CS101', 'description' => 'Introduction to computing', 'units' => 3, 'hours_per_week' => 3, 'is_core' => false],
            ];

            foreach ($collegeSubjects as $subjectData) {
                Subject::create([
                    ...$subjectData,
                    'academic_level_id' => $college->id,
                    'grading_period_id' => $collegeGrading->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
