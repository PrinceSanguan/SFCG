<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Department;
use App\Models\AcademicLevel;

class UpdateDepartmentsAcademicLevelSeeder extends Seeder
{
    public function run(): void
    {
        // Get College level ID
        $college = AcademicLevel::where('key', 'college')->first();
        
        if (!$college) {
            $this->command->error('College academic level not found!');
            return;
        }

        // Update all existing departments to be college level
        Department::query()->update([
            'academic_level_id' => $college->id,
            'is_active' => true,
        ]);

        // Update descriptions for departments that don't have them
        Department::whereNull('description')->each(function ($department) {
            $department->update([
                'description' => $department->name . ' Department'
            ]);
        });

        $this->command->info('Updated all departments with college academic level.');
    }
}
