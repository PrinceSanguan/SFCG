<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_grades', function (Blueprint $table) {
            $table->boolean('is_submitted_for_validation')->default(false)->after('grade');
            $table->timestamp('submitted_at')->nullable()->after('is_submitted_for_validation');
            $table->timestamp('validated_at')->nullable()->after('submitted_at');
            $table->foreignId('validated_by')->nullable()->constrained('users')->after('validated_at');
        });
    }

    public function down(): void
    {
        Schema::table('student_grades', function (Blueprint $table) {
            $table->dropForeign(['validated_by']);
            $table->dropColumn(['is_submitted_for_validation', 'submitted_at', 'validated_at', 'validated_by']);
        });
    }
};
