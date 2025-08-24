<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the instructor profile page.
     */
    public function index()
    {
        return Inertia::render('Instructor/Profile', [
            'user' => Auth::user(),
        ]);
    }
    
    /**
     * Update the instructor's profile information.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = Auth::user();
        
        $validated = $request->validated();
        
        $user->update($validated);
        
        return back()->with('success', 'Profile updated successfully.');
    }
    
    /**
     * Update the instructor's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);
        
        $user = Auth::user();
        
        $user->update([
            'password' => Hash::make($request->password),
        ]);
        
        return back()->with('success', 'Password updated successfully.');
    }
}
