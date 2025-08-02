<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\ParentStudentLink;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\AcademicLevel;
use App\Models\AcademicStrand;
use App\Models\CollegeCourse;
use App\Models\InstructorSubjectAssignment;
use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\HonorCriterion;
use App\Models\GeneratedCertificate;
use App\Models\CertificateTemplate;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Services\HonorCalculationService;
use App\Services\CertificateGenerationService;
use App\Services\GradeManagementService;
use Illuminate\Support\Facades\Log;

class RegistrarController extends Controller
{
    public function index()
    {
        // Get registrar dashboard statistics
        $stats = [
            'totalStudents' => User::where('user_role', 'student')->count(),
            'activeStudents' => User::students()->whereHas('studentProfile', function($q) {
                $q->where('enrollment_status', 'active');
            })->count(),
            'totalInstructors' => User::whereIn('user_role', ['instructor', 'teacher'])->count(),
            'totalParents' => User::where('user_role', 'parent')->count(),
            'pendingGrades' => Grade::where('status', 'submitted')->count(),
            'approvedHonors' => StudentHonor::where('is_approved', true)->count(),
            'generatedCertificates' => GeneratedCertificate::count(),
        ];

        // Get recent activities
        $recentActivities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
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

        return Inertia::render('Registrar/RegistrarDashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }

    // 2.1. Account Management
    // 2.1.1. View/Edit own information
    public function profile()
    {
        $user = Auth::user();
        return Inertia::render('Registrar/Profile', [
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        if ($user) {
            $user->update($request->only(['name', 'email']));
        }

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();
        if ($user) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    // 2.1.3. Manage user accounts
    public function users(Request $request)
    {
        $query = User::whereIn('user_role', ['instructor', 'teacher', 'class_adviser', 'chairperson', 'principal'])
                    ->with('studentProfile');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('role')) {
            $query->where('user_role', $request->role);
        }

        $users = $query->orderBy('name')->paginate(20);

        return Inertia::render('Registrar/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function showUser(User $user)
    {
        return Inertia::render('Registrar/Users/Show', [
            'user' => $user->load('studentProfile'),
        ]);
    }

    public function editUser(User $user)
    {
        return Inertia::render('Registrar/Users/Edit', [
            'user' => $user->load('studentProfile'),
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'user_role' => 'required|in:instructor,teacher,class_adviser,chairperson,principal',
        ]);

        $user->update($request->only(['name', 'email', 'user_role']));

        return redirect()->route('registrar.users.index')->with('success', 'User updated successfully.');
    }

    public function destroyUser(User $user)
    {
        $user->delete();
        return redirect()->route('registrar.users.index')->with('success', 'User deleted successfully.');
    }

    public function changeUserPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

    // 2.1.4. Manage student accounts
    public function students(Request $request)
    {
        $query = User::where('user_role', 'student')
                    ->with(['studentProfile.academicLevel', 'studentProfile.academicStrand', 'studentProfile.collegeCourse', 'studentProfile.classAdviser']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhereHas('studentProfile', function($q) use ($request) {
                      $q->where('student_id', 'like', '%' . $request->search . '%');
                  });
        }

        if ($request->filled('academic_level')) {
            $query->whereHas('studentProfile.academicLevel', function($q) use ($request) {
                $q->where('id', $request->academic_level);
            });
        }

        $students = $query->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('name')->get();
        $academicStrands = AcademicStrand::orderBy('name')->get();
        $collegeCourses = CollegeCourse::orderBy('name')->get();
        $classAdvisers = User::where('user_role', 'class_adviser')->orderBy('name')->get();

        return Inertia::render('Registrar/Students/Index', [
            'students' => $students,
            'academicLevels' => $academicLevels,
            'academicStrands' => $academicStrands,
            'collegeCourses' => $collegeCourses,
            'classAdvisers' => $classAdvisers,
            'filters' => $request->only(['search', 'academic_level']),
        ]);
    }

    public function showStudent(User $student)
    {
        return Inertia::render('Registrar/Students/Show', [
            'student' => $student->load(['studentProfile.academicLevel', 'studentProfile.collegeCourse']),
        ]);
    }

    public function editStudent(User $student)
    {
        $academicLevels = AcademicLevel::orderBy('name')->get();
        $collegeCourses = CollegeCourse::orderBy('name')->get();
        $strands = AcademicStrand::orderBy('name')->get();

        return Inertia::render('Registrar/Students/Edit', [
            'student' => $student->load(['studentProfile.academicLevel', 'studentProfile.collegeCourse']),
            'academicLevels' => $academicLevels,
            'collegeCourses' => $collegeCourses,
            'strands' => $strands,
        ]);
    }

    public function updateStudent(Request $request, User $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->id,
            'student_id' => 'required|string|max:50',
            'grade_level' => 'required|string|max:50',
            'section' => 'required|string|max:50',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'college_course_id' => 'nullable|exists:college_courses,id',
            'academic_strand_id' => 'nullable|exists:academic_strands,id',
        ]);

        $student->update($request->only(['name', 'email']));

        $student->studentProfile()->update([
            'student_id' => $request->student_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'academic_level_id' => $request->academic_level_id,
            'college_course_id' => $request->college_course_id,
            'academic_strand_id' => $request->academic_strand_id,
        ]);

        return redirect()->route('registrar.students.index')->with('success', 'Student updated successfully.');
    }

    public function destroyStudent(User $student)
    {
        $student->delete();
        return redirect()->route('registrar.students.index')->with('success', 'Student deleted successfully.');
    }

    public function changeStudentPassword(Request $request, User $student)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $student->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

    // 2.1.4.1. Upload student accounts via CSV
    public function uploadStudents()
    {
        return Inertia::render('Registrar/Students/Upload');
    }

    public function processStudentUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('csv_file');
        $path = $file->store('temp');
        
        // Process CSV file
        $handle = fopen(storage_path('app/' . $path), 'r');
        $header = fgetcsv($handle);
        $imported = 0;
        $errors = [];

        while (($data = fgetcsv($handle)) !== false) {
            try {
                $row = array_combine($header, $data);
                
                // Create user
                $user = User::create([
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'password' => Hash::make($row['password'] ?? 'password123'),
                    'user_role' => 'student',
                ]);

                // Create student profile
                $user->studentProfile()->create([
                    'student_id' => $row['student_id'],
                    'grade_level' => $row['grade_level'],
                    'section' => $row['section'],
                    'academic_level_id' => $row['academic_level_id'] ?? null,
                    'college_course_id' => $row['college_course_id'] ?? null,
                    'academic_strand_id' => $row['academic_strand_id'] ?? null,
                    'enrollment_status' => 'active',
                ]);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($imported + 1) . ": " . $e->getMessage();
            }
        }

        fclose($handle);
        Storage::delete($path);

        return redirect()->route('registrar.students.index')
                        ->with('success', "Successfully imported $imported students.")
                        ->with('errors', $errors);
    }

    // 2.1.5. Manage parent accounts
    public function parents(Request $request)
    {
        $query = User::where('user_role', 'parent')
                    ->with(['linkedStudents.studentProfile']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        $parents = $query->orderBy('name')->paginate(20);

        return Inertia::render('Registrar/Parents/Index', [
            'parents' => $parents,
            'filters' => $request->only(['search']),
        ]);
    }

    public function showParent(User $parent)
    {
        return Inertia::render('Registrar/Parents/Show', [
            'parent' => $parent->load(['linkedStudents.studentProfile']),
        ]);
    }

    public function editParent(User $parent)
    {
        $students = User::where('user_role', 'student')->orderBy('name')->get();
        
        return Inertia::render('Registrar/Parents/Edit', [
            'parent' => $parent->load(['linkedStudents.studentProfile']),
            'students' => $students,
        ]);
    }

    public function updateParent(Request $request, User $parent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $parent->id,
        ]);

        $parent->update($request->only(['name', 'email']));

        return redirect()->route('registrar.parents.index')->with('success', 'Parent updated successfully.');
    }

    public function destroyParent(User $parent)
    {
        $parent->delete();
        return redirect()->route('registrar.parents.index')->with('success', 'Parent deleted successfully.');
    }

    public function linkParentToStudent(Request $request, User $parent)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        ParentStudentLink::create([
            'parent_id' => $parent->id,
            'student_id' => $request->student_id,
        ]);

        return redirect()->back()->with('success', 'Parent linked to student successfully.');
    }

    public function unlinkParentFromStudent(Request $request, User $parent)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        ParentStudentLink::where('parent_id', $parent->id)
                        ->where('student_id', $request->student_id)
                        ->delete();

        return redirect()->back()->with('success', 'Parent unlinked from student successfully.');
    }

