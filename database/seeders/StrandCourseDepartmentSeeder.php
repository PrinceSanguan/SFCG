<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Strand;
use App\Models\Course;

class StrandCourseDepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // Create strands for existing departments
        $mathDept = Department::where('code', 'MATH')->first();
        $sciDept = Department::where('code', 'SCI')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $csDept = Department::where('code', 'CS')->first();
        $busDept = Department::where('code', 'BUS')->first();

        if ($mathDept) {
            Strand::create([
                'name' => 'Advanced Mathematics',
                'code' => 'ADV_MATH',
                'department_id' => $mathDept->id,
            ]);
        }

        if ($sciDept) {
            Strand::create([
                'name' => 'General Science',
                'code' => 'GEN_SCI',
                'department_id' => $sciDept->id,
            ]);
        }

        if ($engDept) {
            Strand::create([
                'name' => 'English Literature',
                'code' => 'ENG_LIT',
                'department_id' => $engDept->id,
            ]);
        }

        if ($csDept) {
            Strand::create([
                'name' => 'Computer Programming',
                'code' => 'COMP_PROG',
                'department_id' => $csDept->id,
            ]);
        }

        if ($busDept) {
            Strand::create([
                'name' => 'Business Management',
                'code' => 'BUS_MGMT',
                'department_id' => $busDept->id,
            ]);
        }

        // Create courses for existing departments
        if ($mathDept) {
            Course::create([
                'name' => 'Algebra I',
                'code' => 'MATH101',
                'department_id' => $mathDept->id,
            ]);

            Course::create([
                'name' => 'Geometry',
                'code' => 'MATH102',
                'department_id' => $mathDept->id,
            ]);
        }

        if ($sciDept) {
            Course::create([
                'name' => 'Biology',
                'code' => 'SCI101',
                'department_id' => $sciDept->id,
            ]);

            Course::create([
                'name' => 'Chemistry',
                'code' => 'SCI102',
                'department_id' => $sciDept->id,
            ]);
        }

        if ($engDept) {
            Course::create([
                'name' => 'English Composition',
                'code' => 'ENG101',
                'department_id' => $engDept->id,
            ]);

            Course::create([
                'name' => 'World Literature',
                'code' => 'ENG102',
                'department_id' => $engDept->id,
            ]);
        }

        if ($csDept) {
            Course::create([
                'name' => 'Introduction to Programming',
                'code' => 'CS101',
                'department_id' => $csDept->id,
            ]);

            Course::create([
                'name' => 'Data Structures',
                'code' => 'CS201',
                'department_id' => $csDept->id,
            ]);
        }

        if ($busDept) {
            Course::create([
                'name' => 'Business Fundamentals',
                'code' => 'BUS101',
                'department_id' => $busDept->id,
            ]);

            Course::create([
                'name' => 'Marketing Principles',
                'code' => 'BUS102',
                'department_id' => $busDept->id,
            ]);
        }
    }
}
