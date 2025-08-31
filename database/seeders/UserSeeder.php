<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create one user for each role (or update if exists)
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@school.edu',
                'password' => bcrypt('admin123'),
                'user_role' => 'admin',
            ],
            [
                'name' => 'Registrar User',
                'email' => 'registrar@school.edu',
                'password' => bcrypt('registrar123'),
                'user_role' => 'registrar',
            ],
            [
                'name' => 'Teacher User',
                'email' => 'teacher@school.edu',
                'password' => bcrypt('teacher123'),
                'user_role' => 'teacher',
            ],
            [
                'name' => 'Instructor User',
                'email' => 'instructor@school.edu',
                'password' => bcrypt('instructor123'),
                'user_role' => 'instructor',
            ],
            [
                'name' => 'Adviser User',
                'email' => 'adviser@school.edu',
                'password' => bcrypt('adviser123'),
                'user_role' => 'adviser',
            ],
            [
                'name' => 'Chairperson User',
                'email' => 'chairperson@school.edu',
                'password' => bcrypt('chairperson123'),
                'user_role' => 'chairperson',
            ],
            [
                'name' => 'Principal User',
                'email' => 'principal@school.edu',
                'password' => bcrypt('principal123'),
                'user_role' => 'principal',
            ],
            [
                'name' => 'Student User',
                'email' => 'student@school.edu',
                'password' => bcrypt('student123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'Parent User',
                'email' => 'parent@school.edu',
                'password' => bcrypt('parent123'),
                'user_role' => 'parent',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']], // Search by email
                array_merge($userData, [
                    'email_verified_at' => now(),
                    'remember_token' => \Illuminate\Support\Str::random(10),
                ])
            );
        }

        $this->command->info('Users created/updated successfully!');
    }
}
