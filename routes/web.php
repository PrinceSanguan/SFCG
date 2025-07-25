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

  // User Management
  Route::get('admin/users/instructors', [DashboardController::class, 'instructors'])->name('admin.users.instructors');
  Route::get('admin/users/teachers', [DashboardController::class, 'teachers'])->name('admin.users.teachers');
  Route::get('admin/users/advisers', [DashboardController::class, 'advisers'])->name('admin.users.advisers');
  Route::get('admin/users/chairpersons', [DashboardController::class, 'chairpersons'])->name('admin.users.chairpersons');
  Route::get('admin/users/principals', [DashboardController::class, 'principals'])->name('admin.users.principals');
  Route::get('admin/users/students', [DashboardController::class, 'students'])->name('admin.users.students');
  Route::get('admin/users/parents', [DashboardController::class, 'parents'])->name('admin.users.parents');
  Route::get('admin/users/upload', [DashboardController::class, 'uploadCsv'])->name('admin.users.upload');

  // Academic Setup
  Route::get('admin/academic/levels', [DashboardController::class, 'academicLevels'])->name('admin.academic.levels');
  Route::get('admin/academic/periods', [DashboardController::class, 'academicPeriods'])->name('admin.academic.periods');
  Route::get('admin/academic/strands', [DashboardController::class, 'academicStrands'])->name('admin.academic.strands');
  Route::get('admin/academic/subjects', [DashboardController::class, 'academicSubjects'])->name('admin.academic.subjects');

  // Assignments
  Route::get('admin/assignments/instructors', [DashboardController::class, 'assignInstructors'])->name('admin.assignments.instructors');
  Route::get('admin/assignments/advisers', [DashboardController::class, 'assignAdvisers'])->name('admin.assignments.advisers');

  // Grading
  Route::get('admin/grading', [DashboardController::class, 'grading'])->name('admin.grading');

  // Honors & Certificates
  Route::get('admin/honors', [DashboardController::class, 'honors'])->name('admin.honors');
  Route::get('admin/certificates', [DashboardController::class, 'certificates'])->name('admin.certificates');

  // Gmail Notifications
  Route::get('admin/notifications', [DashboardController::class, 'notifications'])->name('admin.notifications');

  // Reports
  Route::get('admin/reports', [DashboardController::class, 'reports'])->name('admin.reports');
  Route::get('admin/reports/export', [DashboardController::class, 'exportData'])->name('admin.reports.export');

  // System Logs
  Route::get('admin/system/logs', [DashboardController::class, 'auditLogs'])->name('admin.system.logs');
  Route::get('admin/system/backup', [DashboardController::class, 'backup'])->name('admin.system.backup');
  Route::get('admin/system/restore', [DashboardController::class, 'restore'])->name('admin.system.restore');

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
