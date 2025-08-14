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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who performed the action
            $table->foreignId('target_user_id')->nullable()->constrained('users')->onDelete('cascade'); // User who was affected (for user management actions)
            $table->string('action'); // Action performed (e.g., 'created_user', 'updated_user', 'deleted_user', 'reset_password', 'login', 'logout')
            $table->string('entity_type')->nullable(); // Type of entity affected (e.g., 'user', 'admin', 'student')
            $table->unsignedBigInteger('entity_id')->nullable(); // ID of the affected entity
            $table->json('details')->nullable(); // Additional details about the action (e.g., what fields were changed)
            $table->string('ip_address')->nullable(); // IP address from where the action was performed
            $table->text('user_agent')->nullable(); // User agent information
            $table->timestamps();
            
            // Index for better performance
            $table->index(['user_id', 'created_at']);
            $table->index(['target_user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
