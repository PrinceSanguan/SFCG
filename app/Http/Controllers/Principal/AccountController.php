<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Principal/Account/Index', [
            'user' => $user,
        ]);
    }
    
    public function edit()
    {
        $user = Auth::user();
        
        return Inertia::render('Principal/Account/Edit', [
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
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);
        
        // Verify current password if changing password
        if ($validated['password'] && !Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.']);
        }
        
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];
        
        if ($validated['password']) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        
        DB::table('users')->where('id', $user->id)->update($updateData);
        
        return redirect()->route('principal.account.index')
            ->with('success', 'Account updated successfully.');
    }
}
