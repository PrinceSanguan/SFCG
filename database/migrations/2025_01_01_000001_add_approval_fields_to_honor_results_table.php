<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('honor_results', function (Blueprint $table) {
            // Add approval fields
            $table->boolean('is_pending_approval')->default(true)->after('is_overridden');
            $table->boolean('is_approved')->default(false)->after('is_pending_approval');
            $table->timestamp('approved_at')->nullable()->after('is_approved');
            $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            // Add rejection fields
            $table->boolean('is_rejected')->default(false)->after('is_approved');
            $table->timestamp('rejected_at')->nullable()->after('is_rejected');
            $table->unsignedBigInteger('rejected_by')->nullable()->after('rejected_at');
            $table->text('rejection_reason')->nullable()->after('rejected_by');
            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('honor_results', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropColumn([
                'is_pending_approval',
                'is_approved',
                'approved_at',
                'approved_by',
                'is_rejected',
                'rejected_at',
                'rejected_by',
                'rejection_reason'
            ]);
        });
    }
};
