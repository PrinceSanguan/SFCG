<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificate_templates', 'source_docx_path')) {
                $table->string('source_docx_path')->nullable()->after('content_html');
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            if (Schema::hasColumn('certificate_templates', 'source_docx_path')) {
                $table->dropColumn('source_docx_path');
            }
        });
    }
};



