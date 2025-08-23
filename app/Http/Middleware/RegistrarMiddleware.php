<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RegistrarMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
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

        // Check if authenticated user has registrar role
        if (Auth::user()->user_role !== 'registrar') {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Access denied. Registrar privileges required',
                ], 403);
            }

            // Redirect to home with error message
            return redirect()->route('home')
                ->with('error', 'Access denied. Registrar privileges required');
        }

        return $next($request);
    }
}
