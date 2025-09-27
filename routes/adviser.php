<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Adviser\DashboardController;
use App\Http\Controllers\Adviser\ProfileController;
use App\Http\Controllers\Adviser\GradeManagementController;
use App\Http\Controllers\Adviser\CSVUploadController;
use App\Http\Controllers\Adviser\HonorTrackingController;
use Inertia\Inertia;

Route::middleware(['auth', 'adviser'])->prefix('adviser')->name('adviser.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'adviser'])->prefix('adviser')->name('adviser.')->group(function () {
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::put('/update', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password');
    });
    // Grades (placeholders mirroring instructor routes)
    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradeManagementController::class, 'index'])->name('index');
        Route::get('/create', [GradeManagementController::class, 'create'])->name('create');
        Route::post('/', [GradeManagementController::class, 'store'])->name('store');
        Route::get('/student/{student}/subject/{subject}', [GradeManagementController::class, 'showStudentGrades'])->name('student.subject');
        Route::get('/upload', [CSVUploadController::class, 'index'])->name('upload');
        Route::post('/upload', [CSVUploadController::class, 'upload'])->name('upload.process');
        Route::get('/template', [CSVUploadController::class, 'downloadTemplate'])->name('template');
    });
    // Honors
    Route::prefix('honors')->name('honors.')->group(function () {
        Route::get('/', [HonorTrackingController::class, 'index'])->name('index');
        Route::get('/level/{academicLevel}', [HonorTrackingController::class, 'showByLevel'])->name('level');
    });
});


