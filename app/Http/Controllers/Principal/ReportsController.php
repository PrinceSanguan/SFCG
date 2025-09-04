<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Course;
// use App\Exports\GradeReportExport;
// use App\Exports\HonorStatisticsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $academicLevels = AcademicLevel::all();
        $courses = Course::with('department')->get();
        
        return Inertia::render('Principal/Reports/Index', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'courses' => $courses,
        ]);
    }
    
    public function academicPerformance(Request $request)
    {
        $user = Auth::user();
        
        $filters = $request->only(['academic_level_id', 'course_id', 'year', 'period']);
        
        try {
            $query = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);
            
            if (!empty($filters['academic_level_id'])) {
                $query->where('academic_level_id', $filters['academic_level_id']);
            }
            
            if (!empty($filters['course_id'])) {
                $query->whereHas('subject.course', function ($q) use ($filters) {
                    $q->where('id', $filters['course_id']);
                });
            }
            
            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }
            
            if (!empty($filters['period'])) {
                $query->where('grading_period_id', $filters['period']);
            }
            
            $grades = $query->paginate(20);
            
            // Calculate performance statistics safely
            $totalGrades = $grades->total();
            $gradeValues = $grades->pluck('grade')->filter();
            
            $stats = [
                'total_grades' => $totalGrades,
                'average_grade' => $gradeValues->count() > 0 ? $gradeValues->avg() : 0,
                'highest_grade' => $gradeValues->count() > 0 ? $gradeValues->max() : 0,
                'lowest_grade' => $gradeValues->count() > 0 ? $gradeValues->min() : 0,
                'passing_rate' => $gradeValues->count() > 0 ? ($gradeValues->where('>=', 75)->count() / $gradeValues->count() * 100) : 0,
            ];
            
            // Get additional data for filters
            $academicLevels = AcademicLevel::all();
            $courses = Course::with('department')->get();
            $gradingPeriods = \App\Models\GradingPeriod::all();
            
            return Inertia::render('Principal/Reports/AcademicPerformance', [
                'user' => $user,
                'grades' => $grades,
                'stats' => $stats,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'courses' => $courses,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Academic Performance Error: ' . $e->getMessage());
            
            // Return empty data on error
            return Inertia::render('Principal/Reports/AcademicPerformance', [
                'user' => $user,
                'grades' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20),
                'stats' => [
                    'total_grades' => 0,
                    'average_grade' => 0,
                    'highest_grade' => 0,
                    'lowest_grade' => 0,
                    'passing_rate' => 0,
                ],
                'filters' => $filters,
                'academicLevels' => AcademicLevel::all(),
                'courses' => Course::with('department')->get(),
                'gradingPeriods' => \App\Models\GradingPeriod::all(),
            ]);
        }
    }
    
    public function gradeTrends(Request $request)
    {
        $user = Auth::user();
        
        $filters = $request->only(['academic_level_id', 'course_id', 'year']);
        
        try {
            $query = StudentGrade::with(['academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);
            
            if (!empty($filters['academic_level_id'])) {
                $query->where('academic_level_id', $filters['academic_level_id']);
            }
            
            if (!empty($filters['course_id'])) {
                $query->whereHas('subject.course', function ($q) use ($filters) {
                    $q->where('id', $filters['course_id']);
                });
            }
            
            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }
            
            // Get trends by grading period
            $trends = $query->selectRaw('
                    grading_period_id,
                    AVG(grade) as average_grade,
                    COUNT(*) as total_grades,
                    COUNT(CASE WHEN grade >= 75 THEN 1 END) as passing_count
                ')
                ->groupBy('grading_period_id')
                ->with('gradingPeriod')
                ->get();
            
            // Get additional data for filters
            $academicLevels = AcademicLevel::all();
            $courses = Course::with('department')->get();
            $gradingPeriods = \App\Models\GradingPeriod::all();
            
            return Inertia::render('Principal/Reports/GradeTrends', [
                'user' => $user,
                'trends' => $trends,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'courses' => $courses,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Grade Trends Error: ' . $e->getMessage());
            
            // Return empty data on error
            return Inertia::render('Principal/Reports/GradeTrends', [
                'user' => $user,
                'trends' => collect([]),
                'filters' => $filters,
                'academicLevels' => AcademicLevel::all(),
                'courses' => Course::with('department')->get(),
                'gradingPeriods' => \App\Models\GradingPeriod::all(),
            ]);
        }
    }
    
    public function honorStatistics(Request $request)
    {
        $user = Auth::user();
        
        $filters = $request->only(['academic_level_id', 'honor_type_id', 'year']);
        
        try {
            $query = HonorResult::with(['student', 'honorType', 'academicLevel'])
                ->where('is_approved', true);
            
            if (!empty($filters['academic_level_id'])) {
                $query->where('academic_level_id', $filters['academic_level_id']);
            }
            
            if (!empty($filters['honor_type_id'])) {
                $query->where('honor_type_id', $filters['honor_type_id']);
            }
            
            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }
            
            $honors = $query->paginate(20);
            
            // Calculate honor statistics safely
            $totalHonors = $honors->total();
            $gpaValues = $honors->pluck('gpa')->filter();
            
            $stats = [
                'total_honors' => $totalHonors,
                'by_type' => $honors->groupBy('honorType.name')->map->count(),
                'by_level' => $honors->groupBy('academicLevel.name')->map->count(),
                'average_gpa' => $gpaValues->count() > 0 ? $gpaValues->avg() : 0,
            ];
            
            // Get additional data for filters
            $academicLevels = AcademicLevel::all();
            $honorTypes = \App\Models\HonorType::all();
            
            return Inertia::render('Principal/Reports/HonorStatistics', [
                'user' => $user,
                'honors' => $honors,
                'stats' => $stats,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'honorTypes' => $honorTypes,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Honor Statistics Error: ' . $e->getMessage());
            
            // Return empty data on error
            return Inertia::render('Principal/Reports/HonorStatistics', [
                'user' => $user,
                'honors' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20),
                'stats' => [
                    'total_honors' => 0,
                    'by_type' => collect([]),
                    'by_level' => collect([]),
                    'average_gpa' => 0,
                ],
                'filters' => $filters,
                'academicLevels' => AcademicLevel::all(),
                'honorTypes' => \App\Models\HonorType::all(),
            ]);
        }
    }
    
    public function export($type)
    {
        // TODO: Implement export functionality
        return back()->with('error', 'Export functionality is not yet implemented.');
    }
    
    // API methods
    public function getPerformanceData(Request $request)
    {
        $filters = $request->only(['academic_level_id', 'course_id', 'year', 'period']);
        
        $query = StudentGrade::where('is_approved', true);
        
        if ($filters['academic_level_id']) {
            $query->where('academic_level_id', $filters['academic_level_id']);
        }
        
        if ($filters['course_id']) {
            $query->whereHas('subject.course', function ($q) use ($filters) {
                $q->where('id', $filters['course_id']);
            });
        }
        
        if ($filters['year']) {
            $query->where('school_year', $filters['year']);
        }
        
        if ($filters['period']) {
            $query->where('grading_period_id', $filters['period']);
        }
        
        $data = $query->selectRaw('
                AVG(grade) as average_grade,
                COUNT(*) as total_grades,
                COUNT(CASE WHEN grade >= 75 THEN 1 END) as passing_count,
                COUNT(CASE WHEN grade >= 90 THEN 1 END) as excellent_count
            ')
            ->first();
        
        return response()->json($data);
    }
    
    public function getTrendData(Request $request)
    {
        $filters = $request->only(['academic_level_id', 'course_id', 'year']);
        
        $query = StudentGrade::where('is_approved', true);
        
        if ($filters['academic_level_id']) {
            $query->where('academic_level_id', $filters['academic_level_id']);
        }
        
        if ($filters['course_id']) {
            $query->whereHas('subject.course', function ($q) use ($filters) {
                $q->where('id', $filters['course_id']);
            });
        }
        
        if ($filters['year']) {
            $query->where('school_year', $filters['year']);
        }
        
        $trends = $query->selectRaw('
                grading_period_id,
                AVG(grade) as average_grade,
                COUNT(*) as total_grades
            ')
            ->groupBy('grading_period_id')
            ->with('gradingPeriod')
            ->get();
        
        return response()->json($trends);
    }
    
    public function getHonorData(Request $request)
    {
        $filters = $request->only(['academic_level_id', 'honor_type_id', 'year']);
        
        $query = HonorResult::where('is_approved', true);
        
        if ($filters['academic_level_id']) {
            $query->where('academic_level_id', $filters['academic_level_id']);
        }
        
        if ($filters['honor_type_id']) {
            $query->where('honor_type_id', $filters['honor_type_id']);
        }
        
        if ($filters['year']) {
            $query->where('school_year', $filters['year']);
        }
        
        $data = $query->selectRaw('
                COUNT(*) as total_honors,
                AVG(gpa) as average_gpa,
                COUNT(CASE WHEN honor_type_id = 1 THEN 1 END) as summa_count,
                COUNT(CASE WHEN honor_type_id = 2 THEN 1 END) as magna_count,
                COUNT(CASE WHEN honor_type_id = 3 THEN 1 END) as cum_laude_count
            ')
            ->first();
        
        return response()->json($data);
    }
}
