<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\InstructorSubjectAssignment;
use App\Models\Section;

class AcademicController extends Controller
{
    private function sharedUser()
    {
        $user = Auth::user();
        if (!$user) {
            return [
                'name' => 'Guest',
                'email' => 'guest@example.com',
                'user_role' => 'guest',
            ];
        }
        return [
            'name' => $user->name,
            'email' => $user->email,
            'user_role' => $user->user_role,
        ];
    }

    public function index()
    {
        return Inertia::render('Admin/Academic/Index', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function levels()
    {
        $levels = AcademicLevel::orderBy('sort_order')->get();
        return Inertia::render('Admin/Academic/Levels', [
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
        
        return Inertia::render('Admin/Academic/Grading', [
            'user' => $this->sharedUser(),
            'gradingPeriods' => $gradingPeriods,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function programs()
    {
        $academicLevels = AcademicLevel::with(['strands.track'])->orderBy('sort_order')->get();
        $departments = Department::with(['courses'])->orderBy('name')->get();
        $tracks = \App\Models\Track::where('is_active', true)->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/Programs', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'departments' => $departments,
            'tracks' => $tracks,
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
            'gradingPeriod',
            'subject'
        ])->where('academic_level_id', $collegeLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $instructors = User::where('user_role', 'instructor')->orderBy('name')->get();
        $departments = Department::where('academic_level_id', $collegeLevel->id)->orderBy('name')->get();
        $courses = Course::whereHas('department', function($query) use ($collegeLevel) {
            $query->where('academic_level_id', $collegeLevel->id);
        })->orderBy('name')->get();
        $subjects = Subject::where('academic_level_id', $collegeLevel->id)->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::where('academic_level_id', $collegeLevel->id)->orderBy('sort_order')->get();
        
        // Get year level options for college
        $yearLevels = User::getSpecificYearLevels()['college'] ?? [];
        
        return Inertia::render('Admin/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'departments' => $departments,
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
        $gradingPeriods = GradingPeriod::where('academic_level_id', $shsLevel->id)->orderBy('sort_order')->get();
        $strands = Strand::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        $tracks = Track::where('is_active', true)->orderBy('name')->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $courses = Course::where('is_active', true)->with('department')->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/AssignTeachers', [
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
        
        $assignments = ClassAdviserAssignment::with([
            'adviser', 
            'academicLevel',
            'subject'
        ])->whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])
          ->orderBy('school_year', 'desc')->get();
        
        $advisers = User::whereIn('user_role', ['adviser', 'teacher'])->orderBy('name')->get();
        $subjects = Subject::whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        // Transform assignments to ensure academic level data is included
        $transformedAssignments = $assignments->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'adviser_id' => $assignment->adviser_id,
                'academic_level_id' => $assignment->academic_level_id,
                'grade_level' => $assignment->grade_level,
                'section' => $assignment->section,
                'school_year' => $assignment->school_year,
                'notes' => $assignment->notes,
                'is_active' => $assignment->is_active,
                'assigned_at' => $assignment->assigned_at,
                'assigned_by' => $assignment->assigned_by,
                'created_at' => $assignment->created_at,
                'updated_at' => $assignment->updated_at,
                'subject_id' => $assignment->subject_id,
                'adviser' => $assignment->adviser,
                'academicLevel' => $assignment->academicLevel,
                'subject' => $assignment->subject,
            ];
        });

        return Inertia::render('Admin/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $transformedAssignments,
            'advisers' => $advisers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'gradingPeriod', 'course', 'section'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        $courses = Course::with('department')->orderBy('name')->get();
        $departments = Department::orderBy('name')->get();
        $yearLevels = \App\Models\User::getSpecificYearLevels()['college'] ?? [];
        $shsYearLevels = \App\Models\User::getSpecificYearLevels()['senior_highschool'] ?? [];
        $tracks = Track::orderBy('name')->get();
        $strands = Strand::orderBy('name')->get();
        $sections = Section::with(['academicLevel'])->orderBy('academic_level_id')->orderBy('specific_year_level')->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/Subjects', [
            'user' => $this->sharedUser(),
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'courses' => $courses,
            'departments' => $departments,
            'yearLevels' => $yearLevels,
            'shsYearLevels' => $shsYearLevels,
            'tracks' => $tracks,
            'strands' => $strands,
            'sections' => $sections,
        ]);
    }

    // Honor Management
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

        // Debug logging
        \Illuminate\Support\Facades\Log::info('🔍 DEBUG: Honors method data:', [
            'academicLevelsCount' => $academicLevels->count(),
            'honorTypesCount' => $honorTypes->count(),
            'criteriaCount' => $criteria->count(),
            'schoolYears' => $schoolYears,
            'honorResultsCount' => $honorResults->count(),
            'groupedKeys' => array_keys($groupedHonorResults),
        ]);

        // Additional debugging for criteria relationships
        if ($criteria->count() > 0) {
            $firstCriterion = $criteria->first();
            \Illuminate\Support\Facades\Log::info('🔍 DEBUG: First criterion details:', [
                'id' => $firstCriterion->id,
                'academic_level_id' => $firstCriterion->academic_level_id,
                'honor_type_id' => $firstCriterion->honor_type_id,
                'hasHonorType' => $firstCriterion->relationLoaded('honorType'),
                'honorTypeData' => $firstCriterion->honorType,
                'honorTypeKeys' => $firstCriterion->honorType ? array_keys($firstCriterion->honorType->toArray()) : 'N/A',
                'rawHonorType' => $firstCriterion->getRawOriginal('honor_type_id'),
            ]);
        }

        return Inertia::render('Admin/Academic/Honors/Index', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults,
            'groupedHonorResults' => $groupedHonorResults,
        ]);
    }

    public function elementaryHonors(Request $request)
    {
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])
            ->where('academic_level_id', 1) // Elementary level ID
            ->get();
        
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get all qualified elementary students for the current school year
        // Use 2024-2025 for now since that's where our test data is
        $currentSchoolYear = '2024-2025'; // TODO: Make this configurable or use current active school year
        
        // Get filter parameters
        $gradeLevel = $request->get('grade_level');
        $sectionId = $request->get('section_id');
        
        $qualifiedStudents = $this->getQualifiedElementaryStudents($currentSchoolYear, $gradeLevel, $sectionId);
        
        // Get available grade levels for elementary
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['elementary'];
        
        // Get available sections for elementary
        $sections = \App\Models\Section::where('academic_level_id', 1)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Academic/Honors/Elementary', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'qualifiedStudents' => $qualifiedStudents,
            'currentSchoolYear' => $currentSchoolYear,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'filters' => [
                'grade_level' => $gradeLevel,
                'section_id' => $sectionId,
            ],
            'cacheBuster' => time(), // Force fresh data
        ]);
    }

    public function calculateElementaryStudentHonor(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        // Find student by ID or student number
        $student = null;
        if (is_numeric($validated['student_id'])) {
            $student = User::find($validated['student_id']);
        } else {
            $student = User::where('student_number', $validated['student_id'])
                ->orWhere('email', $validated['student_id'])
                ->first();
        }

        if (!$student || $student->user_role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Student not found. Please check the Student ID.'
            ]);
        }

        $elementaryService = new \App\Services\ElementaryHonorCalculationService();
        $result = $elementaryService->getStudentHonorCalculation(
            $student->id,
            $validated['academic_level_id'],
            $validated['school_year']
        );

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Get all qualified elementary students for honor calculation
     */
    private function getQualifiedElementaryStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null): array
    {
        $elementaryService = new \App\Services\ElementaryHonorCalculationService();
        $elementaryLevel = \App\Models\AcademicLevel::where('key', 'elementary')->first();
        
        if (!$elementaryLevel) {
            return [];
        }

        // Build query for elementary students with filters
        $studentsQuery = \App\Models\User::where('user_role', 'student')
            ->where('year_level', 'elementary')
            ->with(['section']); // Load section relationship for display

        // Apply grade level filter
        if ($gradeLevel) {
            $studentsQuery->where('specific_year_level', $gradeLevel);
        }

        // Apply section filter
        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        $students = $studentsQuery->orderBy('name')->get();

        $qualifiedStudents = [];

        foreach ($students as $student) {
            try {
                $result = $elementaryService->getStudentHonorCalculation(
                    $student->id,
                    $elementaryLevel->id,
                    $schoolYear
                );

                if ($result['qualified']) {
                    $qualifiedStudents[] = [
                        'student' => [
                            'id' => $student->id,
                            'name' => $student->name,
                            'student_number' => $student->student_number,
                            'email' => $student->email,
                            'specific_year_level' => $student->specific_year_level,
                            'section' => $student->section ? [
                                'id' => $student->section->id,
                                'name' => $student->section->name,
                                'code' => $student->section->code,
                            ] : null,
                        ],
                        'average_grade' => $result['average_grade'],
                        'min_grade' => $result['min_grade'],
                        'total_quarters' => $result['total_quarters'],
                        'honor_type' => $result['qualifications'][0]['honor_type'] ?? null,
                        'grades_breakdown' => $result['grades_breakdown'],
                    ];
                }
            } catch (\Exception $e) {
                // Skip students with calculation errors
                continue;
            }
        }

        // Sort by average grade (highest first)
        usort($qualifiedStudents, function($a, $b) {
            return $b['average_grade'] <=> $a['average_grade'];
        });

        return $qualifiedStudents;
    }

    /**
     * Get all qualified junior high school students for honor calculation
     */
    private function getQualifiedJuniorHighSchoolStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null): array
    {
        $juniorHighSchoolService = new \App\Services\JuniorHighSchoolHonorCalculationService();
        $juniorHighSchoolLevel = \App\Models\AcademicLevel::where('key', 'junior_highschool')->first();
        
        if (!$juniorHighSchoolLevel) {
            return [];
        }

        // Build query for junior high school students with filters
        $studentsQuery = \App\Models\User::where('user_role', 'student')
            ->where('year_level', 'junior_highschool')
            ->with(['section']); // Load section relationship for display

        // Apply grade level filter
        if ($gradeLevel) {
            $studentsQuery->where('specific_year_level', $gradeLevel);
        }

        // Apply section filter
        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        $students = $studentsQuery->orderBy('name')->get();

        $qualifiedStudents = [];

        foreach ($students as $student) {
            $result = $juniorHighSchoolService->calculateJuniorHighSchoolHonorQualification(
                $student->id,
                $juniorHighSchoolLevel->id,
                $schoolYear
            );

            if ($result['qualified']) {
                $qualifiedStudents[] = [
                    'student' => $student,
                    'result' => $result
                ];
            }
        }

        return $qualifiedStudents;
    }

    public function juniorHighSchoolHonors(Request $request)
    {
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])
            ->where('academic_level_id', 2) // Junior High School level ID
            ->get();
        
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get all qualified junior high school students for the current school year
        // Use 2024-2025 for now since that's where our test data is
        $currentSchoolYear = '2024-2025'; // TODO: Make this configurable or use current active school year
        
        // Get filter parameters
        $gradeLevel = $request->get('grade_level');
        $sectionId = $request->get('section_id');
        
        $qualifiedStudents = $this->getQualifiedJuniorHighSchoolStudents($currentSchoolYear, $gradeLevel, $sectionId);
        
        // Get available grade levels for junior high school
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['junior_highschool'];
        
        // Get available sections for junior high school
        $sections = \App\Models\Section::where('academic_level_id', 2)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Academic/Honors/JuniorHighSchool', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'qualifiedStudents' => $qualifiedStudents,
            'currentSchoolYear' => $currentSchoolYear,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'filters' => [
                'grade_level' => $gradeLevel,
                'section_id' => $sectionId,
            ],
        ]);
    }

    /**
     * Get all qualified senior high school students for honor calculation
     */
    private function getQualifiedSeniorHighSchoolStudents(string $schoolYear, ?string $gradeLevel = null, ?string $sectionId = null, ?string $strandId = null): array
    {
        $seniorHighSchoolService = new \App\Services\SeniorHighSchoolHonorCalculationService();
        $seniorHighSchoolLevel = \App\Models\AcademicLevel::where('key', 'senior_highschool')->first();
        
        if (!$seniorHighSchoolLevel) {
            return [];
        }

        // Build query for senior high school students with filters
        $studentsQuery = \App\Models\User::where('user_role', 'student')
            ->where('year_level', 'senior_highschool')
            ->with(['section', 'strand']); // Load relationships for display

        // Apply grade level filter
        if ($gradeLevel) {
            $studentsQuery->where('specific_year_level', $gradeLevel);
        }

        // Apply section filter
        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        // Apply strand filter
        if ($strandId) {
            $studentsQuery->where('strand_id', $strandId);
        }

        $students = $studentsQuery->orderBy('name')->get();

        $qualifiedStudents = [];

        foreach ($students as $student) {
            $result = $seniorHighSchoolService->calculateSeniorHighSchoolHonorQualification(
                $student->id,
                $seniorHighSchoolLevel->id,
                $schoolYear
            );

            // Include all students with computed results to surface data even if not yet qualified
            $qualifiedStudents[] = [
                'student' => $student,
                'result' => $result
            ];
        }

        return $qualifiedStudents;
    }

    public function seniorHighSchoolHonors(Request $request)
    {
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])
            ->where('academic_level_id', 3) // Senior High School level ID
            ->get();
        
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get all qualified senior high school students for the current school year
        // Use 2024-2025 for now since that's where our test data is
        $currentSchoolYear = '2024-2025'; // TODO: Make this configurable or use current active school year
        
        // Get filter parameters
        $gradeLevel = $request->get('grade_level');
        $sectionId = $request->get('section_id');
        $strandId = $request->get('strand_id');
        
        $qualifiedStudents = $this->getQualifiedSeniorHighSchoolStudents($currentSchoolYear, $gradeLevel, $sectionId, $strandId);
        
        // Get available grade levels for senior high school
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['senior_highschool'];
        
        // Get available sections for senior high school
        $sections = \App\Models\Section::where('academic_level_id', 3)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        // Get strands
        $strands = \App\Models\Strand::where('academic_level_id', 3)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Academic/Honors/SeniorHighSchool', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'qualifiedStudents' => $qualifiedStudents,
            'currentSchoolYear' => $currentSchoolYear,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'strands' => $strands,
            'filters' => [
                'grade_level' => $gradeLevel,
                'section_id' => $sectionId,
                'strand_id' => $strandId,
            ],
        ]);
    }

    /**
     * Get all qualified college students for honor calculation
     */
    private function getQualifiedCollegeStudents(string $schoolYear, ?string $gradeLevel = null, ?string $departmentId = null, ?string $courseId = null, ?string $sectionId = null): array
    {
        $collegeService = new \App\Services\CollegeHonorCalculationService();
        return $collegeService->getQualifiedCollegeStudents($schoolYear, $gradeLevel, $departmentId, $courseId, $sectionId);
    }

    public function collegeHonors(Request $request)
    {
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])
            ->where('academic_level_id', 4) // College level ID
            ->get();
        
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get all qualified college students for the current school year
        // Use 2024-2025 for now since that's where our test data is
        $currentSchoolYear = '2024-2025'; // TODO: Make this configurable or use current active school year
        
        // Get filter parameters
        $gradeLevel = $request->get('grade_level');
        $departmentId = $request->get('department_id');
        $courseId = $request->get('course_id');
        $sectionId = $request->get('section_id');
        
        $qualifiedStudents = $this->getQualifiedCollegeStudents($currentSchoolYear, $gradeLevel, $departmentId, $courseId, $sectionId);
        
        // Get available grade levels for college
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['college'];
        
        // Get available departments for college
        $departments = \App\Models\Department::where('academic_level_id', 4)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        
        // Get available courses for college
        $courses = \App\Models\Course::with('department')
            ->whereHas('department', function($query) {
                $query->where('academic_level_id', 4);
            })
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        
        // Get available sections for college
        $sections = \App\Models\Section::where('academic_level_id', 4)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Academic/Honors/College', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'qualifiedStudents' => $qualifiedStudents,
            'currentSchoolYear' => $currentSchoolYear,
            'gradeLevels' => $gradeLevels,
            'departments' => $departments,
            'courses' => $courses,
            'sections' => $sections,
            'filters' => [
                'grade_level' => $gradeLevel,
                'department_id' => $departmentId,
                'course_id' => $courseId,
                'section_id' => $sectionId,
            ],
        ]);
    }

    public function saveHonorType(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'key' => 'required|string|alpha_dash|max:50|unique:honor_types,key',
            'scope' => 'required|string|in:basic,advanced,college',
        ]);

        $honorType = HonorType::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Honor type created successfully!',
            'honorType' => $honorType
        ]);
    }

    public function saveHonorCriteria(Request $request)
    {
        $data = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'honor_type_id' => 'required|exists:honor_types,id',
            'min_gpa' => 'nullable|numeric|min:0|max:100',
            'max_gpa' => 'nullable|numeric|min:0|max:100',
            'min_grade' => 'nullable|integer|min:0|max:100',
            'min_grade_all' => 'nullable|integer|min:1|max:100',
            'min_year' => 'nullable|integer|min:1|max:10',
            'max_year' => 'nullable|integer|min:1|max:10',
            'require_consistent_honor' => 'boolean',
            'additional_rules' => 'array|nullable',
        ]);

        HonorCriterion::updateOrCreate(
            [
                'academic_level_id' => $data['academic_level_id'],
                'honor_type_id' => $data['honor_type_id'],
            ],
            $data
        );

        return back()->with('success', 'Honor criteria saved.');
    }

    public function storeHonorCriterion(Request $request)
    {
        return $this->saveHonorCriteria($request);
    }

    public function destroyHonorCriterion(HonorCriterion $criterion)
    {
        $criterion->delete();
        return back()->with('success', 'Honor criterion deleted successfully.');
    }

    public function updateHonorCriterion(Request $request, HonorCriterion $criterion)
    {
        $data = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'honor_type_id' => 'required|exists:honor_types,id',
            'min_gpa' => 'nullable|numeric|min:0|max:100',
            'max_gpa' => 'nullable|numeric|min:0|max:100',
            'min_grade' => 'nullable|integer|min:0|max:100',
            'min_grade_all' => 'nullable|integer|min:1|max:100',
            'min_year' => 'nullable|integer|min:1|max:10',
            'max_year' => 'nullable|integer|min:1|max:10',
            'require_consistent_honor' => 'boolean',
            'additional_rules' => 'array|nullable',
        ]);

        $criterion->update($data);
        return back()->with('success', 'Honor criterion updated successfully.');
    }

    public function generateHonorRoll(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $level = AcademicLevel::findOrFail($validated['academic_level_id']);
        
        // Use specialized calculation for elementary students
        if ($level->key === 'elementary') {
            $elementaryService = new \App\Services\ElementaryHonorCalculationService();
            $result = $elementaryService->generateElementaryHonorResults($level->id, $validated['school_year']);
            
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => [
                    'academic_level' => $level->name,
                    'school_year' => $validated['school_year'],
                    'total_processed' => $result['total_processed'],
                    'total_qualified' => $result['total_qualified'],
                    'results' => $result['results'],
                ]
            ]);
        }
        
        // Use standard calculation for other academic levels
        $criteria = HonorCriterion::where('academic_level_id', $level->id)->get();
        
        $honorResults = [];
        
        foreach ($criteria as $criterion) {
            $students = User::where('user_role', 'student')
                ->where('year_level', $level->key)
                ->get();
            
            $qualifiedStudents = [];
            
            foreach ($students as $student) {
                $grades = StudentGrade::where('student_id', $student->id)
                    ->where('academic_level_id', $level->id)
                    ->where('school_year', $validated['school_year']);
                
                // Apply year restrictions for college honors
                if ($criterion->min_year || $criterion->max_year) {
                    $grades = $grades->whereBetween('year_of_study', [
                        $criterion->min_year ?? 1,
                        $criterion->max_year ?? 4
                    ]);
                }
                
                $grades = $grades->pluck('grade');
                
                if ($grades->isEmpty()) {
                    continue;
                }
                
                $gpa = round($grades->avg(), 2);
                $minGrade = (int) floor($grades->min());
                
                // Check if student qualifies for this honor
                $qualifies = true;
                
                // GPA requirements
                if ($criterion->min_gpa && $gpa < $criterion->min_gpa) {
                    $qualifies = false;
                }
                if ($criterion->max_gpa && $gpa > $criterion->max_gpa) {
                    $qualifies = false;
                }
                
                // Minimum grade requirements
                if ($criterion->min_grade && $minGrade < $criterion->min_grade) {
                    $qualifies = false;
                }
                
                // Consistent honor standing (for Dean's List)
                if ($criterion->require_consistent_honor) {
                    // Check if student has been on honor roll in previous years
                    $previousHonors = HonorResult::where('student_id', $student->id)
                        ->where('academic_level_id', $level->id)
                        ->where('school_year', '!=', $validated['school_year'])
                        ->where('is_overridden', false)
                        ->exists();
                    
                    if (!$previousHonors) {
                        $qualifies = false;
                    }
                }
                
                if ($qualifies) {
                    $qualifiedStudents[] = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_number' => $student->student_number,
                        'gpa' => $gpa,
                        'min_grade' => $minGrade,
                        'grades_count' => $grades->count(),
                    ];
                }
            }
            
            if (!empty($qualifiedStudents)) {
                $honorResults[] = [
                    'honor_type' => $criterion->honorType,
                    'criterion' => $criterion,
                    'students' => $qualifiedStudents,
                    'count' => count($qualifiedStudents),
                ];
            }
        }
        
        // Store results in honor_results table
        foreach ($honorResults as $result) {
            foreach ($result['students'] as $student) {
                HonorResult::updateOrCreate([
                    'student_id' => $student['id'],
                    'honor_type_id' => $result['honor_type']->id,
                    'academic_level_id' => $level->id,
                    'school_year' => $validated['school_year'],
                ], [
                    'gpa' => $student['gpa'],
                    'is_overridden' => false,
                    'is_pending_approval' => true, // Set as pending for Principal approval
                    'is_approved' => false,
                    'is_rejected' => false,
                ]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Honor roll generated successfully',
            'data' => [
                'academic_level' => $level->name,
                'school_year' => $validated['school_year'],
                'honor_results' => $honorResults,
                'total_students' => array_sum(array_column($honorResults, 'count')),
            ]
        ]);
    }

    public function overrideHonorResult(Request $request, HonorResult $result)
    {
        $data = $request->validate([
            'honor_type_id' => 'required|exists:honor_types,id',
            'override_reason' => 'required|string|max:1000',
        ]);

        $result->update([
            'honor_type_id' => $data['honor_type_id'],
            'is_overridden' => true,
            'override_reason' => $data['override_reason'],
        ]);

        return back()->with('success', 'Honor result overridden.');
    }

    public function exportHonorRoll(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $results = HonorResult::with(['student', 'honorType'])
            ->where('academic_level_id', $validated['academic_level_id'])
            ->where('school_year', $validated['school_year'])
            ->orderBy('honor_type_id')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="honor_roll_'.$validated['school_year'].'.csv"',
        ];

        $callback = function () use ($results) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Student ID', 'Name', 'Honor', 'GPA', 'Overridden', 'Reason']);
            foreach ($results as $row) {
                fputcsv($handle, [
                    $row->student->student_number ?? $row->student->id,
                    $row->student->name,
                    $row->honorType->name,
                    $row->gpa,
                    $row->is_overridden ? 'Yes' : 'No',
                    $row->override_reason,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Subject Management
    public function storeSubject(Request $request)
    {
        Log::info('Subject creation request received:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'strand_id' => 'nullable|exists:strands,id',
            'shs_year_level' => 'nullable|string|in:grade_11,grade_12',
            'jhs_year_level' => 'nullable|string|in:grade_7,grade_8,grade_9,grade_10',
            'grade_levels' => 'nullable|array',
            'grade_levels.*' => 'string|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6',
            'selected_grade_level' => 'nullable|string|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'course_id' => 'nullable|exists:courses,id',
            'units' => 'nullable|numeric|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        if ($validator->fails()) {
            Log::error('Subject validation failed:', $validator->errors()->toArray());
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Get the academic level
            $level = AcademicLevel::find($request->academic_level_id);
            
            // If SHS, ensure strand is present
            if ($level && $level->key === 'senior_highschool' && !$request->filled('strand_id')) {
                return back()->withErrors(['strand_id' => 'Strand is required for Senior High School subjects.'])->withInput();
            }
            
            // If Elementary, Junior High School, Senior High School, or College, ensure section is present
            if ($level && in_array($level->key, ['elementary', 'junior_highschool', 'senior_highschool', 'college']) && !$request->filled('section_id')) {
                $levelNames = [
                    'elementary' => 'Elementary',
                    'junior_highschool' => 'Junior High School',
                    'senior_highschool' => 'Senior High School',
                    'college' => 'College'
                ];
                $levelName = $levelNames[$level->key];
                return back()->withErrors(['section_id' => "Section is required for {$levelName} subjects."])->withInput();
            }
            $data = [
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'academic_level_id' => $request->academic_level_id,
                'strand_id' => $request->strand_id,
                'shs_year_level' => $request->shs_year_level,
                'jhs_year_level' => $request->jhs_year_level,
                'grade_levels' => $request->grade_levels,
                'grading_period_id' => $request->grading_period_id,
                'course_id' => $request->course_id,
                'units' => $request->units ?? 0,
                'hours_per_week' => $request->hours_per_week ?? 0,
                'is_core' => $request->is_core ?? false,
                'is_active' => $request->is_active ?? true,
            ];
            $subject = Subject::create($data);
            
            Log::info('Subject created successfully:', $subject->toArray());
        } catch (\Exception $e) {
            Log::error('Subject creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return back()->withErrors(['error' => 'Failed to create subject: ' . $e->getMessage()])->withInput();
        }

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
                'academic_level' => $subject->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Subject created successfully!');
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'strand_id' => 'nullable|exists:strands,id',
            'shs_year_level' => 'nullable|string|in:grade_11,grade_12',
            'jhs_year_level' => 'nullable|string|in:grade_7,grade_8,grade_9,grade_10',
            'grade_levels' => 'nullable|array',
            'grade_levels.*' => 'string|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'course_id' => 'nullable|exists:courses,id',
            'units' => 'nullable|numeric|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // If SHS, ensure strand is present
        $level = AcademicLevel::find($request->academic_level_id);
        if ($level && $level->key === 'senior_highschool' && !$request->filled('strand_id')) {
            return back()->withErrors(['strand_id' => 'Strand is required for Senior High School subjects.'])->withInput();
        }

        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'strand_id' => $request->strand_id,
            'shs_year_level' => $request->shs_year_level,
            'jhs_year_level' => $request->jhs_year_level,
            'grade_levels' => $request->grade_levels,
            'grading_period_id' => $request->grading_period_id,
            'course_id' => $request->course_id,
            'units' => $request->units ?? 0,
            'hours_per_week' => $request->hours_per_week ?? 0,
            'is_core' => $request->is_core ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject updated successfully!');
    }

    public function destroySubject(Subject $subject)
    {
        $subject->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject deleted successfully!');
    }

    // Grading Period Management
    public function storeGradingPeriod(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('grading_periods')->where(function ($query) use ($request) {
                    return $query->where('academic_level_id', $request->academic_level_id);
                })
            ],
            'type' => 'required|in:quarter,semester',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'parent_id' => 'nullable|exists:grading_periods,id',
            'period_type' => 'required|in:quarter,midterm,prefinal,final',
            'semester_number' => 'nullable|integer|min:1|max:2',
            'weight' => 'nullable|numeric|min:0|max:1',
            'is_calculated' => 'nullable|boolean',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod = GradingPeriod::create([
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type,
            'academic_level_id' => $request->academic_level_id,
            'parent_id' => $request->parent_id,
            'period_type' => $request->period_type,
            'semester_number' => $request->semester_number,
            'weight' => $request->weight ?? 1.00,
            'is_calculated' => $request->is_calculated ?? false,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
                'academic_level' => $gradingPeriod->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Grading period created successfully!');
    }

    public function updateGradingPeriod(Request $request, GradingPeriod $gradingPeriod)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('grading_periods')->where(function ($query) use ($request) {
                    return $query->where('academic_level_id', $request->academic_level_id);
                })->ignore($gradingPeriod->id)
            ],
            'type' => 'required|in:quarter,semester',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'parent_id' => 'nullable|exists:grading_periods,id',
            'period_type' => 'required|in:quarter,midterm,prefinal,final',
            'semester_number' => 'nullable|integer|min:1|max:2',
            'weight' => 'nullable|numeric|min:0|max:1',
            'is_calculated' => 'nullable|boolean',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod->update([
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type,
            'academic_level_id' => $request->academic_level_id,
            'parent_id' => $request->parent_id,
            'period_type' => $request->period_type,
            'semester_number' => $request->semester_number,
            'weight' => $request->weight ?? 1.00,
            'is_calculated' => $request->is_calculated ?? false,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period updated successfully!');
    }

    public function destroyGradingPeriod(GradingPeriod $gradingPeriod)
    {
        $gradingPeriod->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period deleted successfully!');
    }

    // Assignment Management
    public function storeTeacherAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'nullable|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,grade_12',
            'track_id' => 'nullable|exists:tracks,id',
            'strand_id' => 'nullable|exists:strands,id',
            'department_id' => 'nullable|exists:departments,id',
            'course_id' => 'nullable|exists:courses,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment = TeacherSubjectAssignment::create([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'track_id' => $request->track_id,
            'strand_id' => $request->strand_id,
            'department_id' => $request->department_id,
            'course_id' => $request->course_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'assigned_teacher_subject',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assigned to subject successfully!');
    }

    public function updateTeacherAssignment(Request $request, TeacherSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|in:grade_11,grade_12',
            'strand_id' => 'nullable|exists:strands,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment->update([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'strand_id' => $request->strand_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'updated_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assignment updated successfully!');
    }

    public function storeInstructorAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'year_level' => 'required|string|in:first_year,second_year,third_year,fourth_year',
            'department_id' => 'required|exists:departments,id',
            'course_id' => 'required|exists:courses,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        // Check for existing assignment to provide better error message
        $existingAssignment = InstructorCourseAssignment::where([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this course for the specified period and school year. Please check existing assignments or modify the current one.');
        }

        $assignment = InstructorCourseAssignment::create([
            'instructor_id' => $request->instructor_id,
            'year_level' => $request->year_level,
            'department_id' => $request->department_id,
            'course_id' => $request->course_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Sync subject-level assignments
        $subjectsQuery = Subject::query()
            ->where('academic_level_id', $request->academic_level_id);
        if ($request->filled('subject_id')) {
            $subjectsQuery->where('id', $request->subject_id);
        } else {
            $subjectsQuery->where('course_id', $request->course_id);
        }
        $subjects = $subjectsQuery->get();
        Log::info('Syncing instructor subject assignments', [
            'instructor_id' => $request->instructor_id,
            'subjects_count' => $subjects->count(),
            'school_year' => $request->school_year,
        ]);
        foreach ($subjects as $subject) {
            InstructorSubjectAssignment::updateOrCreate([
                'instructor_id' => $request->instructor_id,
                'subject_id' => $subject->id,
                'academic_level_id' => $request->academic_level_id,
                'school_year' => $request->school_year,
            ], [
                'grading_period_id' => $request->grading_period_id,
                'assigned_by' => Auth::id(),
                'is_active' => true,
                'notes' => $request->notes,
            ]);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'assigned_instructor_course',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assigned to course successfully!');
    }

    public function updateInstructorAssignment(Request $request, InstructorCourseAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'year_level' => 'nullable|string|in:first_year,second_year,third_year,fourth_year',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        // Check for existing assignment (excluding current one) to provide better error message
        $existingAssignment = InstructorCourseAssignment::where([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
        ])->where('id', '!=', $assignment->id)->first();

        if ($existingAssignment) {
            return back()->with('error', 'This instructor is already assigned to this course for the specified period and school year. Please check existing assignments or modify the current one.');
        }

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'year_level' => $request->year_level,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Sync subject-level assignments on update
        $subjectsQuery = Subject::query()->where('academic_level_id', $request->academic_level_id);
        if ($request->filled('subject_id')) {
            $subjectsQuery->where('id', $request->subject_id);
        } else {
            $subjectsQuery->where('course_id', $request->course_id);
        }
        $subjects = $subjectsQuery->get();
        Log::info('Syncing (update) instructor subject assignments', [
            'instructor_id' => $request->instructor_id,
            'subjects_count' => $subjects->count(),
            'school_year' => $request->school_year,
        ]);
        foreach ($subjects as $subject) {
            InstructorSubjectAssignment::updateOrCreate([
                'instructor_id' => $request->instructor_id,
                'subject_id' => $subject->id,
                'academic_level_id' => $request->academic_level_id,
                'school_year' => $request->school_year,
            ], [
                'grading_period_id' => $request->grading_period_id,
                'assigned_by' => Auth::id(),
                'is_active' => true,
                'notes' => $request->notes,
            ]);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'updated_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assignment updated successfully!');
    }

    public function storeClassAdviserAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'adviser_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|string',
            'section' => 'required|string',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if adviser has the correct role
        $adviser = User::find($request->adviser_id);
        if (!$adviser || !in_array($adviser->user_role, ['adviser', 'teacher'])) {
            return back()->with('error', 'Selected user is not an adviser or teacher.');
        }

        $assignment = ClassAdviserAssignment::create([
            'adviser_id' => $request->adviser_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'assigned_class_adviser',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Class adviser assigned successfully!');
    }

    public function updateClassAdviserAssignment(Request $request, ClassAdviserAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'adviser_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|string',
            'section' => 'required|string',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if adviser has the correct role
        $adviser = User::find($request->adviser_id);
        if (!$adviser || !in_array($adviser->user_role, ['adviser', 'teacher'])) {
            return back()->with('error', 'Selected user is not an adviser or teacher.');
        }

        $assignment->update([
            'adviser_id' => $request->adviser_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'updated_class_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Class adviser assignment updated successfully!');
    }

    // Delete assignments
    public function destroyTeacherAssignment(TeacherSubjectAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Teacher assignment removed successfully!');
    }

    public function destroyInstructorAssignment(InstructorCourseAssignment $assignment)
    {
        $assignment->delete();

        // Also remove subject-level assignments tied to this course/level + instructor + school year
        $subjectIds = Subject::where('course_id', $assignment->course_id)
            ->where('academic_level_id', $assignment->academic_level_id)
            ->pluck('id');
        InstructorSubjectAssignment::where('instructor_id', $assignment->instructor_id)
            ->whereIn('subject_id', $subjectIds)
            ->where('academic_level_id', $assignment->academic_level_id)
            ->where('school_year', $assignment->school_year)
            ->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Instructor assignment removed successfully!');
    }

    public function destroyClassAdviserAssignment(ClassAdviserAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_class_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Class adviser assignment removed successfully!');
    }
}


