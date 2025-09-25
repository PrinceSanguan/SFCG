<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\StudentGrade;
use App\Models\StudentSubjectAssignment;
use App\Models\GradingPeriod;
use App\Models\AcademicLevel;
use App\Models\TeacherSubjectAssignment;
use App\Models\InstructorSubjectAssignment;
use App\Models\ClassAdviserAssignment;
use App\Services\StudentSubjectAssignmentService;

class RealisticGradesWithExistingPeriodsSeeder extends Seeder
{
    public function run()
    {
        echo "=== CREATING REALISTIC GRADES WITH EXISTING GRADING PERIODS ===\n";

        $currentSchoolYear = '2024-2025';
        $academicLevels = AcademicLevel::all()->keyBy('key');

        // Get all grading periods grouped by academic level
        $gradingPeriods = GradingPeriod::where('is_active', true)
            ->get()
            ->groupBy('academic_level_id');

        // Define realistic grade ranges for each level
        $gradeRanges = [
            'elementary' => ['min' => 85, 'max' => 98],
            'junior_highschool' => ['min' => 80, 'max' => 97],
            'senior_highschool' => ['min' => 75, 'max' => 95],
            'college' => ['min' => 80, 'max' => 98]
        ];

        // Process each academic level
        foreach ($academicLevels as $levelKey => $academicLevel) {
            echo "\n📚 Processing {$academicLevel->name}...\n";

            // Get students for this level
            $students = User::where('user_role', 'student')
                ->where('year_level', $levelKey)
                ->get();

            if ($students->isEmpty()) {
                echo "  No students found for {$academicLevel->name}\n";
                continue;
            }

            // Get subjects for this level
            $subjects = Subject::where('academic_level_id', $academicLevel->id)->get();
            if ($subjects->isEmpty()) {
                echo "  No subjects found for {$academicLevel->name}\n";
                continue;
            }

            // Get grading periods for this level
            $periods = $gradingPeriods->get($academicLevel->id, collect());
            if ($periods->isEmpty()) {
                echo "  No grading periods found for {$academicLevel->name}\n";
                continue;
            }

            echo "  Students: {$students->count()}, Subjects: {$subjects->count()}, Periods: {$periods->count()}\n";

            // Create subject assignments and grades for each student
            foreach ($students as $student) {
                echo "  👤 Processing {$student->name}...\n";

                foreach ($subjects as $subject) {
                    // Create subject assignment
                    StudentSubjectAssignment::updateOrCreate([
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'school_year' => $currentSchoolYear,
                    ], [
                        'semester' => $this->getSemesterForLevel($levelKey),
                        'is_active' => true,
                        'enrolled_at' => now(),
                        'enrolled_by' => 1, // Admin user ID
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Create grades for each grading period
                    foreach ($periods as $period) {
                        // Generate realistic grade based on level and subject
                        $baseGrade = $this->generateRealisticGrade($gradeRanges[$levelKey], $subject, $period);
                        
                        StudentGrade::updateOrCreate([
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'grading_period_id' => $period->id,
                            'school_year' => $currentSchoolYear,
                        ], [
                            'academic_level_id' => $academicLevel->id,
                            'year_of_study' => $this->getYearOfStudy($levelKey, $student),
                            'grade' => $baseGrade,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            // Create teacher and instructor assignments
            $this->createFacultyAssignments($academicLevel, $subjects, $currentSchoolYear);
        }

        echo "\n✅ All grades created successfully!\n";
        echo "Total Students: " . User::where('user_role', 'student')->count() . "\n";
        echo "Total Grades: " . StudentGrade::count() . "\n";
        echo "Total Subject Assignments: " . StudentSubjectAssignment::count() . "\n";
    }

    private function generateRealisticGrade($range, $subject, $period)
    {
        // Base grade within range
        $baseGrade = rand($range['min'] * 10, $range['max'] * 10) / 10;
        
        // Adjust based on subject difficulty
        $subjectAdjustment = $this->getSubjectDifficultyAdjustment($subject->name);
        
        // Adjust based on grading period (students might improve over time)
        $periodAdjustment = $this->getPeriodAdjustment($period->code);
        
        $finalGrade = $baseGrade + $subjectAdjustment + $periodAdjustment;
        
        // Ensure grade stays within realistic bounds
        $finalGrade = max($range['min'], min($range['max'], $finalGrade));
        
        return round($finalGrade, 1);
    }

    private function getSubjectDifficultyAdjustment($subjectName)
    {
        $difficultSubjects = ['Mathematics', 'General Mathematics', 'Advanced Mathematics', 'Calculus', 'Physics', 'Chemistry'];
        $easySubjects = ['Physical Education', 'MAPEH', 'Health', 'Music', 'Arts'];
        
        if (in_array($subjectName, $difficultSubjects)) {
            return -2.0; // Slightly lower for difficult subjects
        } elseif (in_array($subjectName, $easySubjects)) {
            return 1.0; // Slightly higher for easier subjects
        }
        
        return 0;
    }

    private function getPeriodAdjustment($periodCode)
    {
        // Students might improve over time
        $adjustments = [
            'Q1' => 0,
            'Q2' => 0.5,
            'Q3' => 1.0,
            'Q4' => 1.5,
            'COL_S1' => 0,
            'COL_S1_MT' => 0.2,
            'COL_S1_PF' => 0.5,
            'COL_S1_FA' => 1.0,
            'COL_S2' => 0.5,
            'COL_S2_MT' => 0.7,
            'COL_S2_PF' => 1.0,
            'COL_S2_FA' => 1.5,
        ];
        
        return $adjustments[$periodCode] ?? 0;
    }

    private function getSemesterForLevel($levelKey)
    {
        // For college, use semester-based, for others use quarter-based
        return $levelKey === 'college' ? '1st Semester' : '1st Quarter';
    }

    private function getYearOfStudy($levelKey, $student)
    {
        // For college, use year level, for others return null
        if ($levelKey === 'college') {
            return $student->year_level === 'college' ? 1 : null; // Assuming first year college
        }
        return null;
    }

    private function createFacultyAssignments($academicLevel, $subjects, $schoolYear)
    {
        // Get teachers for this level
        $teachers = User::where('user_role', 'teacher')
            ->where('year_level', $academicLevel->key)
            ->get();

        if ($teachers->isEmpty()) {
            echo "  No teachers found for {$academicLevel->name}\n";
            return;
        }

        // Assign teachers to subjects
        foreach ($subjects as $index => $subject) {
            $teacher = $teachers[$index % $teachers->count()];
            
            TeacherSubjectAssignment::updateOrCreate([
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => 1, // Admin user ID
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // For college level, also create instructor assignments
        if ($academicLevel->key === 'college') {
            $instructors = User::where('user_role', 'instructor')->get();
            
            if ($instructors->isNotEmpty()) {
                foreach ($subjects as $index => $subject) {
                    $instructor = $instructors[$index % $instructors->count()];
                    
                    InstructorSubjectAssignment::updateOrCreate([
                        'instructor_id' => $instructor->id,
                        'subject_id' => $subject->id,
                        'school_year' => $schoolYear,
                    ], [
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Create class adviser assignments
        $students = User::where('user_role', 'student')
            ->where('year_level', $academicLevel->key)
            ->get();

        if ($students->isNotEmpty() && $teachers->isNotEmpty()) {
            $adviser = $teachers->first();
            
            ClassAdviserAssignment::updateOrCreate([
                'adviser_id' => $adviser->id,
                'academic_level_id' => $academicLevel->id,
                'school_year' => $schoolYear,
            ], [
                'grade_level' => $academicLevel->key,
                'section' => 'A',
                'is_active' => true,
                'assigned_at' => now(),
                'assigned_by' => 1, // Admin user ID
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
