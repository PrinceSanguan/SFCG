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
        // Skip maintenance check for auth routes, home route, and ALL admin routes
        $path = $request->path();
        if (str_starts_with($path, 'login') || 
            str_starts_with($path, 'logout') || 
            str_starts_with($path, 'register') ||
            str_starts_with($path, 'auth/') ||
            str_starts_with($path, 'admin/') ||
            $path === '' || $path === '/') {
            return $next($request);
        }

        // Check if maintenance mode is enabled
        $isMaintenanceMode = SystemSetting::isMaintenanceMode();
        
        if ($isMaintenanceMode) {
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