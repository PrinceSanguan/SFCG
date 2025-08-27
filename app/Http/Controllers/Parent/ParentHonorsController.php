<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\HonorResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentHonorsController extends Controller
{
    /**
     * Display a listing of honor results for all linked children.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = request('school_year', '2024-2025');
        $studentId = request('student_id');
        
        // Get linked students
        $linkedStudents = $user->students()->orderBy('name')->get();
        
        // If no students linked, return empty view
        if ($linkedStudents->isEmpty()) {
            return Inertia::render('Parent/Honors/Index', [
                'user' => $user,
                'schoolYear' => $schoolYear,
                'linkedStudents' => [],
                'honors' => [],
                'selectedStudent' => null,
            ]);
        }
        
        // If no student selected, use the first one
        if (!$studentId && $linkedStudents->isNotEmpty()) {
            $studentId = $linkedStudents->first()->id;
        }
        
        // Get honors for selected student
        $honors = collect();
        $selectedStudent = null;
        
        if ($studentId) {
            $selectedStudent = $linkedStudents->firstWhere('id', $studentId);
            
            if ($selectedStudent) {
                $honors = HonorResult::with([
                    'honorType',
                    'academicLevel'
                ])
                ->where('student_id', $studentId)
                ->where('school_year', $schoolYear)
                ->orderBy('created_at', 'desc')
                ->get();
            }
        }
        
        return Inertia::render('Parent/Honors/Index', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'linkedStudents' => $linkedStudents,
            'honors' => $honors,
            'selectedStudent' => $selectedStudent,
        ]);
    }
}
