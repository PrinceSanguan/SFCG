<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Registrar\RegistrarController;
use App\Http\Controllers\Registrar\RegistrarUserManagementController;
use App\Http\Controllers\Registrar\RegistrarParentManagementController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AcademicController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\NotificationController;

/*
|--------------------------------------------------------------------------
| Registrar Routes
|--------------------------------------------------------------------------
|
| Here is where you can register registrar routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "registrar" middleware group. All routes require registrar access.
|
*/

Route::middleware(['auth', 'registrar'])->prefix('registrar')->name('registrar.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [RegistrarController::class, 'dashboard'])->name('dashboard');
    
    // Settings
    Route::get('/settings', [RegistrarController::class, 'settings'])->name('settings');
    Route::put('/settings/profile', [RegistrarController::class, 'updateProfile'])->name('settings.updateProfile');
    Route::put('/settings/password', [RegistrarController::class, 'updatePassword'])->name('settings.updatePassword');
    
    // Parent Management (View Only) - MUST COME BEFORE USER MANAGEMENT
    Route::prefix('parents')->name('parents.')->group(function () {
        // List all parents with filters and pagination
        Route::get('/', [RegistrarParentManagementController::class, 'index'])->name('index');
        
        // Show specific parent details and linked students
        Route::get('/{parent}', [RegistrarParentManagementController::class, 'show'])->name('show');
        
        // Show edit form
        Route::get('/{parent}/edit', [RegistrarParentManagementController::class, 'edit'])->name('edit');
        
        // Update parent
        Route::put('/{parent}', [RegistrarParentManagementController::class, 'update'])->name('update');
        
        // Reset parent password
        Route::post('/{parent}/reset-password', [RegistrarParentManagementController::class, 'resetPassword'])->name('reset-password');
        
        // Link parent to student
        Route::post('/{parent}/link-student', [RegistrarParentManagementController::class, 'linkStudent'])->name('link-student');
        
        // Unlink parent from student
        Route::delete('/{parent}/unlink-student/{student}', [RegistrarParentManagementController::class, 'unlinkStudent'])->name('unlink-student');
    });

    // User Management (View Only - No Creation)
    Route::prefix('users')->name('users.')->group(function () {
        // List all users with filters and pagination
        Route::get('/', [RegistrarUserManagementController::class, 'index'])->name('index');
        
        // Show specific user details and activity logs
        Route::get('/{user}', [RegistrarUserManagementController::class, 'show'])->name('show');
        
        // Show edit form
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'edit'])->name('edit');
        
        // Update user
        Route::put('/{user}', [RegistrarUserManagementController::class, 'update'])->name('update');
        
        // Reset user password
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPassword'])->name('reset-password');
        
        // Delete user
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroy'])->name('destroy');
        
        // Get user profile data for API calls
        Route::get('/{user}/profile', [RegistrarUserManagementController::class, 'profile'])->name('profile');
    });

    // Administrator Management (View Only)
    Route::prefix('administrators')->name('administrators.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexAdministrators'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Registrar Management (View Only - Cannot manage other registrars)
    Route::prefix('registrars')->name('registrars.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexRegistrars'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Principal Management (View Only)
    Route::prefix('principals')->name('principals.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexPrincipals'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Chairperson Management (View Only)
    Route::prefix('chairpersons')->name('chairpersons.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexChairpersons'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Teacher Management (View Only)
    Route::prefix('teachers')->name('teachers.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexTeachers'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Instructor Management (View Only)
    Route::prefix('instructors')->name('instructors.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexInstructors'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Adviser Management (View Only)
    Route::prefix('advisers')->name('advisers.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexAdvisers'])->name('index');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });

    // Student Management (View Only)
    Route::prefix('students')->name('students.')->group(function () {
        Route::get('/', [RegistrarUserManagementController::class, 'indexStudents'])->name('index');
        // Year-level dedicated pages (filter param handled in controller)
        Route::get('/elementary', [RegistrarUserManagementController::class, 'indexElementary'])->name('elementary');
        Route::get('/junior-highschool', [RegistrarUserManagementController::class, 'indexJuniorHighschool'])->name('junior_highschool');
        Route::get('/senior-highschool', [RegistrarUserManagementController::class, 'indexSeniorHighschool'])->name('senior_highschool');
        Route::get('/college', [RegistrarUserManagementController::class, 'indexCollege'])->name('college');
        Route::get('/{user}', [RegistrarUserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [RegistrarUserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [RegistrarUserManagementController::class, 'updateByRole'])->name('update');
        Route::post('/{user}/reset-password', [RegistrarUserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        Route::delete('/{user}', [RegistrarUserManagementController::class, 'destroyByRole'])->name('destroy');
    });
    
    // Activity Logs (View Only)
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        // Get activity logs with filters
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        
        // Get activity logs for specific user
        Route::get('/user/{user}', [ActivityLogController::class, 'userLogs'])->name('user');
    });
    
    // API endpoints for AJAX calls
    Route::prefix('api')->name('api.')->group(function () {
        // Get users data for datatables/search
        Route::get('/users', [RegistrarUserManagementController::class, 'apiIndex'])->name('users.index');
        
        // Get user stats for dashboard
        Route::get('/stats', [RegistrarUserManagementController::class, 'stats'])->name('stats');
        
        // Get recent activities
        Route::get('/recent-activities', [ActivityLogController::class, 'recentActivities'])->name('recent-activities');
    });
});

// Academic & Curriculum Management routes (Registrar has access)
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('registrar/academic')->name('registrar.academic.')->group(function () {
    Route::get('/', [AcademicController::class, 'index'])->name('index');
    Route::get('/levels', [AcademicController::class, 'levels'])->name('levels');
    Route::get('/grading', [AcademicController::class, 'grading'])->name('grading');
    Route::get('/subjects', [AcademicController::class, 'subjects'])->name('subjects');
    Route::get('/programs', [AcademicController::class, 'programs'])->name('programs');
    Route::get('/honors', [AcademicController::class, 'honors'])->name('honors');
    Route::get('/assign-instructors', [AcademicController::class, 'assignInstructors'])->name('assign-instructors');
    Route::get('/assign-teachers', [AcademicController::class, 'assignTeachers'])->name('assign-teachers');
    Route::get('/assign-advisers', [AcademicController::class, 'assignAdvisers'])->name('assign-advisers');
    
    // API routes for honor system
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/academic-levels', function () {
            return \App\Models\AcademicLevel::all();
        })->name('academic-levels');
        
        Route::get('/honor-types', function () {
            return \App\Models\HonorType::all();
        })->name('honor-types');
        
        Route::get('/honor-criteria', function () {
            return \App\Models\HonorCriterion::with(['honorType', 'academicLevel'])->get();
        })->name('honor-criteria');
        
        Route::get('/honor-results', function (Request $request) {
            $query = \App\Models\HonorResult::with(['honorType', 'student'])
                ->where('academic_level_id', $request->academic_level_id)
                ->where('school_year', $request->school_year);
            
            return $query->get();
        })->name('honor-results');
    });

    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/search', [CertificateController::class, 'search'])->name('certificates.search');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/certificates/{certificate}/print', [CertificateController::class, 'print'])->name('certificates.print');
});

// Reports and Archiving routes (Registrar has access)
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('registrar/reports')->name('registrar.reports.')->group(function () {
    Route::get('/', [ReportsController::class, 'index'])->name('index');
    Route::post('/grade-report', [ReportsController::class, 'generateGradeReport'])->name('grade-report');
    Route::post('/honor-statistics', [ReportsController::class, 'generateHonorStatistics'])->name('honor-statistics');
    Route::post('/archive-records', [ReportsController::class, 'archiveAcademicRecords'])->name('archive-records');
});

// Notification routes (Registrar has access but cannot send Gmail announcements)
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('registrar/notifications')->name('registrar.notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/recipients', [NotificationController::class, 'getRecipients'])->name('recipients');
    Route::get('/{notification}/resend', [NotificationController::class, 'resendFailed'])->name('resend');
});
