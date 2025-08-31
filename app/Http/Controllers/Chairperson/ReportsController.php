<?php

namespace App\Http\Controllers\Chairperson;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\Department;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
        
        // Handle GET request (show form with default data)
        if ($request->isMethod('get')) {
            $defaultFilters = [
                'school_year' => date('Y') . '-' . (date('Y') + 1),
                'academic_level_id' => '',
                'grading_period_id' => '',
            ];
            
            $performance = [
                'total_grades' => 0,
                'average_grade' => 0,
                'grade_distribution' => [],
                'subject_performance' => [],
                'student_performance' => [],
            ];
            
            return Inertia::render('Chairperson/Reports/AcademicPerformance', [
                'user' => $user,
                'performance' => $performance,
                'filters' => $defaultFilters,
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
            'average_grade' => round($grades->avg('grade'), 2),
            'grade_distribution' => $this->getGradeDistribution($grades),
            'subject_performance' => $this->getSubjectPerformance($grades),
            'student_performance' => $this->getStudentPerformance($grades),
        ];
        
        return Inertia::render('Chairperson/Reports/AcademicPerformance', [
            'user' => $user,
            'performance' => $performance,
            'filters' => $validated,
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
            ]);
        }
        
        // Handle POST request (process form and show results)
        $validated = $request->validate([
            'school_year' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
        ]);
        
        $stats = [
            'total_students' => $this->getDepartmentStats($departmentId)['total_students'],
            'total_courses' => $this->getDepartmentStats($departmentId)['total_courses'],
            'total_instructors' => $this->getDepartmentStats($departmentId)['total_instructors'],
            'average_gpa' => $this->getDepartmentStats($departmentId)['average_gpa'],
            'student_enrollment' => $this->getStudentEnrollment($departmentId),
            'course_performance' => $this->getCoursePerformance($departmentId),
            'instructor_performance' => $this->getInstructorPerformance($departmentId),
            'honor_statistics' => $this->getHonorStatistics($departmentId),
            'performance_trends' => $this->getPerformanceTrends($departmentId),
        ];
        
        return Inertia::render('Chairperson/Reports/DepartmentAnalysis', [
            'user' => $user,
            'department' => $department,
            'stats' => $stats,
            'filters' => $validated,
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
            'average_gpa' => round($averageGpa, 2),
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
                    'average_grade' => round($subjectGrades->avg('grade'), 2),
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
                    'average_grade' => round($studentGrades->avg('grade'), 2),
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
                    'average_grade' => round($grades->avg('grade'), 2),
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
                    'average_grade' => round($grades->avg('grade'), 2),
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
        // Implementation for exporting academic performance data
        // This would typically generate a CSV or Excel file
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
    
    private function exportDepartmentAnalysis($user)
    {
        // Implementation for exporting department analysis data
        // This would typically generate a CSV or Excel file
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}
