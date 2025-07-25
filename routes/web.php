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
| This controller handles All Student Logic
|--------------------------------------------------------------------------
*/


use App\Http\Controllers\StudentController;
use App\Http\Middleware\StudentMiddleware;

Route::middleware([StudentMiddleware::class])->group(function () {

  // Dashboard
  Route::get('student/dashboard', [StudentController::class, 'index'])->name('student.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Instructor Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\InstructorController;
use App\Http\Middleware\InstructorMiddleware;

Route::middleware([InstructorMiddleware::class])->group(function () {

  // Dashboard
  Route::get('instructor/dashboard', [InstructorController::class, 'index'])->name('instructor.dashboard');
});


/*
|--------------------------------------------------------------------------
| This controller handles All Chairperson Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\ChairpersonController;
use App\Http\Middleware\ChairpersonMiddleware;


Route::middleware([ChairpersonMiddleware::class])->group(function () {

  // Dashboard
  Route::get('chairperson/dashboard', [ChairpersonController::class, 'index'])->name('chairperson.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Class Adviser Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\ClassAdviserController;
use App\Http\Middleware\ClassAdviserMiddleware;


Route::middleware([ClassAdviserMiddleware::class])->group(function () {

  // Dashboard
  Route::get('class-adviser/dashboard', [ClassAdviserController::class, 'index'])->name('class-adviser.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Parent Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\ParentController;
use App\Http\Middleware\ParentMiddleware;


Route::middleware([ParentMiddleware::class])->group(function () {

  // Dashboard
  Route::get('parent/dashboard', [ParentController::class, 'index'])->name('parent.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Principal Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\PrincipalController;
use App\Http\Middleware\PrincipalMiddleware;


Route::middleware([PrincipalMiddleware::class])->group(function () {

  // Dashboard
  Route::get('principal/dashboard', [PrincipalController::class, 'index'])->name('principal.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Registrar Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\RegistrarController;
use App\Http\Middleware\RegistrarMiddleware;


Route::middleware([RegistrarMiddleware::class])->group(function () {

  // Dashboard
  Route::get('registrar/dashboard', [RegistrarController::class, 'index'])->name('registrar.dashboard');
});
