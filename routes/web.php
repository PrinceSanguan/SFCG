<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\GuestMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


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
use App\Http\Controllers\Admin\GradingController;
use App\Http\Controllers\Admin\HonorController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\CertificateImageController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SystemController;
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

  // User Management - Registrars
  Route::get('admin/users/registrars', [UserController::class, 'registrars'])->name('admin.users.registrars');
  Route::post('admin/users/registrars', [UserController::class, 'storeRegistrar'])->name('admin.users.registrars.store');
  Route::put('admin/users/registrars/{registrar}', [UserController::class, 'updateRegistrar'])->name('admin.users.registrars.update');
  Route::delete('admin/users/registrars/{registrar}', [UserController::class, 'destroyRegistrar'])->name('admin.users.registrars.destroy');

  // User Management - Students
  Route::get('admin/users/students', [UserController::class, 'students'])->name('admin.users.students');
  Route::get('admin/users/students/elementary', [UserController::class, 'elementaryStudents'])->name('admin.users.students.elementary');
  Route::get('admin/users/students/junior-high', [UserController::class, 'juniorHighStudents'])->name('admin.users.students.junior-high');
  Route::get('admin/users/students/senior-high', [UserController::class, 'seniorHighStudents'])->name('admin.users.students.senior-high');
  Route::get('admin/users/students/college', [UserController::class, 'collegeStudents'])->name('admin.users.students.college');
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

  // User Management - Level-Specific CSV Upload
  Route::post('admin/users/upload-by-level', [UserController::class, 'uploadCsvByLevel'])->name('admin.users.upload.by-level');
  Route::get('admin/users/download-template', [UserController::class, 'downloadCsvTemplate'])->name('admin.users.download-template');
  
  // Debug route for CSV upload testing
  Route::post('admin/users/debug-csv', function(Request $request) {
      Log::info('CSV Debug Request', [
          'has_file' => $request->hasFile('csv_file'),
          'file_size' => $request->file('csv_file') ? $request->file('csv_file')->getSize() : 'no file',
          'academic_level' => $request->input('academic_level'),
          'all_data' => $request->all()
      ]);
      return response()->json(['message' => 'Debug logged']);
  })->name('admin.users.debug-csv');

  // User Management - Search Functions
  Route::get('admin/users/search', [UserController::class, 'searchUsers'])->name('admin.users.search');
  Route::get('admin/students/search', [UserController::class, 'searchStudents'])->name('admin.students.search');
  Route::get('admin/parents/search', [UserController::class, 'searchParents'])->name('admin.parents.search');

  // User Management - Password Change Functions
  Route::put('admin/users/{user}/change-password', [UserController::class, 'changeUserPassword'])->name('admin.users.change-password');
  Route::put('admin/students/{student}/change-password', [UserController::class, 'changeStudentPassword'])->name('admin.students.change-password');
  Route::put('admin/parents/{parent}/change-password', [UserController::class, 'changeParentPassword'])->name('admin.parents.change-password');

  // Academic Setup - Pages
  Route::get('admin/academic/levels', [AcademicController::class, 'levels'])->name('admin.academic.levels');
  Route::get('admin/academic/periods', [AcademicController::class, 'periods'])->name('admin.academic.periods');
  Route::get('admin/academic/strands', [AcademicController::class, 'strands'])->name('admin.academic.strands');
  Route::get('admin/academic/subjects', [AcademicController::class, 'subjects'])->name('admin.academic.subjects');
  Route::get('admin/academic/subjects/elementary', [AcademicController::class, 'elementarySubjects'])->name('admin.academic.subjects.elementary');
  Route::get('admin/academic/subjects/junior-high', [AcademicController::class, 'juniorHighSubjects'])->name('admin.academic.subjects.junior-high');
  Route::get('admin/academic/subjects/senior-high', [AcademicController::class, 'seniorHighSubjects'])->name('admin.academic.subjects.senior-high');
  Route::get('admin/academic/subjects/college', [AcademicController::class, 'collegeSubjects'])->name('admin.academic.subjects.college');
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

  // College Subjects
  Route::get('admin/academic/college-subjects', [AcademicController::class, 'collegeSubjects'])->name('admin.academic.college-subjects');
  Route::post('admin/academic/college-subjects', [AcademicController::class, 'storeCollegeSubjects'])->name('admin.academic.college-subjects.store');
  Route::put('admin/academic/college-subjects/{subject}', [AcademicController::class, 'updateCollegeSubjects'])->name('admin.academic.college-subjects.update');
  Route::delete('admin/academic/college-subjects/{subject}', [AcademicController::class, 'destroyCollegeSubjects'])->name('admin.academic.college-subjects.destroy');

  // Subjects
  Route::post('admin/academic/subjects', [AcademicController::class, 'storeSubjects'])->name('admin.academic.subjects.store');
  Route::put('admin/academic/subjects/{subject}', [AcademicController::class, 'updateSubjects'])->name('admin.academic.subjects.update');
  Route::delete('admin/academic/subjects/{subject}', [AcademicController::class, 'destroySubjects'])->name('admin.academic.subjects.destroy');
  
  // Debug route for testing form data
  Route::post('admin/debug/form-data', function(Request $request) {
      Log::info('Debug form data', $request->all());
      return response()->json(['message' => 'Data logged', 'data' => $request->all()]);
  })->name('admin.debug.form-data');

  // Assignment Pages
  Route::get('admin/assignments/instructors', [AcademicController::class, 'instructorAssignments'])->name('admin.assignments.instructors');
  Route::get('admin/assignments/teachers', [AcademicController::class, 'teacherAssignments'])->name('admin.assignments.teachers');
  Route::get('admin/assignments/advisers', [AcademicController::class, 'adviserAssignments'])->name('admin.assignments.advisers');

  // Assignment Operations
  // Instructor Assignments
  Route::post('admin/assignments/instructors', [AcademicController::class, 'storeInstructorAssignments'])->name('admin.assignments.instructors.store');
  Route::put('admin/assignments/instructors/{assignment}', [AcademicController::class, 'updateInstructorAssignments'])->name('admin.assignments.instructors.update');
  Route::delete('admin/assignments/instructors/{assignment}', [AcademicController::class, 'destroyInstructorAssignments'])->name('admin.assignments.instructors.destroy');

  // Teacher Assignments
  Route::post('admin/assignments/teachers', [AcademicController::class, 'storeTeacherAssignments'])->name('admin.assignments.teachers.store');
  Route::put('admin/assignments/teachers/{assignment}', [AcademicController::class, 'updateTeacherAssignments'])->name('admin.assignments.teachers.update');
  Route::delete('admin/assignments/teachers/{assignment}', [AcademicController::class, 'destroyTeacherAssignments'])->name('admin.assignments.teachers.destroy');

  // Class Adviser Assignments
  Route::post('admin/assignments/advisers', [AcademicController::class, 'storeAdviserAssignments'])->name('admin.assignments.advisers.store');
  Route::put('admin/assignments/advisers/{assignment}', [AcademicController::class, 'updateAdviserAssignments'])->name('admin.assignments.advisers.update');
  Route::delete('admin/assignments/advisers/{assignment}', [AcademicController::class, 'destroyAdviserAssignments'])->name('admin.assignments.advisers.destroy');

  // Academic Data API Routes
  Route::get('admin/api/strands-by-level', [AcademicController::class, 'getStrandsByLevel'])->name('admin.api.strands-by-level');
  Route::get('admin/api/subjects-by-level', [AcademicController::class, 'getSubjectsByLevel'])->name('admin.api.subjects-by-level');
  Route::get('admin/api/subjects-by-course', [AcademicController::class, 'getSubjectsByCourse'])->name('admin.api.subjects-by-course');
  Route::get('admin/api/year-levels-by-course', [AcademicController::class, 'getYearLevelsByCourse'])->name('admin.api.year-levels-by-course');
  Route::get('admin/api/periods-by-level', [AcademicController::class, 'getPeriodsByLevel'])->name('admin.api.periods-by-level');
  Route::get('admin/api/academic-data', [AcademicController::class, 'getAcademicData'])->name('admin.api.academic-data');
  Route::get('admin/api/sections-by-level-year', [AcademicController::class, 'getSectionsByLevelYear'])->name('admin.api.sections-by-level-year');

  // Grading System
  Route::get('admin/grading', [GradingController::class, 'index'])->name('admin.grading.index');
  Route::get('admin/grading/elementary', [GradingController::class, 'elementaryGrading'])->name('admin.grading.elementary');
  Route::get('admin/grading/junior-high', [GradingController::class, 'juniorHighGrading'])->name('admin.grading.junior-high');
  Route::get('admin/grading/senior-high', [GradingController::class, 'seniorHighGrading'])->name('admin.grading.senior-high');
  Route::get('admin/grading/college', [GradingController::class, 'collegeGrading'])->name('admin.grading.college');
  Route::get('admin/grading/create', [GradingController::class, 'create'])->name('admin.grading.create');
  Route::get('admin/grading/elementary/create', [GradingController::class, 'createElementary'])->name('admin.grading.elementary.create');
  Route::get('admin/grading/junior-high/create', [GradingController::class, 'createJuniorHigh'])->name('admin.grading.junior-high.create');
  Route::get('admin/grading/senior-high/create', [GradingController::class, 'createSeniorHigh'])->name('admin.grading.senior-high.create');
  Route::get('admin/grading/college/create', [GradingController::class, 'createCollege'])->name('admin.grading.college.create');
  Route::post('admin/grading', [GradingController::class, 'store'])->name('admin.grading.store');
  Route::get('admin/grading/{grade}', [GradingController::class, 'show'])->name('admin.grading.show');
  Route::get('admin/grading/{grade}/edit', [GradingController::class, 'edit'])->name('admin.grading.edit');
  Route::put('admin/grading/{grade}', [GradingController::class, 'update'])->name('admin.grading.update');
  Route::delete('admin/grading/{grade}', [GradingController::class, 'destroy'])->name('admin.grading.destroy');
  Route::post('admin/grading/bulk-approve', [GradingController::class, 'bulkApprove'])->name('admin.grading.bulk-approve');
  Route::post('admin/grading/import', [GradingController::class, 'importGrades'])->name('admin.grading.import');
  Route::get('admin/api/students-by-section', [GradingController::class, 'getStudentsBySection'])->name('admin.api.students-by-section');

  // Honors & Certificates Management
  Route::get('admin/honors', [HonorController::class, 'index'])->name('admin.honors.index');
  Route::get('admin/honors/roll', [HonorController::class, 'honorRoll'])->name('admin.honors.roll');
  Route::get('admin/honors/criteria', [HonorController::class, 'criteria'])->name('admin.honors.criteria');
  Route::post('admin/honors/criteria', [HonorController::class, 'storeCriteria'])->name('admin.honors.criteria.store');
  Route::put('admin/honors/criteria/{criterion}', [HonorController::class, 'updateCriteria'])->name('admin.honors.criteria.update');
  Route::delete('admin/honors/criteria/{criterion}', [HonorController::class, 'destroyCriteria'])->name('admin.honors.criteria.destroy');
  Route::post('admin/honors/calculate', [HonorController::class, 'calculateHonors'])->name('admin.honors.calculate');
  Route::get('admin/honors/students', [HonorController::class, 'studentHonors'])->name('admin.honors.students');
  Route::put('admin/honors/{honor}/revoke', [HonorController::class, 'revokeHonor'])->name('admin.honors.revoke');
  Route::put('admin/honors/{honor}/restore', [HonorController::class, 'restoreHonor'])->name('admin.honors.restore');
  Route::post('admin/honors/export', [HonorController::class, 'exportHonorRoll'])->name('admin.honors.export');

  // Certificates
