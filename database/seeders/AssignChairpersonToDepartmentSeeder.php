<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;

class AssignChairpersonToDepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // Find the chairperson user
        $chairperson = User::where('email', 'chairperson@school.edu')->first();
        
        if (!$chairperson) {
            $this->command->warn('Chairperson user not found. Please run UserSeeder first.');
            return;
        }
        
        // Find a department (use the first available one)
        $department = Department::first();
        
        if (!$department) {
            $this->command->warn('No departments found. Please run StrandCourseDepartmentSeeder first.');
            return;
        }
        
        // Assign the chairperson to the department
        $chairperson->update(['department_id' => $department->id]);
        
        $this->command->info("Chairperson {$chairperson->name} assigned to {$department->name} department.");
    }
}
