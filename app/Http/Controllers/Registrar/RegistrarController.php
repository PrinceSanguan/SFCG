<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegistrarController extends Controller
{
    /**
     * Display the registrar dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Get statistics for dashboard
        $stats = $this->getDashboardStats();
        
        // Get recent users (excluding admin creation functionality)
        try {
            $recentUsers = User::where('user_role', '!=', 'admin')
                ->latest()
                ->take(5)
                ->get();
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error fetching recent users in registrar dashboard: ' . $e->getMessage());
            // Fallback to empty collection if there's an error
            $recentUsers = collect();
        }
            
        // Get recent activities (excluding admin actions)
        try {
            $recentActivities = ActivityLog::with(['user', 'targetUser'])
                ->whereHas('user', function($query) {
                    $query->where('user_role', '!=', 'admin');
                })
                ->latest()
                ->take(5)
                ->get();
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error fetching recent activities in registrar dashboard: ' . $e->getMessage());
            // Fallback to empty collection if there's an error
            $recentActivities = collect();
        }

        return Inertia::render('Registrar/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    private function getDashboardStats(): array
    {
        try {
            return [
                'total_users' => User::where('user_role', '!=', 'admin')->count(),
                'admin_count' => User::where('user_role', 'admin')->count(),
                'registrar_count' => User::where('user_role', 'registrar')->count(),
                'instructor_count' => User::where('user_role', 'instructor')->count(),
                'teacher_count' => User::where('user_role', 'teacher')->count(),
                'adviser_count' => User::where('user_role', 'adviser')->count(),
                'chairperson_count' => User::where('user_role', 'chairperson')->count(),
                'principal_count' => User::where('user_role', 'principal')->count(),
                'student_count' => User::where('user_role', 'student')->count(),
                'parent_count' => User::where('user_role', 'parent')->count(),
                'total_grades' => StudentGrade::count(),
                'total_honors' => HonorResult::count(),
                'total_certificates' => Certificate::count(),
            ];
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error fetching dashboard stats in registrar dashboard: ' . $e->getMessage());
            // Return default values if there's an error
            return [
                'total_users' => 0,
                'admin_count' => 0,
                'registrar_count' => 0,
                'instructor_count' => 0,
                'teacher_count' => 0,
                'adviser_count' => 0,
                'chairperson_count' => 0,
                'principal_count' => 0,
                'student_count' => 0,
                'parent_count' => 0,
                'total_grades' => 0,
                'total_honors' => 0,
                'total_certificates' => 0,
            ];
        }
    }

    /**
     * Display registrar settings.
     */
    public function settings(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('Registrar/Settings', [
            'user' => $user,
        ]);
    }

    /**
     * Update registrar profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);
        
        $user->update($validated);
        
        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update registrar password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user->update([
            'password' => bcrypt($validated['password']),
        ]);
        
        return back()->with('success', 'Password updated successfully.');
    }
}
