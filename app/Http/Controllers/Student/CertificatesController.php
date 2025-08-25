<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Certificate;

class CertificatesController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');

        $certificates = Certificate::with('template')
            ->where('student_id', $user->id)
            ->where('school_year', $schoolYear)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Certificates/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'certificates' => $certificates,
        ]);
    }
}