    public function changeParentPassword(Request $request, User $parent)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $parent->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

    // 2.1.6. Search user, student, and parent accounts
    public function searchUsers(Request $request)
    {
        $query = $request->get('query');
        $type = $request->get('type', 'all');

        $results = [];

        if ($type === 'all' || $type === 'users') {
            $users = User::whereIn('user_role', ['instructor', 'teacher', 'class_adviser', 'chairperson', 'principal'])
                        ->where(function($q) use ($query) {
                            $q->where('name', 'like', "%$query%")
                              ->orWhere('email', 'like', "%$query%");
                        })
                        ->limit(10)
                        ->get();

            $results['users'] = $users;
        }

        if ($type === 'all' || $type === 'students') {
            $students = User::where('user_role', 'student')
                           ->where(function($q) use ($query) {
                               $q->where('name', 'like', "%$query%")
                                 ->orWhere('email', 'like', "%$query%")
                                 ->orWhereHas('studentProfile', function($sq) use ($query) {
                                     $sq->where('student_id', 'like', "%$query%");
                                 });
                           })
                           ->with('studentProfile')
                           ->limit(10)
                           ->get();

            $results['students'] = $students;
        }

        if ($type === 'all' || $type === 'parents') {
            $parents = User::where('user_role', 'parent')
                          ->where(function($q) use ($query) {
                              $q->where('name', 'like', "%$query%")
                                ->orWhere('email', 'like', "%$query%");
                          })
                          ->limit(10)
                          ->get();

            $results['parents'] = $parents;
        }

        return response()->json($results);
    }

