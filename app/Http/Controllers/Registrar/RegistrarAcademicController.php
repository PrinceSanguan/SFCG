<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AcademicLevel;
use App\Models\Strand;
use App\Models\Course;
use App\Models\Department;
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
        $gradingPeriods = GradingPeriod::with('academicLevel')
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
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'courses' => $courses,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
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
            'gradingPeriod'
        ])->where('academic_level_id', $shsLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $teachers = User::where('user_role', 'teacher')->orderBy('name')->get();
        $subjects = Subject::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/AssignTeachers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function assignAdvisers()
    {
        $assignments = ClassAdviserAssignment::with([
            'adviser', 
            'academicLevel', 
            'gradingPeriod'
        ])->orderBy('school_year', 'desc')->get();
        
        $advisers = User::where('user_role', 'adviser')->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'advisers' => $advisers,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/Subjects', [
            'user' => $this->sharedUser(),
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function honors()
    {
        $honorTypes = HonorType::with(['academicLevel'])->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Registrar/Academic/Honors', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'academicLevels' => $academicLevels,
        ]);
    }
}
