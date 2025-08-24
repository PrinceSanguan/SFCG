<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class InstructorMiddleware
{
    /**
     * Handle an incoming request and ensure the authenticated user is an instructor.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('auth.login')->with('error', 'You must be logged in to access this page.');
        }

        $user = Auth::user();
        if (!$user || $user->user_role !== 'instructor') {
            abort(403, 'Unauthorized. You must be an instructor to access this resource.');
        }

        return $next($request);
    }
}
