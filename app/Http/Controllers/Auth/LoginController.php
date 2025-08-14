<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
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
        return Inertia::render('Auth/Login');
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
            $request->session()->regenerate();

            // Update last login timestamp
            Auth::user()->update(['last_login_at' => now()]);

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

            $redirectUrl = $roleRedirects[Auth::user()->user_role] ?? route('user.dashboard');
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

        return redirect()->route('home');
    }
}
