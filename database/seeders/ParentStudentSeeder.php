<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ParentStudentRelationship;
use Illuminate\Support\Facades\Hash;

class ParentStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create parent users
        $parents = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'parent',
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.garcia@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'parent',
            ],
            [
                'name' => 'Robert Johnson',
                'email' => 'robert.johnson@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'parent',
            ],
            [
                'name' => 'Lisa Chen',
                'email' => 'lisa.chen@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'parent',
            ],
        ];

        // Create student users
        $students = [
            [
                'name' => 'Emily Smith',
                'email' => 'emily.smith@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'Michael Smith',
                'email' => 'michael.smith@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'Sofia Garcia',
                'email' => 'sofia.garcia@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'David Johnson',
                'email' => 'david.johnson@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'Anna Chen',
                'email' => 'anna.chen@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'James Wilson',
                'email' => 'james.wilson@example.com',
                'password' => Hash::make('password123'),
                'user_role' => 'student',
            ],
        ];

        // Create parent and student users
        $parentUsers = collect($parents)->map(function ($parent) {
            return User::create($parent);
        });

        $studentUsers = collect($students)->map(function ($student) {
            return User::create($student);
        });

        // Create parent-student relationships
        $relationships = [
            // John Smith (parent) -> Emily Smith & Michael Smith (children)
            [
                'parent_id' => $parentUsers[0]->id, // John Smith
                'student_id' => $studentUsers[0]->id, // Emily Smith
                'relationship_type' => 'father',
                'emergency_contact' => 'yes',
                'notes' => 'Primary guardian for Emily',
            ],
            [
                'parent_id' => $parentUsers[0]->id, // John Smith
                'student_id' => $studentUsers[1]->id, // Michael Smith
                'relationship_type' => 'father',
                'emergency_contact' => 'yes',
                'notes' => 'Primary guardian for Michael',
            ],
            
            // Maria Garcia (parent) -> Sofia Garcia (child)
            [
                'parent_id' => $parentUsers[1]->id, // Maria Garcia
                'student_id' => $studentUsers[2]->id, // Sofia Garcia
                'relationship_type' => 'mother',
                'emergency_contact' => 'yes',
                'notes' => 'Single mother, primary contact',
            ],
            
            // Robert Johnson (parent) -> David Johnson (child)
            [
                'parent_id' => $parentUsers[2]->id, // Robert Johnson
                'student_id' => $studentUsers[3]->id, // David Johnson
                'relationship_type' => 'father',
                'emergency_contact' => 'no',
                'notes' => 'Secondary contact - mother is primary',
            ],
            
            // Lisa Chen (parent) -> Anna Chen (child)
            [
                'parent_id' => $parentUsers[3]->id, // Lisa Chen
                'student_id' => $studentUsers[4]->id, // Anna Chen
                'relationship_type' => 'mother',
                'emergency_contact' => 'yes',
                'notes' => 'Works from home, available during school hours',
            ],
            
            // Maria Garcia (guardian) -> James Wilson (ward)
            [
                'parent_id' => $parentUsers[1]->id, // Maria Garcia
                'student_id' => $studentUsers[5]->id, // James Wilson
                'relationship_type' => 'guardian',
                'emergency_contact' => 'no',
                'notes' => 'Legal guardian - not biological parent',
            ],
        ];

        foreach ($relationships as $relationship) {
            ParentStudentRelationship::create($relationship);
        }

        $this->command->info('Created ' . count($parents) . ' parent accounts');
        $this->command->info('Created ' . count($students) . ' student accounts');
        $this->command->info('Created ' . count($relationships) . ' parent-student relationships');
    }
}