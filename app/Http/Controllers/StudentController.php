<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\GeneratedCertificate;
use App\Models\AcademicPeriod;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        $student = Auth::user();
        $studentProfile = $student->studentProfile;

        // Get dashboard statistics
        $stats = [
            'total_subjects' => $student->receivedGrades()->distinct('subject_id')->count(),
            'current_gpa' => $this->calculateCurrentGPA($student),
            'honor_count' => $student->honors()->where('is_approved', true)->count(),
            'certificate_count' => $student->certificates()->count(),
            'unread_notifications' => $student->notifications()->where('is_read', false)->count(),
        ];

        // Get recent grades (last 5)
        $recentGrades = $student->receivedGrades()
            ->with(['subject', 'academicPeriod', 'submittedBy'])
            ->where('status', 'approved')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'subject' => $grade->subject->name,
                    'grade_value' => $grade->grade_value,
                    'period' => $grade->academicPeriod->name,
                    'submitted_by' => $grade->submittedBy->name,
                    'date' => $grade->updated_at->format('M d, Y'),
                ];
            });

        // Get recent honors
        $recentHonors = $student->honors()
            ->with('academicPeriod')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($honor) {
                return [
                    'id' => $honor->id,
                    'honor_type' => $honor->getHonorDisplayName(),
                    'gpa' => number_format($honor->gpa, 2),
                    'period' => $honor->academicPeriod->name,
                    'date' => $honor->created_at->format('M d, Y'),
                ];
            });

        // Get unread notifications
        $notifications = $student->notifications()
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Student/StudentDashboard', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'profile' => $studentProfile ? [
                    'student_id' => $studentProfile->student_id,
                    'full_name' => $studentProfile->full_name,
                    'grade_level' => $studentProfile->grade_level,
                    'section' => $studentProfile->section,
                    'academic_level' => $studentProfile->academicLevel->name ?? '',
                    'academic_strand' => $studentProfile->academicStrand->name ?? '',
                    'college_course' => $studentProfile->collegeCourse->name ?? '',
                    'enrollment_status' => $studentProfile->enrollment_status,
                ] : null,
            ],
            'stats' => $stats,
            'recentGrades' => $recentGrades,
            'recentHonors' => $recentHonors,
            'notifications' => $notifications,
        ]);
    }

    // 8.1. View own information
    public function profile()
    {
        $student = Auth::user();
        $studentProfile = $student->studentProfile;

        if (!$studentProfile) {
            return redirect()->route('student.dashboard')->with('error', 'Student profile not found.');
        }

        return Inertia::render('Student/Profile', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'created_at' => $student->created_at->format('M d, Y'),
                'last_login_at' => $student->last_login_at ? $student->last_login_at->format('M d, Y g:i A') : 'Never',
            ],
            'profile' => [
                'student_id' => $studentProfile->student_id,
                'first_name' => $studentProfile->first_name,
                'middle_name' => $studentProfile->middle_name,
                'last_name' => $studentProfile->last_name,
                'full_name' => $studentProfile->full_name,
                'birth_date' => $studentProfile->birth_date,
                'gender' => $studentProfile->gender,
                'address' => $studentProfile->address,
                'contact_number' => $studentProfile->contact_number,
                'grade_level' => $studentProfile->grade_level,
                'section' => $studentProfile->section,
                'academic_level' => $studentProfile->academicLevel->name ?? '',
                'academic_strand' => $studentProfile->academicStrand->name ?? '',
                'college_course' => $studentProfile->collegeCourse->name ?? '',
                'enrollment_status' => $studentProfile->enrollment_status,
                'class_adviser' => $studentProfile->classAdviser->name ?? 'Not assigned',
            ],
        ]);
    }

    // 8.2. View grades
    public function grades(Request $request)
    {
        $student = Auth::user();
        $academicPeriodId = $request->get('academic_period_id');
        $subjectId = $request->get('subject_id');

        $query = $student->receivedGrades()
            ->with(['subject', 'academicPeriod', 'submittedBy'])
            ->where('status', 'approved');

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $grades = $query->orderBy('academic_period_id', 'desc')
            ->orderBy('subject_id')
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'subject' => [
                        'id' => $grade->subject->id,
                        'name' => $grade->subject->name,
                        'code' => $grade->subject->code,
                        'units' => $grade->subject->units,
                    ],
                    'grade_value' => $grade->grade_value,
                    'grade_letter' => $this->getLetterGrade($grade->grade_value),
                    'points' => $this->getGradePoints($grade->grade_value),
                    'academic_period' => [
                        'id' => $grade->academicPeriod->id,
                        'name' => $grade->academicPeriod->name,
                        'school_year' => $grade->academicPeriod->school_year,
                    ],
                    'submitted_by' => $grade->submittedBy->name,
                    'submitted_at' => $grade->created_at->format('M d, Y'),
                    'updated_at' => $grade->updated_at->format('M d, Y g:i A'),
                ];
            });

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('school_year', 'desc')->get();
        $subjects = $student->receivedGrades()
            ->with('subject')
            ->distinct('subject_id')
            ->get()
            ->pluck('subject')
            ->sortBy('name');

        // Calculate GPA for filtered results
        $currentGPA = $this->calculateGPAForGrades($grades);

        // Group grades by academic period
        $gradesByPeriod = $grades->groupBy('academic_period.id')->map(function ($periodGrades) {
            $period = $periodGrades->first()['academic_period'];
            $periodGPA = $this->calculateGPAForGrades($periodGrades);
            
            return [
                'period' => $period,
                'gpa' => $periodGPA,
                'grades' => $periodGrades->values(),
                'total_units' => $periodGrades->sum('subject.units'),
            ];
        })->values();

        return Inertia::render('Student/Grades', [
            'grades' => $grades,
            'gradesByPeriod' => $gradesByPeriod,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'currentGPA' => $currentGPA,
            'filters' => $request->only(['academic_period_id', 'subject_id']),
        ]);
    }

    // 8.3. View honor status
    public function honors()
    {
        $student = Auth::user();

        $honors = $student->honors()
            ->with(['academicPeriod', 'honorCriterion'])
            ->orderBy('academic_period_id', 'desc')
            ->get()
            ->map(function ($honor) {
                return [
                    'id' => $honor->id,
                    'honor_type' => $honor->getHonorDisplayName(),
                    'gpa' => number_format($honor->gpa, 2),
                    'academic_period' => [
                        'id' => $honor->academicPeriod->id,
                        'name' => $honor->academicPeriod->name,
                        'school_year' => $honor->academicPeriod->school_year,
                    ],
                    'is_approved' => $honor->is_approved,
                    'is_active' => $honor->is_active,
                    'approved_at' => $honor->approved_at ? $honor->approved_at->format('M d, Y') : null,
                    'created_at' => $honor->created_at->format('M d, Y'),
                ];
            });

        // Get honor statistics
        $stats = [
            'total_honors' => $honors->count(),
            'approved_honors' => $honors->where('is_approved', true)->count(),
            'pending_honors' => $honors->where('is_approved', false)->count(),
            'highest_gpa' => $honors->where('is_approved', true)->max('gpa') ?? 0,
            'latest_honor' => $honors->where('is_approved', true)->first(),
        ];

        return Inertia::render('Student/Honors', [
            'honors' => $honors,
            'stats' => $stats,
        ]);
    }

    // 8.4. View certificates (read-only)
    public function certificates()
    {
        $student = Auth::user();

        $certificates = $student->certificates()
            ->with(['certificateTemplate', 'academicPeriod'])
            ->orderBy('generated_at', 'desc')
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'certificate_type' => $certificate->certificate_type,
                    'type_display_name' => $certificate->getTypeDisplayName(),
                    'template_name' => $certificate->certificateTemplate->name,
                    'academic_period' => $certificate->academicPeriod ? [
                        'name' => $certificate->academicPeriod->name,
                        'school_year' => $certificate->academicPeriod->school_year,
                    ] : null,
                    'generated_at' => $certificate->generated_at->format('M d, Y'),
                    'is_digitally_signed' => $certificate->is_digitally_signed,
                    'can_download' => $certificate->hasFile(),
                    'issued_at' => $certificate->issued_at ? $certificate->issued_at->format('M d, Y') : null,
                    'issued_to' => $certificate->issued_to,
                ];
            });

        return Inertia::render('Student/Certificates', [
            'certificates' => $certificates,
        ]);
    }

    // Download certificate
    public function downloadCertificate(GeneratedCertificate $certificate)
    {
        $student = Auth::user();

        // Ensure the certificate belongs to the authenticated student
        if ($certificate->student_id !== $student->id) {
            abort(403, 'Unauthorized access to certificate.');
        }

        if (!$certificate->hasFile()) {
            return back()->with('error', 'Certificate file not found.');
        }

        return Storage::download($certificate->file_path, "certificate_{$certificate->certificate_number}.pdf");
    }

    // 8.5. Notifications
    public function notifications()
    {
        $student = Auth::user();

        $notifications = $student->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->format('M d, Y g:i A'),
                    'read_at' => $notification->read_at ? $notification->read_at->format('M d, Y g:i A') : null,
                ];
            });

        return Inertia::render('Student/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    // Mark notification as read
    public function markNotificationAsRead(Notification $notification)
    {
        $student = Auth::user();

        if ($notification->user_id !== $student->id) {
            abort(403, 'Unauthorized access to notification.');
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    // Mark all notifications as read
    public function markAllNotificationsAsRead()
    {
        $student = Auth::user();

        $student->notifications()->where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    // Helper methods
    private function calculateCurrentGPA(User $student)
    {
        $grades = $student->receivedGrades()
            ->with('subject')
            ->where('status', 'approved')
            ->get();

        return $this->calculateGPAForGrades($grades);
    }

    private function calculateGPAForGrades($grades)
    {
        if ($grades->isEmpty()) {
            return 0;
        }

        $totalPoints = 0;
        $totalUnits = 0;

        foreach ($grades as $grade) {
            $gradeValue = is_array($grade) ? $grade['grade_value'] : $grade->grade_value;
            $units = is_array($grade) ? $grade['subject']['units'] : $grade->subject->units;
            
            $points = $this->getGradePoints($gradeValue);
            $totalPoints += $points * $units;
            $totalUnits += $units;
        }

        return $totalUnits > 0 ? round($totalPoints / $totalUnits, 2) : 0;
    }

    private function getGradePoints($gradeValue)
    {
        // Convert grade value to GPA points (adjust based on your grading system)
        if ($gradeValue >= 95) return 4.0;
        if ($gradeValue >= 90) return 3.5;
        if ($gradeValue >= 85) return 3.0;
        if ($gradeValue >= 80) return 2.5;
        if ($gradeValue >= 75) return 2.0;
        return 1.0;
    }

    private function getLetterGrade($gradeValue)
    {
        // Convert grade value to letter grade
        if ($gradeValue >= 95) return 'A+';
        if ($gradeValue >= 90) return 'A';
        if ($gradeValue >= 85) return 'B+';
        if ($gradeValue >= 80) return 'B';
        if ($gradeValue >= 75) return 'C';
        return 'F';
    }
}
