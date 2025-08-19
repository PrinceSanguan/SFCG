<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('academic_levels')) {
            Schema::table('academic_levels', function (Blueprint $table) {
                if (!Schema::hasColumn('academic_levels', 'sort_order')) {
                    $table->unsignedInteger('sort_order')->default(0)->after('name');
                }
                if (!Schema::hasColumn('academic_levels', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('sort_order');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('academic_levels')) {
            Schema::table('academic_levels', function (Blueprint $table) {
                if (Schema::hasColumn('academic_levels', 'is_active')) {
                    $table->dropColumn('is_active');
                }
                if (Schema::hasColumn('academic_levels', 'sort_order')) {
                    $table->dropColumn('sort_order');
                }
            });
        }
    }
};



