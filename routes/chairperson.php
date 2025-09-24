<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Chairperson\ChairpersonController;
use App\Http\Controllers\Chairperson\GradeManagementController;
use App\Http\Controllers\Chairperson\HonorTrackingController;
use App\Http\Controllers\Chairperson\ReportsController;
use App\Http\Controllers\Chairperson\AccountController;

/*
|--------------------------------------------------------------------------
| Chairperson Routes
|--------------------------------------------------------------------------
|
| Here is where you can register chairperson routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "chairperson" middleware group. All routes require chairperson access.
|
*/

Route::middleware(['auth', 'chairperson'])->prefix('chairperson')->name('chairperson.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [ChairpersonController::class, 'dashboard'])->name('dashboard');
    
    // Account Management
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('index');
        Route::get('/edit', [AccountController::class, 'edit'])->name('edit');
        Route::put('/', [AccountController::class, 'update'])->name('update');
    });
    
    // Grade Management (View Only)
    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradeManagementController::class, 'index'])->name('index');
        Route::get('/all', [GradeManagementController::class, 'allGrades'])->name('all');
        Route::get('/{grade}/review', [GradeManagementController::class, 'reviewGrade'])->name('review');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/all-grades', [GradeManagementController::class, 'getAllGrades'])->name('all-grades');
        });
    });
    
    // Final Average Management (View Only - No approval powers)
    Route::prefix('final-averages')->name('final-averages.')->group(function () {
        Route::get('/', [GradeManagementController::class, 'finalAverages'])->name('index');
        Route::get('/pending', [GradeManagementController::class, 'pendingFinalAverages'])->name('pending');
        Route::get('/{grade}/review', [GradeManagementController::class, 'reviewFinalAverage'])->name('review');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/pending-final-averages', [GradeManagementController::class, 'getPendingFinalAverages'])->name('pending-final-averages');
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
        Route::post('/academic-performance', [ReportsController::class, 'academicPerformance'])->name('academic-performance.post');
        Route::get('/department-analysis', [ReportsController::class, 'departmentAnalysis'])->name('department-analysis');
        Route::post('/department-analysis', [ReportsController::class, 'departmentAnalysis'])->name('department-analysis.post');
        Route::get('/export/{type}', [ReportsController::class, 'export'])->name('export');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/performance-trends', [ReportsController::class, 'getPerformanceTrendsApi'])->name('performance-trends');
            Route::get('/department-stats', [ReportsController::class, 'getDepartmentStatsApi'])->name('department-stats');
        });
    });
});
