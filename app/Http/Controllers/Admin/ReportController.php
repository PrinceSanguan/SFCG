<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Grade;
use App\Models\StudentHonor;
use App\Models\AcademicPeriod;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\ActivityLog;

class ReportController extends Controller
{
    public function index()
    {
        $reportTypes = [
            'student_grades' => 'Student Grades Report',
            'honor_roll' => 'Honor Roll Report',
            'enrollment' => 'Enrollment Report',
            'instructor_performance' => 'Instructor Performance Report',
            'academic_summary' => 'Academic Summary Report',
            'user_activity' => 'User Activity Report',
        ];

        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('name')->get();

        return Inertia::render('Admin/Reports/Index', [
            'reportTypes' => $reportTypes,
            'academicPeriods' => $academicPeriods,
            'academicLevels' => $academicLevels
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:student_grades,honor_roll,enrollment,instructor_performance,academic_summary,user_activity',
            'academic_period_id' => 'nullable|exists:academic_periods,id',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
            'format' => 'required|in:view,csv,pdf',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $reportData = $this->generateReportData($request);

        if ($request->format === 'view') {
            return Inertia::render('Admin/Reports/View', [
                'reportData' => $reportData,
                'reportType' => $request->report_type,
                'filters' => $request->only(['academic_period_id', 'academic_level_id', 'date_from', 'date_to'])
            ]);
        } elseif ($request->format === 'csv') {
            return $this->exportCsv($reportData, $request->report_type);
        } else {
            return $this->exportPdf($reportData, $request->report_type);
        }
    }

    public function export()
    {
        $exportOptions = [
            'all_users' => 'All Users',
            'students' => 'Students Only',
            'instructors' => 'Instructors Only',
            'grades' => 'All Grades',
            'honors' => 'Honor Roll Data',
            'activity_logs' => 'Activity Logs',
        ];

        return Inertia::render('Admin/Reports/Export', [
            'exportOptions' => $exportOptions
        ]);
    }

    public function exportData(Request $request)
    {
        $request->validate([
            'export_type' => 'required|in:all_users,students,instructors,grades,honors,activity_logs',
            'format' => 'required|in:csv,json',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $data = $this->getExportData($request);
        
        ActivityLog::logActivity(
            Auth::user(),
            'exported_data',
            'Report',
            null,
            null,
            [
                'export_type' => $request->export_type,
                'format' => $request->format,
                'record_count' => count($data)
            ]
        );

        if ($request->format === 'csv') {
            return $this->exportDataCsv($data, $request->export_type);
        } else {
            return $this->exportDataJson($data, $request->export_type);
        }
    }

    private function generateReportData(Request $request)
    {
        switch ($request->report_type) {
            case 'student_grades':
                return $this->generateStudentGradesReport($request);
            case 'honor_roll':
                return $this->generateHonorRollReport($request);
            case 'enrollment':
                return $this->generateEnrollmentReport($request);
            case 'instructor_performance':
                return $this->generateInstructorPerformanceReport($request);
            case 'academic_summary':
                return $this->generateAcademicSummaryReport($request);
            case 'user_activity':
                return $this->generateUserActivityReport($request);
            default:
                return [];
        }
    }

    private function generateStudentGradesReport(Request $request)
    {
        $query = Grade::with(['student.studentProfile', 'subject', 'academicPeriod', 'instructor'])
                     ->where('status', 'approved');

        if ($request->academic_period_id) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->academic_level_id) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        $grades = $query->get();

        return [
            'title' => 'Student Grades Report',
            'data' => $grades,
            'summary' => [
                'total_grades' => $grades->count(),
                'average_grade' => $grades->avg('final_grade'),
                'highest_grade' => $grades->max('final_grade'),
                'lowest_grade' => $grades->min('final_grade'),
            ]
        ];
    }

    private function generateHonorRollReport(Request $request)
    {
        $query = StudentHonor::with(['student.studentProfile', 'honorCriterion', 'academicPeriod'])
                            ->where('is_active', true);

        if ($request->academic_period_id) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->academic_level_id) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        $honors = $query->get();

        return [
            'title' => 'Honor Roll Report',
            'data' => $honors,
            'summary' => [
                'total_honors' => $honors->count(),
                'by_type' => $honors->groupBy('honorCriterion.honor_type')->map->count(),
                'average_gpa' => $honors->avg('gpa'),
            ]
        ];
    }

    private function generateEnrollmentReport(Request $request)
    {
        $query = User::where('user_role', 'student')->with('studentProfile');

        if ($request->academic_level_id) {
            $query->whereHas('studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        $students = $query->get();

        return [
            'title' => 'Enrollment Report',
            'data' => $students,
            'summary' => [
                'total_students' => $students->count(),
                'by_level' => $students->groupBy('studentProfile.academicLevel.name')->map->count(),
                'by_status' => $students->groupBy('studentProfile.enrollment_status')->map->count(),
                'by_section' => $students->groupBy('studentProfile.section')->map->count(),
            ]
        ];
    }

    private function generateInstructorPerformanceReport(Request $request)
    {
        $instructors = User::whereIn('user_role', ['instructor', 'teacher'])
                          ->withCount(['assignedGrades' => function ($query) use ($request) {
                              if ($request->academic_period_id) {
                                  $query->where('academic_period_id', $request->academic_period_id);
                              }
                          }])
                          ->with(['assignedGrades' => function ($query) use ($request) {
                              $query->where('status', 'approved');
                              if ($request->academic_period_id) {
                                  $query->where('academic_period_id', $request->academic_period_id);
                              }
                          }])
                          ->get();

        return [
            'title' => 'Instructor Performance Report',
            'data' => $instructors,
            'summary' => [
                'total_instructors' => $instructors->count(),
                'total_grades_given' => $instructors->sum('assigned_grades_count'),
                'average_grades_per_instructor' => $instructors->avg('assigned_grades_count'),
            ]
        ];
    }

    private function generateAcademicSummaryReport(Request $request)
    {
        $period = null;
        if ($request->academic_period_id) {
            $period = AcademicPeriod::find($request->academic_period_id);
        }

        $data = [
            'period' => $period,
            'total_students' => User::where('user_role', 'student')->count(),
            'total_instructors' => User::whereIn('user_role', ['instructor', 'teacher'])->count(),
            'total_subjects' => Subject::count(),
            'total_grades' => Grade::where('status', 'approved')->count(),
            'total_honors' => StudentHonor::where('is_active', true)->count(),
            'grade_distribution' => $this->getGradeDistribution($request->academic_period_id),
            'honor_distribution' => $this->getHonorDistribution($request->academic_period_id),
        ];

        return [
            'title' => 'Academic Summary Report',
            'data' => $data,
            'summary' => $data
        ];
    }

    private function generateUserActivityReport(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->orderBy('created_at', 'desc')->get();

        return [
            'title' => 'User Activity Report',
            'data' => $activities,
            'summary' => [
                'total_activities' => $activities->count(),
                'by_action' => $activities->groupBy('action')->map->count(),
                'by_user' => $activities->groupBy('user.name')->map->count(),
                'by_date' => $activities->groupBy(function ($item) {
                    return $item->created_at->format('Y-m-d');
                })->map->count(),
            ]
        ];
    }

    private function getExportData(Request $request)
    {
        switch ($request->export_type) {
            case 'all_users':
                return User::with('studentProfile')->get();
            case 'students':
                return User::where('user_role', 'student')->with('studentProfile')->get();
            case 'instructors':
                return User::whereIn('user_role', ['instructor', 'teacher'])->get();
            case 'grades':
                return Grade::with(['student', 'subject', 'academicPeriod', 'instructor'])
                           ->where('status', 'approved')
                           ->get();
            case 'honors':
                return StudentHonor::with(['student', 'honorCriterion', 'academicPeriod'])
                                 ->where('is_active', true)
                                 ->get();
            case 'activity_logs':
                $query = ActivityLog::with('user');
                if ($request->date_from) {
                    $query->whereDate('created_at', '>=', $request->date_from);
                }
                if ($request->date_to) {
                    $query->whereDate('created_at', '<=', $request->date_to);
                }
                return $query->get();
            default:
                return [];
        }
    }

    private function exportCsv($reportData, $reportType)
    {
        $filename = "{$reportType}_report_" . now()->format('Y-m-d_H-i-s') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($reportData) {
            $file = fopen('php://output', 'w');
            
            if (!empty($reportData['data'])) {
                // Write headers based on data type
                $firstRow = $reportData['data']->first();
                if ($firstRow) {
                    fputcsv($file, array_keys($firstRow->toArray()));
                    
                    // Write data
                    foreach ($reportData['data'] as $row) {
                        fputcsv($file, array_values($row->toArray()));
                    }
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportDataCsv($data, $exportType)
    {
        $filename = "{$exportType}_export_" . now()->format('Y-m-d_H-i-s') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            
            if (!empty($data) && $data->count() > 0) {
                $firstRow = $data->first();
                fputcsv($file, array_keys($firstRow->toArray()));
                
                foreach ($data as $row) {
                    fputcsv($file, array_values($row->toArray()));
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportDataJson($data, $exportType)
    {
        $filename = "{$exportType}_export_" . now()->format('Y-m-d_H-i-s') . ".json";
        
        return response()->json($data)
                        ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    private function exportPdf($reportData, $reportType)
    {
        // Placeholder for PDF export - would use a library like dompdf
        return response()->json(['message' => 'PDF export feature coming soon']);
    }

    private function getGradeDistribution($academicPeriodId = null)
    {
        $query = Grade::where('status', 'approved');
        
        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        return $query->selectRaw('
            CASE 
                WHEN final_grade >= 97 THEN "A+" 
                WHEN final_grade >= 93 THEN "A"
                WHEN final_grade >= 90 THEN "A-"
                WHEN final_grade >= 87 THEN "B+"
                WHEN final_grade >= 83 THEN "B"
                WHEN final_grade >= 80 THEN "B-"
                WHEN final_grade >= 77 THEN "C+"
                WHEN final_grade >= 73 THEN "C"
                WHEN final_grade >= 70 THEN "C-"
                ELSE "Below C-"
            END as grade_letter,
            COUNT(*) as count
        ')
        ->groupBy('grade_letter')
        ->pluck('count', 'grade_letter');
    }

    private function getHonorDistribution($academicPeriodId = null)
    {
        $query = StudentHonor::with('honorCriterion')->where('is_active', true);
        
        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        return $query->get()
                    ->groupBy('honorCriterion.honor_type')
                    ->map->count();
    }
}
