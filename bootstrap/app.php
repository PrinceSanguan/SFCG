<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\InstructorMiddleware;
use App\Http\Middleware\TeacherMiddleware;
use App\Http\Middleware\AdviserMiddleware;
use App\Http\Middleware\RegistrarMiddleware;
use App\Http\Middleware\ChairpersonMiddleware;
use App\Http\Middleware\PrincipalMiddleware;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\StudentMiddleware;
use App\Http\Middleware\CheckMaintenanceMode;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/registrar.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/instructor.php'));

            Route::middleware('web')
                ->group(base_path('routes/teacher.php'));

            Route::middleware('web')
                ->group(base_path('routes/adviser.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/student.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/parent.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/chairperson.php'));
            
            Route::middleware('web')
                ->group(base_path('routes/principal.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->web(append: [
            CheckMaintenanceMode::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureAdmin::class,
            'role' => EnsureRole::class,
            'instructor' => InstructorMiddleware::class,
            'teacher' => TeacherMiddleware::class,
            'registrar' => RegistrarMiddleware::class,
            'student' => StudentMiddleware::class,
            'parent' => \App\Http\Middleware\ParentMiddleware::class,
            'adviser' => AdviserMiddleware::class,
            'chairperson' => ChairpersonMiddleware::class,
            'principal' => PrincipalMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
