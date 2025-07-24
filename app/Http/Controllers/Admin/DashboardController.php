<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get dashboard statistics
        $totalUsers = User::count();
        $totalAdmins = User::where('user_role', 'admin')->count();
        $totalRegularUsers = User::where('user_role', 'user')->count();
        $recentUsers = User::latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_role,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_regular_users' => $totalRegularUsers,
                'recent_users_count' => $recentUsers->count(),
            ],
            'recent_users' => $recentUsers->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->user_role,
                    'created_at' => $user->created_at,
                ];
            }),
        ]);
    }
}
