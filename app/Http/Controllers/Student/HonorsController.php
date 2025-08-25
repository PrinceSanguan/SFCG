<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\HonorResult;

class HonorsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        $honors = HonorResult::with('honorType')
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->get();

        return Inertia::render('Student/Honors/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'honors' => $honors,
        ]);
    }
}
