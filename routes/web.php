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
use App\Http\Controllers\Admin\GradingController;
use App\Http\Controllers\Admin\HonorController;
use App\Http\Controllers\Admin\CertificateController;
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

  // Grading System
  Route::get('admin/grading', [GradingController::class, 'index'])->name('admin.grading.index');
  Route::get('admin/grading/create', [GradingController::class, 'create'])->name('admin.grading.create');
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

  // Certificate Templates
  Route::get('admin/certificates/templates', [CertificateController::class, 'templates'])->name('admin.certificates.templates');
  Route::post('admin/certificates/templates', [CertificateController::class, 'storeTemplate'])->name('admin.certificates.templates.store');
  Route::put('admin/certificates/templates/{template}', [CertificateController::class, 'updateTemplate'])->name('admin.certificates.templates.update');
  Route::delete('admin/certificates/templates/{template}', [CertificateController::class, 'destroyTemplate'])->name('admin.certificates.templates.destroy');
  Route::post('admin/certificates/templates/{template}/preview', [CertificateController::class, 'preview'])->name('admin.certificates.templates.preview');

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

  // 8.5. Notifications
  Route::get('student/notifications', [StudentController::class, 'notifications'])->name('student.notifications');
  Route::post('student/notifications/{notification}/read', [StudentController::class, 'markNotificationAsRead'])->name('student.notifications.read');
  Route::post('student/notifications/read-all', [StudentController::class, 'markAllNotificationsAsRead'])->name('student.notifications.read-all');
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

  // 3.1.1. View/Edit own information
  Route::get('instructor/profile', [InstructorController::class, 'profile'])->name('instructor.profile');
  Route::put('instructor/profile', [InstructorController::class, 'updateProfile'])->name('instructor.profile.update');
  Route::put('instructor/password', [InstructorController::class, 'updatePassword'])->name('instructor.password.update');

  // 3.2. Grade Management
  Route::get('instructor/grades', [InstructorController::class, 'grades'])->name('instructor.grades');
  Route::get('instructor/grades/create', [InstructorController::class, 'createGrade'])->name('instructor.grades.create');
  Route::post('instructor/grades', [InstructorController::class, 'storeGrade'])->name('instructor.grades.store');
  Route::get('instructor/grades/{grade}/edit', [InstructorController::class, 'editGrade'])->name('instructor.grades.edit');
  Route::put('instructor/grades/{grade}', [InstructorController::class, 'updateGrade'])->name('instructor.grades.update');
  Route::post('instructor/grades/submit', [InstructorController::class, 'submitGrades'])->name('instructor.grades.submit');

  // Grade input helpers
  Route::get('instructor/api/students-for-subject', [InstructorController::class, 'getStudentsForSubject'])->name('instructor.api.students-for-subject');

  // 3.2.4. Upload student grades via CSV
  Route::get('instructor/grades/upload', [InstructorController::class, 'uploadGrades'])->name('instructor.grades.upload');
  Route::post('instructor/grades/upload', [InstructorController::class, 'processGradeUpload'])->name('instructor.grades.upload.process');

  // 3.3.1. View honor results of students
  Route::get('instructor/honors', [InstructorController::class, 'honors'])->name('instructor.honors');
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
