<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('strand_id')->nullable()->after('year_level')->constrained()->onDelete('set null');
            $table->foreignId('course_id')->nullable()->after('strand_id')->constrained()->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['strand_id']);
            $table->dropColumn('strand_id');
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });
    }
};
