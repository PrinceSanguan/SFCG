<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\GradesController;
use App\Http\Controllers\Student\HonorsController;
use App\Http\Controllers\Student\ProfileController;
use App\Http\Controllers\Student\SubjectsController;

Route::middleware(['auth', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('subjects')->name('subjects.')->group(function () {
        Route::get('/', [SubjectsController::class, 'index'])->name('index');
    });

    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradesController::class, 'index'])->name('index');
        Route::get('/{subject}', [GradesController::class, 'showSubject'])->name('show');
    });

    Route::prefix('honors')->name('honors.')->group(function () {
        Route::get('/', [HonorsController::class, 'index'])->name('index');
    });

    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', [App\Http\Controllers\Student\CertificateController::class, 'index'])->name('index');
        Route::get('/{certificate}', [App\Http\Controllers\Student\CertificateController::class, 'show'])->name('show');
        Route::get('/{certificate}/view', [App\Http\Controllers\Student\CertificateController::class, 'view'])->name('view');
    });

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
    });
});
