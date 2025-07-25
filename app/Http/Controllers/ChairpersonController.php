<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ChairpersonController extends Controller
{
    public function index()
    {
        return Inertia::render('Chairperson/ChairpersonDashboard');
    }
}
