<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ParentManagementController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AcademicController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\NotificationController;
use App\Models\Track;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\StudentSubjectController;
use App\Http\Controllers\Admin\InstructorSubjectAssignmentController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register admin routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "admin" middleware group. All routes require admin access.
|
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [UserManagementController::class, 'dashboard'])->name('dashboard');
    
    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        // List all users with filters and pagination
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        
        // Show create form
        Route::get('/create', [UserManagementController::class, 'create'])->name('create');
        
        // Store new user
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        
        // Show specific user details and activity logs
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        
        // Show edit form
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        
        // Update user
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        
        // Delete user
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        
        // Reset user password
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
        
        // Get user profile data for API calls
        Route::get('/{user}/profile', [UserManagementController::class, 'profile'])->name('profile');
    });

    // Administrator Management
    Route::prefix('administrators')->name('administrators.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Registrar Management
    Route::prefix('registrars')->name('registrars.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Principal Management
    Route::prefix('principals')->name('principals.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Chairperson Management
    Route::prefix('chairpersons')->name('chairpersons.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Teacher Management
    Route::prefix('teachers')->name('teachers.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Instructor Management
    Route::prefix('instructors')->name('instructors.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });

    // Adviser Management
    Route::prefix('advisers')->name('advisers.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
    });
    
    // Parent Management
    Route::prefix('parents')->name('parents.')->group(function () {
        // List all parents with filters and pagination
        Route::get('/', [ParentManagementController::class, 'index'])->name('index');
        
        // Show create form
        Route::get('/create', [ParentManagementController::class, 'create'])->name('create');
        
        // Store new parent
        Route::post('/', [ParentManagementController::class, 'store'])->name('store');
        
        // Show specific parent details and linked students
        Route::get('/{parent}', [ParentManagementController::class, 'show'])->name('show');
        
        // Show edit form
        Route::get('/{parent}/edit', [ParentManagementController::class, 'edit'])->name('edit');
        
        // Update parent
        Route::put('/{parent}', [ParentManagementController::class, 'update'])->name('update');
        
        // Delete parent
        Route::delete('/{parent}', [ParentManagementController::class, 'destroy'])->name('destroy');
        
        // Reset parent password
        Route::post('/{parent}/reset-password', [ParentManagementController::class, 'resetPassword'])->name('reset-password');
        
        // Link parent to student
        Route::post('/{parent}/link-student', [ParentManagementController::class, 'linkStudent'])->name('link-student');
        
        // Unlink parent from student
        Route::delete('/{parent}/unlink-student/{student}', [ParentManagementController::class, 'unlinkStudent'])->name('unlink-student');
    });

    // Student Management
    Route::prefix('students')->name('students.')->group(function () {
        Route::get('/', [UserManagementController::class, 'indexByRole'])->name('index');
        // Year-level dedicated pages (filter param handled in controller)
        Route::get('/elementary', function() { request()->merge(['year_level' => 'elementary']); return app(UserManagementController::class)->indexByRole(request()); })->name('elementary');
        Route::get('/junior-highschool', function() { request()->merge(['year_level' => 'junior_highschool']); return app(UserManagementController::class)->indexByRole(request()); })->name('junior-highschool');
        Route::get('/senior-highschool', function() { request()->merge(['year_level' => 'senior_highschool']); return app(UserManagementController::class)->indexByRole(request()); })->name('senior-highschool');
        Route::get('/college', function() { request()->merge(['year_level' => 'college']); return app(UserManagementController::class)->indexByRole(request()); })->name('college');
        Route::get('/create', [UserManagementController::class, 'createByRole'])->name('create');
        Route::get('/elementary/create', [UserManagementController::class, 'createByAcademicLevel'])->name('elementary.create');
        Route::get('/junior-highschool/create', [UserManagementController::class, 'createByAcademicLevel'])->name('junior-highschool.create');
        Route::get('/senior-highschool/create', [UserManagementController::class, 'createByAcademicLevel'])->name('senior-highschool.create');
        Route::get('/college/create', [UserManagementController::class, 'createByAcademicLevel'])->name('college.create');
        Route::post('/', [UserManagementController::class, 'storeByRole'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'showByRole'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'editByRole'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'updateByRole'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroyByRole'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPasswordByRole'])->name('reset-password');
        // CSV template and upload endpoints
        Route::get('/template/csv', [UserManagementController::class, 'downloadStudentsCsvTemplate'])->name('template');
        Route::post('/upload/csv', [UserManagementController::class, 'uploadStudentsCsv'])->name('upload');
    });
    
    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        // Get activity logs with filters
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        
        // Get activity logs for specific user
        Route::get('/user/{user}', [ActivityLogController::class, 'userLogs'])->name('user');
    });
    
    // API endpoints for AJAX calls
    Route::prefix('api')->name('api.')->group(function () {
        // Get users data for datatables/search
        Route::get('/users', [UserManagementController::class, 'apiIndex'])->name('users.index');
        
        // Get user stats for dashboard
        Route::get('/stats', [UserManagementController::class, 'stats'])->name('stats');
        
        // Get recent activities
        Route::get('/recent-activities', [ActivityLogController::class, 'recentActivities'])->name('recent-activities');
    });
});

// Academic & Curriculum Management routes
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('admin/academic')->name('admin.academic.')->group(function () {
    Route::get('/', [AcademicController::class, 'index'])->name('index');
    Route::get('/levels', [AcademicController::class, 'levels'])->name('levels');
    Route::post('/levels', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'key' => ['required', 'string', 'alpha_dash', 'max:50', 'unique:academic_levels,key'],
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        \App\Models\AcademicLevel::create($validated);
        return back();
    })->name('levels.store');
    Route::put('/levels/{level}', function(\Illuminate\Http\Request $request, \App\Models\AcademicLevel $level) {
        $validated = $request->validate([
            'key' => ['required', 'string', 'alpha_dash', 'max:50', 'unique:academic_levels,key,' . $level->id],
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $level->update($validated);
        return back();
    })->name('levels.update');
    Route::delete('/levels/{level}', function(\App\Models\AcademicLevel $level) {
        $level->delete();
        return back();
    })->name('levels.destroy');
    
    // Grading Periods Management
    Route::get('/grading', [AcademicController::class, 'grading'])->name('grading');
    Route::post('/grading-periods', [AcademicController::class, 'storeGradingPeriod'])->name('grading-periods.store');
    Route::put('/grading-periods/{gradingPeriod}', [AcademicController::class, 'updateGradingPeriod'])->name('grading-periods.update');
    Route::delete('/grading-periods/{gradingPeriod}', [AcademicController::class, 'destroyGradingPeriod'])->name('grading-periods.destroy');
    
    // Subjects Management
    Route::get('/subjects', [AcademicController::class, 'subjects'])->name('subjects');
    Route::post('/subjects', [AcademicController::class, 'storeSubject'])->name('subjects.store');
    Route::put('/subjects/{subject}', [AcademicController::class, 'updateSubject'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [AcademicController::class, 'destroySubject'])->name('subjects.destroy');

    // Sections Management
    Route::get('/sections', [SectionController::class, 'index'])->name('sections');
    Route::get('/sections/elementary', [SectionController::class, 'manage'])->defaults('levelKey','elementary')->name('sections.elementary');
    Route::get('/sections/junior-highschool', [SectionController::class, 'manage'])->defaults('levelKey','junior_highschool')->name('sections.junior');
    Route::get('/sections/senior-highschool', [SectionController::class, 'manage'])->defaults('levelKey','senior_highschool')->name('sections.senior');
    Route::get('/sections/college', [SectionController::class, 'manage'])->defaults('levelKey','college')->name('sections.college');
    Route::post('/sections', [SectionController::class, 'store'])->name('sections.store');
    Route::put('/sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::get('/api/sections', [SectionController::class, 'list'])->name('api.sections');

    // Honors
    Route::get('/honors', [AcademicController::class, 'honors'])->name('honors');
    Route::get('/honors/elementary', [AcademicController::class, 'elementaryHonors'])->name('honors.elementary');
    Route::post('/honors/elementary/calculate', [AcademicController::class, 'calculateElementaryStudentHonor'])->name('honors.elementary.calculate');
    Route::post('/honors/elementary/generate-results', [AcademicController::class, 'generateElementaryHonorResults'])->name('honors.elementary.generate-results');
    Route::get('/honors/junior-high-school', [AcademicController::class, 'juniorHighSchoolHonors'])->name('honors.junior-high-school');
    Route::get('/honors/senior-high-school', [AcademicController::class, 'seniorHighSchoolHonors'])->name('honors.senior-high-school');
    Route::get('/honors/college', [AcademicController::class, 'collegeHonors'])->name('honors.college');
    Route::post('/honors/criteria', [AcademicController::class, 'saveHonorCriteria'])->name('honors.criteria.save');
    Route::put('/honors/criteria/{criterion}', [AcademicController::class, 'updateHonorCriterion'])->name('honors.criteria.update');
    Route::delete('/honors/criteria/{criterion}', [AcademicController::class, 'destroyHonorCriterion'])->name('honors.criteria.destroy');
    Route::post('/honors/types', [AcademicController::class, 'saveHonorType'])->name('honors.types.save');
    Route::post('/honors/generate', [AcademicController::class, 'generateHonorRoll'])->name('honors.generate');
    Route::post('/honors/{result}/override', [AcademicController::class, 'overrideHonorResult'])->name('honors.override');
    Route::get('/honors/export', [AcademicController::class, 'exportHonorRoll'])->name('honors.export');
    
    Route::get('/programs', [AcademicController::class, 'programs'])->name('programs'); // strands/courses/departments
    
    // Student Subject Management - REMOVED (subjects are now auto-assigned)
    
    // Tracks CRUD
    Route::post('/tracks', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:tracks,code'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $validated['is_active'] = $validated['is_active'] ?? true;
        Track::create($validated);
        return back()->with('success', 'Track created successfully!');
    })->name('tracks.store');
    
    Route::put('/tracks/{track}', function(\Illuminate\Http\Request $request, Track $track) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:tracks,code,' . $track->id],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $track->update($validated);
        return back()->with('success', 'Track updated successfully!');
    })->name('tracks.update');
    
    Route::delete('/tracks/{track}', function(Track $track) {
        $track->delete();
        return back()->with('success', 'Track deleted successfully!');
    })->name('tracks.destroy');
    
    // Strands CRUD
    Route::post('/strands', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:strands,code'],
            'description' => ['nullable', 'string'],
            'track_id' => ['nullable', 'exists:tracks,id'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        // Ensure only Senior High School can have strands
        $academicLevel = \App\Models\AcademicLevel::find($validated['academic_level_id']);
        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            return back()->withErrors(['academic_level_id' => 'Strands can only be created for Senior High School.']);
        }
        
        $validated['is_active'] = $validated['is_active'] ?? true;
        \App\Models\Strand::create($validated);
        return back();
    })->name('strands.store');
    Route::put('/strands/{strand}', function(\Illuminate\Http\Request $request, \App\Models\Strand $strand) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:strands,code,' . $strand->id],
            'description' => ['nullable', 'string'],
            'track_id' => ['nullable', 'exists:tracks,id'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        // Ensure only Senior High School can have strands
        $academicLevel = \App\Models\AcademicLevel::find($validated['academic_level_id']);
        if (!$academicLevel || $academicLevel->key !== 'senior_highschool') {
            return back()->withErrors(['academic_level_id' => 'Strands can only be created for Senior High School.']);
        }
        
        $strand->update($validated);
        return back();
    })->name('strands.update');
    Route::delete('/strands/{strand}', function(\App\Models\Strand $strand) {
        $strand->delete();
        return back();
    })->name('strands.destroy');
    
    // Departments CRUD
    Route::post('/departments', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $validated['is_active'] = $validated['is_active'] ?? true;
        \App\Models\Department::create($validated);
        return back();
    })->name('departments.store');
    Route::put('/departments/{department}', function(\Illuminate\Http\Request $request, \App\Models\Department $department) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code,' . $department->id],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $department->update($validated);
        return back();
    })->name('departments.update');
    Route::delete('/departments/{department}', function(\App\Models\Department $department) {
        $department->delete();
        return back();
    })->name('departments.destroy');
    
    // Courses CRUD
    Route::post('/courses', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:courses,code'],
            'description' => ['nullable', 'string'],
            'department_id' => ['required', 'exists:departments,id'],
            'units' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['units'] = $validated['units'] ?? 0;
        \App\Models\Course::create($validated);
        return back();
    })->name('courses.store');
    Route::put('/courses/{course}', function(\Illuminate\Http\Request $request, \App\Models\Course $course) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:courses,code,' . $course->id],
            'description' => ['nullable', 'string'],
            'department_id' => ['required', 'exists:departments,id'],
            'units' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $course->update($validated);
        return back();
    })->name('courses.update');
    Route::delete('/courses/{course}', function(\Illuminate\Http\Request $request, \App\Models\Course $course) {
        $course->delete();
        return back();
    })->name('courses.destroy');
    
    // Subjects CRUD
    Route::post('/subjects', [AcademicController::class, 'storeSubject'])->name('subjects.store');
    Route::put('/subjects/{subject}', [AcademicController::class, 'updateSubject'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [AcademicController::class, 'destroySubject'])->name('subjects.destroy');
    
    // Assignment Management
    Route::get('/assign-instructors', [AcademicController::class, 'assignInstructors'])->name('assign-instructors');
    Route::post('/assign-instructors', [AcademicController::class, 'storeInstructorAssignment'])->name('assign-instructors.store');
    Route::put('/assign-instructors/{assignment}', [AcademicController::class, 'updateInstructorAssignment'])->name('assign-instructors.update');
    Route::delete('/assign-instructors/{assignment}', [AcademicController::class, 'destroyInstructorAssignment'])->name('assign-instructors.destroy');

    // Hook into the same endpoints with inline syncing to subject-level assignments
    Route::post('/assign-instructors-sync', function(\Illuminate\Http\Request $request) {
        // Call existing controller handler first
        app(\App\Http\Controllers\Admin\AcademicController::class)->storeInstructorAssignment($request);
        // Then sync subjects
        $subjects = \App\Models\Subject::where('course_id', $request->course_id)
            ->where('academic_level_id', $request->academic_level_id)->get();
        foreach ($subjects as $subject) {
            \App\Models\InstructorSubjectAssignment::firstOrCreate([
                'instructor_id' => $request->instructor_id,
                'subject_id' => $subject->id,
                'academic_level_id' => $request->academic_level_id,
                'school_year' => $request->school_year,
                'grading_period_id' => $request->grading_period_id,
            ], [
                'assigned_by' => \Illuminate\Support\Facades\Auth::id(),
                'is_active' => true,
                'notes' => $request->notes,
            ]);
        }
        return back()->with('success', 'Instructor assigned and subjects synced.');
    })->name('assign-instructors.store-sync');
    
    // New Subject-Based Instructor Assignments
    Route::get('/assign-instructors-subjects', [InstructorSubjectAssignmentController::class, 'index'])->name('assign-instructors-subjects');
    Route::post('/assign-instructors-subjects', [InstructorSubjectAssignmentController::class, 'store'])->name('assign-instructors-subjects.store');
    Route::put('/assign-instructors-subjects/{assignment}', [InstructorSubjectAssignmentController::class, 'update'])->name('assign-instructors-subjects.update');
    Route::delete('/assign-instructors-subjects/{assignment}', [InstructorSubjectAssignmentController::class, 'destroy'])->name('assign-instructors-subjects.destroy');
    
    // Manage students in instructor assignments
    Route::get('/assign-instructors-subjects/{assignment}/students', [InstructorSubjectAssignmentController::class, 'showStudents'])->name('assign-instructors-subjects.students');
    Route::post('/assign-instructors-subjects/{assignment}/enroll-student', [InstructorSubjectAssignmentController::class, 'enrollStudent'])->name('assign-instructors-subjects.enroll-student');
    Route::delete('/assign-instructors-subjects/{assignment}/remove-student', [InstructorSubjectAssignmentController::class, 'removeStudent'])->name('assign-instructors-subjects.remove-student');
    
    Route::get('/assign-teachers', [AcademicController::class, 'assignTeachers'])->name('assign-teachers');
    Route::post('/assign-teachers', [AcademicController::class, 'storeTeacherAssignment'])->name('assign-teachers.store');
    Route::put('/assign-teachers/{assignment}', [AcademicController::class, 'updateTeacherAssignment'])->name('assign-teachers.update');
    Route::delete('/assign-teachers/{assignment}', [AcademicController::class, 'destroyTeacherAssignment'])->name('assign-teachers.destroy');
    
    Route::get('/assign-advisers', [AcademicController::class, 'assignAdvisers'])->name('assign-advisers');
    Route::post('/assign-advisers', [AcademicController::class, 'storeClassAdviserAssignment'])->name('assign-advisers.store');
    Route::put('/assign-advisers/{assignment}', [AcademicController::class, 'updateClassAdviserAssignment'])->name('assign-advisers.update');
    Route::delete('/assign-advisers/{assignment}', [AcademicController::class, 'destroyClassAdviserAssignment'])->name('assign-advisers.destroy');
    
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
    Route::post('/certificates/templates', [CertificateController::class, 'storeTemplate'])->name('certificates.templates.store');
    Route::put('/certificates/templates/{template}', [CertificateController::class, 'updateTemplate'])->name('certificates.templates.update');
    Route::delete('/certificates/templates/{template}', [CertificateController::class, 'destroyTemplate'])->name('certificates.templates.destroy');
    Route::post('/certificates/generate', [CertificateController::class, 'generate'])->name('certificates.generate');
    Route::post('/certificates/generate-bulk', [CertificateController::class, 'generateBulk'])->name('certificates.generate-bulk');
    Route::get('/certificates/resolve-student', [CertificateController::class, 'resolveStudentApi'])->name('certificates.resolve-student');

    // New bulk certificate generation routes
    Route::post('/certificates/bulk-generate-by-level', [CertificateController::class, 'bulkGenerateByLevel'])->name('certificates.bulk-generate-by-level');
    Route::post('/certificates/bulk-generate-by-honor-type', [CertificateController::class, 'bulkGenerateByHonorType'])->name('certificates.bulk-generate-by-honor-type');
    Route::post('/certificates/bulk-print-pdf', [CertificateController::class, 'bulkPrintPDF'])->name('certificates.bulk-print-pdf');

    // Honor roll routes
    Route::get('/certificates/honor-roll', [CertificateController::class, 'honorRoll'])->name('certificates.honor-roll');
    Route::get('/certificates/honor-roll/pdf', [CertificateController::class, 'generateHonorRollPDF'])->name('certificates.honor-roll.pdf');

    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/certificates/{certificate}/print', [CertificateController::class, 'print'])->name('certificates.print');
});

