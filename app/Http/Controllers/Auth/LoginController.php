<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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

            // Check user role and redirect accordingly
            if (Auth::user()->user_role === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif (Auth::user()->user_role === 'student') {
                return redirect()->route('student.dashboard');
            } elseif (Auth::user()->user_role === 'instructor') {
                return redirect()->route('instructor.dashboard');
            } elseif (Auth::user()->user_role === 'teacher') {
                return redirect()->route('teacher.dashboard');
            } elseif (Auth::user()->user_role === 'class_adviser') {
                return redirect()->route('class-adviser.dashboard');
            } elseif (Auth::user()->user_role === 'chairperson') {
                return redirect()->route('chairperson.dashboard');
            } elseif (Auth::user()->user_role === 'parent') {
                return redirect()->route('parent.dashboard');
            } elseif (Auth::user()->user_role === 'principal') {
                return redirect()->route('principal.dashboard');
            } elseif (Auth::user()->user_role === 'registrar') {
                return redirect()->route('registrar.dashboard');
            }
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

        return redirect()->route('home')->with('success', 'You have been successfully logged out.');
    }
}
