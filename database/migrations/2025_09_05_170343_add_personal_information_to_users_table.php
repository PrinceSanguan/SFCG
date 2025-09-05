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
        Schema::table('users', function (Blueprint $table) {
            // Basic Personal Information
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('nationality', 50)->default('Filipino');
            $table->string('religion', 100)->nullable();
            
            // Emergency Contact Information
            $table->string('emergency_contact_name', 255)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relationship', 50)->nullable();
            
            // Academic Information
            $table->string('lrn', 20)->nullable()->unique(); // Learner Reference Number
            $table->string('previous_school', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop personal information columns
            $table->dropColumn([
                'birth_date',
                'gender',
                'phone_number',
                'address',
                'city',
                'province',
                'postal_code',
                'nationality',
                'religion',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
                'lrn',
                'previous_school',
            ]);
        });
    }
};
