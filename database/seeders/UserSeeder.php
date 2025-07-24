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
        // Create additional sample users with explicit data (no faker)
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
            [
                'name' => 'Jennifer Lee',
                'email' => 'jennifer.lee@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Robert Brown',
                'email' => 'robert.brown@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Amanda White',
                'email' => 'amanda.white@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Christopher Davis',
                'email' => 'christopher.davis@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Michelle Taylor',
                'email' => 'michelle.taylor@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'James Wilson',
                'email' => 'james.wilson@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Patricia Moore',
                'email' => 'patricia.moore@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Daniel Clark',
                'email' => 'daniel.clark@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Barbara Lewis',
                'email' => 'barbara.lewis@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Matthew Hall',
                'email' => 'matthew.hall@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Susan Allen',
                'email' => 'susan.allen@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Joseph Young',
                'email' => 'joseph.young@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Nancy King',
                'email' => 'nancy.king@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Anthony Wright',
                'email' => 'anthony.wright@school.edu',
                'role' => 'user',
            ],
            [
                'name' => 'Helen Scott',
                'email' => 'helen.scott@school.edu',
                'role' => 'user',
            ],
        ];

        // Create all users using explicit data (no faker)
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

        $this->command->info('Additional sample users created successfully!');
        $this->command->info('All users created with explicit data (no faker used)');
    }
}
