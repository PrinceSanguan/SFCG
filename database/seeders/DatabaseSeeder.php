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
        $this->call(UserSeeder::class);
        $this->call(ParentStudentSeeder::class);
        $this->call(StrandCourseDepartmentSeeder::class);
        $this->call(AcademicManagementSeeder::class);
    }
}
