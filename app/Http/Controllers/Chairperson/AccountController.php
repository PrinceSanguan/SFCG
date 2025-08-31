<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Chairperson/Account/Index', [
            'user' => $user,
        ]);
    }
    
    public function edit()
    {
        $user = Auth::user();
        
        return Inertia::render('Chairperson/Account/Edit', [
            'user' => $user,
        ]);
    }
    
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['nullable', 'string'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);
        
        // Update basic information
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);
        
        // Update password if provided
        if ($validated['new_password']) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'The current password is incorrect.']);
            }
            
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);
        }
        
        return redirect()->route('chairperson.account.index')
            ->with('success', 'Account updated successfully.');
    }
}
