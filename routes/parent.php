<?php

use App\Http\Controllers\Parent\ParentController;
use App\Http\Controllers\Parent\ParentGradesController;
use App\Http\Controllers\Parent\ParentHonorsController;
use App\Http\Controllers\Parent\ParentCertificatesController;
use App\Http\Controllers\Parent\ParentProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Parent Routes
|--------------------------------------------------------------------------
|
| Here is where you can register parent routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "parent" middleware group. Make something great!
|
*/

Route::middleware(['auth', 'parent'])->prefix('parent')->name('parent.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [ParentController::class, 'dashboard'])->name('dashboard');
    
    // Settings
    Route::get('/settings', [ParentController::class, 'settings'])->name('settings');
    Route::put('/settings/profile', [ParentController::class, 'updateProfile'])->name('settings.updateProfile');
    Route::put('/settings/password', [ParentController::class, 'updatePassword'])->name('settings.updatePassword');
    
    // Children's Grades
    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [ParentGradesController::class, 'index'])->name('index');
        Route::get('/{studentId}/{subjectId}', [ParentGradesController::class, 'show'])->name('show');
    });
    
    // Children's Honors
    Route::prefix('honors')->name('honors.')->group(function () {
        Route::get('/', [ParentHonorsController::class, 'index'])->name('index');
    });
    
    // Children's Certificates
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', [ParentCertificatesController::class, 'index'])->name('index');
    });
    
    // Children's Profiles
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ParentProfileController::class, 'index'])->name('index');
        Route::get('/{studentId}', [ParentProfileController::class, 'show'])->name('show');
    });
});
