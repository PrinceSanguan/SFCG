<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\UserAccountCreatedEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class RegisterController extends Controller
{
    // Show the registration form
    public function index()
    {
        return Inertia::render('Auth/Register');
    }

    // Store registration data
    public function store(Request $request)
    {
        // Simple validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        // Create a new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash the password
        ]);

        // Send email to user with their credentials
        try {
            Mail::to($user->email)->send(
                new UserAccountCreatedEmail($user, $request->password)
            );
        } catch (\Exception $e) {
            // Log error but don't fail the registration
            \Log::error('User account creation email failed to send', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        // Redirect to login or dashboard
        return redirect()->route('auth.login')->with('success', 'Account created successfully!');
    }
}
