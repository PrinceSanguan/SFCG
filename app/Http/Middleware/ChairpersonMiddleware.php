<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;



class ChairpersonMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        // Check if user is authenticated
        if (!Auth::check()) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 401);
            }

            // Redirect to login with error message
            return redirect()->route('auth.login')
                ->with('error', 'Please login to access this page');
        }

        // Check if authenticated user has chairperson role
        if (Auth::user()->user_role !== 'chairperson') {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Access denied. Chairperson privileges required',
                ], 403);
            }

            // Redirect to home with error message
            return redirect()->route('home')
                ->with('error', 'Access denied. Chairperson privileges required');
        }

        return $next($request);
    }
}
