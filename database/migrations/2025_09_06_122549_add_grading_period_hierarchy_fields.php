<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grading_periods', function (Blueprint $table) {
            // Add type field to distinguish between quarters and semesters
            $table->enum('type', ['quarter', 'semester'])->default('quarter')->after('code');
            
            // Add parent_id for hierarchical structure (semester -> midterm/prefinal/final)
            $table->foreignId('parent_id')->nullable()->constrained('grading_periods')->onDelete('cascade')->after('academic_level_id');
            
            // Add period_type for semester sub-periods
            $table->enum('period_type', ['quarter', 'midterm', 'prefinal', 'final'])->default('quarter')->after('type');
            
            // Add semester number for semester-based grading
            $table->integer('semester_number')->nullable()->after('period_type');
            
            // Add weight for grade calculation
            $table->decimal('weight', 5, 2)->default(1.00)->after('semester_number');
            
            // Add is_calculated to mark if this period is calculated from others
            $table->boolean('is_calculated')->default(false)->after('weight');
        });
    }

    public function down(): void
    {
        Schema::table('grading_periods', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'type',
                'parent_id', 
                'period_type',
                'semester_number',
                'weight',
                'is_calculated'
            ]);
        });
    }
};