<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ParentController extends Controller
{
    /**
     * Display the parent dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $schoolYear = request('school_year', '2024-2025'); // Default school year
        
        // Get linked students
        $linkedStudents = $user->students()->with([
            'studentGrades' => function ($query) use ($schoolYear) {
                $query->where('school_year', $schoolYear);
            },
            'honorResults' => function ($query) use ($schoolYear) {
                $query->where('school_year', $schoolYear);
            },
            'certificates' => function ($query) use ($schoolYear) {
                $query->where('school_year', $schoolYear);
            }
        ])->get();
        
        // Calculate dashboard statistics
        $stats = $this->getDashboardStats($linkedStudents, $schoolYear);
        
        // Get recent activities for linked students
        $recentActivities = $this->getRecentActivities($linkedStudents, $schoolYear);
        
        return Inertia::render('Parent/Dashboard', [
            'user' => $user,
            'schoolYear' => $schoolYear,
            'linkedStudents' => $linkedStudents,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }
    
    /**
     * Get dashboard statistics.
     */
    private function getDashboardStats($linkedStudents, $schoolYear): array
    {
        $totalStudents = $linkedStudents->count();
        $totalGrades = 0;
        $totalHonors = 0;
        $totalCertificates = 0;
        
        foreach ($linkedStudents as $student) {
            $totalGrades += $student->studentGrades->count();
            $totalHonors += $student->honorResults->count();
            $totalCertificates += $student->certificates->count();
        }
        
        return [
            'total_students' => $totalStudents,
            'total_grades' => $totalGrades,
            'total_honors' => $totalHonors,
            'total_certificates' => $totalCertificates,
        ];
    }
    
    /**
     * Get recent activities for linked students.
     */
    private function getRecentActivities($linkedStudents, $schoolYear): array
    {
        $activities = [];
        
        foreach ($linkedStudents as $student) {
            // Add recent grade updates
            foreach ($student->studentGrades->take(3) as $grade) {
                $activities[] = [
                    'type' => 'grade_update',
                    'student_name' => $student->name,
                    'subject' => $grade->subject->name ?? 'Unknown Subject',
                    'grade' => $grade->grade,
                    'date' => $grade->updated_at,
                    'icon' => 'BookOpen',
                    'color' => 'blue'
                ];
            }
            
            // Add recent honor achievements
            foreach ($student->honorResults->take(3) as $honor) {
                $activities[] = [
                    'type' => 'honor_achievement',
                    'student_name' => $student->name,
                    'honor_type' => $honor->honorType->name ?? 'Honor',
                    'date' => $honor->created_at,
                    'icon' => 'Crown',
                    'color' => 'yellow'
                ];
            }
        }
        
        // Sort by date and take the most recent 10
        usort($activities, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, 10);
    }
    
    /**
     * Display parent settings page.
     */
    public function settings()
    {
        $user = Auth::user();
        
        return Inertia::render('Parent/Settings', [
            'user' => $user,
        ]);
    }
    
    /**
     * Update parent profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);
        
        $user->update($validated);
        
        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
    
    /**
     * Update parent password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user->update([
            'password' => bcrypt($validated['password'])
        ]);
        
        return redirect()->back()->with('success', 'Password updated successfully.');
    }
}
