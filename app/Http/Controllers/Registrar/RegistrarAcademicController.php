<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AcademicLevel;
use App\Models\Strand;
use App\Models\Track;
use App\Models\Department;
use App\Models\Course;
use App\Models\GradingPeriod;
use App\Models\Subject;
use App\Models\TeacherSubjectAssignment;
use App\Models\InstructorCourseAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\StudentGrade;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\CertificateTemplate;
use App\Models\Certificate;

class RegistrarAcademicController extends Controller
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
        return Inertia::render('Registrar/Academic/Index', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function levels()
    {
        $levels = AcademicLevel::orderBy('sort_order')->get();
        return Inertia::render('Registrar/Academic/Levels', [
            'user' => $this->sharedUser(),
            'levels' => $levels,
        ]);
    }

    public function grading()
    {
        $gradingPeriods = GradingPeriod::with(['academicLevel', 'parent', 'children'])
            ->orderBy('academic_level_id')
            ->orderBy('sort_order')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/Grading', [
            'user' => $this->sharedUser(),
            'gradingPeriods' => $gradingPeriods,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function programs()
    {
        $academicLevels = AcademicLevel::with(['strands'])->orderBy('sort_order')->get();
        $departments = Department::with(['courses'])->orderBy('name')->get();
        
        return Inertia::render('Registrar/Academic/Programs', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'departments' => $departments,
        ]);
    }

    public function assignInstructors()
    {
        // Get College level ID
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        
        $assignments = InstructorCourseAssignment::with([
            'instructor', 
            'course.department', 
            'academicLevel', 
            'gradingPeriod'
        ])->where('academic_level_id', $collegeLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $instructors = User::where('user_role', 'instructor')->orderBy('name')->get();
        $courses = Course::whereHas('department', function($query) use ($collegeLevel) {
            $query->where('academic_level_id', $collegeLevel->id);
        })->orderBy('name')->get();
        
        // Get subjects for college level
        $subjects = Subject::with(['course'])
            ->where('academic_level_id', $collegeLevel->id)
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        
        // Get year level options for college
        $yearLevels = User::getSpecificYearLevels()['college'] ?? [];
        
        return Inertia::render('Registrar/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'courses' => $courses,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'yearLevels' => $yearLevels,
        ]);
    }

    public function assignTeachers()
    {
        // Get Senior High School level ID
        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        
        $assignments = TeacherSubjectAssignment::with([
            'teacher', 
            'subject', 
            'academicLevel', 
            'gradingPeriod',
            'track',
            'strand'
        ])->where('academic_level_id', $shsLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $teachers = User::where('user_role', 'teacher')->orderBy('name')->get();
        $subjects = Subject::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        $strands = Strand::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        $tracks = Track::where('is_active', true)->orderBy('name')->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $courses = Course::where('is_active', true)->with('department')->orderBy('name')->get();
        
        return Inertia::render('Registrar/Academic/AssignTeachers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'strands' => $strands,
            'tracks' => $tracks,
            'departments' => $departments,
            'courses' => $courses,
        ]);
    }

    public function assignAdvisers()
    {
        // Get Elementary and Junior High School level IDs
        $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
        $jhsLevel = AcademicLevel::where('key', 'junior_highschool')->first();
        
        // Safety check: only proceed if we have valid levels
        if (!$elementaryLevel || !$jhsLevel) {
            return Inertia::render('Registrar/Academic/AssignAdvisers', [
                'user' => $this->sharedUser(),
                'assignments' => collect(),
                'advisers' => collect(),
                'subjects' => collect(),
                'academicLevels' => collect(),
                'error' => 'Elementary or Junior High School academic levels are not configured in the system.',
            ]);
        }
        
        $assignments = ClassAdviserAssignment::with([
            'adviser', 
            'academicLevel'
        ])->orderBy('school_year', 'desc')->get();
        
        $advisers = User::where('user_role', 'adviser')->orderBy('name')->get();
        
        // Filter subjects to only include Elementary and Junior High School subjects
        $subjects = Subject::whereIn('academic_level_id', [
            $elementaryLevel->id, 
            $jhsLevel->id
        ])->orderBy('name')->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'advisers' => $advisers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'gradingPeriod', 'course'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        $courses = Course::with('department')->orderBy('name')->get();
        $departments = Department::orderBy('name')->get();
        
        return Inertia::render('Registrar/Academic/Subjects', [
            'user' => $this->sharedUser(),
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'courses' => $courses,
            'departments' => $departments,
        ]);
    }

    public function honors()
    {
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])->get();
        
        // Get current school year (you can modify this logic as needed)
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get existing honor results for the current school year
        $honorResults = HonorResult::with(['honorType', 'student'])
            ->where('school_year', '2024-2025') // Use the school year that matches our sample data
            ->get();

        // Group results by academic_level_id and honor_type_id for easy UI rendering
        $groupedHonorResults = [];
        foreach ($honorResults as $result) {
            $levelId = (string) $result->academic_level_id;
            $typeId = (string) $result->honor_type_id;
            if (!isset($groupedHonorResults[$levelId])) {
                $groupedHonorResults[$levelId] = [];
            }
            if (!isset($groupedHonorResults[$levelId][$typeId])) {
                $groupedHonorResults[$levelId][$typeId] = [];
            }
            $groupedHonorResults[$levelId][$typeId][] = $result;
        }
        
        return Inertia::render('Registrar/Academic/Honors', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults,
            'groupedHonorResults' => $groupedHonorResults,
        ]);
    }

    public function certificates()
    {
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $templates = CertificateTemplate::with(['academicLevel'])->orderBy('name')->get();
        
        // Get current school year
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get recent certificates
        $recentCertificates = Certificate::with(['student', 'template', 'academicLevel'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Registrar/Academic/Certificates', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'templates' => $templates,
            'recentCertificates' => $recentCertificates,
            'schoolYears' => $schoolYears,
        ]);
    }
}