// Reports and Archiving routes
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('admin/reports')->name('admin.reports.')->group(function () {
    Route::get('/', [ReportsController::class, 'index'])->name('index');
    Route::post('/grade-report', [ReportsController::class, 'generateGradeReport'])->name('grade-report');
    Route::post('/honor-statistics', [ReportsController::class, 'generateHonorStatistics'])->name('honor-statistics');
    Route::post('/archive-records', [ReportsController::class, 'archiveAcademicRecords'])->name('archive-records');
});

// Notification and Transparency routes
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('admin/notifications')->name('admin.notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::post('/preview-grade-notifications', [NotificationController::class, 'previewGradeNotifications'])->name('preview-grade');
    Route::post('/preview-honor-notifications', [NotificationController::class, 'previewHonorNotifications'])->name('preview-honor');
    Route::post('/send-grade-notifications', [NotificationController::class, 'sendGradeNotifications'])->name('send-grade');
    Route::post('/send-honor-notifications', [NotificationController::class, 'sendHonorNotifications'])->name('send-honor');
    Route::post('/send-general-announcement', [NotificationController::class, 'sendGeneralAnnouncement'])->name('send-announcement');
    Route::get('/recipients', [NotificationController::class, 'getRecipients'])->name('recipients');
    Route::post('/{notification}/resend', [NotificationController::class, 'resendFailed'])->name('resend');
});

// System Audit and Security routes
Route::middleware(['auth', 'role:admin'])->prefix('admin/security')->name('admin.security.')->group(function () {
    Route::get('/', [SecurityController::class, 'index'])->name('index');
    Route::get('/activity-logs', [SecurityController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/login-sessions', [SecurityController::class, 'loginSessions'])->name('login-sessions');
    Route::delete('/sessions/{sessionId}', [SecurityController::class, 'terminateSession'])->name('terminate-session');
    Route::delete('/users/{userId}/sessions', [SecurityController::class, 'terminateUserSessions'])->name('terminate-user-sessions');
    Route::post('/backups', [SecurityController::class, 'createBackup'])->name('create-backup');
    Route::get('/backups/{filename}/download', [SecurityController::class, 'downloadBackup'])->name('download-backup');
    Route::delete('/backups/{filename}', [SecurityController::class, 'deleteBackup'])->name('delete-backup');
    
    // Maintenance mode routes
    Route::post('/toggle-maintenance-mode', [SecurityController::class, 'toggleMaintenanceMode'])->name('toggle-maintenance-mode');
    Route::post('/force-logout-all-users', [SecurityController::class, 'forceLogoutAllUsers'])->name('force-logout-all-users');
});
