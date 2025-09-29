<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            $table->json('grading_period_ids')->nullable()->after('section');
        });
    }

    public function down(): void
    {
        Schema::table('class_adviser_assignments', function (Blueprint $table) {
            $table->dropColumn('grading_period_ids');
        });
    }
};