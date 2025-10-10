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
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return Inertia::render('Chairperson/Reports/Index', [
                'user' => $user,
                'department' => null,
                'stats' => [],
                'recentData' => [],
            ]);
        }
        
        $department = Department::find($departmentId);
        $stats = $this->getDepartmentStats($user);
        $recentData = $this->getRecentData($user);
        
        return Inertia::render('Chairperson/Reports/Index', [
            'user' => $user,
            'department' => $department,
            'stats' => $stats,
            'recentData' => $recentData,
        ]);
    }
    
    public function academicPerformance(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;

        if (!$departmentId) {
            return back()->withErrors(['department' => 'No department assigned.']);
        }

        // Set default filters
        $defaultSchoolYear = date('Y') . '-' . (date('Y') + 1);

        // Get College academic level (Chairperson only handles College)
        $collegeLevel = AcademicLevel::where('key', 'college')->first();

        // Get dropdown options
        $academicLevels = AcademicLevel::where('is_active', true)
            ->where('key', 'college')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'key']);

        $gradingPeriods = [];
        if ($collegeLevel) {
            $gradingPeriods = \App\Models\GradingPeriod::where('academic_level_id', $collegeLevel->id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'code']);
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

        // Handle GET request (show form with actual data using current school year)
        if ($request->isMethod('get')) {
            $defaultFilters = [
                'school_year' => $defaultSchoolYear,
                'academic_level_id' => '',
                'grading_period_id' => '',
            ];

            // Load actual data for current school year on initial GET
            $query = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                    $query->where('department_id', $departmentId);
                })
                ->where('school_year', $defaultSchoolYear);

            $grades = $query->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->get();

            $performance = [
                'total_grades' => $grades->count(),
                'average_grade' => round($grades->avg('grade') ?? 0, 2),
                'grade_distribution' => $this->getGradeDistribution($grades),
                'subject_performance' => $this->getSubjectPerformance($grades),
                'student_performance' => $this->getStudentPerformance($grades),
            ];

            return Inertia::render('Chairperson/Reports/AcademicPerformance', [
                'user' => $user,
                'performance' => $performance,
                'filters' => $defaultFilters,
                'academicLevels' => $academicLevels,
                'gradingPeriods' => $gradingPeriods,
                'availableSchoolYears' => $availableSchoolYears,
            ]);
        }

        // Handle POST request (process form and show results)
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
        ]);

        $query = StudentGrade::whereHas('subject.course', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->where('school_year', $validated['school_year']);

        if ($validated['academic_level_id']) {
            $query->where('academic_level_id', $validated['academic_level_id']);
        }

        if ($validated['grading_period_id']) {
            $query->where('grading_period_id', $validated['grading_period_id']);
        }

        $grades = $query->with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->get();

        $performance = [
            'total_grades' => $grades->count(),
            'average_grade' => round($grades->avg('grade') ?? 0, 2),
            'grade_distribution' => $this->getGradeDistribution($grades),
            'subject_performance' => $this->getSubjectPerformance($grades),
            'student_performance' => $this->getStudentPerformance($grades),
        ];

        return Inertia::render('Chairperson/Reports/AcademicPerformance', [
            'user' => $user,
            'performance' => $performance,
            'filters' => $validated,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'availableSchoolYears' => $availableSchoolYears,
        ]);
    }
    
    public function departmentAnalysis(Request $request)
    {
        $user = Auth::user();
        $departmentId = $user->department_id;
        
        if (!$departmentId) {
            return back()->withErrors(['department' => 'No department assigned.']);
        }
        
        $department = Department::find($departmentId);
        
        // Handle GET request (show form with default data)
        if ($request->isMethod('get')) {
            $defaultFilters = [
                'school_year' => date('Y') . '-' . (date('Y') + 1),
                'academic_level_id' => '',
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
            
            // Get available academic levels
            $academicLevels = AcademicLevel::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'key']);
            
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
            
            return Inertia::render('Chairperson/Reports/DepartmentAnalysis', [
                'user' => $user,
                'department' => $department,
                'stats' => $stats,
                'filters' => $defaultFilters,
                'availableSchoolYears' => $availableSchoolYears,
                'academicLevels' => $academicLevels,
            ]);
        }
        
        // Handle POST request (process form and show results)
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);
        
        $departmentStats = $this->getDepartmentStats($user);
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
        
        // Get available school years and academic levels for the form
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
        
        $academicLevels = AcademicLevel::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'key']);
        
        return Inertia::render('Chairperson/Reports/DepartmentAnalysis', [
            'user' => $user,
            'department' => $department,
            'stats' => $stats,
            'filters' => $validated,
            'availableSchoolYears' => $availableSchoolYears,
            'academicLevels' => $academicLevels,
        ]);
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
        return $grades->groupBy('student_id')
            ->map(function ($studentGrades) {
                return [
                    'student_name' => $studentGrades->first()->student->name,
                    'average_grade' => round($studentGrades->avg('grade') ?? 0, 2),
                    'total_subjects' => $studentGrades->count(),
                ];
            })
            ->sortByDesc('average_grade')
            ->values();
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
