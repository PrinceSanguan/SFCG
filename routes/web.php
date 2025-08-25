<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\GuestMiddleware;


/*
|--------------------------------------------------------------------------
| This controller handles the homepage and other public-facing pages that don't require authentication
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| This controller handles Login Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\LoginController;

Route::get('login', [LoginController::class, 'index'])->middleware(GuestMiddleware::class)->name('auth.login');
Route::post('login', [LoginController::class, 'store'])->name('auth.login.store');
Route::get('logout', [LoginController::class, 'destroy'])->name('auth.logout');

/*
|--------------------------------------------------------------------------
| This controller handles Google Auth Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\SocialAuthController;

Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

/*
|--------------------------------------------------------------------------
| This controller handles Register Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\RegisterController;


Route::get('register', [RegisterController::class, 'index'])->middleware(GuestMiddleware::class)->name('auth.register');

/*
|--------------------------------------------------------------------------
| This controller handles All Admin Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Middleware\AdminMiddleware;

Route::middleware([AdminMiddleware::class])->group(function () {

  // Dashboard
  Route::get('admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

  // Settings
  Route::get('admin/settings', [SettingsController::class, 'index'])->name('admin.settings');
  Route::put('admin/settings/profile', [SettingsController::class, 'updateProfile'])->name('admin.settings.updateProfile');
  Route::put('admin/settings/password', [SettingsController::class, 'updatePassword'])->name('admin.settings.updatePassword');
});

/*
|--------------------------------------------------------------------------
| This controller handles All User Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\User\UserSettingsController;
use App\Http\Middleware\UserMiddleware;

Route::middleware([UserMiddleware::class])->group(function () {

  // Dashboard
  Route::get('dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');

  // Settings
  Route::get('user/settings', [UserSettingsController::class, 'index'])->name('user.settings');
  Route::put('user/settings/profile', [UserSettingsController::class, 'updateProfile'])->name('user.settings.updateProfile');
  Route::put('user/settings/password', [UserSettingsController::class, 'updatePassword'])->name('user.settings.updatePassword');
});

/*
|--------------------------------------------------------------------------
| Role-specific Dashboard Routes (Placeholders)
|--------------------------------------------------------------------------
*/

// Registrar Dashboard - Now handled by dedicated routes file
// Route::get('/registrar/dashboard', function () {
//     return Inertia::render('Welcome', ['message' => 'Welcome to Registrar Dashboard - Coming Soon!']);
// })->name('registrar.dashboard');

// Instructor Dashboard - Now handled by dedicated routes file
// Route::get('/instructor/dashboard', function () {
//     return Inertia::render('Welcome', ['message' => 'Welcome to Instructor Dashboard - Coming Soon!']);
// })->name('instructor.dashboard');

// Teacher Dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/teacher/dashboard', function () {
        return Inertia::render('Welcome', ['message' => 'Welcome to Teacher Dashboard - Coming Soon!']);
    })->name('teacher.dashboard');
});

// Adviser Dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/adviser/dashboard', function () {
        return Inertia::render('Welcome', ['message' => 'Welcome to Adviser Dashboard - Coming Soon!']);
    })->name('adviser.dashboard');
});

// Chairperson Dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/chairperson/dashboard', function () {
        return Inertia::render('Welcome', ['message' => 'Welcome to Chairperson Dashboard - Coming Soon!']);
    })->name('chairperson.dashboard');
});

// Principal Dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/principal/dashboard', function () {
        return Inertia::render('Welcome', ['message' => 'Welcome to Principal Dashboard - Coming Soon!']);
    })->name('principal.dashboard');
});

// Parent Dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/parent/dashboard', function () {
        return Inertia::render('Parent/Dashboard');
    })->name('parent.dashboard');
});
