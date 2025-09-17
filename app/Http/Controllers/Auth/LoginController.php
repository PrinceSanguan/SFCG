<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Display the Login Page
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $maintenanceMode = SystemSetting::isMaintenanceMode();
        
        return Inertia::render('Auth/Login', [
            'maintenanceMode' => $maintenanceMode,
        ]);
    }

    /**
     * Handle the incoming authentication request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if maintenance mode is enabled and user is not admin
            if (SystemSetting::isMaintenanceMode() && $user->user_role !== 'admin') {
                Auth::logout();
                throw ValidationException::withMessages([
                    'email' => 'The system is currently under maintenance. Only admin accounts can access the system.',
                ]);
            }

            $request->session()->regenerate();

            // Update last login timestamp
            $user->update(['last_login_at' => now()]);

            // Log login activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'login',
                'entity_type' => 'auth',
                'details' => [
                    'login_time' => now(),
                    'user_agent' => $request->userAgent(),
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Role-based redirect
            $roleRedirects = [
                'admin' => route('admin.dashboard'),
                'registrar' => route('registrar.dashboard'),
                'instructor' => route('instructor.dashboard'),
                'teacher' => route('teacher.dashboard'),
                'adviser' => route('adviser.dashboard'),
                'chairperson' => route('chairperson.dashboard'),
                'principal' => route('principal.dashboard'),
                'student' => route('student.dashboard'),
                'parent' => route('parent.dashboard'),
            ];

            $redirectUrl = $roleRedirects[$user->user_role] ?? route('user.dashboard');
            return redirect($redirectUrl);
        }

        // Authentication failed
        throw ValidationException::withMessages([
            'auth' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('auth.login');
    }
}
