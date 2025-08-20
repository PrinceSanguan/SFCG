<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('honor_types', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('scope')->default('general'); // general, basic, college
            $table->timestamps();
        });

        // Seed defaults
        DB::table('honor_types')->insert([
            ['key' => 'with_honors', 'name' => 'With Honors', 'scope' => 'basic', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'with_high_honors', 'name' => 'With High Honors', 'scope' => 'basic', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'with_highest_honors', 'name' => 'With Highest Honors', 'scope' => 'basic', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'deans_list', 'name' => "Dean's List", 'scope' => 'college', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'college_honors', 'name' => 'College Honors', 'scope' => 'college', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'cum_laude', 'name' => 'Cum Laude', 'scope' => 'college', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'magna_cum_laude', 'name' => 'Magna Cum Laude', 'scope' => 'college', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'summa_cum_laude', 'name' => 'Summa Cum Laude', 'scope' => 'college', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('honor_types');
    }
};


