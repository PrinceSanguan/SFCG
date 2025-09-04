<?php

use App\Http\Controllers\Principal\DashboardController;
use App\Http\Controllers\Principal\AccountController;
use App\Http\Controllers\Principal\GradeManagementController;
use App\Http\Controllers\Principal\HonorTrackingController;
use App\Http\Controllers\Principal\ReportsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'principal'])->prefix('principal')->name('principal.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Account Management
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('index');
        Route::get('/edit', [AccountController::class, 'edit'])->name('edit');
        Route::put('/update', [AccountController::class, 'update'])->name('update');
    });
    
    // Grade Management
    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradeManagementController::class, 'index'])->name('index');
        Route::get('/pending', [GradeManagementController::class, 'pendingGrades'])->name('pending');
        Route::post('/{grade}/approve', [GradeManagementController::class, 'approveGrade'])->name('approve');
        Route::post('/{grade}/return', [GradeManagementController::class, 'returnGrade'])->name('return');
        Route::get('/{grade}/review', [GradeManagementController::class, 'reviewGrade'])->name('review');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/pending-grades', [GradeManagementController::class, 'getPendingGrades'])->name('pending-grades');
            Route::get('/approved-grades', [GradeManagementController::class, 'getApprovedGrades'])->name('approved-grades');
            Route::get('/returned-grades', [GradeManagementController::class, 'getReturnedGrades'])->name('returned-grades');
        });
    });
    
    // Honor Tracking
    Route::prefix('honors')->name('honors.')->group(function () {
        Route::get('/', [HonorTrackingController::class, 'index'])->name('index');
        Route::get('/pending', [HonorTrackingController::class, 'pendingHonors'])->name('pending');
        Route::post('/{honor}/approve', [HonorTrackingController::class, 'approveHonor'])->name('approve');
        Route::post('/{honor}/reject', [HonorTrackingController::class, 'rejectHonor'])->name('reject');
        Route::get('/{honor}/review', [HonorTrackingController::class, 'reviewHonor'])->name('review');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/pending-honors', [HonorTrackingController::class, 'getPendingHonors'])->name('pending-honors');
            Route::get('/approved-honors', [HonorTrackingController::class, 'getApprovedHonors'])->name('approved-honors');
            Route::get('/rejected-honors', [HonorTrackingController::class, 'getRejectedHonors'])->name('rejected-honors');
        });
    });
    
    // Reports and Archiving
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportsController::class, 'index'])->name('index');
        Route::get('/academic-performance', [ReportsController::class, 'academicPerformance'])->name('academic-performance');
        Route::get('/grade-trends', [ReportsController::class, 'gradeTrends'])->name('grade-trends');
        Route::get('/honor-statistics', [ReportsController::class, 'honorStatistics'])->name('honor-statistics');
        Route::get('/export/{type}', [ReportsController::class, 'export'])->name('export');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/performance-data', [ReportsController::class, 'getPerformanceData'])->name('performance-data');
            Route::get('/trend-data', [ReportsController::class, 'getTrendData'])->name('trend-data');
            Route::get('/honor-data', [ReportsController::class, 'getHonorData'])->name('honor-data');
        });
    });
});
