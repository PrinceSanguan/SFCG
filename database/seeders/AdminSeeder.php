<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the main admin user
        User::firstOrCreate(
            ['email' => 'admin@school.edu'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'user_role' => 'admin',
                'email_verified_at' => now(),
                'last_login_at' => now(),
            ]
        );

        // Create additional admin users for demonstration
        User::firstOrCreate(
            ['email' => 'principal@school.edu'],
            [
                'name' => 'Maria Garcia (Principal)',
                'password' => Hash::make('principal123'),
                'user_role' => 'admin',
                'email_verified_at' => now(),
                'last_login_at' => now()->subDays(1),
            ]
        );

        User::firstOrCreate(
            ['email' => 'dean@school.edu'],
            [
                'name' => 'Dr. Robert Chen (Academic Dean)',
                'password' => Hash::make('dean123'),
                'user_role' => 'admin',
                'email_verified_at' => now(),
                'last_login_at' => now()->subDays(2),
            ]
        );

        // Create sample faculty and staff users
        $sampleUsers = [
            [
                'name' => 'Dr. Sarah Johnson',
                'email' => 'sarah.johnson@school.edu',
                'role' => 'user', // instructor
            ],
            [
                'name' => 'Mark Wilson',
                'email' => 'mark.wilson@school.edu',
                'role' => 'user', // teacher
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@school.edu',
                'role' => 'user', // class adviser
            ],
            [
                'name' => 'John Smith',
                'email' => 'john.smith@school.edu',
                'role' => 'user', // chairperson
            ],
            [
                'name' => 'Lisa Thompson',
                'email' => 'lisa.thompson@school.edu',
                'role' => 'user', // registrar
            ],
            [
                'name' => 'David Rodriguez',
                'email' => 'david.rodriguez@school.edu',
                'role' => 'user', // guidance counselor
            ],
        ];

        foreach ($sampleUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password123'),
                    'user_role' => $userData['role'],
                    'email_verified_at' => now(),
                    'last_login_at' => now()->subDays(rand(1, 7)),
                ]
            );
        }

        $this->command->info('Admin users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Email: admin@school.edu | Password: admin123');
        $this->command->info('Email: principal@school.edu | Password: principal123');
        $this->command->info('Email: dean@school.edu | Password: dean123');
    }
} 