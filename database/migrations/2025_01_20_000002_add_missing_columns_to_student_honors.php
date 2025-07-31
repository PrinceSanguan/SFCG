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
        Schema::table('student_honors', function (Blueprint $table) {
            // Add missing columns that the code expects
            $table->boolean('is_active')->default(true)->after('gpa');
            $table->foreignId('honor_criterion_id')->nullable()->constrained('honor_criteria')->after('academic_period_id');
            $table->timestamp('awarded_date')->nullable()->after('is_active');
        });

        // Update existing records to have is_active = is_approved
        DB::statement('UPDATE student_honors SET is_active = is_approved');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_honors', function (Blueprint $table) {
            $table->dropForeign(['honor_criterion_id']);
            $table->dropColumn(['is_active', 'honor_criterion_id', 'awarded_date']);
        });
    }
}; 