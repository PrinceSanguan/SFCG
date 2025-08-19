<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Strand;
use App\Models\Course;
use App\Models\AcademicLevel;

class StrandCourseDepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // Get academic levels
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();

        // Create strands ONLY for Senior High School
        if ($seniorHigh) {
            Strand::create([
                'name' => 'STEM (Science, Technology, Engineering, and Mathematics)',
                'code' => 'STEM',
                'description' => 'Science, Technology, Engineering, and Mathematics strand',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ]);

            Strand::create([
                'name' => 'ABM (Accountancy, Business, and Management)',
                'code' => 'ABM',
                'description' => 'Accountancy, Business, and Management strand',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ]);

            Strand::create([
                'name' => 'HUMSS (Humanities and Social Sciences)',
                'code' => 'HUMSS',
                'description' => 'Humanities and Social Sciences strand',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ]);

            Strand::create([
                'name' => 'GAS (General Academic Strand)',
                'code' => 'GAS',
                'description' => 'General Academic Strand',
                'academic_level_id' => $seniorHigh->id,
                'is_active' => true,
            ]);
        }

        // Create departments with their specific courses
        $computerDept = Department::create([
            'name' => 'Computer Department',
            'code' => 'COMP',
        ]);

        $computerDept->courses()->createMany([
            [
                'name' => 'Computer Engineering Technology',
                'code' => 'COMP_ENG_TECH',
                'description' => 'Computer Engineering Technology Program',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Computer Engineering',
                'code' => 'COMP_ENG',
                'description' => 'Computer Engineering Program',
                'units' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Computer Science',
                'code' => 'COMP_SCI',
                'description' => 'Computer Science Program',
                'units' => 4,
                'is_active' => true,
            ],
        ]);

        $mathDept = Department::create([
            'name' => 'Mathematics Department',
            'code' => 'MATH',
        ]);

        $mathDept->courses()->createMany([
            [
                'name' => 'Algebra I',
                'code' => 'MATH101',
                'description' => 'Introduction to Algebra',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Geometry',
                'code' => 'MATH102',
                'description' => 'Plane and Solid Geometry',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Calculus',
                'code' => 'MATH201',
                'description' => 'Differential Calculus',
                'units' => 4,
                'is_active' => true,
            ],
        ]);

        $sciDept = Department::create([
            'name' => 'Science Department',
            'code' => 'SCI',
        ]);

        $sciDept->courses()->createMany([
            [
                'name' => 'Biology',
                'code' => 'SCI101',
                'description' => 'General Biology',
                'units' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Chemistry',
                'code' => 'SCI102',
                'description' => 'General Chemistry',
                'units' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Physics',
                'code' => 'SCI201',
                'description' => 'General Physics',
                'units' => 4,
                'is_active' => true,
            ],
        ]);

        $engDept = Department::create([
            'name' => 'English Department',
            'code' => 'ENG',
        ]);

        $engDept->courses()->createMany([
            [
                'name' => 'English Composition',
                'code' => 'ENG101',
                'description' => 'College Composition and Rhetoric',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'World Literature',
                'code' => 'ENG102',
                'description' => 'Introduction to World Literature',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Technical Writing',
                'code' => 'ENG201',
                'description' => 'Technical and Professional Writing',
                'units' => 3,
                'is_active' => true,
            ],
        ]);

        $busDept = Department::create([
            'name' => 'Business Department',
            'code' => 'BUS',
        ]);

        $busDept->courses()->createMany([
            [
                'name' => 'Business Fundamentals',
                'code' => 'BUS101',
                'description' => 'Introduction to Business',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Marketing Principles',
                'code' => 'BUS102',
                'description' => 'Principles of Marketing',
                'units' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Financial Management',
                'code' => 'BUS201',
                'description' => 'Business Financial Management',
                'units' => 3,
                'is_active' => true,
            ],
        ]);
    }
}
