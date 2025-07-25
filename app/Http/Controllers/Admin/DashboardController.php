<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AdminDashboard');
    }

    // User Management
    public function instructors()
    {
        return Inertia::render('Admin/Users/Instructors');
    }

    public function teachers()
    {
        return Inertia::render('Admin/Users/Teachers');
    }

    public function advisers()
    {
        return Inertia::render('Admin/Users/Advisers');
    }

    public function chairpersons()
    {
        return Inertia::render('Admin/Users/Chairpersons');
    }

    public function principals()
    {
        return Inertia::render('Admin/Users/Principals');
    }

    public function students()
    {
        return Inertia::render('Admin/Users/Students');
    }

    public function parents()
    {
        return Inertia::render('Admin/Users/Parents');
    }

    public function uploadCsv()
    {
        return Inertia::render('Admin/Users/UploadCsv');
    }

    // Academic Setup
    public function academicLevels()
    {
        return Inertia::render('Admin/Academic/Levels');
    }

    public function academicPeriods()
    {
        return Inertia::render('Admin/Academic/Periods');
    }

    public function academicStrands()
    {
        return Inertia::render('Admin/Academic/Strands');
    }

    public function academicSubjects()
    {
        return Inertia::render('Admin/Academic/Subjects');
    }

    // Assignments
    public function assignInstructors()
    {
        return Inertia::render('Admin/Assignments/Instructors');
    }

    public function assignAdvisers()
    {
        return Inertia::render('Admin/Assignments/Advisers');
    }

    // Grading
    public function grading()
    {
        return Inertia::render('Admin/Grading/Index');
    }

    // Honors & Certificates
    public function honors()
    {
        return Inertia::render('Admin/Honors/Index');
    }

    public function certificates()
    {
        return Inertia::render('Admin/Certificates/Index');
    }

    // Gmail Notifications
    public function notifications()
    {
        return Inertia::render('Admin/Notifications/Index');
    }

    // Reports
    public function reports()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    public function exportData()
    {
        return Inertia::render('Admin/Reports/Export');
    }

    // System Logs
    public function auditLogs()
    {
        return Inertia::render('Admin/System/Logs');
    }

    public function backup()
    {
        return Inertia::render('Admin/System/Backup');
    }

    public function restore()
    {
        return Inertia::render('Admin/System/Restore');
    }
}