    // 2.2. Academic & Curriculum Management (Same as Admin)
    public function academicLevels()
    {
        $levels = AcademicLevel::with(['academicStrands', 'subjects'])
            ->withCount(['academicStrands', 'subjects'])
            ->orderBy('name')
            ->get();
        return Inertia::render('Registrar/Academic/Levels', [
            'levels' => $levels,
        ]);
    }

    public function academicPeriods()
    {
        $periods = AcademicPeriod::orderBy('name')->get();
        return Inertia::render('Registrar/Academic/Periods', [
            'periods' => $periods,
        ]);
    }

    public function strands()
    {
        $strands = AcademicStrand::with('academicLevel')->orderBy('name')->get();
        $levels = AcademicLevel::orderBy('name')->get();
        
        return Inertia::render('Registrar/Academic/Strands', [
            'strands' => $strands,
            'levels' => $levels,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'academicStrand', 'collegeCourse'])->orderBy('name')->get();
        $levels = AcademicLevel::orderBy('name')->get();
        $strands = AcademicStrand::orderBy('name')->get();
        $collegeCourses = CollegeCourse::orderBy('name')->get();
        $semesters = [
            '1st' => '1st Semester',
            '2nd' => '2nd Semester',
            'summer' => 'Summer',
        ];
        
        return Inertia::render('Registrar/Academic/Subjects', [
            'subjects' => $subjects,
            'levels' => $levels,
            'strands' => $strands,
            'collegeCourses' => $collegeCourses,
            'semesters' => $semesters,
        ]);
    }

    public function collegeCourses()
    {
        $courses = CollegeCourse::withCount(['subjects', 'studentProfiles'])->orderBy('name')->get();
        $degreeTypes = [
            'bachelor' => 'Bachelor\'s Degree',
            'master' => 'Master\'s Degree',
            'doctorate' => 'Doctorate',
            'diploma' => 'Diploma',
            'certificate' => 'Certificate',
        ];
        
        return Inertia::render('Registrar/Academic/CollegeCourses', [
            'courses' => $courses,
            'degreeTypes' => $degreeTypes,
        ]);
    }

    public function collegeSubjects()
    {
        $subjects = Subject::with(['collegeCourse'])
            ->whereNotNull('college_course_id')
            ->orderBy('name')
            ->get();

        $collegeCourses = CollegeCourse::active()->orderBy('name')->get();
        
        return Inertia::render('Registrar/Academic/CollegeSubjects', [
            'subjects' => $subjects,
            'collegeCourses' => $collegeCourses,
        ]);
    }

    // Assignment Pages
    public function instructorAssignments()
    {
        $assignments = InstructorSubjectAssignment::with(['instructor', 'subject', 'academicLevel'])
                                                  ->orderBy('created_at', 'desc')
                                                  ->get();
        $instructors = User::whereIn('user_role', ['instructor', 'teacher'])->orderBy('name')->get();
        $subjects = Subject::orderBy('name')->get();
        $periods = AcademicPeriod::orderBy('name')->get();

        return Inertia::render('Registrar/Assignments/Instructors', [
            'assignments' => $assignments,
            'instructors' => $instructors,
            'subjects' => $subjects,
            'periods' => $periods,
        ]);
    }

    public function adviserAssignments()
    {
        $students = User::where('user_role', 'student')
                       ->with(['studentProfile.academicLevel', 'studentProfile.classAdviser'])
                       ->orderBy('name')
                       ->get();
        $advisers = User::where('user_role', 'class_adviser')->orderBy('name')->get();

        return Inertia::render('Registrar/Assignments/Advisers', [
            'students' => $students,
            'advisers' => $advisers,
        ]);
    }

