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
        Schema::table('generated_certificates', function (Blueprint $table) {
            // Add fields for certificate image uploads
            $table->string('certificate_image_path')->nullable()->after('file_path');
            $table->enum('upload_status', ['pending', 'uploaded', 'approved', 'rejected'])->default('pending')->after('certificate_image_path');
            $table->text('upload_notes')->nullable()->after('upload_status');
            $table->timestamp('uploaded_at')->nullable()->after('upload_notes');
            $table->unsignedBigInteger('uploaded_by')->nullable()->after('uploaded_at');
            $table->unsignedBigInteger('approved_by')->nullable()->after('uploaded_by');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->enum('usage_type', ['academic', 'employment', 'personal', 'other'])->nullable()->after('approved_at');
            $table->text('usage_notes')->nullable()->after('usage_type');
            
            // Add foreign key constraints
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_certificates', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by', 'approved_by']);
            $table->dropColumn([
                'certificate_image_path',
                'upload_status',
                'upload_notes',
                'uploaded_at',
                'uploaded_by',
                'approved_by',
                'approved_at',
                'usage_type',
                'usage_notes'
            ]);
        });
    }
};
