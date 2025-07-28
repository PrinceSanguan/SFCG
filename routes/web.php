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
use App\Http\Controllers\Admin\AcademicController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\AdminMiddleware;

Route::middleware([AdminMiddleware::class])->group(function () {

  // Dashboard
  Route::get('admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

  // User Management - Instructors
  Route::get('admin/users/instructors', [UserController::class, 'instructors'])->name('admin.users.instructors');
  Route::post('admin/users/instructors', [UserController::class, 'storeInstructor'])->name('admin.users.instructors.store');
  Route::put('admin/users/instructors/{instructor}', [UserController::class, 'updateInstructor'])->name('admin.users.instructors.update');
  Route::delete('admin/users/instructors/{instructor}', [UserController::class, 'destroyInstructor'])->name('admin.users.instructors.destroy');

  // User Management - Teachers
  Route::get('admin/users/teachers', [UserController::class, 'teachers'])->name('admin.users.teachers');
  Route::post('admin/users/teachers', [UserController::class, 'storeTeacher'])->name('admin.users.teachers.store');
  Route::put('admin/users/teachers/{teacher}', [UserController::class, 'updateTeacher'])->name('admin.users.teachers.update');
  Route::delete('admin/users/teachers/{teacher}', [UserController::class, 'destroyTeacher'])->name('admin.users.teachers.destroy');

  // User Management - Class Advisers
  Route::get('admin/users/advisers', [UserController::class, 'advisers'])->name('admin.users.advisers');
  Route::post('admin/users/advisers', [UserController::class, 'storeAdviser'])->name('admin.users.advisers.store');
  Route::put('admin/users/advisers/{adviser}', [UserController::class, 'updateAdviser'])->name('admin.users.advisers.update');
  Route::delete('admin/users/advisers/{adviser}', [UserController::class, 'destroyAdviser'])->name('admin.users.advisers.destroy');

  // User Management - Chairpersons
  Route::get('admin/users/chairpersons', [UserController::class, 'chairpersons'])->name('admin.users.chairpersons');
  Route::post('admin/users/chairpersons', [UserController::class, 'storeChairperson'])->name('admin.users.chairpersons.store');
  Route::put('admin/users/chairpersons/{chairperson}', [UserController::class, 'updateChairperson'])->name('admin.users.chairpersons.update');
  Route::delete('admin/users/chairpersons/{chairperson}', [UserController::class, 'destroyChairperson'])->name('admin.users.chairpersons.destroy');

  // User Management - Principals
  Route::get('admin/users/principals', [UserController::class, 'principals'])->name('admin.users.principals');
  Route::post('admin/users/principals', [UserController::class, 'storePrincipal'])->name('admin.users.principals.store');
  Route::put('admin/users/principals/{principal}', [UserController::class, 'updatePrincipal'])->name('admin.users.principals.update');
  Route::delete('admin/users/principals/{principal}', [UserController::class, 'destroyPrincipal'])->name('admin.users.principals.destroy');

  // User Management - Students
  Route::get('admin/users/students', [UserController::class, 'students'])->name('admin.users.students');
  Route::post('admin/users/students', [UserController::class, 'storeStudent'])->name('admin.users.students.store');
  Route::put('admin/users/students/{student}', [UserController::class, 'updateStudent'])->name('admin.users.students.update');
  Route::delete('admin/users/students/{student}', [UserController::class, 'destroyStudent'])->name('admin.users.students.destroy');

  // User Management - Parents
  Route::get('admin/users/parents', [UserController::class, 'parents'])->name('admin.users.parents');
  Route::post('admin/users/parents', [UserController::class, 'storeParent'])->name('admin.users.parents.store');
  Route::put('admin/users/parents/{parent}', [UserController::class, 'updateParent'])->name('admin.users.parents.update');
  Route::delete('admin/users/parents/{parent}', [UserController::class, 'destroyParent'])->name('admin.users.parents.destroy');

  // User Management - CSV Upload
  Route::get('admin/users/upload', [UserController::class, 'uploadCsv'])->name('admin.users.upload');
  Route::post('admin/users/upload', [UserController::class, 'processCsvUpload'])->name('admin.users.upload.process');

  // Academic Setup - Pages
  Route::get('admin/academic/levels', [AcademicController::class, 'levels'])->name('admin.academic.levels');
  Route::get('admin/academic/periods', [AcademicController::class, 'periods'])->name('admin.academic.periods');
  Route::get('admin/academic/strands', [AcademicController::class, 'strands'])->name('admin.academic.strands');
  Route::get('admin/academic/subjects', [AcademicController::class, 'subjects'])->name('admin.academic.subjects');
  Route::get('admin/academic/college-courses', [AcademicController::class, 'collegeCourses'])->name('admin.academic.college-courses');

  // Academic Setup - CRUD Operations
  // Academic Levels
  Route::post('admin/academic/levels', [AcademicController::class, 'storeLevels'])->name('admin.academic.levels.store');
  Route::put('admin/academic/levels/{level}', [AcademicController::class, 'updateLevels'])->name('admin.academic.levels.update');
  Route::delete('admin/academic/levels/{level}', [AcademicController::class, 'destroyLevels'])->name('admin.academic.levels.destroy');

  // Academic Periods
  Route::post('admin/academic/periods', [AcademicController::class, 'storePeriods'])->name('admin.academic.periods.store');
  Route::put('admin/academic/periods/{period}', [AcademicController::class, 'updatePeriods'])->name('admin.academic.periods.update');
  Route::delete('admin/academic/periods/{period}', [AcademicController::class, 'destroyPeriods'])->name('admin.academic.periods.destroy');

  // Academic Strands
  Route::post('admin/academic/strands', [AcademicController::class, 'storeStrands'])->name('admin.academic.strands.store');
  Route::put('admin/academic/strands/{strand}', [AcademicController::class, 'updateStrands'])->name('admin.academic.strands.update');
  Route::delete('admin/academic/strands/{strand}', [AcademicController::class, 'destroyStrands'])->name('admin.academic.strands.destroy');

  // College Courses
  Route::post('admin/academic/college-courses', [AcademicController::class, 'storeCollegeCourses'])->name('admin.academic.college-courses.store');
  Route::put('admin/academic/college-courses/{course}', [AcademicController::class, 'updateCollegeCourses'])->name('admin.academic.college-courses.update');
  Route::delete('admin/academic/college-courses/{course}', [AcademicController::class, 'destroyCollegeCourses'])->name('admin.academic.college-courses.destroy');

  // Subjects
  Route::post('admin/academic/subjects', [AcademicController::class, 'storeSubjects'])->name('admin.academic.subjects.store');
  Route::put('admin/academic/subjects/{subject}', [AcademicController::class, 'updateSubjects'])->name('admin.academic.subjects.update');
  Route::delete('admin/academic/subjects/{subject}', [AcademicController::class, 'destroySubjects'])->name('admin.academic.subjects.destroy');

  // Assignment Pages
  Route::get('admin/assignments/instructors', [AcademicController::class, 'instructorAssignments'])->name('admin.assignments.instructors');
  Route::get('admin/assignments/advisers', [AcademicController::class, 'adviserAssignments'])->name('admin.assignments.advisers');

  // Assignment Operations
  // Instructor Assignments
  Route::post('admin/assignments/instructors', [AcademicController::class, 'storeInstructorAssignments'])->name('admin.assignments.instructors.store');
  Route::put('admin/assignments/instructors/{assignment}', [AcademicController::class, 'updateInstructorAssignments'])->name('admin.assignments.instructors.update');
  Route::delete('admin/assignments/instructors/{assignment}', [AcademicController::class, 'destroyInstructorAssignments'])->name('admin.assignments.instructors.destroy');

  // Class Adviser Assignments
  Route::post('admin/assignments/advisers/assign', [AcademicController::class, 'assignClassAdviser'])->name('admin.assignments.advisers.assign');
  Route::post('admin/assignments/advisers/remove', [AcademicController::class, 'removeClassAdviser'])->name('admin.assignments.advisers.remove');

  // Academic Data API Routes
  Route::get('admin/api/strands-by-level', [AcademicController::class, 'getStrandsByLevel'])->name('admin.api.strands-by-level');
  Route::get('admin/api/subjects-by-level', [AcademicController::class, 'getSubjectsByLevel'])->name('admin.api.subjects-by-level');
  Route::get('admin/api/subjects-by-course', [AcademicController::class, 'getSubjectsByCourse'])->name('admin.api.subjects-by-course');
  Route::get('admin/api/year-levels-by-course', [AcademicController::class, 'getYearLevelsByCourse'])->name('admin.api.year-levels-by-course');
  Route::get('admin/api/academic-data', [AcademicController::class, 'getAcademicData'])->name('admin.api.academic-data');

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
