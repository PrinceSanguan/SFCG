<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\HonorResult;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\Course;
use App\Exports\GradeReportExport;
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

        // Filter out College level for Principal (only Elementary, JHS, SHS)
        $academicLevels = AcademicLevel::whereNotIn('key', ['college'])->get();
        $strands = \App\Models\Strand::with('academicLevel')->get();

        return Inertia::render('Principal/Reports/Index', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'strands' => $strands,
        ]);
    }
    
    public function academicPerformance(Request $request)
    {
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Academic Performance - Request', [
            'user_id' => $user->id,
            'user_year_level' => $user->year_level,
            'principal_academic_level_id' => $principalAcademicLevel?->id,
            'principal_academic_level_key' => $principalAcademicLevel?->key,
            'principal_academic_level_name' => $principalAcademicLevel?->name,
        ]);

        $filters = $request->only(['academic_level_id', 'course_id', 'year', 'period']);

        try {
            $query = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);

            // Auto-filter by principal's academic level
            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
            }

            // Note: Removed manual academic_level_id filter since it's auto-set above

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

            // Only pass the principal's assigned academic level (not all levels)
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
            $strands = \App\Models\Strand::with('academicLevel')
                ->when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                    return $query->where('academic_level_id', $principalAcademicLevel->id);
                })
                ->get();
            $gradingPeriods = \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                    return $query->where('academic_level_id', $principalAcademicLevel->id);
                })
                ->orderBy('sort_order', 'asc')
                ->get();

            Log::info('[Principal Reports] Academic Performance - Data to Frontend', [
                'strands_count' => $strands->count(),
                'strands' => $strands->pluck('name', 'id')->toArray(),
                'grading_periods_count' => $gradingPeriods->count(),
            ]);

            return Inertia::render('Principal/Reports/AcademicPerformance', [
                'user' => $user,
                'grades' => $grades,
                'stats' => $stats,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'strands' => $strands,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Academic Performance Error: ' . $e->getMessage());

            // Return empty data on error - only principal's assigned level
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
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
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'strands' => \App\Models\Strand::with('academicLevel')
                    ->when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                        return $query->where('academic_level_id', $principalAcademicLevel->id);
                    })
                    ->get(),
                'gradingPeriods' => \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                        return $query->where('academic_level_id', $principalAcademicLevel->id);
                    })
                    ->orderBy('sort_order', 'asc')
                    ->get(),
            ]);
        }
    }

    public function gradeTrends(Request $request)
    {
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Grade Trends - Request', [
            'user_id' => $user->id,
            'user_year_level' => $user->year_level,
            'principal_academic_level_id' => $principalAcademicLevel?->id,
            'principal_academic_level_key' => $principalAcademicLevel?->key,
            'principal_academic_level_name' => $principalAcademicLevel?->name,
        ]);

        $filters = $request->only(['academic_level_id', 'course_id', 'year']);

        try {
            $query = StudentGrade::with(['academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);

            // Auto-filter by principal's academic level
            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
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

            // Only pass the principal's assigned academic level
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
            $strands = \App\Models\Strand::with('academicLevel')
                ->when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                    return $query->where('academic_level_id', $principalAcademicLevel->id);
                })
                ->get();
            $gradingPeriods = \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                    return $query->where('academic_level_id', $principalAcademicLevel->id);
                })
                ->orderBy('sort_order', 'asc')
                ->get();

            return Inertia::render('Principal/Reports/GradeTrends', [
                'user' => $user,
                'trends' => $trends,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'strands' => $strands,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Grade Trends Error: ' . $e->getMessage());

            // Return empty data on error - only principal's assigned level
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
            return Inertia::render('Principal/Reports/GradeTrends', [
                'user' => $user,
                'trends' => collect([]),
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'strands' => \App\Models\Strand::with('academicLevel')
                    ->when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                        return $query->where('academic_level_id', $principalAcademicLevel->id);
                    })
                    ->get(),
                'gradingPeriods' => \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                        return $query->where('academic_level_id', $principalAcademicLevel->id);
                    })
                    ->orderBy('sort_order', 'asc')
                    ->get(),
            ]);
        }
    }

    public function honorStatistics(Request $request)
    {
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Honor Statistics - Request', [
            'user_id' => $user->id,
            'user_year_level' => $user->year_level,
            'principal_academic_level_id' => $principalAcademicLevel?->id,
            'principal_academic_level_key' => $principalAcademicLevel?->key,
            'principal_academic_level_name' => $principalAcademicLevel?->name,
        ]);

        $filters = $request->only(['academic_level_id', 'honor_type_id', 'year', 'period']);

        try {
            $query = HonorResult::with(['student', 'honorType', 'academicLevel'])
                ->where('is_approved', true);

            // Auto-filter by principal's academic level
            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
            }

            if (!empty($filters['honor_type_id'])) {
                $query->where('honor_type_id', $filters['honor_type_id']);
            }

            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }

            if (!empty($filters['period'])) {
                $query->where('grading_period_id', $filters['period']);
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

            // Only pass the principal's assigned academic level
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
            $honorTypes = \App\Models\HonorType::all();
            $gradingPeriods = \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                    return $query->where('academic_level_id', $principalAcademicLevel->id);
                })
                ->orderBy('sort_order', 'asc')
                ->get();

            Log::info('[Principal Reports] Honor Statistics - Data to Frontend', [
                'honor_types_count' => $honorTypes->count(),
                'honor_types' => $honorTypes->pluck('name', 'id')->toArray(),
                'grading_periods_count' => $gradingPeriods->count(),
            ]);

            return Inertia::render('Principal/Reports/HonorStatistics', [
                'user' => $user,
                'honors' => $honors,
                'stats' => $stats,
                'filters' => $filters,
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'honorTypes' => $honorTypes,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Honor Statistics Error: ' . $e->getMessage());

            // Return empty data on error - only principal's assigned level
            $academicLevels = $principalAcademicLevel ? [$principalAcademicLevel] : [];
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
                'academicLevels' => $academicLevels,
                'principalAcademicLevel' => $principalAcademicLevel,
                'honorTypes' => \App\Models\HonorType::all(),
                'gradingPeriods' => \App\Models\GradingPeriod::when($principalAcademicLevel, function ($query) use ($principalAcademicLevel) {
                        return $query->where('academic_level_id', $principalAcademicLevel->id);
                    })
                    ->orderBy('sort_order', 'asc')
                    ->get(),
            ]);
        }
    }

    // =====================================================
    // EXPORT METHODS WITH VERBOSE LOGGING
    // =====================================================

    public function exportAcademicPerformance($format, Request $request)
    {
        $startTime = microtime(true);
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Academic Performance Export - Request Start', [
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_year_level' => $user->year_level,
            'principal_academic_level_id' => $principalAcademicLevel?->id,
            'principal_academic_level_name' => $principalAcademicLevel?->name,
            'export_format' => $format,
            'request_ip' => $request->ip(),
            'request_user_agent' => $request->userAgent(),
        ]);

        try {
            $filters = $request->only(['academic_level_id', 'strand_id', 'year', 'period']);

            Log::info('[Principal Reports] Academic Performance Export - Filters Applied', [
                'filters' => $filters,
                'has_strand_filter' => !empty($filters['strand_id']),
                'has_year_filter' => !empty($filters['year']),
                'has_period_filter' => !empty($filters['period']),
            ]);

            $queryStartTime = microtime(true);

            // Query grades with relationships
            $query = StudentGrade::with(['student', 'subject.course', 'academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);

            // Auto-filter by principal's academic level
            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
            }

            if (!empty($filters['strand_id'])) {
                $query->whereHas('student', function ($q) use ($filters) {
                    $q->where('strand_id', $filters['strand_id']);
                });
            }

            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }

            if (!empty($filters['period'])) {
                $query->where('grading_period_id', $filters['period']);
            }

            $grades = $query->get();
            $queryEndTime = microtime(true);

            Log::info('[Principal Reports] Academic Performance Export - Query Executed', [
                'query_execution_time_ms' => round(($queryEndTime - $queryStartTime) * 1000, 2),
                'total_records_retrieved' => $grades->count(),
                'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            ]);

            // Calculate statistics
            $gradeValues = $grades->pluck('grade')->filter();
            $statistics = [
                'total_records' => $grades->count(),
                'average_grade' => $gradeValues->count() > 0 ? $gradeValues->avg() : 0,
                'highest_grade' => $gradeValues->count() > 0 ? $gradeValues->max() : 0,
                'lowest_grade' => $gradeValues->count() > 0 ? $gradeValues->min() : 0,
                'passing_rate' => $gradeValues->count() > 0 ? ($gradeValues->where('>=', 75)->count() / $gradeValues->count() * 100) : 0,
                'grade_distribution' => $this->calculateGradeDistribution($gradeValues),
                'subject_averages' => $this->calculateSubjectAverages($grades),
            ];

            Log::info('[Principal Reports] Academic Performance Export - Statistics Calculated', [
                'statistics' => $statistics,
            ]);

            $fileStartTime = microtime(true);

            // Generate export based on format
            if ($format === 'pdf') {
                $response = $this->generateAcademicPerformancePDF($grades, $statistics, $filters, $principalAcademicLevel);
            } elseif ($format === 'excel') {
                $response = $this->generateAcademicPerformanceExcel($grades, $statistics);
            } elseif ($format === 'csv') {
                $response = $this->generateAcademicPerformanceCSV($grades, $statistics);
            } else {
                Log::warning('[Principal Reports] Academic Performance Export - Invalid Format', [
                    'requested_format' => $format,
                ]);
                return back()->with('error', 'Invalid export format. Please use pdf, excel, or csv.');
            }

            $fileEndTime = microtime(true);
            $totalTime = microtime(true) - $startTime;

            Log::info('[Principal Reports] Academic Performance Export - File Generated Successfully', [
                'file_generation_time_ms' => round(($fileEndTime - $fileStartTime) * 1000, 2),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
                'format' => $format,
                'success' => true,
            ]);

            return $response;

        } catch (\Exception $e) {
            $totalTime = microtime(true) - $startTime;

            Log::error('[Principal Reports] Academic Performance Export - Error', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
                'user_id' => $user->id,
                'format' => $format,
            ]);

            return back()->with('error', 'An error occurred while generating the report: ' . $e->getMessage());
        }
    }

    private function generateAcademicPerformancePDF($grades, $statistics, $filters, $principalAcademicLevel)
    {
        $html = '<html><head><style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            .stats { margin-top: 20px; }
        </style></head><body>';

        $html .= '<h1>Academic Performance Report</h1>';
        $html .= '<p>Generated: ' . now()->format('F d, Y h:i A') . '</p>';
        $html .= '<p>Academic Level: ' . ($principalAcademicLevel ? $principalAcademicLevel->name : 'N/A') . '</p>';

        $html .= '<div class="stats"><h2>Statistics</h2>';
        $html .= '<p>Total Records: ' . $statistics['total_records'] . '</p>';
        $html .= '<p>Average Grade: ' . round($statistics['average_grade'], 2) . '</p>';
        $html .= '<p>Highest Grade: ' . $statistics['highest_grade'] . '</p>';
        $html .= '<p>Lowest Grade: ' . $statistics['lowest_grade'] . '</p>';
        $html .= '<p>Passing Rate: ' . round($statistics['passing_rate'], 2) . '%</p></div>';

        $html .= '<table><thead><tr><th>Student</th><th>Subject</th><th>Grade</th><th>Period</th><th>Year</th></tr></thead><tbody>';
        foreach ($grades->take(100) as $grade) {
            $html .= '<tr>';
            $html .= '<td>' . ($grade->student ? $grade->student->name : 'N/A') . '</td>';
            $html .= '<td>' . ($grade->subject ? $grade->subject->name : 'N/A') . '</td>';
            $html .= '<td>' . $grade->grade . '</td>';
            $html .= '<td>' . ($grade->gradingPeriod ? $grade->gradingPeriod->name : 'N/A') . '</td>';
            $html .= '<td>' . $grade->school_year . '</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table></body></html>';

        $pdf = \PDF::loadHTML($html);
        $filename = 'academic_performance_report_' . now()->format('Y-m-d_H-i-s') . '.pdf';

        Log::info('[Principal Reports] Academic Performance PDF - File Details', [
            'filename' => $filename,
            'record_count' => $grades->count(),
        ]);

        return $pdf->download($filename);
    }

    private function generateAcademicPerformanceExcel($grades, $statistics)
    {
        $filename = 'academic_performance_report_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        Log::info('[Principal Reports] Academic Performance Excel - File Details', [
            'filename' => $filename,
            'record_count' => $grades->count(),
        ]);

        return Excel::download(new GradeReportExport($grades, $statistics), $filename);
    }

    private function generateAcademicPerformanceCSV($grades, $statistics)
    {
        $filename = 'academic_performance_report_' . now()->format('Y-m-d_H-i-s') . '.csv';

        Log::info('[Principal Reports] Academic Performance CSV - File Details', [
            'filename' => $filename,
            'record_count' => $grades->count(),
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($grades, $statistics) {
            $file = fopen('php://output', 'w');

            // Write headers
            fputcsv($file, ['Student Name', 'Student Number', 'Subject', 'Academic Level', 'Grading Period', 'School Year', 'Grade', 'Year of Study']);

            // Write grade data
            foreach ($grades as $grade) {
                fputcsv($file, [
                    $grade->student ? $grade->student->name : 'N/A',
                    $grade->student ? $grade->student->student_number : 'N/A',
                    $grade->subject ? $grade->subject->name : 'N/A',
                    $grade->academicLevel ? $grade->academicLevel->name : 'N/A',
                    $grade->gradingPeriod ? $grade->gradingPeriod->name : 'N/A',
                    $grade->school_year ?? 'N/A',
                    $grade->grade ?? 'N/A',
                    $grade->year_of_study ?? 'N/A',
                ]);
            }

            // Write statistics
            fputcsv($file, []);
            fputcsv($file, ['Statistics']);
            fputcsv($file, ['Total Records', $statistics['total_records']]);
            fputcsv($file, ['Average Grade', round($statistics['average_grade'], 2)]);
            fputcsv($file, ['Highest Grade', $statistics['highest_grade']]);
            fputcsv($file, ['Lowest Grade', $statistics['lowest_grade']]);
            fputcsv($file, ['Passing Rate', round($statistics['passing_rate'], 2) . '%']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportGradeTrends($format, Request $request)
    {
        $startTime = microtime(true);
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Grade Trends Export - Request Start', [
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'export_format' => $format,
            'request_ip' => $request->ip(),
        ]);

        try {
            $filters = $request->only(['academic_level_id', 'strand_id', 'year']);

            Log::info('[Principal Reports] Grade Trends Export - Filters Applied', [
                'filters' => $filters,
            ]);

            $queryStartTime = microtime(true);

            $query = StudentGrade::with(['academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);

            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
            }

            if (!empty($filters['strand_id'])) {
                $query->whereHas('student', function ($q) use ($filters) {
                    $q->where('strand_id', $filters['strand_id']);
                });
            }

            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }

            $trends = $query->selectRaw('
                    grading_period_id,
                    AVG(grade) as average_grade,
                    COUNT(*) as total_grades,
                    COUNT(CASE WHEN grade >= 75 THEN 1 END) as passing_count,
                    MAX(grade) as highest_grade,
                    MIN(grade) as lowest_grade
                ')
                ->groupBy('grading_period_id')
                ->with('gradingPeriod')
                ->get();

            $queryEndTime = microtime(true);

            Log::info('[Principal Reports] Grade Trends Export - Query Executed', [
                'query_execution_time_ms' => round(($queryEndTime - $queryStartTime) * 1000, 2),
                'total_trend_records' => $trends->count(),
                'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            ]);

            $fileStartTime = microtime(true);

            if ($format === 'pdf') {
                $response = $this->generateGradeTrendsPDF($trends, $filters, $principalAcademicLevel);
            } elseif ($format === 'excel') {
                $response = $this->generateGradeTrendsExcel($trends);
            } elseif ($format === 'csv') {
                $response = $this->generateGradeTrendsCSV($trends);
            } else {
                return back()->with('error', 'Invalid export format.');
            }

            $fileEndTime = microtime(true);
            $totalTime = microtime(true) - $startTime;

            Log::info('[Principal Reports] Grade Trends Export - Success', [
                'file_generation_time_ms' => round(($fileEndTime - $fileStartTime) * 1000, 2),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
                'format' => $format,
            ]);

            return $response;

        } catch (\Exception $e) {
            $totalTime = microtime(true) - $startTime;

            Log::error('[Principal Reports] Grade Trends Export - Error', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
            ]);

            return back()->with('error', 'An error occurred while generating the report: ' . $e->getMessage());
        }
    }

    private function generateGradeTrendsPDF($trends, $filters, $principalAcademicLevel)
    {
        $html = '<html><head><style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
        </style></head><body>';

        $html .= '<h1>Grade Trends Report</h1>';
        $html .= '<p>Generated: ' . now()->format('F d, Y h:i A') . '</p>';
        $html .= '<p>Academic Level: ' . ($principalAcademicLevel ? $principalAcademicLevel->name : 'N/A') . '</p>';

        $html .= '<table><thead><tr><th>Period</th><th>Avg Grade</th><th>Total</th><th>Passing</th><th>Rate %</th></tr></thead><tbody>';
        foreach ($trends as $trend) {
            $html .= '<tr>';
            $html .= '<td>' . ($trend->gradingPeriod ? $trend->gradingPeriod->name : 'N/A') . '</td>';
            $html .= '<td>' . round($trend->average_grade, 2) . '</td>';
            $html .= '<td>' . $trend->total_grades . '</td>';
            $html .= '<td>' . $trend->passing_count . '</td>';
            $html .= '<td>' . round(($trend->passing_count / $trend->total_grades) * 100, 2) . '%</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table></body></html>';

        $pdf = \PDF::loadHTML($html);
        $filename = 'grade_trends_report_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        Log::info('[Principal Reports] Grade Trends PDF Generated', ['filename' => $filename]);
        return $pdf->download($filename);
    }

    private function generateGradeTrendsExcel($trends)
    {
        $filename = 'grade_trends_report_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        Log::info('[Principal Reports] Grade Trends Excel Generated', ['filename' => $filename]);

        $data = $trends->map(function($trend) {
            return [
                'Grading Period' => $trend->gradingPeriod ? $trend->gradingPeriod->name : 'N/A',
                'Average Grade' => round($trend->average_grade, 2),
                'Total Grades' => $trend->total_grades,
                'Passing Count' => $trend->passing_count,
                'Passing Rate %' => round(($trend->passing_count / $trend->total_grades) * 100, 2),
                'Highest Grade' => $trend->highest_grade,
                'Lowest Grade' => $trend->lowest_grade,
            ];
        });

        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings {
            protected $data;
            public function __construct($data) { $this->data = $data; }
            public function collection() { return $this->data; }
            public function headings(): array {
                return ['Grading Period', 'Average Grade', 'Total Grades', 'Passing Count', 'Passing Rate %', 'Highest Grade', 'Lowest Grade'];
            }
        }, $filename);
    }

    private function generateGradeTrendsCSV($trends)
    {
        $filename = 'grade_trends_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        Log::info('[Principal Reports] Grade Trends CSV Generated', ['filename' => $filename]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($trends) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Grading Period', 'Average Grade', 'Total Grades', 'Passing Count', 'Passing Rate %', 'Highest Grade', 'Lowest Grade']);

            foreach ($trends as $trend) {
                fputcsv($file, [
                    $trend->gradingPeriod ? $trend->gradingPeriod->name : 'N/A',
                    round($trend->average_grade, 2),
                    $trend->total_grades,
                    $trend->passing_count,
                    round(($trend->passing_count / $trend->total_grades) * 100, 2),
                    $trend->highest_grade,
                    $trend->lowest_grade,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportHonorStatistics($format, Request $request)
    {
        $startTime = microtime(true);
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        Log::info('[Principal Reports] Honor Statistics Export - Request Start', [
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'export_format' => $format,
            'request_ip' => $request->ip(),
        ]);

        try {
            $filters = $request->only(['academic_level_id', 'honor_type_id', 'year', 'period']);

            Log::info('[Principal Reports] Honor Statistics Export - Filters Applied', [
                'filters' => $filters,
            ]);

            $queryStartTime = microtime(true);

            $query = HonorResult::with(['student', 'honorType', 'academicLevel', 'gradingPeriod'])
                ->where('is_approved', true);

            if ($principalAcademicLevel) {
                $query->where('academic_level_id', $principalAcademicLevel->id);
            }

            if (!empty($filters['honor_type_id'])) {
                $query->where('honor_type_id', $filters['honor_type_id']);
            }

            if (!empty($filters['year'])) {
                $query->where('school_year', $filters['year']);
            }

            if (!empty($filters['period'])) {
                $query->where('grading_period_id', $filters['period']);
            }

            $honors = $query->get();
            $queryEndTime = microtime(true);

            Log::info('[Principal Reports] Honor Statistics Export - Query Executed', [
                'query_execution_time_ms' => round(($queryEndTime - $queryStartTime) * 1000, 2),
                'total_honors_retrieved' => $honors->count(),
                'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            ]);

            $gpaValues = $honors->pluck('gpa')->filter();
            $stats = [
                'total_honors' => $honors->count(),
                'by_type' => $honors->groupBy('honorType.name')->map->count(),
                'average_gpa' => $gpaValues->count() > 0 ? $gpaValues->avg() : 0,
            ];

            $fileStartTime = microtime(true);

            if ($format === 'pdf') {
                $response = $this->generateHonorStatisticsPDF($honors, $stats, $filters, $principalAcademicLevel);
            } elseif ($format === 'excel') {
                $response = $this->generateHonorStatisticsExcel($honors, $stats);
            } elseif ($format === 'csv') {
                $response = $this->generateHonorStatisticsCSV($honors, $stats);
            } else {
                return back()->with('error', 'Invalid export format.');
            }

            $fileEndTime = microtime(true);
            $totalTime = microtime(true) - $startTime;

            Log::info('[Principal Reports] Honor Statistics Export - Success', [
                'file_generation_time_ms' => round(($fileEndTime - $fileStartTime) * 1000, 2),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
                'format' => $format,
            ]);

            return $response;

        } catch (\Exception $e) {
            $totalTime = microtime(true) - $startTime;

            Log::error('[Principal Reports] Honor Statistics Export - Error', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'total_execution_time_ms' => round($totalTime * 1000, 2),
            ]);

            return back()->with('error', 'An error occurred while generating the report: ' . $e->getMessage());
        }
    }

    private function generateHonorStatisticsPDF($honors, $stats, $filters, $principalAcademicLevel)
    {
        $html = '<html><head><style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            .stats { margin-top: 20px; }
        </style></head><body>';

        $html .= '<h1>Honor Statistics Report</h1>';
        $html .= '<p>Generated: ' . now()->format('F d, Y h:i A') . '</p>';
        $html .= '<p>Academic Level: ' . ($principalAcademicLevel ? $principalAcademicLevel->name : 'N/A') . '</p>';

        $html .= '<div class="stats"><h2>Statistics</h2>';
        $html .= '<p>Total Honors: ' . $stats['total_honors'] . '</p>';
        $html .= '<p>Average GPA: ' . round($stats['average_gpa'], 2) . '</p></div>';

        $html .= '<table><thead><tr><th>Student</th><th>Honor Type</th><th>GPA</th><th>Period</th><th>Year</th></tr></thead><tbody>';
        foreach ($honors as $honor) {
            $html .= '<tr>';
            $html .= '<td>' . ($honor->student ? $honor->student->name : 'N/A') . '</td>';
            $html .= '<td>' . ($honor->honorType ? $honor->honorType->name : 'N/A') . '</td>';
            $html .= '<td>' . $honor->gpa . '</td>';
            $html .= '<td>' . ($honor->gradingPeriod ? $honor->gradingPeriod->name : 'N/A') . '</td>';
            $html .= '<td>' . $honor->school_year . '</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table></body></html>';

        $pdf = \PDF::loadHTML($html);
        $filename = 'honor_statistics_report_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        Log::info('[Principal Reports] Honor Statistics PDF Generated', ['filename' => $filename]);
        return $pdf->download($filename);
    }

    private function generateHonorStatisticsExcel($honors, $stats)
    {
        $filename = 'honor_statistics_report_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        Log::info('[Principal Reports] Honor Statistics Excel Generated', ['filename' => $filename]);

        $data = $honors->map(function($honor) {
            return [
                'Student Name' => $honor->student ? $honor->student->name : 'N/A',
                'Student Number' => $honor->student ? $honor->student->student_number : 'N/A',
                'Honor Type' => $honor->honorType ? $honor->honorType->name : 'N/A',
                'GPA' => $honor->gpa,
                'Academic Level' => $honor->academicLevel ? $honor->academicLevel->name : 'N/A',
                'Grading Period' => $honor->gradingPeriod ? $honor->gradingPeriod->name : 'N/A',
                'School Year' => $honor->school_year,
            ];
        });

        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings {
            protected $data;
            public function __construct($data) { $this->data = $data; }
            public function collection() { return $this->data; }
            public function headings(): array {
                return ['Student Name', 'Student Number', 'Honor Type', 'GPA', 'Academic Level', 'Grading Period', 'School Year'];
            }
        }, $filename);
    }

    private function generateHonorStatisticsCSV($honors, $stats)
    {
        $filename = 'honor_statistics_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        Log::info('[Principal Reports] Honor Statistics CSV Generated', ['filename' => $filename]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($honors, $stats) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student Name', 'Student Number', 'Honor Type', 'GPA', 'Academic Level', 'Grading Period', 'School Year']);

            foreach ($honors as $honor) {
                fputcsv($file, [
                    $honor->student ? $honor->student->name : 'N/A',
                    $honor->student ? $honor->student->student_number : 'N/A',
                    $honor->honorType ? $honor->honorType->name : 'N/A',
                    $honor->gpa,
                    $honor->academicLevel ? $honor->academicLevel->name : 'N/A',
                    $honor->gradingPeriod ? $honor->gradingPeriod->name : 'N/A',
                    $honor->school_year,
                ]);
            }

            fputcsv($file, []);
            fputcsv($file, ['Statistics']);
            fputcsv($file, ['Total Honors', $stats['total_honors']]);
            fputcsv($file, ['Average GPA', round($stats['average_gpa'], 2)]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function calculateGradeDistribution($gradeValues)
    {
        if ($gradeValues->count() === 0) {
            return [];
        }

        return [
            '95-100 (Excellent)' => $gradeValues->filter(function($grade) { return $grade >= 95 && $grade <= 100; })->count(),
            '90-94 (Very Good)' => $gradeValues->filter(function($grade) { return $grade >= 90 && $grade <= 94; })->count(),
            '85-89 (Good)' => $gradeValues->filter(function($grade) { return $grade >= 85 && $grade <= 89; })->count(),
            '80-84 (Satisfactory)' => $gradeValues->filter(function($grade) { return $grade >= 80 && $grade <= 84; })->count(),
            '75-79 (Fair)' => $gradeValues->filter(function($grade) { return $grade >= 75 && $grade <= 79; })->count(),
            'Below 75 (Failing)' => $gradeValues->filter(function($grade) { return $grade < 75; })->count(),
        ];
    }

    private function calculateSubjectAverages($grades)
    {
        return $grades->groupBy('subject.name')
            ->map(function ($subjectGrades) {
                $gradeValues = $subjectGrades->pluck('grade')->filter();
                return [
                    'subject' => $subjectGrades->first()->subject->name,
                    'average' => $gradeValues->count() > 0 ? $gradeValues->avg() : 0,
                    'count' => $gradeValues->count(),
                ];
            })
            ->values()
            ->toArray();
    }
    
    // API methods
    public function getPerformanceData(Request $request)
    {
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        $filters = $request->only(['academic_level_id', 'course_id', 'year', 'period']);

        $query = StudentGrade::where('is_approved', true);

        // Auto-filter by principal's academic level
        if ($principalAcademicLevel) {
            $query->where('academic_level_id', $principalAcademicLevel->id);
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
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        $filters = $request->only(['academic_level_id', 'course_id', 'year']);

        $query = StudentGrade::where('is_approved', true);

        // Auto-filter by principal's academic level
        if ($principalAcademicLevel) {
            $query->where('academic_level_id', $principalAcademicLevel->id);
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
        $user = Auth::user();
        $principalAcademicLevel = AcademicLevel::where('key', $user->year_level)->first();

        $filters = $request->only(['academic_level_id', 'honor_type_id', 'year']);

        $query = HonorResult::where('is_approved', true);

        // Auto-filter by principal's academic level
        if ($principalAcademicLevel) {
            $query->where('academic_level_id', $principalAcademicLevel->id);
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
