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
        User::factory()->create([
            'name' => 'Admin Account',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('admin123'),
            'user_role' => 'admin',
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
            User::factory()->create($account);
        }

        // Create additional random users for testing
        User::factory(10)->create([
            'user_role' => 'student',
        ]);

        User::factory(5)->create([
            'user_role' => 'parent',
        ]);

        User::factory(3)->create([
            'user_role' => 'teacher',
        ]);
    }
}