Route::get('admin/certificates', [CertificateController::class, 'index'])->name('admin.certificates.index');
Route::post('admin/certificates/generate', [CertificateController::class, 'generate'])->name('admin.certificates.generate');
Route::post('admin/certificates/bulk-generate', [CertificateController::class, 'bulkGenerate'])->name('admin.certificates.bulk-generate');
Route::get('admin/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('admin.certificates.download');
Route::get('admin/certificates/{certificate}/print', [CertificateController::class, 'print'])->name('admin.certificates.print');
Route::post('admin/certificates/bulk-print', [CertificateController::class, 'bulkPrint'])->name('admin.certificates.bulk-print');
Route::delete('admin/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('admin.certificates.destroy');

// Certificate Image Uploads (Protected routes)
Route::middleware(['auth'])->group(function () {
    Route::get('certificate-images', [CertificateImageController::class, 'index'])->name('certificate-images.index');
    Route::post('certificate-images/{certificate}/upload', [CertificateImageController::class, 'upload'])->name('certificate-images.upload');
    Route::post('certificate-images/{certificate}/approve', [CertificateImageController::class, 'approve'])->name('certificate-images.approve');
    Route::post('certificate-images/{certificate}/reject', [CertificateImageController::class, 'reject'])->name('certificate-images.reject');
    Route::get('certificate-images/{certificate}/image', [CertificateImageController::class, 'showImage'])->name('certificate-images.image');
    Route::get('certificate-images/{certificate}/download', [CertificateImageController::class, 'downloadImage'])->name('certificate-images.download');
    Route::delete('certificate-images/{certificate}', [CertificateImageController::class, 'deleteImage'])->name('certificate-images.delete');
    Route::post('certificate-images/bulk-approve', [CertificateImageController::class, 'bulkApprove'])->name('certificate-images.bulk-approve');
    Route::post('certificate-images/bulk-reject', [CertificateImageController::class, 'bulkReject'])->name('certificate-images.bulk-reject');
});

  // Certificate Templates
  Route::get('admin/certificates/templates', [CertificateController::class, 'templates'])->name('admin.certificates.templates');
Route::post('admin/certificates/templates', [CertificateController::class, 'storeTemplate'])->name('admin.certificates.templates.store');
Route::put('admin/certificates/templates/{template}', [CertificateController::class, 'updateTemplate'])->name('admin.certificates.templates.update');
Route::delete('admin/certificates/templates/{template}', [CertificateController::class, 'destroyTemplate'])->name('admin.certificates.templates.destroy');
Route::post('admin/certificates/templates/{template}/preview', [CertificateController::class, 'preview'])->name('admin.certificates.templates.preview');
Route::get('admin/certificates/templates/{template}/image', [CertificateController::class, 'showTemplateImage'])->name('certificate-templates.image');
Route::get('certificate-templates/by-education-level', [CertificateController::class, 'getTemplatesByEducationLevel'])->name('certificate-templates.by-education-level');

  // Certificate Tracking & Issuance
  Route::get('admin/certificates/tracking', [CertificateController::class, 'trackIssuance'])->name('admin.certificates.tracking');
  Route::post('admin/certificates/mark-issued', [CertificateController::class, 'markAsIssued'])->name('admin.certificates.mark-issued');

  // Notifications & Email Management
  Route::get('admin/notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
  Route::get('admin/notifications/compose', [NotificationController::class, 'compose'])->name('admin.notifications.compose');
  Route::post('admin/notifications/send', [NotificationController::class, 'send'])->name('admin.notifications.send');
  Route::post('admin/notifications/mark-read', [NotificationController::class, 'markAsRead'])->name('admin.notifications.mark-read');
  Route::post('admin/notifications/mark-unread', [NotificationController::class, 'markAsUnread'])->name('admin.notifications.mark-unread');
  Route::delete('admin/notifications/delete', [NotificationController::class, 'delete'])->name('admin.notifications.delete');
  Route::get('admin/notifications/templates', [NotificationController::class, 'templates'])->name('admin.notifications.templates');
  Route::get('admin/notifications/analytics', [NotificationController::class, 'analytics'])->name('admin.notifications.analytics');

  // Reports & Data Export
  Route::get('admin/reports', [ReportController::class, 'index'])->name('admin.reports.index');
  Route::post('admin/reports/generate', [ReportController::class, 'generate'])->name('admin.reports.generate');
  Route::get('admin/reports/export', [ReportController::class, 'export'])->name('admin.reports.export');
  Route::post('admin/reports/export-data', [ReportController::class, 'exportData'])->name('admin.reports.export-data');

  // System Management
  Route::get('admin/system/logs', [SystemController::class, 'logs'])->name('admin.system.logs');
  Route::get('admin/system/backup', [SystemController::class, 'backup'])->name('admin.system.backup');
  Route::post('admin/system/backup/create', [SystemController::class, 'createBackup'])->name('admin.system.backup.create');
  Route::get('admin/system/backup/download/{filename}', [SystemController::class, 'downloadBackup'])->name('admin.system.backup.download');
  Route::delete('admin/system/backup/delete/{filename}', [SystemController::class, 'deleteBackup'])->name('admin.system.backup.delete');
  Route::get('admin/system/restore', [SystemController::class, 'restore'])->name('admin.system.restore');
  Route::post('admin/system/restore', [SystemController::class, 'performRestore'])->name('admin.system.restore.perform');
  Route::get('admin/system/maintenance', [SystemController::class, 'maintenance'])->name('admin.system.maintenance');
  Route::post('admin/system/maintenance', [SystemController::class, 'runMaintenance'])->name('admin.system.maintenance.run');

  // Enhanced Backup Management
  Route::post('admin/system/backup/schedule', [SystemController::class, 'scheduleBackup'])->name('admin.system.backup.schedule');
  Route::get('admin/system/backup/schedule', [SystemController::class, 'getBackupSchedule'])->name('admin.system.backup.schedule.get');
  Route::get('admin/system/backup/verify/{filename}', [SystemController::class, 'verifyBackup'])->name('admin.system.backup.verify');
  Route::get('admin/system/backup/statistics', [SystemController::class, 'getBackupStatistics'])->name('admin.system.backup.statistics');
  Route::get('admin/system/backup/log/export', [SystemController::class, 'exportBackupLog'])->name('admin.system.backup.log.export');

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

  // 8.1. View own information
  Route::get('student/profile', [StudentController::class, 'profile'])->name('student.profile');

  // 8.2. View grades
  Route::get('student/grades', [StudentController::class, 'grades'])->name('student.grades');

  // 8.3. View honor status
  Route::get('student/honors', [StudentController::class, 'honors'])->name('student.honors');

  // 8.4. View certificates (read-only)
Route::get('student/certificates', [StudentController::class, 'certificates'])->name('student.certificates');
Route::get('student/certificates/{certificate}/download', [StudentController::class, 'downloadCertificate'])->name('student.certificates.download');
      Route::get('student/certificate-selection', [StudentController::class, 'certificateSelection'])->name('student.certificate-selection');
      Route::post('student/certificates/generate', [StudentController::class, 'generateCertificate'])->name('student.certificates.generate');
      Route::get('student/certificates/{certificate}', [StudentController::class, 'viewCertificate'])->name('student.certificates.view');

  // 8.5. Notifications
  Route::get('student/notifications', [StudentController::class, 'notifications'])->name('student.notifications');
  Route::post('student/notifications/{notification}/read', [StudentController::class, 'markNotificationAsRead'])->name('student.notifications.read');
  Route::post('student/notifications/read-all', [StudentController::class, 'markAllNotificationsAsRead'])->name('student.notifications.read-all');
});

/*
|--------------------------------------------------------------------------
| This controller handles All Teacher Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\TeacherController;
use App\Http\Middleware\TeacherMiddleware;

Route::middleware([TeacherMiddleware::class])->group(function () {

  // Dashboard
  Route::get('teacher/dashboard', [TeacherController::class, 'index'])->name('teacher.dashboard');

  // 4.1.1. View/Edit own information
  Route::get('teacher/profile', [TeacherController::class, 'profile'])->name('teacher.profile');
  Route::put('teacher/profile', [TeacherController::class, 'updateProfile'])->name('teacher.profile.update');
  Route::put('teacher/password', [TeacherController::class, 'updatePassword'])->name('teacher.password.update');

  // 4.2. Grade Management
  Route::get('teacher/grades', [TeacherController::class, 'grades'])->name('teacher.grades');
  Route::get('teacher/grades/create', [TeacherController::class, 'createGrade'])->name('teacher.grades.create');
  Route::post('teacher/grades', [TeacherController::class, 'storeGrade'])->name('teacher.grades.store');
  Route::get('teacher/grades/{grade}/edit', [TeacherController::class, 'editGrade'])->name('teacher.grades.edit');
  Route::put('teacher/grades/{grade}', [TeacherController::class, 'updateGrade'])->name('teacher.grades.update');
  Route::post('teacher/grades/submit', [TeacherController::class, 'submitGrades'])->name('teacher.grades.submit');

  // Grade input helpers
  Route::get('teacher/api/students-for-subject', [TeacherController::class, 'getStudentsForSubject'])->name('teacher.api.students-for-subject');

  // 4.2.4. Upload student grades via CSV
  Route::get('teacher/grades/edit', [TeacherController::class, 'editGrades'])->name('teacher.grades.edit');
  Route::get('teacher/grades/submit', [TeacherController::class, 'submitGradesPage'])->name('teacher.grades.submit');
  Route::get('teacher/grades/upload', [TeacherController::class, 'uploadGradesPage'])->name('teacher.grades.upload');
  Route::post('teacher/grades/upload', [TeacherController::class, 'processGradeUpload'])->name('teacher.grades.upload.process');

  // 4.3.1. View honor results of students
  Route::get('teacher/honors', [TeacherController::class, 'honors'])->name('teacher.honors');

  // Grading Management (K-12 Only)
  Route::get('teacher/grading', [TeacherController::class, 'gradingIndex'])->name('teacher.grading.index');
  Route::get('teacher/grading/elementary', [TeacherController::class, 'elementaryGrading'])->name('teacher.grading.elementary');
  Route::get('teacher/grading/junior-high', [TeacherController::class, 'juniorHighGrading'])->name('teacher.grading.junior-high');
  Route::get('teacher/grading/senior-high', [TeacherController::class, 'seniorHighGrading'])->name('teacher.grading.senior-high');
  Route::get('teacher/grading/elementary/create', [TeacherController::class, 'createElementary'])->name('teacher.grading.elementary.create');
  Route::get('teacher/grading/junior-high/create', [TeacherController::class, 'createJuniorHigh'])->name('teacher.grading.junior-high.create');
  Route::get('teacher/grading/senior-high/create', [TeacherController::class, 'createSeniorHigh'])->name('teacher.grading.senior-high.create');
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

  // 5.1.1. View/Edit own information
  Route::get('class-adviser/profile', [ClassAdviserController::class, 'profile'])->name('class-adviser.profile');
  Route::put('class-adviser/profile', [ClassAdviserController::class, 'updateProfile'])->name('class-adviser.profile.update');
  Route::put('class-adviser/password', [ClassAdviserController::class, 'updatePassword'])->name('class-adviser.password.update');

  // Grading System
  Route::get('class-adviser/grading', [ClassAdviserController::class, 'grading'])->name('class-adviser.grading');
  Route::get('class-adviser/grading/create', [ClassAdviserController::class, 'createGrading'])->name('class-adviser.grading.create');
  Route::post('class-adviser/grading/store', [ClassAdviserController::class, 'storeGrading'])->name('class-adviser.grading.store');

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

  // 2.1. Account Management
  // 2.1.1. View/Edit own information
  Route::get('registrar/profile', [RegistrarController::class, 'profile'])->name('registrar.profile');
  Route::put('registrar/profile', [RegistrarController::class, 'updateProfile'])->name('registrar.profile.update');
  Route::put('registrar/password', [RegistrarController::class, 'updatePassword'])->name('registrar.password.update');

  // 2.1.3. Specific User Management (MUST BE BEFORE GENERAL USER ROUTES)
  // Instructors
  Route::get('registrar/users/instructors', [RegistrarController::class, 'instructors'])->name('registrar.users.instructors');
  Route::post('registrar/users/instructors', [RegistrarController::class, 'storeInstructors'])->name('registrar.users.instructors.store');
  Route::put('registrar/users/instructors/{instructor}', [RegistrarController::class, 'updateInstructors'])->name('registrar.users.instructors.update');
  Route::delete('registrar/users/instructors/{instructor}', [RegistrarController::class, 'destroyInstructors'])->name('registrar.users.instructors.destroy');

  // Teachers
  Route::get('registrar/users/teachers', [RegistrarController::class, 'teachers'])->name('registrar.users.teachers');
  Route::post('registrar/users/teachers', [RegistrarController::class, 'storeTeachers'])->name('registrar.users.teachers.store');
  Route::put('registrar/users/teachers/{teacher}', [RegistrarController::class, 'updateTeachers'])->name('registrar.users.teachers.update');
  Route::delete('registrar/users/teachers/{teacher}', [RegistrarController::class, 'destroyTeachers'])->name('registrar.users.teachers.destroy');

  // Advisers
  Route::get('registrar/users/advisers', [RegistrarController::class, 'advisers'])->name('registrar.users.advisers');
  Route::post('registrar/users/advisers', [RegistrarController::class, 'storeAdvisers'])->name('registrar.users.advisers.store');
  Route::put('registrar/users/advisers/{adviser}', [RegistrarController::class, 'updateAdvisers'])->name('registrar.users.advisers.update');
  Route::delete('registrar/users/advisers/{adviser}', [RegistrarController::class, 'destroyAdvisers'])->name('registrar.users.advisers.destroy');

  // Chairpersons
  Route::get('registrar/users/chairpersons', [RegistrarController::class, 'chairpersons'])->name('registrar.users.chairpersons');
  Route::post('registrar/users/chairpersons', [RegistrarController::class, 'storeChairpersons'])->name('registrar.users.chairpersons.store');
  Route::put('registrar/users/chairpersons/{chairperson}', [RegistrarController::class, 'updateChairpersons'])->name('registrar.users.chairpersons.update');
  Route::delete('registrar/users/chairpersons/{chairperson}', [RegistrarController::class, 'destroyChairpersons'])->name('registrar.users.chairpersons.destroy');

  // Principals
  Route::get('registrar/users/principals', [RegistrarController::class, 'principals'])->name('registrar.users.principals');
  Route::post('registrar/users/principals', [RegistrarController::class, 'storePrincipals'])->name('registrar.users.principals.store');
  Route::put('registrar/users/principals/{principal}', [RegistrarController::class, 'updatePrincipals'])->name('registrar.users.principals.update');
  Route::delete('registrar/users/principals/{principal}', [RegistrarController::class, 'destroyPrincipals'])->name('registrar.users.principals.destroy');

  // User Upload
  Route::get('registrar/users/upload', [RegistrarController::class, 'uploadUsers'])->name('registrar.users.upload');
  Route::post('registrar/users/upload', [RegistrarController::class, 'processUserUpload'])->name('registrar.users.upload.process');

  // 2.1.4. General User Management
  Route::get('registrar/users', [RegistrarController::class, 'users'])->name('registrar.users.index');
  Route::get('registrar/users/{user}', [RegistrarController::class, 'showUser'])->name('registrar.users.show');
  Route::get('registrar/users/{user}/edit', [RegistrarController::class, 'editUser'])->name('registrar.users.edit');
  Route::put('registrar/users/{user}', [RegistrarController::class, 'updateUser'])->name('registrar.users.update');
  Route::delete('registrar/users/{user}', [RegistrarController::class, 'destroyUser'])->name('registrar.users.destroy');
  Route::put('registrar/users/{user}/change-password', [RegistrarController::class, 'changeUserPassword'])->name('registrar.users.change-password');

  // 2.1.5. Manage student accounts
  Route::get('registrar/students', [RegistrarController::class, 'students'])->name('registrar.students.index');
  Route::get('registrar/students/{student}', [RegistrarController::class, 'showStudent'])->name('registrar.students.show');
  Route::get('registrar/students/{student}/edit', [RegistrarController::class, 'editStudent'])->name('registrar.students.edit');
  Route::put('registrar/students/{student}', [RegistrarController::class, 'updateStudent'])->name('registrar.students.update');
  Route::delete('registrar/students/{student}', [RegistrarController::class, 'destroyStudent'])->name('registrar.students.destroy');
  Route::put('registrar/students/{student}/change-password', [RegistrarController::class, 'changeStudentPassword'])->name('registrar.students.change-password');

  // 2.1.4.1. Upload student accounts via CSV
  Route::get('registrar/students/upload', [RegistrarController::class, 'uploadStudents'])->name('registrar.students.upload');
  Route::post('registrar/students/upload', [RegistrarController::class, 'processStudentUpload'])->name('registrar.students.upload.process');

  // 2.1.5. Manage parent accounts
  Route::get('registrar/parents', [RegistrarController::class, 'parents'])->name('registrar.parents.index');
  Route::post('registrar/parents', [RegistrarController::class, 'storeParent'])->name('registrar.parents.store');
  Route::put('registrar/parents/{parent}', [RegistrarController::class, 'updateParent'])->name('registrar.parents.update');
  Route::delete('registrar/parents/{parent}', [RegistrarController::class, 'destroyParent'])->name('registrar.parents.destroy');
  Route::put('registrar/parents/{parent}/change-password', [RegistrarController::class, 'changeParentPassword'])->name('registrar.parents.change-password');
  Route::post('registrar/parents/{parent}/link-student', [RegistrarController::class, 'linkParentToStudent'])->name('registrar.parents.link-student');
  Route::delete('registrar/parents/{parent}/unlink-student', [RegistrarController::class, 'unlinkParentFromStudent'])->name('registrar.parents.unlink-student');

  // 2.1.6. Search user, student, and parent accounts
  Route::get('registrar/search', [RegistrarController::class, 'searchUsers'])->name('registrar.search');

  // 2.2. Academic & Curriculum Management
  // Academic Levels CRUD
  Route::get('registrar/academic/levels', [RegistrarController::class, 'academicLevels'])->name('registrar.academic.levels');
  Route::post('registrar/academic/levels', [RegistrarController::class, 'storeLevels'])->name('registrar.academic.levels.store');
  Route::put('registrar/academic/levels/{level}', [RegistrarController::class, 'updateLevels'])->name('registrar.academic.levels.update');
  Route::delete('registrar/academic/levels/{level}', [RegistrarController::class, 'destroyLevels'])->name('registrar.academic.levels.destroy');
  
  // Academic Periods CRUD
  Route::get('registrar/academic/periods', [RegistrarController::class, 'academicPeriods'])->name('registrar.academic.periods');
  Route::post('registrar/academic/periods', [RegistrarController::class, 'storePeriods'])->name('registrar.academic.periods.store');
  Route::put('registrar/academic/periods/{period}', [RegistrarController::class, 'updatePeriods'])->name('registrar.academic.periods.update');
  Route::delete('registrar/academic/periods/{period}', [RegistrarController::class, 'destroyPeriods'])->name('registrar.academic.periods.destroy');
  
  // Academic Strands CRUD
  Route::get('registrar/academic/strands', [RegistrarController::class, 'strands'])->name('registrar.academic.strands');
  Route::post('registrar/academic/strands', [RegistrarController::class, 'storeStrands'])->name('registrar.academic.strands.store');
  Route::put('registrar/academic/strands/{strand}', [RegistrarController::class, 'updateStrands'])->name('registrar.academic.strands.update');
  Route::delete('registrar/academic/strands/{strand}', [RegistrarController::class, 'destroyStrands'])->name('registrar.academic.strands.destroy');
  
  // Subjects CRUD
  Route::get('registrar/academic/subjects', [RegistrarController::class, 'subjects'])->name('registrar.academic.subjects');
  Route::post('registrar/academic/subjects', [RegistrarController::class, 'storeSubjects'])->name('registrar.academic.subjects.store');
  Route::put('registrar/academic/subjects/{subject}', [RegistrarController::class, 'updateSubjects'])->name('registrar.academic.subjects.update');
  Route::delete('registrar/academic/subjects/{subject}', [RegistrarController::class, 'destroySubjects'])->name('registrar.academic.subjects.destroy');
  
  // College Courses CRUD
  Route::get('registrar/academic/college-courses', [RegistrarController::class, 'collegeCourses'])->name('registrar.academic.college-courses');
  Route::post('registrar/academic/college-courses', [RegistrarController::class, 'storeCollegeCourses'])->name('registrar.academic.college-courses.store');
  Route::put('registrar/academic/college-courses/{course}', [RegistrarController::class, 'updateCollegeCourses'])->name('registrar.academic.college-courses.update');
  Route::delete('registrar/academic/college-courses/{course}', [RegistrarController::class, 'destroyCollegeCourses'])->name('registrar.academic.college-courses.destroy');
  
  // College Subjects CRUD
  Route::get('registrar/academic/college-subjects', [RegistrarController::class, 'collegeSubjects'])->name('registrar.academic.college-subjects');
  Route::post('registrar/academic/college-subjects', [RegistrarController::class, 'storeCollegeSubjects'])->name('registrar.academic.college-subjects.store');
  Route::put('registrar/academic/college-subjects/{subject}', [RegistrarController::class, 'updateCollegeSubjects'])->name('registrar.academic.college-subjects.update');
  Route::delete('registrar/academic/college-subjects/{subject}', [RegistrarController::class, 'destroyCollegeSubjects'])->name('registrar.academic.college-subjects.destroy');

  // Assignment Pages
  Route::get('registrar/assignments/instructors', [RegistrarController::class, 'instructorAssignments'])->name('registrar.assignments.instructors');
  Route::post('registrar/assignments/instructors', [RegistrarController::class, 'storeInstructorAssignments'])->name('registrar.assignments.instructors.store');
  Route::put('registrar/assignments/instructors/{assignment}', [RegistrarController::class, 'updateInstructorAssignments'])->name('registrar.assignments.instructors.update');
  Route::delete('registrar/assignments/instructors/{assignment}', [RegistrarController::class, 'destroyInstructorAssignments'])->name('registrar.assignments.instructors.destroy');
  Route::get('registrar/assignments/teachers', [RegistrarController::class, 'teacherAssignments'])->name('registrar.assignments.teachers');
  Route::post('registrar/assignments/teachers', [RegistrarController::class, 'storeTeacherAssignments'])->name('registrar.assignments.teachers.store');
  Route::put('registrar/assignments/teachers/{assignment}', [RegistrarController::class, 'updateTeacherAssignments'])->name('registrar.assignments.teachers.update');
  Route::delete('registrar/assignments/teachers/{assignment}', [RegistrarController::class, 'destroyTeacherAssignments'])->name('registrar.assignments.teachers.destroy');
  Route::get('registrar/assignments/advisers', [RegistrarController::class, 'adviserAssignments'])->name('registrar.assignments.advisers');
  Route::post('registrar/assignments/advisers/assign', [RegistrarController::class, 'assignAdvisers'])->name('registrar.assignments.advisers.assign');
  Route::post('registrar/assignments/advisers/remove', [RegistrarController::class, 'removeAdvisers'])->name('registrar.assignments.advisers.remove');

  // Registrar API Routes
  Route::get('registrar/api/periods-by-level', [RegistrarController::class, 'getPeriodsByLevel'])->name('registrar.api.periods-by-level');

  // 2.3. Honor Tracking and Ranking
  Route::get('registrar/honors', [RegistrarController::class, 'honors'])->name('registrar.honors.index');
  Route::get('registrar/honors/roll', [RegistrarController::class, 'honorRoll'])->name('registrar.honors.roll');
  Route::get('registrar/honors/criteria', [RegistrarController::class, 'criteria'])->name('registrar.honors.criteria');
  Route::post('registrar/honors/calculate', [RegistrarController::class, 'calculateHonors'])->name('registrar.honors.calculate');
  Route::post('registrar/honors/export', [RegistrarController::class, 'exportHonorRoll'])->name('registrar.honors.export');
  
  // Honor CRUD Routes
  Route::post('registrar/honors', [RegistrarController::class, 'storeHonor'])->name('registrar.honors.store');
  Route::put('registrar/honors/{honor}', [RegistrarController::class, 'updateHonor'])->name('registrar.honors.update');
  Route::delete('registrar/honors/{honor}', [RegistrarController::class, 'destroyHonor'])->name('registrar.honors.destroy');
  
  // Honor Criteria CRUD Routes
  Route::post('registrar/honors/criteria', [RegistrarController::class, 'storeHonorCriteria'])->name('registrar.honors.criteria.store');
  Route::put('registrar/honors/criteria/{criterion}', [RegistrarController::class, 'updateHonorCriteria'])->name('registrar.honors.criteria.update');
  Route::delete('registrar/honors/criteria/{criterion}', [RegistrarController::class, 'destroyHonorCriteria'])->name('registrar.honors.criteria.destroy');

  // 2.4. Automated Certificate Generation
  Route::get('registrar/certificates', [RegistrarController::class, 'certificates'])->name('registrar.certificates.index');
  Route::get('registrar/certificates/templates', [RegistrarController::class, 'certificateTemplates'])->name('registrar.certificates.templates');
  Route::post('registrar/certificates/generate', [RegistrarController::class, 'generateCertificate'])->name('registrar.certificates.generate');
  Route::post('registrar/certificates/bulk-generate', [RegistrarController::class, 'bulkGenerateCertificates'])->name('registrar.certificates.bulk-generate');
  Route::get('registrar/certificates/{certificate}/download', [RegistrarController::class, 'downloadCertificate'])->name('registrar.certificates.download');
  Route::get('registrar/certificates/{certificate}/print', [RegistrarController::class, 'printCertificate'])->name('registrar.certificates.print');
  
  // Certificate Templates CRUD Routes
  Route::post('registrar/certificates/templates', [RegistrarController::class, 'storeCertificateTemplate'])->name('registrar.certificates.templates.store');
  Route::post('registrar/certificates/templates/{template}', [RegistrarController::class, 'updateCertificateTemplate'])->name('registrar.certificates.templates.update');
  Route::delete('registrar/certificates/templates/{template}', [RegistrarController::class, 'destroyCertificateTemplate'])->name('registrar.certificates.templates.destroy');

  // 2.5. Reports and Archiving
  Route::get('registrar/reports', [RegistrarController::class, 'reports'])->name('registrar.reports.index');
  Route::post('registrar/reports/generate', [RegistrarController::class, 'generateReport'])->name('registrar.reports.generate');
  Route::get('registrar/reports/export', [RegistrarController::class, 'export'])->name('registrar.reports.export');
});
