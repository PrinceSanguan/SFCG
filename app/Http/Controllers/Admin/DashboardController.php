<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\AcademicPeriod;
use App\Models\Subject;
use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\GeneratedCertificate;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get real statistics
        $stats = [
            'totalUsers' => User::count(),
            'activeStudents' => User::students()->whereHas('studentProfile', function($q) {
                $q->where('enrollment_status', 'active');
            })->count(),
            'instructors' => User::whereIn('user_role', ['instructor', 'teacher', 'class_adviser'])->count(),
            'subjects' => Subject::active()->count(),
            'pendingGrades' => Grade::where('status', 'submitted')->count(),
        ];

        // Get recent activities
        $recentActivities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->getActionDisplayName() . ' ' . $log->getModelDisplayName(),
                    'user' => $log->user->name ?? 'System',
                    'time' => $log->created_at->diffForHumans(),
                    'type' => strtolower($log->model),
                ];
            });

        // Get additional dashboard data
        $dashboardData = [
            'honorRollCount' => StudentHonor::where('is_approved', true)->count(),
            'certificatesGenerated' => GeneratedCertificate::count(),
            'activePeriods' => AcademicPeriod::active()->count(),
            'pendingApprovals' => Grade::where('status', 'submitted')->count() + 
                                StudentHonor::where('is_approved', false)->count(),
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'dashboardData' => $dashboardData,
        ]);
    }

    // Academic Management Pages (now redirected to AcademicController)
    public function academicLevels()
    {
        return app(AcademicController::class)->levels();
    }

    public function academicPeriods()
    {
        return app(AcademicController::class)->periods();
    }

    public function academicStrands()
    {
        return app(AcademicController::class)->strands();
    }

    public function academicSubjects()
    {
        return app(AcademicController::class)->subjects();
    }

    public function assignInstructors()
    {
        return app(AcademicController::class)->instructorAssignments();
    }

    public function assignAdvisers()
    {
        return app(AcademicController::class)->adviserAssignments();
    }

    // User Management Pages
    public function instructors()
    {
        $instructors = User::byRole('instructor')->with('subjectAssignments.subject')->get();
        
        return Inertia::render('Admin/Users/Instructors', [
            'instructors' => $instructors
        ]);
    }

    public function teachers()
    {
        $teachers = User::byRole('teacher')->with('subjectAssignments.subject')->get();
        
        return Inertia::render('Admin/Users/Teachers', [
            'teachers' => $teachers
        ]);
    }

    public function advisers()
    {
        $advisers = User::byRole('class_adviser')->with('advisedStudents')->get();
        
        return Inertia::render('Admin/Users/Advisers', [
            'advisers' => $advisers
        ]);
    }

    public function chairpersons()
    {
        $chairpersons = User::byRole('chairperson')->get();
        
        return Inertia::render('Admin/Users/Chairpersons', [
            'chairpersons' => $chairpersons
        ]);
    }

    public function principals()
    {
        $principals = User::byRole('principal')->get();
        
        return Inertia::render('Admin/Users/Principals', [
            'principals' => $principals
        ]);
    }

    public function students()
    {
        $students = User::students()
            ->with(['studentProfile.academicLevel', 'studentProfile.academicStrand', 'studentProfile.classAdviser'])
            ->get();
        
        return Inertia::render('Admin/Users/Students', [
            'students' => $students
        ]);
    }

    public function parents()
    {
        $parents = User::parents()->with('linkedStudents')->get();
        
        return Inertia::render('Admin/Users/Parents', [
            'parents' => $parents
        ]);
    }

    public function uploadCsv()
    {
        return Inertia::render('Admin/Users/UploadCsv');
    }

    // Grading Management
    public function grading()
    {
        $gradingStats = [
            'totalGrades' => Grade::count(),
            'draftGrades' => Grade::draft()->count(),
            'submittedGrades' => Grade::submitted()->count(),
            'approvedGrades' => Grade::approved()->count(),
            'finalizedGrades' => Grade::finalized()->count(),
        ];

        $pendingGrades = Grade::submitted()
            ->with(['student.studentProfile', 'subject', 'instructor', 'academicPeriod'])
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Grading/Index', [
            'gradingStats' => $gradingStats,
            'pendingGrades' => $pendingGrades,
        ]);
    }

    // Honors & Certificates
    public function honors()
    {
        $honorStats = [
            'totalHonors' => StudentHonor::count(),
            'approvedHonors' => StudentHonor::approved()->count(),
            'pendingHonors' => StudentHonor::pending()->count(),
            'withHonors' => StudentHonor::byHonorType('with_honors')->count(),
            'withHighHonors' => StudentHonor::byHonorType('with_high_honors')->count(),
            'withHighestHonors' => StudentHonor::byHonorType('with_highest_honors')->count(),
        ];

        $recentHonors = StudentHonor::with(['student.studentProfile', 'academicPeriod'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Honors/Index', [
            'honorStats' => $honorStats,
            'recentHonors' => $recentHonors,
        ]);
    }

    public function certificates()
    {
        $certificateStats = [
            'totalCertificates' => GeneratedCertificate::count(),
            'digitallySigned' => GeneratedCertificate::digitallySigned()->count(),
            'honorRollCerts' => GeneratedCertificate::byType('honor_roll')->count(),
            'graduationCerts' => GeneratedCertificate::byType('graduation')->count(),
        ];

        $recentCertificates = GeneratedCertificate::with(['student.studentProfile', 'certificateTemplate'])
            ->orderBy('generated_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Certificates/Index', [
            'certificateStats' => $certificateStats,
            'recentCertificates' => $recentCertificates,
        ]);
    }

    // Notifications
    public function notifications()
    {
        $notificationStats = [
            'totalNotifications' => Notification::count(),
            'unreadNotifications' => Notification::unread()->count(),
            'honorNotifications' => Notification::byType('honor_achievement')->count(),
            'certificateNotifications' => Notification::byType('certificate_generated')->count(),
        ];

        return Inertia::render('Admin/Notifications/Index', [
            'notificationStats' => $notificationStats,
        ]);
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

    // System Management
    public function auditLogs()
    {
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Admin/System/Logs', [
            'logs' => $logs
        ]);
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
