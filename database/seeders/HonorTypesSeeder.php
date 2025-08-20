<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HonorType;

class HonorTypesSeeder extends Seeder
{
    public function run(): void
    {
        // Basic Education Honor Types (scope: 'basic')
        HonorType::updateOrCreate(['key' => 'with_honors'], [
            'name' => 'With Honors',
            'scope' => 'basic',
        ]);

        HonorType::updateOrCreate(['key' => 'with_high_honors'], [
            'name' => 'With High Honors',
            'scope' => 'basic',
        ]);

        HonorType::updateOrCreate(['key' => 'with_highest_honors'], [
            'name' => 'With Highest Honors',
            'scope' => 'basic',
        ]);

        // College Honor Types (scope: 'college')
        HonorType::updateOrCreate(['key' => 'deans_list'], [
            'name' => 'Dean\'s List',
            'scope' => 'college',
        ]);

        HonorType::updateOrCreate(['key' => 'cum_laude'], [
            'name' => 'Cum Laude',
            'scope' => 'college',
        ]);

        HonorType::updateOrCreate(['key' => 'magna_cum_laude'], [
            'name' => 'Magna Cum Laude',
            'scope' => 'college',
        ]);

        HonorType::updateOrCreate(['key' => 'summa_cum_laude'], [
            'name' => 'Summa Cum Laude',
            'scope' => 'college',
        ]);

        HonorType::updateOrCreate(['key' => 'college_honors'], [
            'name' => 'College Honors',
            'scope' => 'college',
        ]);
    }
}
