<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Instructor\DashboardController;
use App\Http\Controllers\Instructor\GradeManagementController;
use App\Http\Controllers\Instructor\HonorTrackingController;
use App\Http\Controllers\Instructor\ProfileController;
use App\Http\Controllers\Instructor\CSVUploadController;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Instructor Routes
|--------------------------------------------------------------------------
|
| Here is where you can register instructor routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "instructor" middleware group. All routes require instructor access.
|
*/

Route::middleware(['auth', 'instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::put('/update', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password');
    });
    
    // Grade Management
    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradeManagementController::class, 'index'])->name('index');
        Route::get('/create', [GradeManagementController::class, 'create'])->name('create');
        Route::post('/', [GradeManagementController::class, 'store'])->name('store');
        Route::get('/student/{student}/subject/{subject}', [GradeManagementController::class, 'showStudent'])->name('show-student');
        Route::get('/{grade}/edit', [GradeManagementController::class, 'edit'])->name('edit');
        Route::put('/{grade}', [GradeManagementController::class, 'update'])->name('update');
        Route::delete('/{grade}', [GradeManagementController::class, 'destroy'])->name('destroy');
        Route::post('/{grade}/submit', [GradeManagementController::class, 'submitForValidation'])->name('submit');
        Route::post('/{grade}/unsubmit', [GradeManagementController::class, 'unsubmitFromValidation'])->name('unsubmit');
        

        
        // CSV Upload
        Route::get('/upload', [CSVUploadController::class, 'index'])->name('upload');
        Route::post('/upload', [CSVUploadController::class, 'upload'])->name('upload.store');
        Route::get('/template', [CSVUploadController::class, 'downloadTemplate'])->name('template');
        Route::get('/subject-template', [CSVUploadController::class, 'downloadSubjectTemplate'])->name('subject-template');
        
        // API endpoints for AJAX calls
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/students', [GradeManagementController::class, 'getAssignedStudents'])->name('students');
            Route::get('/subjects', [GradeManagementController::class, 'getAssignedSubjects'])->name('subjects');
            Route::get('/grading-periods', [GradeManagementController::class, 'getGradingPeriods'])->name('grading-periods');
            Route::get('/academic-levels', [GradeManagementController::class, 'getAcademicLevels'])->name('academic-levels');
        });
    });
    
    // Honor Tracking
    Route::prefix('honors')->name('honors.')->group(function () {
        Route::get('/', [HonorTrackingController::class, 'index'])->name('index');
        Route::get('/{academicLevel}', [HonorTrackingController::class, 'showByLevel'])->name('show-by-level');
        
        // API endpoints for honor data
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/results', [HonorTrackingController::class, 'getHonorResults'])->name('results');
            Route::get('/statistics', [HonorTrackingController::class, 'getStatistics'])->name('statistics');
        });
    });
    
    // API endpoints for dashboard data
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/stats', [DashboardController::class, 'getStats'])->name('stats');
        Route::get('/recent-grades', [DashboardController::class, 'getRecentGrades'])->name('recent-grades');
        Route::get('/upcoming-deadlines', [DashboardController::class, 'getUpcomingDeadlines'])->name('upcoming-deadlines');
        Route::get('/debug-dashboard', [DashboardController::class, 'debugDashboard'])->name('debug-dashboard');
    });

    Route::get('/test-auth', function () {
        $user = Auth::user();
        return response()->json([
            'authenticated' => Auth::check(),
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : null,
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->user_role : null,
        ]);
    })->name('test-auth');
});
