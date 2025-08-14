<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ActivityLogController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register admin routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "admin" middleware group. All routes require admin access.
|
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [UserManagementController::class, 'dashboard'])->name('dashboard');
    
    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        // List all users with filters and pagination
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        
        // Show create form
        Route::get('/create', [UserManagementController::class, 'create'])->name('create');
        
        // Store new user
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        
        // Show specific user details and activity logs
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        
        // Show edit form
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        
        // Update user
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        
        // Delete user
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        
        // Reset user password
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
        
        // Get user profile data for API calls
        Route::get('/{user}/profile', [UserManagementController::class, 'profile'])->name('profile');
    });
    
    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        // Get activity logs with filters
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        
        // Get activity logs for specific user
        Route::get('/user/{user}', [ActivityLogController::class, 'userLogs'])->name('user');
    });
    
    // API endpoints for AJAX calls
    Route::prefix('api')->name('api.')->group(function () {
        // Get users data for datatables/search
        Route::get('/users', [UserManagementController::class, 'apiIndex'])->name('users.index');
        
        // Get user stats for dashboard
        Route::get('/stats', [UserManagementController::class, 'stats'])->name('stats');
        
        // Get recent activities
        Route::get('/recent-activities', [ActivityLogController::class, 'recentActivities'])->name('recent-activities');
    });
});
