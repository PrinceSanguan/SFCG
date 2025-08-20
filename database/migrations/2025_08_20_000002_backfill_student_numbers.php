<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\User;

return new class extends Migration {
    public function up(): void
    {
        // Assign student_number to existing students missing it
        User::where('user_role', 'student')
            ->whereNull('student_number')
            ->orderBy('id')
            ->chunkById(200, function ($students) {
                foreach ($students as $student) {
                    /** @var User $student */
                    $student->student_number = User::generateStudentNumber($student);
                    $student->save();
                }
            });
    }

    public function down(): void
    {
        // No-op: do not remove assigned student numbers
    }
};


