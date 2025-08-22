<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'grade_update', 'honor_qualification', 'general_announcement'
            $table->string('title');
            $table->text('message');
            $table->json('recipients')->nullable(); // Array of user IDs or email addresses
            $table->string('status')->default('pending'); // pending, sent, failed
            $table->timestamp('sent_at')->nullable();
            $table->json('metadata')->nullable(); // Additional data like grades, honors, etc.
            $table->string('email_subject')->nullable();
            $table->text('email_body')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index('sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
