<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip maintenance check for login page and ALL admin routes
        if ($request->routeIs('auth.login') || $request->routeIs('admin.*')) {
            return $next($request);
        }

        // Check if maintenance mode is enabled
        if (SystemSetting::isMaintenanceMode()) {
            // If user is not authenticated, redirect to maintenance page
            if (!Auth::check()) {
                return response()->view('maintenance');
            }
            
            // If user is authenticated but not admin, log them out and redirect to maintenance page
            if (Auth::user()->user_role !== 'admin') {
                Auth::logout();
                return response()->view('maintenance');
            }
        }

        return $next($request);
    }
}