    // Instructor Assignment CRUD Methods
    public function storeInstructorAssignments(Request $request)
    {
        $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:50',
        ]);

        InstructorSubjectAssignment::create([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
        ]);

        return redirect()->back()->with('success', 'Instructor assignment created successfully.');
    }

    public function updateInstructorAssignments(Request $request, InstructorSubjectAssignment $assignment)
    {
        $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:50',
        ]);

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
        ]);

        return redirect()->back()->with('success', 'Instructor assignment updated successfully.');
    }

    public function destroyInstructorAssignments(InstructorSubjectAssignment $assignment)
    {
        $assignment->delete();
        return redirect()->back()->with('success', 'Instructor assignment deleted successfully.');
    }

    // 2.3. Honor Tracking and Ranking (Same as Admin)
    public function honors()
    {
        $honors = StudentHonor::with(['student.studentProfile', 'honorCriterion'])
                             ->orderBy('created_at', 'desc')
                             ->paginate(20);

        return Inertia::render('Registrar/Honors/Index', [
            'honors' => $honors,
        ]);
    }

    public function honorRoll()
    {
        $honors = StudentHonor::with(['student.studentProfile', 'honorCriterion'])
                             ->where('is_approved', true)
                             ->orderBy('created_at', 'desc')
                             ->paginate(20);

        return Inertia::render('Registrar/Honors/Roll', [
            'honors' => $honors,
        ]);
    }

    public function criteria()
    {
        $criteria = HonorCriterion::with('academicLevel')->orderBy('academic_level_id')->get();
        $levels = AcademicLevel::orderBy('name')->get();

        return Inertia::render('Registrar/Honors/Criteria', [
            'criteria' => $criteria,
            'levels' => $levels,
        ]);
    }

    public function calculateHonors()
    {
        $service = new HonorCalculationService();
        // Get the current active academic period or use a default
        $academicPeriod = AcademicPeriod::where('is_active', true)->first();
        
        if ($academicPeriod) {
            $service->calculateAllStudentHonors($academicPeriod->id);
        }

        return redirect()->route('registrar.honors.index')
                        ->with('success', 'Honor calculation completed successfully.');
    }

    public function exportHonorRoll()
    {
        $honorRoll = StudentHonor::with(['student.studentProfile', 'honorCriterion'])
                                ->where('is_approved', true)
                                ->orderBy('created_at', 'desc')
                                ->get();

        // Generate CSV export
        $filename = 'honor_roll_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($honorRoll) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student ID', 'Name', 'Level', 'Honor Type', 'GPA', 'Date']);

            foreach ($honorRoll as $honor) {
                fputcsv($file, [
                    $honor->student->studentProfile->student_id,
                    $honor->student->name,
                    $honor->student->studentProfile->academicLevel->name ?? 'N/A',
                    $honor->honorCriterion->name,
                    $honor->gpa,
                    $honor->created_at->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Honor CRUD Methods
    public function storeHonor(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'honor_type' => 'required|string|max:255',
            'gpa' => 'required|numeric|min:0|max:4',
            'is_approved' => 'boolean',
            'awarded_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        StudentHonor::create([
            'student_id' => $request->student_id,
            'honor_type' => $request->honor_type,
            'gpa' => $request->gpa,
            'is_approved' => $request->is_approved ?? false,
            'awarded_date' => $request->awarded_date,
            'remarks' => $request->remarks,
        ]);

        return redirect()->back()->with('success', 'Honor created successfully.');
    }

    public function updateHonor(Request $request, StudentHonor $honor)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'honor_type' => 'required|string|max:255',
            'gpa' => 'required|numeric|min:0|max:4',
            'is_approved' => 'boolean',
            'awarded_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $honor->update([
            'student_id' => $request->student_id,
            'honor_type' => $request->honor_type,
            'gpa' => $request->gpa,
            'is_approved' => $request->is_approved ?? false,
            'awarded_date' => $request->awarded_date,
            'remarks' => $request->remarks,
        ]);

        return redirect()->back()->with('success', 'Honor updated successfully.');
    }

    public function destroyHonor(StudentHonor $honor)
    {
        $honor->delete();
        return redirect()->back()->with('success', 'Honor deleted successfully.');
    }

    // 2.4. Automated Certificate Generation (Same as Admin)
    public function certificates()
    {
        $certificates = GeneratedCertificate::with(['student.studentProfile', 'template'])
                                           ->orderBy('created_at', 'desc')
                                           ->paginate(20);

        return Inertia::render('Registrar/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }

    public function certificateTemplates()
    {
        $templates = CertificateTemplate::orderBy('name')->get();
        return Inertia::render('Registrar/Certificates/Templates', [
            'templates' => $templates,
        ]);
    }

    public function generateCertificate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'template_id' => 'required|exists:certificate_templates,id',
            'certificate_type' => 'required|in:honor_roll,achievement,completion',
        ]);

        $service = new CertificateGenerationService();
        $certificate = $service->generateCertificate(
            $request->student_id,
            $request->template_id,
            $request->certificate_type
        );

        return redirect()->route('registrar.certificates.index')
                        ->with('success', 'Certificate generated successfully.');
    }

    public function bulkGenerateCertificates(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
            'template_id' => 'required|exists:certificate_templates,id',
            'certificate_type' => 'required|in:honor_roll,achievement,completion',
        ]);

        $service = new CertificateGenerationService();
        $count = 0;

        foreach ($request->student_ids as $studentId) {
            try {
                $service->generateCertificate($studentId, $request->template_id, $request->certificate_type);
                $count++;
            } catch (\Exception $e) {
                // Log error and continue
                Log::error("Failed to generate certificate for student $studentId: " . $e->getMessage());
            }
        }

        return redirect()->route('registrar.certificates.index')
                        ->with('success', "Successfully generated $count certificates.");
    }

    public function downloadCertificate(GeneratedCertificate $certificate)
    {
        if (!Storage::exists($certificate->file_path)) {
            abort(404, 'Certificate file not found.');
        }

        return Storage::download($certificate->file_path, $certificate->filename);
    }

    public function printCertificate(GeneratedCertificate $certificate)
    {
        return Inertia::render('Registrar/Certificates/Print', [
            'certificate' => $certificate->load(['student.studentProfile', 'template']),
        ]);
    }

    // 2.5. Reports and Archiving (Same as Admin)
    public function reports()
    {
        $stats = [
            'totalStudents' => User::where('user_role', 'student')->count(),
            'totalInstructors' => User::whereIn('user_role', ['instructor', 'teacher'])->count(),
            'totalGrades' => Grade::count(),
            'approvedHonors' => StudentHonor::where('is_approved', true)->count(),
            'generatedCertificates' => GeneratedCertificate::count(),
        ];

        return Inertia::render('Registrar/Reports/Index', [
            'stats' => $stats,
        ]);
    }

    public function generateReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:grades,honors,students,performance',
            'format' => 'required|in:pdf,excel,csv',
            'filters' => 'array',
        ]);

        // Generate report based on type
        $report = $this->generateReportData($request->report_type, $request->filters ?? []);

        if ($request->format === 'csv') {
            return $this->exportToCsv($report, $request->report_type);
        } elseif ($request->format === 'excel') {
            return $this->exportToExcel($report, $request->report_type);
        } else {
            return $this->exportToPdf($report, $request->report_type);
        }
    }

    private function generateReportData($type, $filters)
    {
        switch ($type) {
            case 'grades':
                return Grade::with(['student.studentProfile', 'subject', 'academicPeriod'])
                           ->when(isset($filters['academic_period_id']), function($q) use ($filters) {
                               $q->where('academic_period_id', $filters['academic_period_id']);
                           })
                           ->when(isset($filters['subject_id']), function($q) use ($filters) {
                               $q->where('subject_id', $filters['subject_id']);
                           })
                           ->get();

            case 'honors':
                return StudentHonor::with(['student.studentProfile', 'honorCriterion'])
                                  ->when(isset($filters['academic_level_id']), function($q) use ($filters) {
                                      $q->whereHas('student.studentProfile', function($sq) use ($filters) {
                                          $sq->where('academic_level_id', $filters['academic_level_id']);
                                      });
                                  })
                                  ->get();

            case 'students':
                return User::where('user_role', 'student')
                          ->with(['studentProfile.academicLevel', 'studentProfile.collegeCourse'])
                          ->when(isset($filters['academic_level_id']), function($q) use ($filters) {
                              $q->whereHas('studentProfile', function($sq) use ($filters) {
                                  $sq->where('academic_level_id', $filters['academic_level_id']);
                              });
                          })
                          ->get();

            case 'performance':
                return Grade::with(['student.studentProfile', 'subject'])
                           ->select('student_id', 'subject_id', DB::raw('AVG(final_grade) as average_grade'))
                           ->groupBy('student_id', 'subject_id')
                           ->get();

            default:
                return collect();
        }
    }

    private function exportToCsv($data, $type)
    {
        $filename = $type . '_report_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($data, $type) {
            $file = fopen('php://output', 'w');
            
            // Add headers based on report type
            switch ($type) {
                case 'grades':
                    fputcsv($file, ['Student ID', 'Student Name', 'Subject', 'Grade', 'Period']);
                    foreach ($data as $grade) {
                        fputcsv($file, [
                            $grade->student->studentProfile->student_id,
                            $grade->student->name,
                            $grade->subject->name,
                            $grade->final_grade,
                            $grade->academicPeriod->name,
                        ]);
                    }
                    break;

                case 'honors':
                    fputcsv($file, ['Student ID', 'Student Name', 'Honor Type', 'GPA', 'Level']);
                    foreach ($data as $honor) {
                        fputcsv($file, [
                            $honor->student->studentProfile->student_id,
                            $honor->student->name,
                            $honor->honorCriterion->name,
                            $honor->gpa,
                            $honor->student->studentProfile->academicLevel->name ?? 'N/A',
                        ]);
                    }
                    break;

                case 'students':
                    fputcsv($file, ['Student ID', 'Name', 'Email', 'Level', 'Course']);
                    foreach ($data as $student) {
                        fputcsv($file, [
                            $student->studentProfile->student_id,
                            $student->name,
                            $student->email,
                            $student->studentProfile->academicLevel->name ?? 'N/A',
                            $student->studentProfile->collegeCourse->name ?? 'N/A',
                        ]);
                    }
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToExcel($data, $type)
    {
        // Implementation for Excel export
        // This would require a package like PhpSpreadsheet
        return response()->json(['message' => 'Excel export not implemented yet']);
    }

    private function exportToPdf($data, $type)
    {
        // Implementation for PDF export
        // This would require a package like DomPDF
        return response()->json(['message' => 'PDF export not implemented yet']);
    }

    // ==================== ACADEMIC CRUD OPERATIONS ====================
    
    // Academic Levels CRUD
    public function storeLevels(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_levels,code',
            'description' => 'nullable|string',
        ]);

        $level = AcademicLevel::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicLevel',
            $level->id,
            null,
            $level->toArray()
        );

        return redirect()->back()->with('success', 'Academic level created successfully.');
    }

    public function updateLevels(Request $request, AcademicLevel $level)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_levels,code,' . $level->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $oldValues = $level->toArray();

        $level->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicLevel',
            $level->id,
            $oldValues,
            $level->toArray()
        );

        return redirect()->back()->with('success', 'Academic level updated successfully.');
    }

    public function destroyLevels(AcademicLevel $level)
    {
        // Check if level has associated data
        if ($level->subjects()->count() > 0 || $level->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic level with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicLevel',
            $level->id,
            $level->toArray(),
            null
        );

        $level->delete();

        return redirect()->back()->with('success', 'Academic level deleted successfully.');
    }

    // Academic Periods CRUD
    public function storePeriods(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:semester,quarter,trimester',
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $period = AcademicPeriod::create($request->all());

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicPeriod',
            $period->id,
            null,
            $period->toArray()
        );

        return redirect()->back()->with('success', 'Academic period created successfully.');
    }

    public function updatePeriods(Request $request, AcademicPeriod $period)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:semester,quarter,trimester',
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        $oldValues = $period->toArray();
        $period->update($request->all());

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicPeriod',
            $period->id,
            $oldValues,
            $period->toArray()
        );

        return redirect()->back()->with('success', 'Academic period updated successfully.');
    }

    public function destroyPeriods(AcademicPeriod $period)
    {
        // Check if period has associated grades
        if ($period->grades()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic period with associated grades.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicPeriod',
            $period->id,
            $period->toArray(),
            null
        );

        $period->delete();

        return redirect()->back()->with('success', 'Academic period deleted successfully.');
    }

    // Academic Strands CRUD
    public function storeStrands(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_strands,code',
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
        ]);

        $strand = AcademicStrand::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicStrand',
            $strand->id,
            null,
            $strand->toArray()
        );

        return redirect()->back()->with('success', 'Academic strand created successfully.');
    }

    public function updateStrands(Request $request, AcademicStrand $strand)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_strands,code,' . $strand->id,
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'is_active' => 'boolean',
        ]);

        $oldValues = $strand->toArray();

        $strand->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicStrand',
            $strand->id,
            $oldValues,
            $strand->toArray()
        );

        return redirect()->back()->with('success', 'Academic strand updated successfully.');
    }

    public function destroyStrands(AcademicStrand $strand)
    {
        // Check if strand has associated data
        if ($strand->subjects()->count() > 0 || $strand->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic strand with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicStrand',
            $strand->id,
            $strand->toArray(),
            null
        );

        $strand->delete();

        return redirect()->back()->with('success', 'Academic strand deleted successfully.');
    }

    // College Courses CRUD
    public function storeCollegeCourses(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:college_courses,code',
            'description' => 'nullable|string',
            'degree_type' => 'required|in:bachelor,master,doctorate,diploma,certificate',
            'years_duration' => 'required|integer|min:1|max:10',
            'department' => 'nullable|string|max:255',
        ]);

        $course = CollegeCourse::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'degree_type' => $request->degree_type,
            'years_duration' => $request->years_duration,
            'department' => $request->department,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'CollegeCourse',
            $course->id,
            null,
            $course->toArray()
        );

        return redirect()->back()->with('success', 'College course created successfully.');
    }

    public function updateCollegeCourses(Request $request, CollegeCourse $course)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:college_courses,code,' . $course->id,
            'description' => 'nullable|string',
            'degree_type' => 'required|in:bachelor,master,doctorate,diploma,certificate',
            'years_duration' => 'required|integer|min:1|max:10',
            'department' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $oldValues = $course->toArray();

        $course->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'degree_type' => $request->degree_type,
            'years_duration' => $request->years_duration,
            'department' => $request->department,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'CollegeCourse',
            $course->id,
            $oldValues,
            $course->toArray()
        );

        return redirect()->back()->with('success', 'College course updated successfully.');
    }

    public function destroyCollegeCourses(CollegeCourse $course)
    {
        // Check if course has associated data
        if ($course->subjects()->count() > 0 || $course->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete college course with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'CollegeCourse',
            $course->id,
            $course->toArray(),
            null
        );

        $course->delete();

        return redirect()->back()->with('success', 'College course deleted successfully.');
    }

    // College Subjects CRUD
    public function storeCollegeSubjects(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'college_course_id' => 'required|exists:college_courses,id',
            'year_level' => 'required|integer|min:1|max:6',
            'semester' => 'required|in:1st,2nd,summer',
            'is_active' => 'boolean',
        ]);

        $subject = Subject::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'college_course_id' => $request->college_course_id,
            'year_level' => $request->year_level,
            'semester' => $request->semester,
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'Subject',
            $subject->id,
            null,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'College subject created successfully.');
    }

    public function updateCollegeSubjects(Request $request, Subject $subject)
    {
        // Ensure this is a college subject
        if (!$subject->isCollegeSubject()) {
            return redirect()->back()->with('error', 'This subject is not a college subject.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'college_course_id' => 'required|exists:college_courses,id',
            'year_level' => 'required|integer|min:1|max:6',
            'semester' => 'required|in:1st,2nd,summer',
            'is_active' => 'boolean',
        ]);

        $oldValues = $subject->toArray();

        $subject->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'college_course_id' => $request->college_course_id,
            'year_level' => $request->year_level,
            'semester' => $request->semester,
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'Subject',
            $subject->id,
            $oldValues,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'College subject updated successfully.');
    }

    public function destroyCollegeSubjects(Subject $subject)
    {
        // Ensure this is a college subject
        if (!$subject->isCollegeSubject()) {
            return redirect()->back()->with('error', 'This subject is not a college subject.');
        }

        // Check if subject has associated data
        if ($subject->grades()->count() > 0 || $subject->instructorAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete college subject with associated grades or instructor assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'Subject',
            $subject->id,
            $subject->toArray(),
            null
        );

        $subject->delete();

        return redirect()->back()->with('success', 'College subject deleted successfully.');
    }

    // Subjects CRUD
    public function storeSubjects(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
        ];

        // Conditional validation based on subject type
        if ($request->subject_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12'; // Add grade level for K-12
        }

        $request->validate($rules);

        $subjectData = [
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'is_active' => true,
        ];

        if ($request->subject_type === 'college') {
            $subjectData['college_course_id'] = $request->college_course_id;
            $subjectData['year_level'] = $request->year_level;
            $subjectData['semester'] = $request->semester;
        } else {
            $subjectData['academic_level_id'] = $request->academic_level_id;
            $subjectData['academic_strand_id'] = $request->academic_strand_id;
            $subjectData['year_level'] = $request->year_level; // Add grade level for K-12
        }

        $subject = Subject::create($subjectData);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'Subject',
            $subject->id,
            null,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function updateSubjects(Request $request, Subject $subject)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ];

        // Conditional validation based on subject type
        if ($request->subject_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12'; // Add grade level for K-12
        }

        $request->validate($rules);

        $oldValues = $subject->toArray();

        $subjectData = [
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'is_active' => $request->is_active,
        ];

        if ($request->subject_type === 'college') {
            $subjectData['college_course_id'] = $request->college_course_id;
            $subjectData['year_level'] = $request->year_level;
            $subjectData['semester'] = $request->semester;
            // Clear K-12 fields
            $subjectData['academic_level_id'] = null;
            $subjectData['academic_strand_id'] = null;
        } else {
            $subjectData['academic_level_id'] = $request->academic_level_id;
            $subjectData['academic_strand_id'] = $request->academic_strand_id;
            $subjectData['year_level'] = $request->year_level; // Add grade level for K-12
            // Clear college fields
            $subjectData['college_course_id'] = null;
            $subjectData['semester'] = null;
        }

        $subject->update($subjectData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'Subject',
            $subject->id,
            $oldValues,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function destroySubjects(Subject $subject)
    {
        // Check if subject has associated data
        if ($subject->grades()->count() > 0 || $subject->instructorAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete subject with associated grades or assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'Subject',
            $subject->id,
            $subject->toArray(),
            null
        );

        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }

    // User Management Methods
    public function instructors()
    {
        $instructors = User::where('user_role', 'instructor')
                          ->orderBy('name')
                          ->get();

        return Inertia::render('Registrar/Users/Instructors', [
            'instructors' => $instructors,
        ]);
    }

    public function storeInstructors(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'instructor',
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return redirect()->back()->with('success', 'Instructor created successfully.');
    }

    public function updateInstructors(Request $request, User $instructor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $instructor->id,
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $instructor->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Instructor updated successfully.');
    }

    public function destroyInstructors(User $instructor)
    {
        $instructor->delete();
        return redirect()->back()->with('success', 'Instructor deleted successfully.');
    }

    public function teachers()
    {
        $teachers = User::where('user_role', 'teacher')
                       ->orderBy('name')
                       ->get();

        return Inertia::render('Registrar/Users/Teachers', [
            'teachers' => $teachers,
        ]);
    }

    public function storeTeachers(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'teacher',
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return redirect()->back()->with('success', 'Teacher created successfully.');
    }

    public function updateTeachers(Request $request, User $teacher)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->id,
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $teacher->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Teacher updated successfully.');
    }

    public function destroyTeachers(User $teacher)
    {
        $teacher->delete();
        return redirect()->back()->with('success', 'Teacher deleted successfully.');
    }

    public function advisers()
    {
        $advisers = User::where('user_role', 'class_adviser')
                       ->orderBy('name')
                       ->get();

        return Inertia::render('Registrar/Users/Advisers', [
            'advisers' => $advisers,
        ]);
    }

    public function storeAdvisers(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'class_adviser',
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return redirect()->back()->with('success', 'Adviser created successfully.');
    }

    public function updateAdvisers(Request $request, User $adviser)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $adviser->id,
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $adviser->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Adviser updated successfully.');
    }

    public function destroyAdvisers(User $adviser)
    {
        $adviser->delete();
        return redirect()->back()->with('success', 'Adviser deleted successfully.');
    }

    public function chairpersons()
    {
        $chairpersons = User::where('user_role', 'chairperson')
                           ->orderBy('name')
                           ->get();

        return Inertia::render('Registrar/Users/Chairpersons', [
            'chairpersons' => $chairpersons,
        ]);
    }

    public function storeChairpersons(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'chairperson',
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return redirect()->back()->with('success', 'Chairperson created successfully.');
    }

    public function updateChairpersons(Request $request, User $chairperson)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $chairperson->id,
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $chairperson->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Chairperson updated successfully.');
    }

    public function destroyChairpersons(User $chairperson)
    {
        $chairperson->delete();
        return redirect()->back()->with('success', 'Chairperson deleted successfully.');
    }

    public function principals()
    {
        $principals = User::where('user_role', 'principal')
                         ->orderBy('name')
                         ->get();

        return Inertia::render('Registrar/Users/Principals', [
            'principals' => $principals,
        ]);
    }

    public function storePrincipals(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'principal',
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return redirect()->back()->with('success', 'Principal created successfully.');
    }

    public function updatePrincipals(Request $request, User $principal)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $principal->id,
            'contact_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $principal->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'specialization' => $request->specialization,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Principal updated successfully.');
    }

    public function destroyPrincipals(User $principal)
    {
        $principal->delete();
        return redirect()->back()->with('success', 'Principal deleted successfully.');
    }

    public function uploadUsers()
    {
        return Inertia::render('Registrar/Users/UploadCsv');
    }

    public function processUserUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'user_type' => 'required|in:instructor,teacher,adviser,chairperson,principal',
        ]);

        // Process CSV upload logic here
        // This would be similar to the student upload process

        return redirect()->back()->with('success', 'Users uploaded successfully.');
    }
}
