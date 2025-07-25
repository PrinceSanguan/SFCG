<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;


class ClassAdviserController extends Controller
{
    public function index()
    {
        return Inertia::render('Class-Adviser/ClassAdviserDashboard');
    }
}
