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
            $table->string('certificate_title')->nullable()->after('honor_type');
            $table->text('remarks')->nullable()->after('awarded_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_honors', function (Blueprint $table) {
            $table->dropColumn(['certificate_title', 'remarks']);
        });
    }
};
