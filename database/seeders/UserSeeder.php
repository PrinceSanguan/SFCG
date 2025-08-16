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
        // Create Admin account
        User::create([
            'name' => 'Admin Account',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('admin123'),
            'user_role' => 'admin',
            'email_verified_at' => now(),
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);

        // Create additional test accounts for each role
        $testAccounts = [
            [
                'name' => 'Admin User',
                'email' => 'admin@school.edu',
                'password' => bcrypt('admin123'),
                'user_role' => 'admin',
            ],
            [
                'name' => 'Maria Registrar',
                'email' => 'registrar@school.edu',
                'password' => bcrypt('registrar123'),
                'user_role' => 'registrar',
            ],
            [
                'name' => 'John Teacher',
                'email' => 'teacher@school.edu',
                'password' => bcrypt('teacher123'),
                'user_role' => 'teacher',
            ],
            [
                'name' => 'Jane Instructor',
                'email' => 'instructor@school.edu',
                'password' => bcrypt('instructor123'),
                'user_role' => 'instructor',
            ],
            [
                'name' => 'Mike Adviser',
                'email' => 'adviser@school.edu',
                'password' => bcrypt('adviser123'),
                'user_role' => 'adviser',
            ],
            [
                'name' => 'Sarah Chairperson',
                'email' => 'chairperson@school.edu',
                'password' => bcrypt('chairperson123'),
                'user_role' => 'chairperson',
            ],
            [
                'name' => 'Robert Principal',
                'email' => 'principal@school.edu',
                'password' => bcrypt('principal123'),
                'user_role' => 'principal',
            ],
            [
                'name' => 'Alice Student',
                'email' => 'student@school.edu',
                'password' => bcrypt('student123'),
                'user_role' => 'student',
            ],
            [
                'name' => 'Bob Parent',
                'email' => 'parent@school.edu',
                'password' => bcrypt('parent123'),
                'user_role' => 'parent',
            ],
        ];

        foreach ($testAccounts as $account) {
            User::create(array_merge($account, [
                'email_verified_at' => now(),
                'remember_token' => \Illuminate\Support\Str::random(10),
            ]));
        }

        // Create additional hardcoded users for testing instead of random ones
        $additionalUsers = [
            // Additional students
            ['name' => 'Student 1', 'email' => 'student1@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 2', 'email' => 'student2@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 3', 'email' => 'student3@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 4', 'email' => 'student4@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 5', 'email' => 'student5@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 6', 'email' => 'student6@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 7', 'email' => 'student7@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 8', 'email' => 'student8@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 9', 'email' => 'student9@school.edu', 'user_role' => 'student'],
            ['name' => 'Student 10', 'email' => 'student10@school.edu', 'user_role' => 'student'],
            
            // Additional parents
            ['name' => 'Parent 1', 'email' => 'parent1@school.edu', 'user_role' => 'parent'],
            ['name' => 'Parent 2', 'email' => 'parent2@school.edu', 'user_role' => 'parent'],
            ['name' => 'Parent 3', 'email' => 'parent3@school.edu', 'user_role' => 'parent'],
            ['name' => 'Parent 4', 'email' => 'parent4@school.edu', 'user_role' => 'parent'],
            ['name' => 'Parent 5', 'email' => 'parent5@school.edu', 'user_role' => 'parent'],
            
            // Additional teachers
            ['name' => 'Teacher 1', 'email' => 'teacher1@school.edu', 'user_role' => 'teacher'],
            ['name' => 'Teacher 2', 'email' => 'teacher2@school.edu', 'user_role' => 'teacher'],
            ['name' => 'Teacher 3', 'email' => 'teacher3@school.edu', 'user_role' => 'teacher'],
        ];

        foreach ($additionalUsers as $user) {
            User::create(array_merge($user, [
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
                'remember_token' => \Illuminate\Support\Str::random(10),
            ]));
        }
    }
}
