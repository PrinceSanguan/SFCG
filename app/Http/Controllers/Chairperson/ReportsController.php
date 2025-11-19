<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Department;
use App\Models\Course;
use App\Models\User;
use App\Models\AcademicLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    public function index()
    {
        try {
            Log::info('[Chairperson Reports] Index - Start', ['timestamp' => now()]);

            $user = Auth::user();
            Log::info('[Chairperson Reports] User loaded', ['user_id' => $user->id, 'department_id' => $user->department_id]);

            $departmentId = $user->department_id;

            if (!$departmentId) {
                Log::warning('[Chairperson Reports] No department assigned', ['user_id' => $user->id]);
                return Inertia::render('Chairperson/Reports/Index', [
                    'user' => $user,
                    'department' => null,
                    'stats' => [
                        'total_students' => 0,
                        'total_courses' => 0,
                        'total_instructors' => 0,
                        'average_gpa' => 0,
                    ],
                    'recentData' => [
                        'recent_grades' => [],
                        'recent_honors' => [],
                    ],
                ]);
            }

            $department = Department::find($departmentId);
            Log::info('[Chairperson Reports] Department loaded', ['department' => $department->name ?? 'N/A']);

            $stats = $this->getDepartmentStats($user);
            Log::info('[Chairperson Reports] Stats calculated', ['stats' => $stats]);

            $recentData = $this->getRecentData($user);
            Log::info('[Chairperson Reports] Recent data loaded', [
                'grades_count' => count($recentData['recent_grades'] ?? []),
                'honors_count' => count($recentData['recent_honors'] ?? [])
            ]);

            Log::info('[Chairperson Reports] Index - Success');

            return Inertia::render('Chairperson/Reports/Index', [
                'user' => $user,
                'department' => $department,
                'stats' => $stats,
                'recentData' => $recentData,
            ]);
        } catch (\Exception $e) {
            Log::error('[Chairperson Reports] Index - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Chairperson/Reports/Index', [
                'user' => $user ?? Auth::user(),
                'department' => null,
                'stats' => [
                    'total_students' => 0,
                    'total_courses' => 0,
                    'total_instructors' => 0,
                    'average_gpa' => 0,
                ],
                'recentData' => [
                    'recent_grades' => [],
                    'recent_honors' => [],
                ],
            ]);
        }
    }
    
    public function academicPerformance(Request $request)
    {
        try {
            Log::info('[Chairperson Reports] Academic Performance - Start', ['method' => $request->method()]);

            $user = Auth::user();
            $departmentId = $user->department_id;

            Log::info('[Chairperson Reports] Academic Performance - User loaded', [
                'user_id' => $user->id,
                'department_id' => $departmentId
            ]);

            if (!$departmentId) {
                Log::warning('[Chairperson Reports] Academic Performance - No department assigned');
                return back()->withErrors(['department' => 'No department assigned.']);
            }

            // Set default filters
            $defaultSchoolYear = date('Y') . '-' . (date('Y') + 1);

            // Get College academic level (Chairperson only handles College)
            $collegeLevel = AcademicLevel::where('key', 'college')->first();

            if (!$collegeLevel) {
                Log::error('[Chairperson Reports] Academic Performance - College level not found in database!');
                return back()->withErrors(['error' => 'College academic level not found in the system. Please contact the administrator.']);
            }

            Log::info('[Chairperson Reports] Academic Performance - College level loaded', [
                'college_level_id' => $collegeLevel->id,
                'college_level_name' => $collegeLevel->name
            ]);

            // Get courses from chairperson's department instead of academic levels
            $courses = Course::where('department_id', $departmentId)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);

            Log::info('[Chairperson Reports] Academic Performance - Courses loaded', [
                'courses_count' => $courses->count()
            ]);

            $gradingPeriods = [];
            if ($collegeLevel) {
                $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $collegeLevel->id)
                    ->where('is_active', true)
                    ->with('parent')  // Load parent relationship to show context
                    ->orderBy('sort_order')
                    ->get(['id', 'name', 'code', 'parent_id', 'type']);

                Log::info('[Chairperson Reports] Academic Performance - Grading periods loaded', [
                    'periods_count' => $gradingPeriods->count(),
                    'periods' => $gradingPeriods->map(fn($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'parent' => $p->parent ? $p->parent->name : null
                    ])
                ]);
            }

            // Get available school years from database
            $availableSchoolYears = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->distinct()
                ->pluck('school_year')
                ->sort()
                ->values()
                ->toArray();

            // If no school years in database, provide current and nearby years
            if (empty($availableSchoolYears)) {
                $currentYear = date('Y');
                $availableSchoolYears = [
                    ($currentYear - 1) . '-' . $currentYear,
                    $currentYear . '-' . ($currentYear + 1),
                    ($currentYear + 1) . '-' . ($currentYear + 2),
                ];
            }

            Log::info('[Chairperson Reports] Academic Performance - School years loaded', [
                'years_count' => count($availableSchoolYears)
            ]);

            // Handle GET request (show form with actual data using current school year)
            if ($request->isMethod('get')) {
                Log::info('[Chairperson Reports] Academic Performance - GET request');

                $defaultFilters = [
                    'school_year' => $defaultSchoolYear,
                    'course_id' => 'all',
                    'grading_period_id' => 'all',
                ];

                // Load actual data for current school year on initial GET
                $query = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                        $query->where('department_id', $departmentId);
                    })
                    ->where('school_year', $defaultSchoolYear);

                $grades = $query->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                    ->get();

                Log::info('[Chairperson Reports] Academic Performance - Grades loaded', [
                    'grades_count' => $grades->count()
                ]);

                $performance = [
                    'total_grades' => $grades->count(),
                    'average_grade' => round($grades->avg('grade') ?? 0, 2),
                    'grade_distribution' => $this->getGradeDistribution($grades),
                    'subject_performance' => $this->getSubjectPerformance($grades),
                    'student_performance' => $this->getStudentPerformance($grades),
                ];

                Log::info('[Chairperson Reports] Academic Performance - Performance calculated', [
                    'total_grades' => $performance['total_grades'],
                    'average_grade' => $performance['average_grade']
                ]);

                return Inertia::render('Chairperson/Reports/AcademicPerformance', [
                    'user' => $user,
                    'performance' => $performance,
                    'filters' => $defaultFilters,
                    'courses' => $courses,
                    'gradingPeriods' => $gradingPeriods,
                    'availableSchoolYears' => $availableSchoolYears,
                ]);
            }

            // Handle POST request (process form and show results)
            Log::info('[Chairperson Reports] Academic Performance - POST request');

            $validated = $request->validate([
                'school_year' => 'required|string',
                'course_id' => 'nullable|string',
                'grading_period_id' => 'nullable|string',
            ]);

            Log::info('[Chairperson Reports] Academic Performance - Filters validated', $validated);

            $query = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->where('school_year', $validated['school_year']);

            // Handle course filter - "all" means no filter
            if (!empty($validated['course_id']) && $validated['course_id'] !== 'all') {
                $query->whereHas('subject.course', function ($q) use ($validated) {
                    $q->where('id', $validated['course_id']);
                });
                Log::info('[Chairperson Reports] Academic Performance - Filtering by course', [
                    'course_id' => $validated['course_id']
                ]);
            }

            // Handle grading period filter - "all" means no filter
            if (!empty($validated['grading_period_id']) && $validated['grading_period_id'] !== 'all') {
                $query->where('grading_period_id', $validated['grading_period_id']);
                Log::info('[Chairperson Reports] Academic Performance - Filtering by grading period', [
                    'grading_period_id' => $validated['grading_period_id']
                ]);
            }

            $grades = $query->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->get();

            Log::info('[Chairperson Reports] Academic Performance - Filtered grades loaded', [
                'grades_count' => $grades->count()
            ]);

            $performance = [
                'total_grades' => $grades->count(),
                'average_grade' => round($grades->avg('grade') ?? 0, 2),
                'grade_distribution' => $this->getGradeDistribution($grades),
                'subject_performance' => $this->getSubjectPerformance($grades),
                'student_performance' => $this->getStudentPerformance($grades),
            ];

            Log::info('[Chairperson Reports] Academic Performance - Performance calculated', [
                'total_grades' => $performance['total_grades'],
                'average_grade' => $performance['average_grade']
            ]);

            Log::info('[Chairperson Reports] Academic Performance - Success');

            return Inertia::render('Chairperson/Reports/AcademicPerformance', [
                'user' => $user,
                'performance' => $performance,
                'filters' => $validated,
                'courses' => $courses,
                'gradingPeriods' => $gradingPeriods,
                'availableSchoolYears' => $availableSchoolYears,
            ]);
        } catch (\Exception $e) {
            Log::error('[Chairperson Reports] Academic Performance - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to load academic performance report.']);
        }
    }
    
    public function departmentAnalysis(Request $request)
    {
        try {
            Log::info('[Chairperson Reports] Department Analysis - Start', ['method' => $request->method()]);

            $user = Auth::user();
            $departmentId = $user->department_id;

            Log::info('[Chairperson Reports] Department Analysis - User loaded', [
                'user_id' => $user->id,
                'department_id' => $departmentId
            ]);

            if (!$departmentId) {
                Log::warning('[Chairperson Reports] Department Analysis - No department assigned');
                return back()->withErrors(['department' => 'No department assigned.']);
            }

            $department = Department::find($departmentId);
            Log::info('[Chairperson Reports] Department Analysis - Department loaded', [
                'department_name' => $department->name ?? 'N/A'
            ]);

            // Handle GET request (show form with default data)
            if ($request->isMethod('get')) {
                Log::info('[Chairperson Reports] Department Analysis - GET request');

                $defaultFilters = [
                    'school_year' => date('Y') . '-' . (date('Y') + 1),
                    'course_id' => '',
                ];

                // Get available school years from the database
                $availableSchoolYears = StudentGrade::distinct()
                    ->pluck('school_year')
                    ->sort()
                    ->values()
                    ->toArray();

                // If no school years in database, provide current and next year
                if (empty($availableSchoolYears)) {
                    $currentYear = date('Y');
                    $availableSchoolYears = [
                        ($currentYear - 1) . '-' . $currentYear,
                        $currentYear . '-' . ($currentYear + 1),
                        ($currentYear + 1) . '-' . ($currentYear + 2),
                    ];
                }

                Log::info('[Chairperson Reports] Department Analysis - School years loaded', [
                    'years_count' => count($availableSchoolYears)
                ]);

                // Get courses from the chairperson's department
                $courses = Course::where('department_id', $departmentId)
                    ->orderBy('name')
                    ->get(['id', 'name', 'code']);

                Log::info('[Chairperson Reports] Department Analysis - Courses loaded', [
                    'courses_count' => $courses->count()
                ]);

                $stats = [
                    'total_students' => 0,
                    'total_courses' => 0,
                    'total_instructors' => 0,
                    'average_gpa' => 0,
                    'student_enrollment' => [],
                    'course_performance' => [],
                    'instructor_performance' => [],
                    'honor_statistics' => [],
                    'performance_trends' => [],
                ];

                Log::info('[Chairperson Reports] Department Analysis - Rendering with default data');

                return Inertia::render('Chairperson/Reports/DepartmentAnalysis', [
                    'user' => $user,
                    'department' => $department,
                    'stats' => $stats,
                    'filters' => $defaultFilters,
                    'availableSchoolYears' => $availableSchoolYears,
                    'courses' => $courses,
                ]);
            }

            // Handle POST request (process form and show results)
            Log::info('[Chairperson Reports] Department Analysis - POST request');

            $validated = $request->validate([
                'school_year' => 'required|string',
                'course_id' => 'nullable|exists:courses,id',
            ]);

            Log::info('[Chairperson Reports] Department Analysis - Filters validated', $validated);

            $departmentStats = $this->getDepartmentStats($user);
            Log::info('[Chairperson Reports] Department Analysis - Department stats loaded', $departmentStats);

            $stats = [
                'total_students' => $departmentStats['total_students'] ?? 0,
                'total_courses' => $departmentStats['total_courses'] ?? 0,
                'total_instructors' => $departmentStats['total_instructors'] ?? 0,
                'average_gpa' => $departmentStats['average_gpa'] ?? 0,
                'student_enrollment' => $this->getStudentEnrollment($departmentId),
                'course_performance' => $this->getCoursePerformance($departmentId),
                'instructor_performance' => $this->getInstructorPerformance($departmentId),
                'honor_statistics' => $this->getHonorStatistics($departmentId),
                'performance_trends' => $this->getPerformanceTrends($departmentId),
            ];

            Log::info('[Chairperson Reports] Department Analysis - All stats calculated');

            // Get available school years and courses for the form
            $availableSchoolYears = StudentGrade::distinct()
                ->pluck('school_year')
                ->sort()
                ->values()
                ->toArray();

            if (empty($availableSchoolYears)) {
                $currentYear = date('Y');
                $availableSchoolYears = [
                    ($currentYear - 1) . '-' . $currentYear,
                    $currentYear . '-' . ($currentYear + 1),
                    ($currentYear + 1) . '-' . ($currentYear + 2),
                ];
            }

            // Get courses from the chairperson's department
            $courses = Course::where('department_id', $departmentId)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);

            Log::info('[Chairperson Reports] Department Analysis - Success');

            return Inertia::render('Chairperson/Reports/DepartmentAnalysis', [
                'user' => $user,
                'department' => $department,
                'stats' => $stats,
                'filters' => $validated,
                'availableSchoolYears' => $availableSchoolYears,
                'courses' => $courses,
            ]);
        } catch (\Exception $e) {
            Log::error('[Chairperson Reports] Department Analysis - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to load department analysis report.']);
        }
    }
    
    public function export($type)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            abort(403, 'No department assigned.');
        }
        
        switch ($type) {
            case 'academic-performance':
                return $this->exportAcademicPerformance($user);
            case 'department-analysis':
                return $this->exportDepartmentAnalysisPDF($user);
            case 'department-analysis-csv':
                return $this->exportDepartmentAnalysis($user);
            default:
                abort(404, 'Export type not found.');
        }
    }
    
    // API methods
    public function getPerformanceTrendsApi()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $trends = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->select('school_year', 'academic_level_id', DB::raw('AVG(grade) as avg_grade'))
            ->groupBy('school_year', 'academic_level_id')
            ->orderBy('school_year')
            ->get();
        
        return response()->json($trends);
    }
    
    public function getDepartmentStatsApi()
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return response()->json([]);
        }
        
        $stats = $this->getDepartmentStats($user);
        
        return response()->json($stats);
    }
    
    // Private helper methods
    private function getDepartmentStats($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return [];
        }
        
        $totalStudents = User::where('user_role', 'student')
            ->whereHas('course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->count();
        
        $totalCourses = Course::where('department_id', $departmentId)->count();
        
        $totalInstructors = User::where('user_role', 'instructor')
            ->whereHas('instructorSubjectAssignments', function ($query) use ($departmentId) {
                $query->whereHas('subject.course', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
            })
            ->count();
        
        $averageGpa = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->avg('grade');
        
        return [
            'total_students' => $totalStudents,
            'total_courses' => $totalCourses,
            'total_instructors' => $totalInstructors,
            'average_gpa' => round($averageGpa ?? 0, 2),
        ];
    }
    
    private function getRecentData($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return [];
        }
        
        $recentGrades = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject'])
            ->latest('created_at')
            ->limit(10)
            ->get();
        
        $recentHonors = HonorResult::whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'honorType'])
            ->latest('created_at')
            ->limit(10)
            ->get();
        
        return [
            'recent_grades' => $recentGrades,
            'recent_honors' => $recentHonors,
        ];
    }
    
    private function getGradeDistribution($grades)
    {
        $distribution = [];
        
        foreach ($grades as $grade) {
            $gradeValue = (int) $grade->grade;
            if (!isset($distribution[$gradeValue])) {
                $distribution[$gradeValue] = 0;
            }
            $distribution[$gradeValue]++;
        }
        
        ksort($distribution);
        return $distribution;
    }
    
    private function getSubjectPerformance($grades)
    {
        return $grades->groupBy('subject_id')
            ->map(function ($subjectGrades) {
                return [
                    'subject_name' => $subjectGrades->first()->subject->name,
                    'average_grade' => round($subjectGrades->avg('grade') ?? 0, 2),
                    'total_students' => $subjectGrades->count(),
                ];
            })
            ->values();
    }
    
    private function getStudentPerformance($grades)
    {
        Log::info('[Chairperson Reports] getStudentPerformance - Starting', [
            'total_grades' => $grades->count()
        ]);

        $result = $grades->groupBy('student_id')
            ->map(function ($studentGrades) {
                $avgGrade = round($studentGrades->avg('grade') ?? 0, 2);
                $studentName = $studentGrades->first()->student->name ?? 'Unknown';

                Log::info('[Chairperson Reports] Student Performance', [
                    'student_name' => $studentName,
                    'average_grade' => $avgGrade,
                    'total_subjects' => $studentGrades->count()
                ]);

                return [
                    'student_name' => $studentName,
                    'average_grade' => $avgGrade,
                    'total_subjects' => $studentGrades->count(),
                ];
            })
            // Sort by ASCENDING order - lower GPA is better in Philippine grading system
            ->sortBy('average_grade')
            ->values();

        Log::info('[Chairperson Reports] getStudentPerformance - Result', [
            'students_count' => $result->count(),
            'rankings' => $result->take(5)->map(fn($s, $i) => [
                'rank' => $i + 1,
                'name' => $s['student_name'],
                'gpa' => $s['average_grade']
            ])
        ]);

        return $result;
    }
    
    private function getStudentEnrollment($departmentId)
    {
        return User::where('user_role', 'student')
            ->whereHas('course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with('course')
            ->get()
            ->groupBy('course.name')
            ->map(function ($students) {
                return $students->count();
            });
    }
    
    private function getCoursePerformance($departmentId)
    {
        return Course::where('department_id', $departmentId)
            ->with(['subjects.grades'])
            ->get()
            ->map(function ($course) {
                $grades = $course->subjects->flatMap->grades;
                return [
                    'course_name' => $course->name,
                    'average_grade' => round($grades->avg('grade') ?? 0, 2),
                    'total_grades' => $grades->count(),
                ];
            });
    }
    
    private function getInstructorPerformance($departmentId)
    {
        return User::where('user_role', 'instructor')
            ->whereHas('instructorSubjectAssignments', function ($query) use ($departmentId) {
                $query->whereHas('subject.course', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
            })
            ->with(['instructorSubjectAssignments.subject.grades'])
            ->get()
            ->map(function ($instructor) {
                $grades = $instructor->instructorSubjectAssignments->flatMap(function ($assignment) {
                    return $assignment->subject->grades;
                });
                
                return [
                    'instructor_name' => $instructor->name,
                    'average_grade' => round($grades->avg('grade') ?? 0, 2),
                    'total_grades' => $grades->count(),
                ];
            });
    }
    
    private function getHonorStatistics($departmentId)
    {
        return HonorResult::whereHas('student.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['honorType'])
            ->get()
            ->groupBy('honorType.name')
            ->map(function ($honors) {
                return $honors->count();
            });
    }
    
    private function getPerformanceTrends($departmentId)
    {
        return StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->select('school_year', DB::raw('AVG(grade) as avg_grade'))
            ->groupBy('school_year')
            ->orderBy('school_year')
            ->get();
    }
    
    private function exportAcademicPerformance($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            abort(403, 'No department assigned.');
        }
        
        $grades = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->get();
        
        $filename = 'academic_performance_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($grades) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Student Name',
                'Subject',
                'Grade',
                'Academic Level',
                'Grading Period',
                'School Year',
                'Year of Study'
            ]);
            
            // CSV Data
            foreach ($grades as $grade) {
                fputcsv($file, [
                    $grade->student->name ?? 'N/A',
                    $grade->subject->name ?? 'N/A',
                    $grade->grade,
                    $grade->academicLevel->name ?? 'N/A',
                    $grade->gradingPeriod->name ?? 'N/A',
                    $grade->school_year,
                    $grade->year_of_study
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    private function exportDepartmentAnalysis($user)
    {
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            abort(403, 'No department assigned.');
        }
        
        $department = Department::find($departmentId);
        $departmentStats = $this->getDepartmentStats($user);
        $studentEnrollment = $this->getStudentEnrollment($departmentId);
        $coursePerformance = $this->getCoursePerformance($departmentId);
        $instructorPerformance = $this->getInstructorPerformance($departmentId);
        $honorStatistics = $this->getHonorStatistics($departmentId);
        $performanceTrends = $this->getPerformanceTrends($departmentId);
        
        $filename = 'department_analysis_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($department, $departmentStats, $studentEnrollment, $coursePerformance, $instructorPerformance, $honorStatistics, $performanceTrends) {
            $file = fopen('php://output', 'w');
            
            // Department Overview
            fputcsv($file, ['DEPARTMENT ANALYSIS REPORT']);
            fputcsv($file, ['Department:', $department->name ?? 'N/A']);
            fputcsv($file, ['Generated:', date('Y-m-d H:i:s')]);
            fputcsv($file, []);
            
            // Key Metrics
            fputcsv($file, ['KEY METRICS']);
            fputcsv($file, ['Total Students', $departmentStats['total_students']]);
            fputcsv($file, ['Total Courses', $departmentStats['total_courses']]);
            fputcsv($file, ['Total Instructors', $departmentStats['total_instructors']]);
            fputcsv($file, ['Average GPA', $departmentStats['average_gpa']]);
            fputcsv($file, []);
            
            // Student Enrollment by Course
            fputcsv($file, ['STUDENT ENROLLMENT BY COURSE']);
            fputcsv($file, ['Course', 'Enrollment Count']);
            foreach ($studentEnrollment as $course => $count) {
                fputcsv($file, [$course, $count]);
            }
            fputcsv($file, []);
            
            // Course Performance
            fputcsv($file, ['COURSE PERFORMANCE']);
            fputcsv($file, ['Course', 'Average Grade', 'Total Grades']);
            foreach ($coursePerformance as $course) {
                fputcsv($file, [$course['course_name'], $course['average_grade'], $course['total_grades']]);
            }
            fputcsv($file, []);
            
            // Instructor Performance
            fputcsv($file, ['INSTRUCTOR PERFORMANCE']);
            fputcsv($file, ['Instructor', 'Average Grade', 'Total Grades']);
            foreach ($instructorPerformance as $instructor) {
                fputcsv($file, [$instructor['instructor_name'], $instructor['average_grade'], $instructor['total_grades']]);
            }
            fputcsv($file, []);
            
            // Honor Statistics
            fputcsv($file, ['HONOR STATISTICS']);
            fputcsv($file, ['Honor Type', 'Count']);
            foreach ($honorStatistics as $honorType => $count) {
                fputcsv($file, [$honorType, $count]);
            }
            fputcsv($file, []);
            
            // Performance Trends
            fputcsv($file, ['PERFORMANCE TRENDS']);
            fputcsv($file, ['School Year', 'Average Grade']);
            foreach ($performanceTrends as $trend) {
                fputcsv($file, [$trend['school_year'], $trend['avg_grade']]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    private function exportDepartmentAnalysisPDF($user)
    {
        try {
            $departmentId = $user->department_id;
            
            if (!$departmentId) {
                abort(403, 'No department assigned.');
            }
            
            $department = Department::find($departmentId);
            $departmentStats = $this->getDepartmentStats($user);
            $studentEnrollment = $this->getStudentEnrollment($departmentId);
            $coursePerformance = $this->getCoursePerformance($departmentId);
            $instructorPerformance = $this->getInstructorPerformance($departmentId);
            $honorStatistics = $this->getHonorStatistics($departmentId);
            $performanceTrends = $this->getPerformanceTrends($departmentId);
            
            $html = view('reports.department-analysis', [
                'department' => $department,
                'stats' => $departmentStats,
                'studentEnrollment' => $studentEnrollment,
                'coursePerformance' => $coursePerformance,
                'instructorPerformance' => $instructorPerformance,
                'honorStatistics' => $honorStatistics,
                'performanceTrends' => $performanceTrends,
                'generatedAt' => now()->format('Y-m-d H:i:s')
            ])->render();
            
            // Debug: Log the HTML content length
            Log::info('PDF Export Debug - HTML Length: ' . strlen($html));
            
            $pdf = Pdf::loadHTML($html);
            
            // Debug: Check if PDF was created successfully
            Log::info('PDF Export Debug - PDF object created: ' . ($pdf ? 'Yes' : 'No'));
            
            $pdfContent = $pdf->output();
            
            // Debug: Log PDF content length and first 100 characters
            Log::info('PDF Export Debug - PDF Content Length: ' . strlen($pdfContent));
            Log::info('PDF Export Debug - PDF Content Start: ' . substr($pdfContent, 0, 100));
            
            $filename = 'department_analysis_' . date('Y-m-d_H-i-s') . '.pdf';
            
            // Debug: Log response headers
            Log::info('PDF Export Debug - Filename: ' . $filename);
            Log::info('PDF Export Debug - Content Length: ' . strlen($pdfContent));
            
            // Force download with explicit headers
            Log::info('PDF Export Debug - Attempting download with explicit headers');
            
            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => strlen($pdfContent),
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
            ]);
            
        } catch (\Exception $e) {
            Log::error('PDF Export Error: ' . $e->getMessage());
            Log::error('PDF Export Error Stack: ' . $e->getTraceAsString());
            
            // Return error response instead of crashing
            return response()->json([
                'error' => 'PDF generation failed',
                'message' => $e->getMessage(),
                'debug_info' => [
                    'department_id' => $departmentId ?? 'not set',
                    'user_id' => $user->id,
                    'timestamp' => now()->toISOString()
                ]
            ], 500);
        }
    }
}
