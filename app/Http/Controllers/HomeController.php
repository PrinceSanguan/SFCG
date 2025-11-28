<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the homepage - landing page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Landing');
    }
}
