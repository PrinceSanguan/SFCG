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
        $query = Grade::with(['student.studentProfile.academicLevel', 'subject', 'academicPeriod', 'instructor'])
                     ->whereIn('status', ['approved', 'finalized']);

        if ($request->academic_period_id) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->academic_level_id) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $grades = $query->get();

        // Calculate additional statistics
        $gradeDistribution = $this->getGradeDistribution($request->academic_period_id);
        $bySubject = $grades->groupBy('subject.name')->map(function ($subjectGrades) {
            return [
                'count' => $subjectGrades->count(),
                'average' => $subjectGrades->avg('overall_grade'),
                'highest' => $subjectGrades->max('overall_grade'),
                'lowest' => $subjectGrades->min('overall_grade'),
            ];
        });

        $byLevel = $grades->groupBy('student.studentProfile.academicLevel.name')->map(function ($levelGrades) {
            return [
                'count' => $levelGrades->count(),
                'average' => $levelGrades->avg('overall_grade'),
            ];
        });

        return [
            'title' => 'Student Grades Report',
            'data' => $grades,
            'summary' => [
                'total_grades' => $grades->count(),
                'average_grade' => $grades->avg('overall_grade'),
                'highest_grade' => $grades->max('overall_grade'),
                'lowest_grade' => $grades->min('overall_grade'),
                'grade_distribution' => $gradeDistribution,
                'by_subject' => $bySubject,
                'by_level' => $byLevel,
                'passing_rate' => $grades->where('overall_grade', '>=', 75)->count() / max($grades->count(), 1) * 100,
            ]
        ];
    }

    private function generateHonorRollReport(Request $request)
    {
        $query = StudentHonor::with(['student.studentProfile.academicLevel', 'honorCriterion', 'academicPeriod'])
                            ->where('is_active', true);

        if ($request->academic_period_id) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->academic_level_id) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        if ($request->date_from) {
            $query->whereDate('awarded_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('awarded_date', '<=', $request->date_to);
        }

        $honors = $query->get();

        // Calculate additional statistics
        $byType = $honors->groupBy('honorCriterion.honor_type')->map->count();
        $byLevel = $honors->groupBy('student.studentProfile.academicLevel.name')->map->count();
        $byPeriod = $honors->groupBy('academicPeriod.name')->map->count();

        return [
            'title' => 'Honor Roll Report',
            'data' => $honors,
            'summary' => [
                'total_honors' => $honors->count(),
                'by_type' => $byType,
                'by_level' => $byLevel,
                'by_period' => $byPeriod,
                'average_gpa' => $honors->avg('gpa'),
                'highest_gpa' => $honors->max('gpa'),
                'approved_count' => $honors->where('is_approved', true)->count(),
                'pending_count' => $honors->where('is_approved', false)->count(),
            ]
        ];
    }

    private function generateEnrollmentReport(Request $request)
    {
        $query = User::where('user_role', 'student')
                    ->with(['studentProfile.academicLevel']);

        if ($request->academic_level_id) {
            $query->whereHas('studentProfile', function ($q) use ($request) {
                $q->where('academic_level_id', $request->academic_level_id);
            });
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $students = $query->get();

        // Calculate additional statistics
        $byLevel = $students->groupBy('studentProfile.academicLevel.name')->map->count();
        $bySection = $students->groupBy('studentProfile.section')->map->count();
        $byStatus = $students->groupBy('studentProfile.enrollment_status')->map->count();
        $byStrand = $students->groupBy('studentProfile.academicStrand.name')->map->count();

        // Gender distribution (if available)
        $byGender = $students->groupBy('studentProfile.gender')->map->count();

        return [
            'title' => 'Enrollment Report',
            'data' => $students,
            'summary' => [
                'total_students' => $students->count(),
                'by_level' => $byLevel,
                'by_section' => $bySection,
                'by_status' => $byStatus,
                'by_strand' => $byStrand,
                'by_gender' => $byGender,
                'new_enrollments' => $students->where('created_at', '>=', now()->subDays(30))->count(),
                'active_students' => $students->where('studentProfile.enrollment_status', 'active')->count(),
            ]
        ];
    }

    private function generateInstructorPerformanceReport(Request $request)
    {
        $instructors = User::whereIn('user_role', ['instructor', 'teacher'])
                          ->withCount(['assignedGrades' => function ($query) use ($request) {
                              $query->whereIn('status', ['approved', 'finalized']);
                              if ($request->academic_period_id) {
                                  $query->where('academic_period_id', $request->academic_period_id);
                              }
                              if ($request->date_from) {
                                  $query->whereDate('created_at', '>=', $request->date_from);
                              }
                              if ($request->date_to) {
                                  $query->whereDate('created_at', '<=', $request->date_to);
                              }
                          }])
                          ->with(['assignedGrades' => function ($query) use ($request) {
                              $query->whereIn('status', ['approved', 'finalized']);
                              if ($request->academic_period_id) {
                                  $query->where('academic_period_id', $request->academic_period_id);
                              }
                              if ($request->date_from) {
                                  $query->whereDate('created_at', '>=', $request->date_from);
                              }
                              if ($request->date_to) {
                                  $query->whereDate('created_at', '<=', $request->date_to);
                              }
                          }])
                          ->get();

        // Calculate performance metrics
        $performanceData = $instructors->map(function ($instructor) {
            $grades = $instructor->assignedGrades;
            $averageGrade = $grades->avg('overall_grade');
            $passingRate = $grades->where('overall_grade', '>=', 75)->count() / max($grades->count(), 1) * 100;
            
            return [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'user_role' => $instructor->user_role,
                'assigned_grades_count' => $instructor->assigned_grades_count,
                'average_grade_given' => $averageGrade,
                'passing_rate' => $passingRate,
                'subjects_taught' => $grades->unique('subject_id')->count(),
            ];
        });

        return [
            'title' => 'Instructor Performance Report',
            'data' => $performanceData,
            'summary' => [
                'total_instructors' => $instructors->count(),
                'total_grades_given' => $instructors->sum('assigned_grades_count'),
                'average_grades_per_instructor' => $instructors->avg('assigned_grades_count'),
                'overall_average_grade' => $instructors->flatMap->assignedGrades->avg('overall_grade'),
                'overall_passing_rate' => $instructors->flatMap->assignedGrades->where('overall_grade', '>=', 75)->count() / max($instructors->flatMap->assignedGrades->count(), 1) * 100,
                'by_role' => $instructors->groupBy('user_role')->map->count(),
            ]
        ];
    }

    private function generateAcademicSummaryReport(Request $request)
    {
        $period = null;
        if ($request->academic_period_id) {
            $period = AcademicPeriod::find($request->academic_period_id);
        }

        // Get comprehensive academic data
        $totalStudents = User::where('user_role', 'student')->count();
        $totalInstructors = User::whereIn('user_role', ['instructor', 'teacher'])->count();
        $totalSubjects = Subject::count();
        $totalGrades = Grade::whereIn('status', ['approved', 'finalized'])->count();
        $totalHonors = StudentHonor::where('is_active', true)->count();

        // Get grade and honor distributions
        $gradeDistribution = $this->getGradeDistribution($request->academic_period_id);
        $honorDistribution = $this->getHonorDistribution($request->academic_period_id);

        // Calculate additional metrics
        $averageGrade = Grade::whereIn('status', ['approved', 'finalized'])->avg('overall_grade');
        $passingRate = Grade::whereIn('status', ['approved', 'finalized'])->where('overall_grade', '>=', 75)->count() / max(Grade::whereIn('status', ['approved', 'finalized'])->count(), 1) * 100;

        // Enrollment trends
        $recentEnrollments = User::where('user_role', 'student')
                                ->where('created_at', '>=', now()->subDays(30))
                                ->count();

        $data = [
            'period' => $period,
            'total_students' => $totalStudents,
            'total_instructors' => $totalInstructors,
            'total_subjects' => $totalSubjects,
            'total_grades' => $totalGrades,
            'total_honors' => $totalHonors,
            'grade_distribution' => $gradeDistribution,
            'honor_distribution' => $honorDistribution,
            'average_grade' => $averageGrade,
            'passing_rate' => $passingRate,
            'recent_enrollments' => $recentEnrollments,
            'academic_levels' => AcademicLevel::withCount('studentProfiles')->get(),
            'subjects_by_level' => Subject::with('academicLevel')->get()->groupBy('academicLevel.name')->map->count(),
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

        // Calculate activity statistics
        $byAction = $activities->groupBy('action')->map->count();
        $byUser = $activities->groupBy('user.name')->map->count();
        $byDate = $activities->groupBy(function ($item) {
            return $item->created_at->format('Y-m-d');
        })->map->count();
        $byModel = $activities->groupBy('model_type')->map->count();

        // Most active users
        $mostActiveUsers = $activities->groupBy('user.name')
                                    ->map->count()
                                    ->sortDesc()
                                    ->take(10);

        // Recent activity trends
        $recentActivity = $activities->where('created_at', '>=', now()->subDays(7))->count();

        return [
            'title' => 'User Activity Report',
            'data' => $activities,
            'summary' => [
                'total_activities' => $activities->count(),
                'by_action' => $byAction,
                'by_user' => $byUser,
                'by_date' => $byDate,
                'by_model' => $byModel,
                'most_active_users' => $mostActiveUsers,
                'recent_activity' => $recentActivity,
                'unique_users' => $activities->unique('user_id')->count(),
                'average_activities_per_user' => $activities->count() / max($activities->unique('user_id')->count(), 1),
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
        $filename = strtolower(str_replace(' ', '_', $reportData['title'])) . '_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($reportData, $reportType) {
            $file = fopen('php://output', 'w');
            
            // Write report header
            fputcsv($file, [$reportData['title']]);
            fputcsv($file, ['Generated on: ' . date('Y-m-d H:i:s')]);
            fputcsv($file, []); // Empty line
            
            // Write summary
            fputcsv($file, ['SUMMARY']);
            foreach ($reportData['summary'] as $key => $value) {
                if (is_array($value)) {
                    fputcsv($file, [ucfirst(str_replace('_', ' ', $key)) . ':']);
                    foreach ($value as $subKey => $subValue) {
                        fputcsv($file, ['  ' . $subKey . ': ' . $subValue]);
                    }
                } else {
                    fputcsv($file, [ucfirst(str_replace('_', ' ', $key)) . ': ' . $value]);
                }
            }
            fputcsv($file, []); // Empty line
            
            // Write data headers and content based on report type
            switch ($reportType) {
                case 'student_grades':
                    fputcsv($file, ['Student ID', 'Student Name', 'Subject', 'Instructor', 'Academic Period', 'Overall Grade', 'Status']);
                    foreach ($reportData['data'] as $grade) {
                        fputcsv($file, [
                            $grade->student->studentProfile->student_id ?? 'N/A',
                            $grade->student->name ?? 'N/A',
                            $grade->subject->name ?? 'N/A',
                            $grade->instructor->name ?? 'N/A',
                            $grade->academicPeriod->name ?? 'N/A',
                            $grade->overall_grade ?? 'N/A',
                            $grade->status ?? 'N/A',
                        ]);
                    }
                    break;
                    
                case 'honor_roll':
                    fputcsv($file, ['Student ID', 'Student Name', 'Honor Type', 'GPA', 'Awarded Date', 'Status']);
                    foreach ($reportData['data'] as $honor) {
                        fputcsv($file, [
                            $honor->student->studentProfile->student_id ?? 'N/A',
                            $honor->student->name ?? 'N/A',
                            $honor->honorCriterion->honor_type ?? 'N/A',
                            $honor->gpa ?? 'N/A',
                            $honor->awarded_date ?? 'N/A',
                            $honor->is_approved ? 'Approved' : 'Pending',
                        ]);
                    }
                    break;
                    
                case 'enrollment':
                    fputcsv($file, ['Student ID', 'Student Name', 'Email', 'Academic Level', 'Section', 'Enrollment Status', 'Enrolled Date']);
                    foreach ($reportData['data'] as $student) {
                        fputcsv($file, [
                            $student->studentProfile->student_id ?? 'N/A',
                            $student->name ?? 'N/A',
                            $student->email ?? 'N/A',
                            $student->studentProfile->academicLevel->name ?? 'N/A',
                            $student->studentProfile->section ?? 'N/A',
                            $student->studentProfile->enrollment_status ?? 'N/A',
                            $student->created_at ?? 'N/A',
                        ]);
                    }
                    break;
                    
                case 'instructor_performance':
                    fputcsv($file, ['Instructor Name', 'Email', 'Role', 'Grades Given', 'Average Grade', 'Passing Rate', 'Subjects Taught']);
                    foreach ($reportData['data'] as $instructor) {
                        fputcsv($file, [
                            $instructor['name'] ?? 'N/A',
                            $instructor['email'] ?? 'N/A',
                            $instructor['user_role'] ?? 'N/A',
                            $instructor['assigned_grades_count'] ?? 'N/A',
                            number_format($instructor['average_grade_given'], 2) ?? 'N/A',
                            number_format($instructor['passing_rate'], 2) . '%' ?? 'N/A',
                            $instructor['subjects_taught'] ?? 'N/A',
                        ]);
                    }
                    break;
                    
                case 'academic_summary':
                    fputcsv($file, ['Metric', 'Value']);
                    fputcsv($file, ['Total Students', $reportData['summary']['total_students']]);
                    fputcsv($file, ['Total Instructors', $reportData['summary']['total_instructors']]);
                    fputcsv($file, ['Total Subjects', $reportData['summary']['total_subjects']]);
                    fputcsv($file, ['Total Grades', $reportData['summary']['total_grades']]);
                    fputcsv($file, ['Total Honors', $reportData['summary']['total_honors']]);
                    fputcsv($file, ['Average Grade', number_format($reportData['summary']['average_grade'], 2)]);
                    fputcsv($file, ['Passing Rate', number_format($reportData['summary']['passing_rate'], 2) . '%']);
                    fputcsv($file, ['Recent Enrollments', $reportData['summary']['recent_enrollments']]);
                    break;
                    
                case 'user_activity':
                    fputcsv($file, ['User', 'Action', 'Model Type', 'Date', 'Details']);
                    foreach ($reportData['data'] as $activity) {
                        fputcsv($file, [
                            $activity->user->name ?? 'N/A',
                            $activity->action ?? 'N/A',
                            $activity->model_type ?? 'N/A',
                            $activity->created_at ?? 'N/A',
                            $activity->description ?? 'N/A',
                        ]);
                    }
                    break;
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

        return $query->selectRaw("\n            CASE \n                WHEN final_grade >= 97 THEN 'A+' \n                WHEN final_grade >= 93 THEN 'A'\n                WHEN final_grade >= 90 THEN 'A-'\n                WHEN final_grade >= 87 THEN 'B+'\n                WHEN final_grade >= 83 THEN 'B'\n                WHEN final_grade >= 80 THEN 'B-'\n                WHEN final_grade >= 77 THEN 'C+'\n                WHEN final_grade >= 73 THEN 'C'\n                WHEN final_grade >= 70 THEN 'C-'\n                ELSE 'Below C-'\n            END as grade_letter,\n            COUNT(*) as count\n        ")
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
