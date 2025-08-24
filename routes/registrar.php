<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Registrar\RegistrarController;
use App\Http\Controllers\Registrar\RegistrarUserManagementController;
use App\Http\Controllers\Registrar\RegistrarParentManagementController;

use App\Http\Controllers\Registrar\RegistrarAcademicController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\ReportsController;


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
    

    
    // API endpoints for AJAX calls
    Route::prefix('api')->name('api.')->group(function () {
        // Get users data for datatables/search
        Route::get('/users', [RegistrarUserManagementController::class, 'apiIndex'])->name('users.index');
        
        // Get user stats for dashboard
        Route::get('/stats', [RegistrarUserManagementController::class, 'stats'])->name('stats');
        

    });
});

// Academic & Curriculum Management routes (Registrar has access)
Route::middleware(['auth', 'role:admin,registrar,principal'])->prefix('registrar/academic')->name('registrar.academic.')->group(function () {
    Route::get('/', [RegistrarAcademicController::class, 'index'])->name('index');
    Route::get('/levels', [RegistrarAcademicController::class, 'levels'])->name('levels');
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
    Route::get('/grading', [RegistrarAcademicController::class, 'grading'])->name('grading');
    Route::post('/grading-periods', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:grading_periods,code'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        \App\Models\GradingPeriod::create($validated);
        return back();
    })->name('grading-periods.store');
    Route::put('/grading-periods/{gradingPeriod}', function(\Illuminate\Http\Request $request, \App\Models\GradingPeriod $gradingPeriod) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:grading_periods,code,' . $gradingPeriod->id],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $gradingPeriod->update($validated);
        return back();
    })->name('grading-periods.update');
    Route::delete('/grading-periods/{gradingPeriod}', function(\App\Models\GradingPeriod $gradingPeriod) {
        $gradingPeriod->delete();
        return back();
    })->name('grading-periods.destroy');
    Route::get('/subjects', [RegistrarAcademicController::class, 'subjects'])->name('subjects');
    Route::get('/programs', [RegistrarAcademicController::class, 'programs'])->name('programs');
    Route::get('/honors', [RegistrarAcademicController::class, 'honors'])->name('honors');
    Route::get('/assign-instructors', [RegistrarAcademicController::class, 'assignInstructors'])->name('assign-instructors');
    Route::post('/assign-instructors', function(\Illuminate\Http\Request $request) {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = \App\Models\User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        $assignment = \App\Models\InstructorCourseAssignment::create([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => \Illuminate\Support\Facades\Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'assigned_instructor_course',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assigned to course successfully!');
    })->name('assign-instructors.store');
    Route::put('/assign-instructors/{assignment}', function(\Illuminate\Http\Request $request, \App\Models\InstructorCourseAssignment $assignment) {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = \App\Models\User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'updated_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assignment updated successfully!');
    })->name('assign-instructors.update');
    Route::delete('/assign-instructors/{assignment}', function(\App\Models\InstructorCourseAssignment $assignment) {
        $assignment->delete();

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Instructor assignment removed successfully!');
    })->name('assign-instructors.destroy');
    Route::get('/assign-teachers', [RegistrarAcademicController::class, 'assignTeachers'])->name('assign-teachers');
    Route::post('/assign-teachers', function(\Illuminate\Http\Request $request) {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = \App\Models\User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment = \App\Models\TeacherSubjectAssignment::create([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => \Illuminate\Support\Facades\Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'assigned_teacher_subject',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assigned to subject successfully!');
    })->name('assign-teachers.store');
    Route::put('/assign-teachers/{assignment}', function(\Illuminate\Http\Request $request, \App\Models\TeacherSubjectAssignment $assignment) {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = \App\Models\User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment->update([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'updated_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assignment updated successfully!');
    })->name('assign-teachers.update');
    Route::delete('/assign-teachers/{assignment}', function(\App\Models\TeacherSubjectAssignment $assignment) {
        $assignment->delete();

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Teacher assignment removed successfully!');
    })->name('assign-teachers.destroy');
    Route::get('/assign-advisers', [RegistrarAcademicController::class, 'assignAdvisers'])->name('assign-advisers');
    
    // Strands CRUD routes
    Route::post('/strands', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:strands,code'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
        ]);
        
        $strand = \App\Models\Strand::create($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'created_strand',
            'entity_type' => 'strand',
            'entity_id' => $strand->id,
            'details' => [
                'strand_name' => $strand->name,
                'strand_code' => $strand->code,
            ],
        ]);
        
        return back()->with('success', 'Strand created successfully!');
    })->name('strands.store');
    
    Route::put('/strands/{strand}', function(\Illuminate\Http\Request $request, \App\Models\Strand $strand) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:strands,code,' . $strand->id],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
        ]);
        
        $strand->update($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'updated_strand',
            'entity_type' => 'strand',
            'entity_id' => $strand->id,
            'details' => [
                'strand_name' => $strand->name,
                'strand_code' => $strand->code,
            ],
        ]);
        
        return back()->with('success', 'Strand updated successfully!');
    })->name('strands.update');
    
    Route::delete('/strands/{strand}', function(\App\Models\Strand $strand) {
        $strand->delete();
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_strand',
            'entity_type' => 'strand',
            'entity_id' => $strand->id,
        ]);
        
        return back()->with('success', 'Strand deleted successfully!');
    })->name('strands.destroy');
    
    // Departments CRUD routes
    Route::post('/departments', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code'],
        ]);
        
        $department = \App\Models\Department::create($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'created_department',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'details' => [
                'department_name' => $department->name,
                'department_code' => $department->code,
            ],
        ]);
        
        return back()->with('success', 'Department created successfully!');
    })->name('departments.store');
    
    Route::put('/departments/{department}', function(\Illuminate\Http\Request $request, \App\Models\Department $department) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code,' . $department->id],
        ]);
        
        $department->update($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'updated_department',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'details' => [
                'department_name' => $department->name,
                'department_code' => $department->code,
            ],
        ]);
        
        return back()->with('success', 'Department updated successfully!');
    })->name('departments.update');
    
    Route::delete('/departments/{department}', function(\App\Models\Department $department) {
        $department->delete();
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_department',
            'entity_type' => 'department',
            'entity_id' => $department->id,
        ]);
        
        return back()->with('success', 'Department deleted successfully!');
    })->name('departments.destroy');
    
    // Courses CRUD routes
    Route::post('/courses', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:courses,code'],
            'department_id' => ['required', 'exists:departments,id'],
        ]);
        
        $course = \App\Models\Course::create($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'created_course',
            'entity_type' => 'course',
            'entity_id' => $course->id,
            'details' => [
                'course_name' => $course->name,
                'course_code' => $course->code,
            ],
        ]);
        
        return back()->with('success', 'Course created successfully!');
    })->name('courses.store');
    
    Route::put('/courses/{course}', function(\Illuminate\Http\Request $request, \App\Models\Course $course) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:courses,code,' . $course->id],
            'department_id' => ['required', 'exists:departments,id'],
        ]);
        
        $course->update($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'updated_course',
            'entity_type' => 'course',
            'entity_id' => $course->id,
            'details' => [
                'course_name' => $course->name,
                'course_code' => $course->code,
            ],
        ]);
        
        return back()->with('success', 'Course updated successfully!');
    })->name('courses.update');
    
    Route::delete('/courses/{course}', function(\App\Models\Course $course) {
        $course->delete();
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_course',
            'entity_type' => 'course',
            'entity_id' => $course->id,
        ]);
        
        return back()->with('success', 'Course deleted successfully!');
    })->name('courses.destroy');
    
    // Adviser Assignments CRUD routes
    Route::post('/assign-advisers', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'adviser_id' => ['required', 'exists:users,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'grade_level' => ['required', 'string', 'max:50'],
            'section' => ['required', 'string', 'max:10'],
            'school_year' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $assignment = \App\Models\ClassAdviserAssignment::create($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'created_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $assignment->adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);
        
        return back()->with('success', 'Adviser assigned successfully!');
    })->name('assign-advisers.store');
    
    Route::put('/assign-advisers/{assignment}', function(\Illuminate\Http\Request $request, \App\Models\ClassAdviserAssignment $assignment) {
        $validated = $request->validate([
            'adviser_id' => ['required', 'exists:users,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'grade_level' => ['required', 'string', 'max:50'],
            'section' => ['required', 'string', 'max:10'],
            'school_year' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $assignment->update($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'updated_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $assignment->adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);
        
        return back()->with('success', 'Adviser assignment updated successfully!');
    })->name('assign-advisers.update');
    
    Route::delete('/assign-advisers/{assignment}', function(\App\Models\ClassAdviserAssignment $assignment) {
        $assignment->delete();
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
        ]);
        
        return back()->with('success', 'Adviser assignment removed successfully!');
    })->name('assign-advisers.destroy');
    
    // Subjects CRUD routes
    Route::post('/subjects', function(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code'],
            'description' => ['nullable', 'string'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'grading_period_id' => ['nullable', 'exists:grading_periods,id'],
            'units' => ['required', 'numeric', 'min:0'],
            'hours_per_week' => ['required', 'numeric', 'min:0'],
            'is_core' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $validated['is_core'] = $validated['is_core'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $subject = \App\Models\Subject::create($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'created_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'subject_name' => $subject->name,
                'subject_code' => $subject->code,
                'academic_level' => $subject->academicLevel->name,
            ],
        ]);
        
        return back()->with('success', 'Subject created successfully!');
    })->name('subjects.store');
    
    Route::put('/subjects/{subject}', function(\Illuminate\Http\Request $request, \App\Models\Subject $subject) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code,' . $subject->id],
            'description' => ['nullable', 'string'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'grading_period_id' => ['nullable', 'exists:grading_periods,id'],
            'units' => ['required', 'numeric', 'min:0'],
            'hours_per_week' => ['required', 'numeric', 'min:0'],
            'is_core' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        $validated['is_core'] = $validated['is_core'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $subject->update($validated);
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'updated_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'subject_name' => $subject->name,
                'subject_code' => $subject->code,
                'academic_level' => $subject->academicLevel->name,
            ],
        ]);
        
        return back()->with('success', 'Subject updated successfully!');
    })->name('subjects.update');
    
    Route::delete('/subjects/{subject}', function(\Illuminate\Http\Request $request, \App\Models\Subject $subject) {
        $subject->delete();
        
        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => 'deleted_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
        ]);
        
        return back()->with('success', 'Subject deleted successfully!');
    })->name('subjects.destroy');
    
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
    Route::get('/certificates', [RegistrarAcademicController::class, 'certificates'])->name('certificates.index');
    Route::get('/certificates/search', [CertificateController::class, 'search'])->name('certificates.search');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/certificates/{certificate}/print', [CertificateController::class, 'print'])->name('certificates.print');
});

// Reports and Archiving routes (Registrar has access)
Route::middleware(['auth', 'registrar'])->prefix('registrar/reports')->name('registrar.reports.')->group(function () {
    Route::get('/', [RegistrarController::class, 'reports'])->name('index');
    Route::post('/grade-report', [ReportsController::class, 'generateGradeReport'])->name('grade-report');
    Route::post('/honor-statistics', [ReportsController::class, 'generateHonorStatistics'])->name('honor-statistics');
    Route::post('/archive-records', [ReportsController::class, 'archiveAcademicRecords'])->name('archive-records');
});


