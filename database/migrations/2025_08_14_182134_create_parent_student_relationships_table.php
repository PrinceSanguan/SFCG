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
        Schema::create('parent_student_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->enum('relationship_type', ['father', 'mother', 'guardian', 'other'])->default('guardian');
            $table->string('emergency_contact')->default('no');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure a parent can't be linked to the same student multiple times with the same relationship type
            $table->unique(['parent_id', 'student_id', 'relationship_type'], 'unique_parent_student_relationship');
            
            // Add indexes for better performance
            $table->index(['parent_id']);
            $table->index(['student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_student_relationships');
    }
};
