<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('address')->nullable()->change();
            $table->string('contact_number')->nullable()->change();
            $table->string('middle_name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('address')->nullable(false)->change();
            $table->string('contact_number')->nullable(false)->change();
            $table->string('middle_name')->nullable(false)->change();
        });
    }
};
