<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;


class RegistrarController extends Controller
{
    public function index()
    {
        return Inertia::render('Registrar/RegistrarDashboard');
    }
}
