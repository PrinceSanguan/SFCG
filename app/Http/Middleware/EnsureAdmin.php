<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('auth.login')->with('error', 'You must be logged in to access this page.');
        }

        // Check if user is an admin
        if (!auth()->user()->isAdmin()) {
            // Log unauthorized access attempt
            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'unauthorized_admin_access',
                'entity_type' => 'admin_panel',
                'details' => [
                    'url' => $request->fullUrl(),
                    'attempted_at' => now(),
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            abort(403, 'Unauthorized. Admin access required.');
        }

        return $next($request);
    }
}
