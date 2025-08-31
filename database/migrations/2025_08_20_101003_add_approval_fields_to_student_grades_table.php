<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_grades', function (Blueprint $table) {
            // Add approval fields
            $table->boolean('is_approved')->default(false)->after('is_submitted_for_validation');
            $table->timestamp('approved_at')->nullable()->after('is_approved');
            $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            // Add return fields
            $table->boolean('is_returned')->default(false)->after('is_approved');
            $table->timestamp('returned_at')->nullable()->after('is_returned');
            $table->unsignedBigInteger('returned_by')->nullable()->after('returned_at');
            $table->text('return_reason')->nullable()->after('returned_by');
            $table->foreign('returned_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('student_grades', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['returned_by']);
            $table->dropColumn([
                'is_approved',
                'approved_at',
                'approved_by',
                'is_returned',
                'returned_at',
                'returned_by',
                'return_reason'
            ]);
        });
    }
};
