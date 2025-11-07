<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\Certificate;
use App\Models\GradingPeriod;
use App\Models\HonorResult;
use App\Models\HonorType;
use App\Models\StudentGrade;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GradeReportExport;
use App\Exports\HonorStatisticsExport;
use App\Exports\AcademicRecordsExport;

class ReportsController extends Controller
{
    private function sharedUser(): array
    {
        $user = Auth::user();
        return [
            'name' => $user?->name ?? '',
            'email' => $user?->email ?? '',
            'user_role' => method_exists($user, 'getAttribute') ? ($user->user_role ?? '') : '',
        ];
    }

    public function index()
    {
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $schoolYears = $this->getSchoolYears();
        $gradingPeriods = GradingPeriod::with('academicLevel')->orderBy('sort_order')->get();
        $honorTypes = HonorType::all();
        $sections = \App\Models\Section::with(['academicLevel', 'track', 'strand', 'department', 'course'])
            ->where('is_active', true)
            ->orderBy('academic_level_id')
            ->orderBy('specific_year_level')
            ->orderBy('name')
            ->get();

        // Load additional data for Class Section Report filtering
        $tracks = \App\Models\Track::where('is_active', true)->orderBy('name')->get();
        $strands = \App\Models\Strand::with('track')->orderBy('name')->get();
        $departments = \App\Models\Department::where('is_active', true)->orderBy('name')->get();
        $courses = \App\Models\Course::with('department')->where('is_active', true)->orderBy('name')->get();

        // Get quick stats for dashboard
        $stats = [
            'total_students' => User::where('user_role', 'student')->count(),
            'total_certificates' => Certificate::count(),
            'total_honors' => HonorResult::count(),
            'active_periods' => GradingPeriod::where('is_active', true)->count(),
            'active_sections' => $sections->count(),
        ];

        // Get the most recent school year from actual data
        $currentSchoolYear = StudentGrade::select('school_year')
            ->distinct()
            ->orderBy('school_year', 'DESC')
            ->value('school_year') ?? $schoolYears[0];

        return Inertia::render('Admin/Reports/Index', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'schoolYears' => $schoolYears,
            'currentSchoolYear' => $currentSchoolYear,
            'gradingPeriods' => $gradingPeriods,
            'honorTypes' => $honorTypes,
            'sections' => $sections,
            'tracks' => $tracks,
            'strands' => $strands,
            'departments' => $departments,
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    public function generateGradeReport(Request $request)
    {
        try {
            Log::info('Raw request data received:', $request->all());
            
            $validated = $request->validate([
                'academic_level_id' => ['nullable', 'string'],
                'grading_period_id' => ['nullable', 'string'],
                'school_year' => ['required', 'string'],
                'format' => ['required', 'in:pdf,excel,csv'],
                'include_statistics' => ['nullable', 'string', 'in:0,1'],
            ]);

            Log::info('Generating grade report', $validated);

            $query = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->where('school_year', $validated['school_year']);

            if ($validated['academic_level_id'] && $validated['academic_level_id'] !== 'all') {
                // Validate that the academic_level_id exists
                if (!AcademicLevel::find($validated['academic_level_id'])) {
                    return back()->withErrors(['academic_level_id' => 'Invalid academic level selected.']);
                }
                $query->where('academic_level_id', $validated['academic_level_id']);
            }

            if ($validated['grading_period_id'] && $validated['grading_period_id'] !== 'all') {
                // Validate that the grading_period_id exists
                if (!GradingPeriod::find($validated['grading_period_id'])) {
                    return back()->withErrors(['grading_period_id' => 'Invalid grading period selected.']);
                }
                $query->where('grading_period_id', $validated['grading_period_id']);
            }

            $grades = $query->orderBy('student_id')
                ->orderBy('subject_id')
                ->get();

            Log::info('Found ' . $grades->count() . ' grade records');

            $statistics = null;
            if (isset($validated['include_statistics']) && $validated['include_statistics'] === '1') {
                $statistics = $this->calculateGradeStatistics($grades);
            }

            $filename = 'grade_report_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('Generating ' . $validated['format'] . ' format with filename: ' . $filename);

            switch ($validated['format']) {
                case 'pdf':
                    return $this->generateGradePDF($grades, $statistics, $filename);
                case 'excel':
                    return Excel::download(new GradeReportExport($grades, $statistics), $filename . '.xlsx');
                case 'csv':
                    return Excel::download(new GradeReportExport($grades, $statistics), $filename . '.csv');
                default:
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('Grade report generation failed: ' . $e->getMessage());
            return back()->withErrors(['general' => 'Failed to generate grade report. Please try again.']);
        }
    }

    public function generateHonorStatistics(Request $request)
    {
        try {
            Log::info('=== HONOR STATISTICS REQUEST RECEIVED ===');
            Log::info('All request data:', $request->all());

            $validated = $request->validate([
                'academic_level_id' => ['nullable', 'string'],
                'school_year' => ['required', 'string'],
                'honor_type_id' => ['nullable', 'string'],
                'year_level' => ['nullable', 'string'],
                'track_id' => ['nullable', 'exists:tracks,id'],
                'strand_id' => ['nullable', 'exists:strands,id'],
                'department_id' => ['nullable', 'exists:departments,id'],
                'course_id' => ['nullable', 'exists:courses,id'],
                'section_id' => ['nullable', 'string'],
                'format' => ['required', 'in:pdf,excel,csv'],
            ]);

            Log::info('Validation passed - Generating honor statistics', $validated);

            // Start with base query - include student.section relationship
            $query = HonorResult::with(['student.section', 'honorType', 'academicLevel'])
                ->where('school_year', $validated['school_year']);

            // Filter by academic level
            if ($validated['academic_level_id'] && $validated['academic_level_id'] !== 'all') {
                if (!AcademicLevel::find($validated['academic_level_id'])) {
                    return back()->withErrors(['academic_level_id' => 'Invalid academic level selected.']);
                }
                $query->where('academic_level_id', $validated['academic_level_id']);
                Log::info('Applied academic level filter:', ['academic_level_id' => $validated['academic_level_id']]);
            }

            // Filter by honor type
            if ($validated['honor_type_id'] && $validated['honor_type_id'] !== 'all') {
                if (!HonorType::find($validated['honor_type_id'])) {
                    return back()->withErrors(['honor_type_id' => 'Invalid honor type selected.']);
                }
                $query->where('honor_type_id', $validated['honor_type_id']);
                Log::info('Applied honor type filter:', ['honor_type_id' => $validated['honor_type_id']]);
            }

            // Filter by section-related fields (through student relationship)
            $hasStudentFilters = !empty($validated['year_level']) ||
                                !empty($validated['track_id']) ||
                                !empty($validated['strand_id']) ||
                                !empty($validated['department_id']) ||
                                !empty($validated['course_id']) ||
                                (!empty($validated['section_id']) && $validated['section_id'] !== 'all');

            if ($hasStudentFilters) {
                $query->whereHas('student', function ($q) use ($validated) {
                    $q->whereHas('section', function ($sectionQuery) use ($validated) {
                        // Filter by year level
                        if (!empty($validated['year_level'])) {
                            $sectionQuery->where('specific_year_level', $validated['year_level']);
                            Log::info('Applied year level filter:', ['year_level' => $validated['year_level']]);
                        }

                        // Filter by track (SHS)
                        if (!empty($validated['track_id'])) {
                            $sectionQuery->where('track_id', $validated['track_id']);
                            Log::info('Applied track filter:', ['track_id' => $validated['track_id']]);
                        }

                        // Filter by strand (SHS)
                        if (!empty($validated['strand_id'])) {
                            $sectionQuery->where('strand_id', $validated['strand_id']);
                            Log::info('Applied strand filter:', ['strand_id' => $validated['strand_id']]);
                        }

                        // Filter by department (College)
                        if (!empty($validated['department_id'])) {
                            $sectionQuery->where('department_id', $validated['department_id']);
                            Log::info('Applied department filter:', ['department_id' => $validated['department_id']]);
                        }

                        // Filter by course (College)
                        if (!empty($validated['course_id'])) {
                            $sectionQuery->where('course_id', $validated['course_id']);
                            Log::info('Applied course filter:', ['course_id' => $validated['course_id']]);
                        }

                        // Filter by specific section
                        if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                            $sectionQuery->where('id', $validated['section_id']);
                            Log::info('Applied section filter:', ['section_id' => $validated['section_id']]);
                        }
                    });
                });
            }

            $honors = $query->orderBy('gpa', 'desc')->get();

            Log::info('Found ' . $honors->count() . ' honor records after filtering');

            $statistics = $this->calculateHonorStatistics($honors);

            $filename = 'honor_statistics_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('Generating ' . $validated['format'] . ' format with filename: ' . $filename);

            switch ($validated['format']) {
                case 'pdf':
                    return $this->generateHonorStatisticsPDF($honors, $statistics, $filename);
                case 'excel':
                    return Excel::download(new HonorStatisticsExport($honors, $statistics), $filename . '.xlsx');
                case 'csv':
                    return Excel::download(new HonorStatisticsExport($honors, $statistics), $filename . '.csv');
                default:
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('Honor statistics generation failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to generate honor statistics. Please try again.']);
        }
    }

    public function archiveAcademicRecords(Request $request)
    {
        try {
            Log::info('=== ARCHIVE RECORDS REQUEST RECEIVED ===');
            Log::info('All request data:', $request->all());

            $validated = $request->validate([
                'academic_level_id' => ['required', 'exists:academic_levels,id'],
                'school_year' => ['required', 'string'],
                'include_grades' => ['nullable', 'string', 'in:0,1'],
                'include_honors' => ['nullable', 'string', 'in:0,1'],
                'include_certificates' => ['nullable', 'string', 'in:0,1'],
                'format' => ['required', 'in:excel,csv'],
            ]);

            $academicLevel = AcademicLevel::find($validated['academic_level_id']);
            Log::info('Archiving records for:', [
                'academic_level' => $academicLevel->name,
                'school_year' => $validated['school_year'],
                'include_grades' => $validated['include_grades'] ?? '0',
                'include_honors' => $validated['include_honors'] ?? '0',
                'include_certificates' => $validated['include_certificates'] ?? '0',
            ]);

            $data = [];
            $totalRecords = 0;

            if (isset($validated['include_grades']) && $validated['include_grades'] === '1') {
                $data['grades'] = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                $gradesCount = $data['grades']->count();
                $totalRecords += $gradesCount;
                Log::info('[ARCHIVE] Grades found:', ['count' => $gradesCount]);
            } else {
                Log::info('[ARCHIVE] Grades excluded from archive');
            }

            if (isset($validated['include_honors']) && $validated['include_honors'] === '1') {
                $data['honors'] = HonorResult::with(['student', 'honorType', 'academicLevel'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                $honorsCount = $data['honors']->count();
                $totalRecords += $honorsCount;
                Log::info('[ARCHIVE] Honors found:', ['count' => $honorsCount]);
            } else {
                Log::info('[ARCHIVE] Honors excluded from archive');
            }

            if (isset($validated['include_certificates']) && $validated['include_certificates'] === '1') {
                $data['certificates'] = Certificate::with(['student', 'template', 'academicLevel'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                $certificatesCount = $data['certificates']->count();
                $totalRecords += $certificatesCount;
                Log::info('[ARCHIVE] Certificates found:', ['count' => $certificatesCount]);
            } else {
                Log::info('[ARCHIVE] Certificates excluded from archive');
            }

            Log::info('[ARCHIVE] Total records to archive:', ['total' => $totalRecords]);

            if ($totalRecords === 0) {
                Log::warning('[ARCHIVE] No records found matching the criteria - will generate empty archive');
            }

            $filename = 'academic_records_' . $academicLevel->key . '_' . $validated['school_year'] . '_' . now()->format('Y-m-d');
            Log::info('[ARCHIVE] Generating ' . $validated['format'] . ' with filename: ' . $filename);

            switch ($validated['format']) {
                case 'excel':
                    Log::info('[ARCHIVE] Archive generation successful - downloading Excel file');
                    return Excel::download(new AcademicRecordsExport($data), $filename . '.xlsx');
                case 'csv':
                    Log::info('[ARCHIVE] Archive generation successful - downloading CSV file');
                    return Excel::download(new AcademicRecordsExport($data), $filename . '.csv');
                default:
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('[ARCHIVE] Academic records archive failed: ' . $e->getMessage());
            Log::error('[ARCHIVE] Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to create academic archive. Please try again.']);
        }
    }

    private function generateGradePDF($grades, $statistics, $filename)
    {
        try {
            Log::info('Starting PDF generation for grade report', ['filename' => $filename, 'grades_count' => $grades->count()]);

            // Check if we have any grades to report
            if ($grades->count() === 0) {
                Log::warning('No grades found for PDF generation');
                return response()->view('errors.no-data', [
                    'message' => 'No grade data found for the selected criteria.',
                    'details' => 'There are no grade records matching your filters. Please adjust your selection and try again.'
                ], 404);
            }

            $html = view('reports.grade-report', compact('grades', 'statistics'))->render();
            Log::info('HTML generated successfully', ['html_length' => strlen($html)]);

            $pdf = Pdf::loadHTML($html);

            // Set PDF options for better compatibility
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            Log::info('PDF options set, generating output');

            // Ensure proper headers for download
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            Log::error('PDF generation failed: ' . $e->getMessage());
            Log::error('PDF generation stack trace: ' . $e->getTraceAsString());
            return response()->view('errors.no-data', [
                'message' => 'Failed to generate PDF report.',
                'details' => 'An error occurred while generating the grade report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateHonorStatisticsPDF($honors, $statistics, $filename)
    {
        try {
            Log::info('Starting PDF generation for honor statistics', ['filename' => $filename, 'honors_count' => $honors->count()]);

            // Check if we have any honors to report
            if ($honors->count() === 0) {
                Log::warning('No honors found for PDF generation');
                return response()->view('errors.no-data', [
                    'message' => 'No honor data found for the selected criteria.',
                    'details' => 'There are no honor records matching your filters. Please adjust your selection and try again.'
                ], 404);
            }
            
            $html = view('reports.honor-statistics', compact('honors', 'statistics'))->render();
            Log::info('HTML generated successfully', ['html_length' => strlen($html)]);
            
            $pdf = Pdf::loadHTML($html);
            
            // Set PDF options for better compatibility
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);
            
            Log::info('PDF options set, generating output');

            // Ensure proper headers for download
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            Log::error('PDF generation failed: ' . $e->getMessage());
            Log::error('PDF generation stack trace: ' . $e->getTraceAsString());
            return response()->view('errors.no-data', [
                'message' => 'Failed to generate PDF report.',
                'details' => 'An error occurred while generating the honor statistics report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateGradeStatistics($grades)
    {
        $totalRecords = $grades->count();
        
        $stats = [
            'total_records' => $totalRecords,
            'average_grade' => $totalRecords > 0 ? $grades->avg('grade') : 0,
            'highest_grade' => $totalRecords > 0 ? $grades->max('grade') : 0,
            'lowest_grade' => $totalRecords > 0 ? $grades->min('grade') : 0,
            'grade_distribution' => [],
            'subject_averages' => [],
        ];

        // Grade distribution
        $gradeRanges = [
            'A (90-100)' => $grades->whereBetween('grade', [90, 100])->count(),
            'B (80-89)' => $grades->whereBetween('grade', [80, 89])->count(),
            'C (70-79)' => $grades->whereBetween('grade', [70, 79])->count(),
            'D (60-69)' => $grades->whereBetween('grade', [60, 69])->count(),
            'F (Below 60)' => $grades->where('grade', '<', 60)->count(),
        ];

        $stats['grade_distribution'] = $gradeRanges;

        // Subject averages
        $subjectAverages = $grades->groupBy('subject_id')->map(function ($subjectGrades) {
            return [
                'subject' => $subjectGrades->first()->subject->name,
                'average' => $subjectGrades->avg('grade'),
                'count' => $subjectGrades->count(),
            ];
        });

        $stats['subject_averages'] = $subjectAverages->values()->toArray();

        return $stats;
    }

    private function calculateHonorStatistics($honors)
    {
        $totalHonors = $honors->count();
        
        $stats = [
            'total_honors' => $totalHonors,
            'average_gpa' => $totalHonors > 0 ? $honors->avg('gpa') : 0,
            'highest_gpa' => $totalHonors > 0 ? $honors->max('gpa') : 0,
            'honor_type_distribution' => [],
            'academic_level_distribution' => [],
        ];

        // Honor type distribution
        if ($totalHonors > 0) {
            $honorTypeDistribution = $honors->groupBy('honor_type_id')->map(function ($typeHonors) use ($totalHonors) {
                return [
                    'type' => $typeHonors->first()->honorType->name,
                    'count' => $typeHonors->count(),
                    'percentage' => round(($typeHonors->count() / $totalHonors) * 100, 2),
                ];
            });

            $stats['honor_type_distribution'] = $honorTypeDistribution->values()->toArray();
        }

        // Academic level distribution
        if ($totalHonors > 0) {
            $levelDistribution = $honors->groupBy('academic_level_id')->map(function ($levelHonors) {
                return [
                    'level' => $levelHonors->first()->academicLevel->name,
                    'count' => $levelHonors->count(),
                    'average_gpa' => $levelHonors->avg('gpa'),
                ];
            });

            $stats['academic_level_distribution'] = $levelDistribution->values()->toArray();
        }

        return $stats;
    }

    private function getSchoolYears(): array
    {
        // Get distinct school years from all relevant tables
        $yearsFromGrades = StudentGrade::select('school_year')
            ->distinct()
            ->whereNotNull('school_year')
            ->pluck('school_year');

        $yearsFromHonors = HonorResult::select('school_year')
            ->distinct()
            ->whereNotNull('school_year')
            ->pluck('school_year');

        $yearsFromSections = \App\Models\Section::select('school_year')
            ->distinct()
            ->whereNotNull('school_year')
            ->pluck('school_year');

        $yearsFromCertificates = Certificate::select('school_year')
            ->distinct()
            ->whereNotNull('school_year')
            ->pluck('school_year');

        // Merge all years from database
        $allYears = $yearsFromGrades
            ->merge($yearsFromHonors)
            ->merge($yearsFromSections)
            ->merge($yearsFromCertificates)
            ->unique()
            ->toArray();

        // Generate school years: 3 years in the past, current year, and 1 year in the future
        $currentYear = (int) date('Y');
        $currentMonth = (int) date('n');

        // Determine the current school year based on the month
        // School year typically starts in August (month 8) or later
        if ($currentMonth >= 8) {
            // If we're in Aug-Dec, we're in academic year YYYY-YYYY+1
            $academicStartYear = $currentYear;
        } else {
            // If we're in Jan-Jul, we're still in academic year YYYY-1-YYYY
            $academicStartYear = $currentYear - 1;
        }

        // Generate a range of school years: 3 years back + current + 1 year forward
        $generatedYears = [];
        for ($i = 3; $i >= -1; $i--) {
            $startYear = $academicStartYear - $i;
            $endYear = $startYear + 1;
            $generatedYears[] = $startYear . '-' . $endYear;
        }

        // Merge generated years with database years and remove duplicates
        $allYears = array_unique(array_merge($allYears, $generatedYears));

        // Sort in descending order (most recent first)
        rsort($allYears);

        return array_values($allYears);
    }

    public function generateClassSectionReport(Request $request)
    {
        Log::info('[ADMIN] === CLASS SECTION REPORT REQUEST RECEIVED ===');
        Log::info('[ADMIN] Request method: ' . $request->method());
        Log::info('[ADMIN] Request URL: ' . $request->url());
        Log::info('[ADMIN] All request data:', $request->all());
        Log::info('[ADMIN] User: ' . Auth::user()->name . ' (ID: ' . Auth::user()->id . ')');

        try {
            Log::info('[ADMIN] Starting validation...');

            $validated = $request->validate([
                'academic_level_id' => ['required', 'exists:academic_levels,id'],
                'section_id' => ['nullable', 'string'],
                'year_level' => ['nullable', 'string'],
                'track_id' => ['nullable', 'exists:tracks,id'],
                'strand_id' => ['nullable', 'exists:strands,id'],
                'department_id' => ['nullable', 'exists:departments,id'],
                'course_id' => ['nullable', 'exists:courses,id'],
                'school_year' => ['required', 'string'],
                'include_grades' => ['nullable', 'string', 'in:0,1'],
                'format' => ['required', 'in:pdf,excel,csv'],
            ]);

            Log::info('[ADMIN] Validation passed!');
            Log::info('[ADMIN] Validated data:', $validated);

            // Validate section_id if not 'all'
            if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                Log::info('[ADMIN] Validating specific section ID: ' . $validated['section_id']);
                if (!\App\Models\Section::find($validated['section_id'])) {
                    Log::error('[ADMIN] Invalid section ID: ' . $validated['section_id']);
                    return back()->withErrors(['section_id' => 'Invalid section selected.']);
                }
                Log::info('[ADMIN] Section ID validation passed');
            }

            Log::info('[ADMIN] Generating class section report with validated data:', $validated);

            // Get academic level to determine filtering logic
            $academicLevel = AcademicLevel::find($validated['academic_level_id']);
            Log::info('[ADMIN] Academic Level found:', [
                'id' => $academicLevel->id,
                'name' => $academicLevel->name,
                'key' => $academicLevel->key
            ]);

            // Get sections based on filters
            Log::info('[ADMIN] Building sections query...');
            $sectionsQuery = \App\Models\Section::with(['academicLevel', 'students', 'course', 'department', 'strand', 'track'])
                ->withCount('students');

            // If a specific section is selected, ONLY filter by section_id (skip all other filters)
            if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                $sectionsQuery->where('id', $validated['section_id']);
                Log::info('[ADMIN] Filtering by specific section only:', ['section_id' => $validated['section_id']]);
            } else {
                // Only apply filters when "All Sections" is selected

                // Apply base filters
                $sectionsQuery->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year']);

                Log::info('[ADMIN] Base query filters:', [
                    'academic_level_id' => $validated['academic_level_id'],
                    'school_year' => $validated['school_year']
                ]);

                // Apply year level filter for Elementary, JHS, and SHS
                if (!empty($validated['year_level'])) {
                    $sectionsQuery->where('specific_year_level', $validated['year_level']);
                    Log::info('[ADMIN] Applied year level filter:', ['year_level' => $validated['year_level']]);
                }

                // Apply SHS-specific filters
                if ($academicLevel->key === 'senior_highschool') {
                    Log::info('[ADMIN] Applying SHS-specific filters...');
                    if (!empty($validated['track_id'])) {
                        $sectionsQuery->where('track_id', $validated['track_id']);
                        Log::info('[ADMIN] Applied track filter:', ['track_id' => $validated['track_id']]);
                    }
                    if (!empty($validated['strand_id'])) {
                        $sectionsQuery->where('strand_id', $validated['strand_id']);
                        Log::info('[ADMIN] Applied strand filter:', ['strand_id' => $validated['strand_id']]);
                    }
                }

                // Apply College-specific filters
                if ($academicLevel->key === 'college') {
                    Log::info('[ADMIN] Applying College-specific filters...');
                    if (!empty($validated['department_id'])) {
                        $sectionsQuery->where('department_id', $validated['department_id']);
                        Log::info('[ADMIN] Applied department filter:', ['department_id' => $validated['department_id']]);
                    }
                    if (!empty($validated['course_id'])) {
                        $sectionsQuery->where('course_id', $validated['course_id']);
                        Log::info('[ADMIN] Applied course filter:', ['course_id' => $validated['course_id']]);
                    }
                }
            }

            Log::info('[ADMIN] Executing sections query...');
            $sections = $sectionsQuery->orderBy('specific_year_level')->orderBy('name')->get();

            Log::info('[ADMIN] Sections query completed. Found ' . $sections->count() . ' sections');
            Log::info('[ADMIN] Section IDs found:', $sections->pluck('id')->toArray());

            if ($sections->count() === 0) {
                Log::warning('[ADMIN] No sections found for filters');
                return back()->withErrors(['general' => 'No sections found for the selected filters.']);
            }

            // Get student data with optional grades
            Log::info('[ADMIN] Mapping section data...');
            $sectionsData = $sections->map(function ($section) use ($validated) {
                Log::info('[ADMIN] Processing section:', [
                    'id' => $section->id,
                    'name' => $section->name
                ]);

                $students = \App\Models\User::where('section_id', $section->id)
                    ->where('user_role', 'student')
                    ->orderBy('name')
                    ->get();

                Log::info('[ADMIN] Found ' . $students->count() . ' students in section ' . $section->name);

                $sectionInfo = [
                    'section' => $section,
                    'students' => $students,
                    'enrollment_count' => $students->count(),
                    'capacity_percentage' => $section->max_students > 0 ? ($students->count() / $section->max_students) * 100 : 0,
                ];

                // Include grades if requested
                if (isset($validated['include_grades']) && $validated['include_grades'] === '1') {
                    $sectionInfo['students'] = $students->map(function ($student) use ($validated) {
                        $grades = StudentGrade::with(['subject', 'gradingPeriod'])
                            ->where('student_id', $student->id)
                            ->where('school_year', $validated['school_year'])
                            ->get();

                        $student->grades = $grades;
                        $student->average_grade = $grades->avg('grade');
                        return $student;
                    });
                }

                return $sectionInfo;
            });

            $academicLevel = AcademicLevel::find($validated['academic_level_id']);
            $filename = 'class_section_report_' . $academicLevel->key . '_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('[ADMIN] Preparing to generate report in format: ' . $validated['format']);
            Log::info('[ADMIN] Filename will be: ' . $filename);
            Log::info('[ADMIN] Sections data count: ' . $sectionsData->count());

            switch ($validated['format']) {
                case 'pdf':
                    Log::info('[ADMIN] Calling generateClassSectionPDF method...');
                    $result = $this->generateClassSectionPDF($sectionsData, $academicLevel, $validated, $filename);
                    Log::info('[ADMIN] PDF generation method returned successfully');
                    return $result;
                case 'excel':
                    Log::info('[ADMIN] Generating Excel file...');
                    return Excel::download(new \App\Exports\ClassSectionReportExport($sectionsData, $academicLevel, $validated), $filename . '.xlsx');
                case 'csv':
                    Log::info('[ADMIN] Generating CSV file...');
                    return Excel::download(new \App\Exports\ClassSectionReportExport($sectionsData, $academicLevel, $validated), $filename . '.csv');
                default:
                    Log::error('[ADMIN] Invalid format selected: ' . $validated['format']);
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('[ADMIN] Validation failed:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('[ADMIN] === CLASS SECTION REPORT GENERATION FAILED ===');
            Log::error('[ADMIN] Exception type: ' . get_class($e));
            Log::error('[ADMIN] Exception message: ' . $e->getMessage());
            Log::error('[ADMIN] Exception file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('[ADMIN] Exception trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to generate class section report. Error: ' . $e->getMessage()]);
        }
    }

    private function generateClassSectionPDF($sectionsData, $academicLevel, $filters, $filename)
    {
        Log::info('[ADMIN] === GENERATING CLASS SECTION PDF ===');
        Log::info('[ADMIN] Filename: ' . $filename);
        Log::info('[ADMIN] Academic Level: ' . $academicLevel->name);
        Log::info('[ADMIN] School Year: ' . $filters['school_year']);
        Log::info('[ADMIN] Include Grades: ' . (isset($filters['include_grades']) && $filters['include_grades'] === '1' ? 'Yes' : 'No'));
        Log::info('[ADMIN] Sections data count: ' . $sectionsData->count());

        // Check if we have any sections to report
        if ($sectionsData->count() === 0) {
            Log::warning('[ADMIN] No sections found for PDF generation');
            return response()->view('errors.no-data', [
                'message' => 'No class sections found for the selected criteria.',
                'details' => 'There are no sections matching your filters. Please adjust your selection and try again.'
            ], 404);
        }

        try {
            Log::info('[ADMIN] Preparing view data...');
            $viewData = [
                'sectionsData' => $sectionsData,
                'academicLevel' => $academicLevel,
                'schoolYear' => $filters['school_year'],
                'includeGrades' => isset($filters['include_grades']) && $filters['include_grades'] === '1',
                'generatedAt' => now()->format('F d, Y h:i A'),
            ];

            Log::info('[ADMIN] View data prepared. Checking if view exists...');

            // Check if view exists
            if (!view()->exists('reports.class-section')) {
                Log::error('[ADMIN] View does not exist: reports.class-section');
                throw new \Exception('PDF template view not found: reports.class-section');
            }

            Log::info('[ADMIN] View exists. Loading view...');
            $pdf = PDF::loadView('reports.class-section', $viewData);
            Log::info('[ADMIN] View loaded successfully');

            Log::info('[ADMIN] Setting PDF paper size to A4 portrait...');
            $pdf->setPaper('a4', 'portrait');
            Log::info('[ADMIN] PDF paper size set');

            Log::info('[ADMIN] Generating PDF download response...');
            $response = $pdf->download($filename . '.pdf');
            Log::info('[ADMIN] PDF download response generated successfully');

            return $response;
        } catch (\Exception $e) {
            Log::error('[ADMIN] === PDF GENERATION FAILED ===');
            Log::error('[ADMIN] Exception type: ' . get_class($e));
            Log::error('[ADMIN] Error message: ' . $e->getMessage());
            Log::error('[ADMIN] Error file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('[ADMIN] Stack trace: ' . $e->getTraceAsString());
            return response()->view('errors.no-data', [
                'message' => 'Failed to generate PDF report.',
                'details' => 'An error occurred while generating the class section report: ' . $e->getMessage()
            ], 500);
        }
    }
}
