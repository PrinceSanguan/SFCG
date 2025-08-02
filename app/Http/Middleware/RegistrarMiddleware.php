<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RegistrarMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('auth.login');
        }

        if (Auth::user()->user_role !== 'registrar') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Registrar privileges required.'], 403);
            }
            return redirect()->route('home')->with('error', 'Access denied. Registrar privileges required.');
        }

        return $next($request);
    }
}
