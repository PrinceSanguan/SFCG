<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'admin',
        ]);

        // Create Instructor User
        User::create([
            'name' => 'Instructor User',
            'email' => 'instructor@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'instructor',
        ]);

        // Create Class Adviser User
        User::create([
            'name' => 'Class Adviser User',
            'email' => 'classadviser@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'class_adviser',
        ]);

        // Create Chairperson User
        User::create([
            'name' => 'Chairperson User',
            'email' => 'chairperson@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'chairperson',
        ]);

        // Create Principal User
        User::create([
            'name' => 'Principal User',
            'email' => 'principal@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'principal',
        ]);

        // Create Registrar User
        User::create([
            'name' => 'Registrar User',
            'email' => 'registrar@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'registrar',
        ]);

        // Create Student User
        User::create([
            'name' => 'Student User',
            'email' => 'student@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'student',
        ]);

        // Create Parent User
        User::create([
            'name' => 'Parent User',
            'email' => 'parent@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'parent',
        ]);

        // Create Teacher User
        User::create([
            'name' => 'Teacher User',
            'email' => 'teacher@gmail.com',
            'password' => Hash::make('password123'),
            'user_role' => 'teacher',
        ]);
    }
}
