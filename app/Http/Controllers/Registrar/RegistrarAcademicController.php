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
        $academicLevels = AcademicLevel::with(['strands.track'])->orderBy('sort_order')->get();
        $departments = Department::with(['courses'])->orderBy('name')->get();
        $tracks = Track::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Registrar/Academic/Programs', [
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
        $gradingPeriods = GradingPeriod::where('academic_level_id', $shsLevel->id)->orderBy('sort_order')->get();
        $strands = Strand::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        $tracks = Track::where('is_active', true)->orderBy('name')->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $courses = Course::where('is_active', true)->with('department')->orderBy('name')->get();
        $sections = \App\Models\Section::with('academicLevel')->orderBy('name')->get();

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
            'sections' => $sections,
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
                'sections' => collect(),
                'gradingPeriods' => collect(),
                'error' => 'Elementary or Junior High School academic levels are not configured in the system.',
            ]);
        }

        $assignments = ClassAdviserAssignment::with([
            'adviser',
            'academicLevel',
            'subject'
        ])->whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])
          ->orderBy('school_year', 'desc')->get();

        $advisers = User::whereIn('user_role', ['adviser', 'teacher'])->orderBy('name')->get();
        $subjects = Subject::with('section')->whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $sections = \App\Models\Section::whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();
        $gradingPeriods = GradingPeriod::with('academicLevel')
            ->whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])
            ->orderBy('sort_order')
            ->get();

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

        return Inertia::render('Registrar/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $transformedAssignments,
            'advisers' => $advisers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'sections' => $sections,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'gradingPeriod', 'course', 'section', 'strand.track'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get()
            ->map(function ($subject) {
                // Add grading periods collection to each subject
                $subjectArray = $subject->toArray();
                $subjectArray['grading_periods'] = $subject->gradingPeriods()->toArray();
                return $subjectArray;
            });

        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        $courses = Course::with('department')->orderBy('name')->get();
        $departments = Department::orderBy('name')->get();
        $yearLevels = \App\Models\User::getSpecificYearLevels()['college'] ?? [];
        $shsYearLevels = \App\Models\User::getSpecificYearLevels()['senior_highschool'] ?? [];
        $tracks = Track::orderBy('name')->get();
        $strands = Strand::orderBy('name')->get();
        $sections = \App\Models\Section::with(['academicLevel'])->orderBy('academic_level_id')->orderBy('specific_year_level')->orderBy('name')->get();

        return Inertia::render('Registrar/Academic/Subjects', [
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

        // Get actual honor results for elementary students
        $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
        $honorResultsQuery = HonorResult::with(['student.section', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('school_year', $currentSchoolYear);

        if ($elementaryLevel) {
            $honorResultsQuery->where('academic_level_id', $elementaryLevel->id);
        }

        // Apply filters
        if ($gradeLevel) {
            $honorResultsQuery->whereHas('student', function($query) use ($gradeLevel) {
                $query->where('specific_year_level', $gradeLevel);
            });
        }

        if ($sectionId) {
            if ($sectionId === 'no_section') {
                $honorResultsQuery->whereHas('student', function($query) {
                    $query->whereNull('section_id');
                });
            } else {
                $honorResultsQuery->whereHas('student', function($query) use ($sectionId) {
                    $query->where('section_id', $sectionId);
                });
            }
        }

        $honorResults = $honorResultsQuery->orderBy('created_at', 'desc')->get();

        // Also get the qualified students data for backward compatibility
        $qualifiedStudents = $this->getQualifiedElementaryStudents($currentSchoolYear, $gradeLevel, $sectionId);

        // Get available grade levels for elementary
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['elementary'];

        // Get available sections for elementary
        $sections = \App\Models\Section::where('academic_level_id', 1)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        return Inertia::render('Registrar/Academic/Honors/Elementary', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults, // Add actual honor results
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
            if ($sectionId === 'no_section') {
                $studentsQuery->whereNull('section_id');
            } else {
                $studentsQuery->where('section_id', $sectionId);
            }
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
                        'quarter_averages' => $result['quarter_averages'],
                        'total_subjects' => $result['total_subjects'],
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

        // Get actual honor results for JHS students
        $jhsLevel = AcademicLevel::where('key', 'junior_highschool')->first();
        $honorResultsQuery = HonorResult::with(['student.section', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('school_year', $currentSchoolYear);

        if ($jhsLevel) {
            $honorResultsQuery->where('academic_level_id', $jhsLevel->id);
        }

        // Apply filters
        if ($gradeLevel) {
            $honorResultsQuery->whereHas('student', function($query) use ($gradeLevel) {
                $query->where('specific_year_level', $gradeLevel);
            });
        }

        if ($sectionId) {
            if ($sectionId === 'no_section') {
                $honorResultsQuery->whereHas('student', function($query) {
                    $query->whereNull('section_id');
                });
            } else {
                $honorResultsQuery->whereHas('student', function($query) use ($sectionId) {
                    $query->where('section_id', $sectionId);
                });
            }
        }

        $honorResults = $honorResultsQuery->orderBy('created_at', 'desc')->get();

        // Also get the qualified students data for backward compatibility
        $qualifiedStudents = $this->getQualifiedJuniorHighSchoolStudents($currentSchoolYear, $gradeLevel, $sectionId);

        // Get available grade levels for junior high school
        $gradeLevels = \App\Models\User::getSpecificYearLevels()['junior_highschool'];

        // Get available sections for junior high school
        $sections = \App\Models\Section::where('academic_level_id', 2)
            ->where('is_active', true)
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        return Inertia::render('Registrar/Academic/Honors/JuniorHighSchool', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults, // Add actual honor results
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
            if ($sectionId === 'no_section') {
                $studentsQuery->whereNull('section_id');
            } else {
                $studentsQuery->where('section_id', $sectionId);
            }
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

        // Get actual honor results for SHS students
        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        $honorResultsQuery = HonorResult::with(['student.section', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('school_year', $currentSchoolYear);

        if ($shsLevel) {
            $honorResultsQuery->where('academic_level_id', $shsLevel->id);
        }

        // Apply filters
        if ($gradeLevel) {
            $honorResultsQuery->whereHas('student', function($query) use ($gradeLevel) {
                $query->where('specific_year_level', $gradeLevel);
            });
        }

        if ($sectionId) {
            $honorResultsQuery->whereHas('student', function($query) use ($sectionId) {
                $query->where('section_id', $sectionId);
            });
        }

        if ($strandId) {
            $honorResultsQuery->whereHas('student', function($query) use ($strandId) {
                $query->where('strand_id', $strandId);
            });
        }

        $honorResults = $honorResultsQuery->orderBy('created_at', 'desc')->get();

        // Also get the qualified students data for backward compatibility
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

        return Inertia::render('Registrar/Academic/Honors/SeniorHighSchool', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults, // Add actual honor results
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

        // Get actual honor results for College students
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        $honorResultsQuery = HonorResult::with(['student.section', 'honorType', 'academicLevel', 'approvedBy'])
            ->where('school_year', $currentSchoolYear);

        if ($collegeLevel) {
            $honorResultsQuery->where('academic_level_id', $collegeLevel->id);
        }

        // Apply filters
        if ($gradeLevel) {
            $honorResultsQuery->whereHas('student', function($query) use ($gradeLevel) {
                $query->where('specific_year_level', $gradeLevel);
            });
        }

        if ($sectionId) {
            $honorResultsQuery->whereHas('student', function($query) use ($sectionId) {
                $query->where('section_id', $sectionId);
            });
        }

        if ($departmentId) {
            $honorResultsQuery->whereHas('student.course', function($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            });
        }

        if ($courseId) {
            $honorResultsQuery->whereHas('student', function($query) use ($courseId) {
                $query->where('course_id', $courseId);
            });
        }

        $honorResults = $honorResultsQuery->orderBy('created_at', 'desc')->get();

        // Also get the qualified students data for backward compatibility
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

        return Inertia::render('Registrar/Academic/Honors/College', [
            'user' => $this->sharedUser(),
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults, // Add actual honor results
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

    private function getQualifiedCollegeStudents(string $schoolYear, ?string $gradeLevel = null, ?string $departmentId = null, ?string $courseId = null, ?string $sectionId = null): array
    {
        $collegeService = new \App\Services\CollegeHonorCalculationService();
        return $collegeService->getQualifiedCollegeStudents($schoolYear, $gradeLevel, $departmentId, $courseId, $sectionId);
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

        // Route to appropriate specialized service based on academic level
        switch ($level->key) {
            case 'elementary':
                $service = new \App\Services\ElementaryHonorCalculationService();
                $result = $service->generateElementaryHonorResults($level->id, $validated['school_year']);

                // Send pending approval notification to Principal
                if ($result['success']) {
                    try {
                        $notificationService = new \App\Services\NotificationService();
                        $honorCount = \App\Models\HonorResult::where('academic_level_id', $level->id)
                            ->where('school_year', $validated['school_year'])
                            ->where('approval_status', 'pending')
                            ->count();

                        Log::info('[Registrar] Sending elementary honor approval notification to Principal', [
                            'academic_level' => $level->name,
                            'school_year' => $validated['school_year'],
                            'honor_count' => $honorCount,
                        ]);

                        $notificationResult = $notificationService->sendPendingHonorApprovalNotification(
                            $level,
                            $validated['school_year'],
                            $honorCount
                        );

                        if ($notificationResult['success']) {
                            Log::info('[Registrar] Elementary honor approval notification sent successfully', [
                                'notification_id' => $notificationResult['notification_id'],
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('[Registrar] Exception while sending elementary honor approval notification', [
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                break;

            case 'junior_highschool':
                $service = new \App\Services\JuniorHighSchoolHonorCalculationService();
                $result = $service->generateJuniorHighSchoolHonorResults($level->id, $validated['school_year']);

                // Send pending approval notification to Principal
                if ($result['success']) {
                    try {
                        $notificationService = new \App\Services\NotificationService();
                        $honorCount = \App\Models\HonorResult::where('academic_level_id', $level->id)
                            ->where('school_year', $validated['school_year'])
                            ->where('approval_status', 'pending')
                            ->count();

                        Log::info('[Registrar] Sending junior high school honor approval notification to Principal', [
                            'academic_level' => $level->name,
                            'school_year' => $validated['school_year'],
                            'honor_count' => $honorCount,
                        ]);

                        $notificationResult = $notificationService->sendPendingHonorApprovalNotification(
                            $level,
                            $validated['school_year'],
                            $honorCount
                        );

                        if ($notificationResult['success']) {
                            Log::info('[Registrar] Junior high school honor approval notification sent successfully', [
                                'notification_id' => $notificationResult['notification_id'],
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('[Registrar] Exception while sending junior high school honor approval notification', [
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                break;

            case 'senior_highschool':
                $service = new \App\Services\SeniorHighSchoolHonorCalculationService();
                $result = $service->generateSeniorHighSchoolHonorResults($level->id, $validated['school_year']);

                // Send pending approval notification to Principal
                if ($result['success']) {
                    try {
                        $notificationService = new \App\Services\NotificationService();
                        $honorCount = \App\Models\HonorResult::where('academic_level_id', $level->id)
                            ->where('school_year', $validated['school_year'])
                            ->where('approval_status', 'pending')
                            ->count();

                        Log::info('[Registrar] Sending senior high school honor approval notification to Principal', [
                            'academic_level' => $level->name,
                            'school_year' => $validated['school_year'],
                            'honor_count' => $honorCount,
                        ]);

                        $notificationResult = $notificationService->sendPendingHonorApprovalNotification(
                            $level,
                            $validated['school_year'],
                            $honorCount
                        );

                        if ($notificationResult['success']) {
                            Log::info('[Registrar] Senior high school honor approval notification sent successfully', [
                                'notification_id' => $notificationResult['notification_id'],
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('[Registrar] Exception while sending senior high school honor approval notification', [
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                break;

            case 'college':
                $service = new \App\Services\CollegeHonorCalculationService();
                $result = $service->generateCollegeHonorResults($level->id, $validated['school_year']);

                // Send pending approval notification to Chairperson
                if ($result['success']) {
                    try {
                        $notificationService = new \App\Services\NotificationService();
                        $honorCount = \App\Models\HonorResult::where('academic_level_id', $level->id)
                            ->where('school_year', $validated['school_year'])
                            ->where('approval_status', 'pending')
                            ->count();

                        Log::info('[Registrar] Sending college honor approval notification to Chairperson', [
                            'academic_level' => $level->name,
                            'school_year' => $validated['school_year'],
                            'honor_count' => $honorCount,
                        ]);

                        $notificationResult = $notificationService->sendPendingHonorApprovalNotification(
                            $level,
                            $validated['school_year'],
                            $honorCount
                        );

                        if ($notificationResult['success']) {
                            Log::info('[Registrar] College honor approval notification sent successfully', [
                                'notification_id' => $notificationResult['notification_id'],
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('[Registrar] Exception while sending college honor approval notification', [
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                break;

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported academic level: ' . $level->name
                ], 400);
        }

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
