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
            // Certificate printing tracking
            $table->timestamp('printed_at')->nullable()->after('generated_at');
            $table->integer('print_count')->default(0)->after('printed_at');
            
            // Certificate issuance tracking
            $table->timestamp('issued_at')->nullable()->after('print_count');
            $table->string('issued_to')->nullable()->after('issued_at');
            $table->string('issued_by')->nullable()->after('issued_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_certificates', function (Blueprint $table) {
            $table->dropColumn([
                'printed_at',
                'print_count',
                'issued_at',
                'issued_to',
                'issued_by'
            ]);
        });
    }
};
