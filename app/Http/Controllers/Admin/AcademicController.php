<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AcademicLevel;
use App\Models\Strand;
use App\Models\Course;
use App\Models\Department;

class AcademicController extends Controller
{
    private function sharedUser()
    {
        $user = Auth::user();
        return [
            'name' => $user->name,
            'email' => $user->email,
            'user_role' => $user->user_role,
        ];
    }

    public function index()
    {
        return Inertia::render('Admin/Academic/Index', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function levels()
    {
        $levels = AcademicLevel::orderBy('sort_order')->get();
        return Inertia::render('Admin/Academic/Levels', [
            'user' => $this->sharedUser(),
            'levels' => $levels,
        ]);
    }

    public function grading()
    {
        return Inertia::render('Admin/Academic/Grading', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function programs()
    {
        $departments = Department::with(['strands', 'courses'])->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/Programs', [
            'user' => $this->sharedUser(),
            'departments' => $departments,
        ]);
    }

    public function assignInstructors()
    {
        return Inertia::render('Admin/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function assignTeachers()
    {
        return Inertia::render('Admin/Academic/AssignTeachers', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function assignAdvisers()
    {
        return Inertia::render('Admin/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function subjects()
    {
        return Inertia::render('Admin/Academic/Subjects', [
            'user' => $this->sharedUser(),
        ]);
    }
}


