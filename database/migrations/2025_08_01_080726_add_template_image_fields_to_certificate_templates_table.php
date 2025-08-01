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
        Schema::table('certificate_templates', function (Blueprint $table) {
            // Add fields for template image uploads
            $table->string('template_image_path')->nullable()->after('template_content');
            $table->text('image_description')->nullable()->after('template_image_path');
            $table->json('image_placeholders')->nullable()->after('image_description');
            $table->enum('template_type', ['code', 'image'])->default('code')->after('image_placeholders');
            $table->unsignedBigInteger('created_by')->nullable()->after('template_type');
            $table->timestamp('image_uploaded_at')->nullable()->after('created_by');
            
            // Add foreign key constraint
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'template_image_path',
                'image_description',
                'image_placeholders',
                'template_type',
                'created_by',
                'image_uploaded_at'
            ]);
        });
    }
};
