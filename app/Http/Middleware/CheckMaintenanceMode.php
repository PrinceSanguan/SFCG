<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;

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
            // If user is not authenticated, allow them to reach login page
            // The login page will show maintenance message but allow admin login
            if (!auth()->check()) {
                return $next($request);
            }
            
            // If user is authenticated but not admin, log them out and redirect
            if (auth()->user()->user_role !== 'admin') {
                auth()->logout();
                return redirect()->route('auth.login')->with('maintenance', 'The system is currently under maintenance. Please try again later.');
            }
        }

        return $next($request);
    }
}