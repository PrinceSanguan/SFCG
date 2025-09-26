<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Section;
use App\Models\AcademicLevel;
use Illuminate\Support\Facades\Log;

class FixStudentSectionAssignmentsSeeder extends Seeder
{
    /**
     * Fix existing students without section assignments by assigning appropriate sections
     */
    public function run(): void
    {
        $this->command->info('Finding and fixing students without section assignments...');

        // Find students without sections
        $studentsWithoutSections = User::where('user_role', 'student')
            ->whereNull('section_id')
            ->get();

        $this->command->info("Found {$studentsWithoutSections->count()} students without sections");

        if ($studentsWithoutSections->isEmpty()) {
            $this->command->info('All students already have sections assigned!');
            return;
        }

        $fixed = 0;
        $failed = 0;

        foreach ($studentsWithoutSections as $student) {
            $result = $this->assignSectionToStudent($student);
            if ($result) {
                $fixed++;
            } else {
                $failed++;
            }
        }

        $this->command->info("Fixed: {$fixed} students, Failed: {$failed} students");
        $this->command->info('Section assignment fix completed!');
    }

    private function assignSectionToStudent(User $student): bool
    {
        try {
            // Determine academic level based on year_level
            $academicLevelKey = $this->getAcademicLevelKey($student);

            if (!$academicLevelKey) {
                // Default to elementary if no year level specified
                $academicLevelKey = 'elementary';
                $student->update([
                    'year_level' => 'elementary',
                    'specific_year_level' => 'grade_1'
                ]);
            }

            $academicLevel = AcademicLevel::where('key', $academicLevelKey)->first();

            if (!$academicLevel) {
                Log::warning("Academic level not found for key: {$academicLevelKey}");
                return false;
            }

            // Get specific year level
            $specificYearLevel = $this->getSpecificYearLevel($student, $academicLevelKey);

            // Find an appropriate section
            $section = Section::where('academic_level_id', $academicLevel->id)
                ->where('specific_year_level', $specificYearLevel)
                ->where('is_active', true)
                ->orderBy('name')
                ->first();

            if (!$section) {
                // Create a default section if none exists
                $section = $this->createDefaultSection($academicLevel->id, $specificYearLevel);
            }

            if ($section) {
                $student->update([
                    'section_id' => $section->id,
                    'year_level' => $academicLevelKey,
                    'specific_year_level' => $specificYearLevel,
                    'student_number' => $student->student_number ?: $this->generateStudentNumber($academicLevelKey)
                ]);

                $this->command->info("✓ Assigned {$student->name} to section {$section->name}");
                return true;
            }

        } catch (\Exception $e) {
            Log::error("Failed to assign section to student {$student->id}: " . $e->getMessage());
        }

        return false;
    }

    private function getAcademicLevelKey(User $student): ?string
    {
        // Return existing year_level if valid
        if (in_array($student->year_level, ['elementary', 'junior_highschool', 'senior_highschool', 'college'])) {
            return $student->year_level;
        }

        // Try to determine from specific_year_level
        if ($student->specific_year_level) {
            if (in_array($student->specific_year_level, ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6'])) {
                return 'elementary';
            } elseif (in_array($student->specific_year_level, ['grade_7', 'grade_8', 'grade_9', 'grade_10'])) {
                return 'junior_highschool';
            } elseif (in_array($student->specific_year_level, ['grade_11', 'grade_12'])) {
                return 'senior_highschool';
            } elseif (in_array($student->specific_year_level, ['first_year', 'second_year', 'third_year', 'fourth_year'])) {
                return 'college';
            }
        }

        return null; // Will default to elementary
    }

    private function getSpecificYearLevel(User $student, string $academicLevelKey): string
    {
        // Use existing specific_year_level if valid for the academic level
        if ($student->specific_year_level) {
            $validLevels = $this->getValidSpecificYearLevels($academicLevelKey);
            if (in_array($student->specific_year_level, $validLevels)) {
                return $student->specific_year_level;
            }
        }

        // Default to first level of the academic level
        $defaults = [
            'elementary' => 'grade_1',
            'junior_highschool' => 'grade_7',
            'senior_highschool' => 'grade_11',
            'college' => 'first_year'
        ];

        return $defaults[$academicLevelKey] ?? 'grade_1';
    }

    private function getValidSpecificYearLevels(string $academicLevelKey): array
    {
        $levels = [
            'elementary' => ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6'],
            'junior_highschool' => ['grade_7', 'grade_8', 'grade_9', 'grade_10'],
            'senior_highschool' => ['grade_11', 'grade_12'],
            'college' => ['first_year', 'second_year', 'third_year', 'fourth_year']
        ];

        return $levels[$academicLevelKey] ?? ['grade_1'];
    }

    private function createDefaultSection(int $academicLevelId, string $specificYearLevel): ?Section
    {
        try {
            $yearLevelName = $this->getYearLevelDisplayName($specificYearLevel);

            $section = Section::create([
                'name' => $yearLevelName . ' - Default',
                'code' => strtoupper(str_replace(['grade_', '_year'], ['G', 'Y'], $specificYearLevel)) . '-DEFAULT',
                'academic_level_id' => $academicLevelId,
                'specific_year_level' => $specificYearLevel,
                'max_students' => 50,
                'school_year' => '2024-2025',
                'is_active' => true,
            ]);

            $this->command->info("✓ Created default section: {$section->name}");
            return $section;

        } catch (\Exception $e) {
            Log::error("Failed to create default section: " . $e->getMessage());
            return null;
        }
    }

    private function getYearLevelDisplayName(string $specificYearLevel): string
    {
        $names = [
            'grade_1' => 'Grade 1',
            'grade_2' => 'Grade 2',
            'grade_3' => 'Grade 3',
            'grade_4' => 'Grade 4',
            'grade_5' => 'Grade 5',
            'grade_6' => 'Grade 6',
            'grade_7' => 'Grade 7',
            'grade_8' => 'Grade 8',
            'grade_9' => 'Grade 9',
            'grade_10' => 'Grade 10',
            'grade_11' => 'Grade 11',
            'grade_12' => 'Grade 12',
            'first_year' => '1st Year',
            'second_year' => '2nd Year',
            'third_year' => '3rd Year',
            'fourth_year' => '4th Year'
        ];

        return $names[$specificYearLevel] ?? 'Unknown';
    }

    private function generateStudentNumber(string $academicLevelKey): string
    {
        $prefixes = [
            'elementary' => 'ELEM',
            'junior_highschool' => 'JHS',
            'senior_highschool' => 'SHS',
            'college' => 'COL'
        ];

        $prefix = $prefixes[$academicLevelKey] ?? 'STU';
        $year = date('Y');
        $randomNumber = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$randomNumber}";
    }
}