<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run admin seeder first to create admin users
        $this->call(AdminSeeder::class);
        
        // Run user seeder for additional sample data
        $this->call(UserSeeder::class);
    }
}
