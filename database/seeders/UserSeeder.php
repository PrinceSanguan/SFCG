<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create additional sample users (different from AdminSeeder)
        $additionalUsers = [
            [
                'name' => 'Prof. Michael Thompson',
                'email' => 'michael.thompson@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Dr. Jessica Martinez',
                'email' => 'jessica.martinez@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Thomas Anderson',
                'email' => 'thomas.anderson@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Rachel Green',
                'email' => 'rachel.green@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Alex Johnson',
                'email' => 'alex.johnson@school.edu',
                'role' => 'user',
            ],
        ];

        // Create the additional users using firstOrCreate to avoid duplicates
        foreach ($additionalUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password123'),
                    'user_role' => $userData['role'],
                    'email_verified_at' => now(),
                    'last_login_at' => now()->subDays(rand(1, 30)),
                ]
            );
        }

        // Create random sample users (only if they don't exist)
        $existingEmails = User::pluck('email')->toArray();
        $usersToCreate = max(0, 25 - count($existingEmails)); // Ensure we have at least 25 total users

        if ($usersToCreate > 0) {
            User::factory($usersToCreate)->create([
                'user_role' => 'user',
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Additional sample users created successfully!');
    }
}
