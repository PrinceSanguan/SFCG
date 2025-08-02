<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RegistrarMiddleware;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\InstructorMiddleware;
use App\Http\Middleware\StudentMiddleware;
use App\Http\Middleware\ParentMiddleware;
use App\Http\Middleware\ClassAdviserMiddleware;
use App\Http\Middleware\ChairpersonMiddleware;
use App\Http\Middleware\PrincipalMiddleware;
use App\Http\Middleware\UserMiddleware;
use App\Http\Middleware\GuestMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->alias([
            'registrar' => RegistrarMiddleware::class,
            'admin' => AdminMiddleware::class,
            'instructor' => InstructorMiddleware::class,
            'student' => StudentMiddleware::class,
            'parent' => ParentMiddleware::class,
            'class_adviser' => ClassAdviserMiddleware::class,
            'chairperson' => ChairpersonMiddleware::class,
            'principal' => PrincipalMiddleware::class,
            'user' => UserMiddleware::class,
            'guest' => GuestMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
