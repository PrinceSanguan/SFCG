<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Certificate;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        $gradesCount = StudentGrade::where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->count();

        $honors = HonorResult::with('honorType')
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->get();

        $certificates = Certificate::where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->get();

        return Inertia::render('Student/Dashboard', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'stats' => [
                'grades' => $gradesCount,
                'honor_count' => $honors->count(),
                'certificates' => $certificates->count(),
            ],
        ]);
    }
}
