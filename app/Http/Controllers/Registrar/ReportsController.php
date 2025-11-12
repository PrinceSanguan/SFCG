<?php

namespace App\Http\Controllers\Registrar;

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

    public function generateGradeReport(Request $request)
    {
        try {
            Log::info('[REGISTRAR] === GRADE REPORT REQUEST RECEIVED ===');
            Log::info('[REGISTRAR] Raw request data:', $request->all());

            $validated = $request->validate([
                'academic_level_id' => ['nullable', 'string'],
                'grading_period_id' => ['nullable', 'string'],
                'school_year' => ['required', 'string'],
                'format' => ['required', 'in:pdf,excel,csv'],
                'include_statistics' => ['nullable', 'string', 'in:0,1'],
            ]);

            Log::info('[REGISTRAR] Validation passed - Generating grade report', $validated);

            $query = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                ->where('school_year', $validated['school_year']);

            if ($validated['academic_level_id'] && $validated['academic_level_id'] !== 'all') {
                if (!AcademicLevel::find($validated['academic_level_id'])) {
                    Log::error('[REGISTRAR] Invalid academic level ID: ' . $validated['academic_level_id']);
                    return back()->withErrors(['academic_level_id' => 'Invalid academic level selected.']);
                }
                $query->where('academic_level_id', $validated['academic_level_id']);
            }

            if ($validated['grading_period_id'] && $validated['grading_period_id'] !== 'all') {
                if (!GradingPeriod::find($validated['grading_period_id'])) {
                    Log::error('[REGISTRAR] Invalid grading period ID: ' . $validated['grading_period_id']);
                    return back()->withErrors(['grading_period_id' => 'Invalid grading period selected.']);
                }
                $query->where('grading_period_id', $validated['grading_period_id']);
            }

            $grades = $query->orderBy('student_id')
                ->orderBy('subject_id')
                ->get();

            Log::info('[REGISTRAR] Found ' . $grades->count() . ' grade records');

            $statistics = null;
            if (isset($validated['include_statistics']) && $validated['include_statistics'] === '1') {
                $statistics = $this->calculateGradeStatistics($grades);
            }

            $filename = 'grade_report_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('[REGISTRAR] Generating ' . $validated['format'] . ' format with filename: ' . $filename);

            switch ($validated['format']) {
                case 'pdf':
                    return $this->generateGradePDF($grades, $statistics, $filename);
                case 'excel':
                    return Excel::download(new GradeReportExport($grades, $statistics), $filename . '.xlsx');
                case 'csv':
                    return Excel::download(new GradeReportExport($grades, $statistics), $filename . '.csv');
                default:
                    Log::error('[REGISTRAR] Invalid format selected: ' . $validated['format']);
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] Grade report generation failed: ' . $e->getMessage());
            Log::error('[REGISTRAR] Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to generate grade report. Please try again.']);
        }
    }

    public function generateHonorStatistics(Request $request)
    {
        try {
            Log::info('[REGISTRAR] === HONOR STATISTICS REQUEST RECEIVED ===');
            Log::info('[REGISTRAR] All request data:', $request->all());

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

            Log::info('[REGISTRAR] Validation passed - Generating honor statistics', $validated);

            $query = HonorResult::with(['student.section', 'honorType', 'academicLevel'])
                ->where('school_year', $validated['school_year']);

            if ($validated['academic_level_id'] && $validated['academic_level_id'] !== 'all') {
                if (!AcademicLevel::find($validated['academic_level_id'])) {
                    Log::error('[REGISTRAR] Invalid academic level ID: ' . $validated['academic_level_id']);
                    return back()->withErrors(['academic_level_id' => 'Invalid academic level selected.']);
                }
                $query->where('academic_level_id', $validated['academic_level_id']);
                Log::info('[REGISTRAR] Applied academic level filter:', ['academic_level_id' => $validated['academic_level_id']]);
            }

            if ($validated['honor_type_id'] && $validated['honor_type_id'] !== 'all') {
                if (!HonorType::find($validated['honor_type_id'])) {
                    Log::error('[REGISTRAR] Invalid honor type ID: ' . $validated['honor_type_id']);
                    return back()->withErrors(['honor_type_id' => 'Invalid honor type selected.']);
                }
                $query->where('honor_type_id', $validated['honor_type_id']);
                Log::info('[REGISTRAR] Applied honor type filter:', ['honor_type_id' => $validated['honor_type_id']]);
            }

            $hasStudentFilters = !empty($validated['year_level']) ||
                                !empty($validated['track_id']) ||
                                !empty($validated['strand_id']) ||
                                !empty($validated['department_id']) ||
                                !empty($validated['course_id']) ||
                                (!empty($validated['section_id']) && $validated['section_id'] !== 'all');

            if ($hasStudentFilters) {
                $query->whereHas('student', function ($q) use ($validated) {
                    $q->whereHas('section', function ($sectionQuery) use ($validated) {
                        if (!empty($validated['year_level'])) {
                            $sectionQuery->where('specific_year_level', $validated['year_level']);
                            Log::info('[REGISTRAR] Applied year level filter:', ['year_level' => $validated['year_level']]);
                        }

                        if (!empty($validated['track_id'])) {
                            $sectionQuery->where('track_id', $validated['track_id']);
                            Log::info('[REGISTRAR] Applied track filter:', ['track_id' => $validated['track_id']]);
                        }

                        if (!empty($validated['strand_id'])) {
                            $sectionQuery->where('strand_id', $validated['strand_id']);
                            Log::info('[REGISTRAR] Applied strand filter:', ['strand_id' => $validated['strand_id']]);
                        }

                        if (!empty($validated['department_id'])) {
                            $sectionQuery->where('department_id', $validated['department_id']);
                            Log::info('[REGISTRAR] Applied department filter:', ['department_id' => $validated['department_id']]);
                        }

                        if (!empty($validated['course_id'])) {
                            $sectionQuery->where('course_id', $validated['course_id']);
                            Log::info('[REGISTRAR] Applied course filter:', ['course_id' => $validated['course_id']]);
                        }

                        if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                            $sectionQuery->where('id', $validated['section_id']);
                            Log::info('[REGISTRAR] Applied section filter:', ['section_id' => $validated['section_id']]);
                        }
                    });
                });
            }

            $honors = $query->orderBy('gpa', 'desc')->get();

            Log::info('[REGISTRAR HONOR STATS] Found ' . $honors->count() . ' honor records after filtering');

            // Check if no honors were found - provide helpful, actionable error messages
            if ($honors->count() === 0) {
                Log::warning('[REGISTRAR HONOR STATS] No honors found for query. Checking data availability...');

                // First, check if ANY honors exist for this school year at all
                $totalHonorsInYear = HonorResult::where('school_year', $validated['school_year'])->count();

                Log::info('[REGISTRAR HONOR STATS] Total honors in school year ' . $validated['school_year'] . ': ' . $totalHonorsInYear);

                if ($totalHonorsInYear === 0) {
                    // No honors at all for this school year - user needs to generate them first
                    Log::warning('[REGISTRAR HONOR STATS] No honors exist for school year ' . $validated['school_year']);
                    return response()->view('errors.no-data', [
                        'message' => 'No honor records exist for school year ' . $validated['school_year'] . '.',
                        'details' => 'No honors have been generated yet for this school year. Please use the Honor Tracking & Ranking system to generate honors for each academic level first, then try generating this report again.'
                    ], 404);
                }

                // Honors exist, but not for the selected filters - show what IS available
                $availableHonors = HonorResult::where('school_year', $validated['school_year'])
                    ->with('academicLevel')
                    ->get()
                    ->groupBy('academic_level_id');

                $availabilityList = [];
                foreach ($availableHonors as $levelId => $levelHonors) {
                    $levelName = $levelHonors->first()->academicLevel->name;
                    $count = $levelHonors->count();
                    $availabilityList[] = $levelName . ' (' . $count . ' student' . ($count !== 1 ? 's' : '') . ')';
                }

                $availabilityText = implode(', ', $availabilityList);

                Log::warning('[REGISTRAR HONOR STATS] Honors available for other filters: ' . $availabilityText);

                return response()->view('errors.no-data', [
                    'message' => 'No honor records found matching your selected criteria.',
                    'details' => 'However, honors are available for the following academic levels in ' . $validated['school_year'] . ': ' . $availabilityText . '. Please adjust your filters and try again, or generate honors for your desired academic level in the Honor Tracking & Ranking system.'
                ], 404);
            }

            Log::info('[REGISTRAR HONOR STATS] Proceeding with report generation for ' . $honors->count() . ' honors');

            $statistics = $this->calculateHonorStatistics($honors);

            $filename = 'honor_statistics_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('[REGISTRAR HONOR STATS] Generating ' . $validated['format'] . ' format with filename: ' . $filename);

            switch ($validated['format']) {
                case 'pdf':
                    return $this->generateHonorStatisticsPDF($honors, $statistics, $filename);
                case 'excel':
                    return Excel::download(new HonorStatisticsExport($honors, $statistics), $filename . '.xlsx');
                case 'csv':
                    return Excel::download(new HonorStatisticsExport($honors, $statistics), $filename . '.csv');
                default:
                    Log::error('[REGISTRAR HONOR STATS] Invalid format selected: ' . $validated['format']);
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] Honor statistics generation failed: ' . $e->getMessage());
            Log::error('[REGISTRAR] Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to generate honor statistics. Please try again.']);
        }
    }

    public function archiveAcademicRecords(Request $request)
    {
        try {
            Log::info('[REGISTRAR] === ARCHIVE ACADEMIC RECORDS REQUEST RECEIVED ===');
            Log::info('[REGISTRAR] Request data:', $request->all());

            $validated = $request->validate([
                'academic_level_id' => ['required', 'exists:academic_levels,id'],
                'school_year' => ['required', 'string'],
                'include_grades' => ['nullable', 'string', 'in:0,1'],
                'include_honors' => ['nullable', 'string', 'in:0,1'],
                'include_certificates' => ['nullable', 'string', 'in:0,1'],
                'format' => ['required', 'in:excel,csv'],
            ]);

            Log::info('[REGISTRAR] Validation passed - Archiving academic records', $validated);

            $data = [];

            if (isset($validated['include_grades']) && $validated['include_grades'] === '1') {
                $data['grades'] = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                Log::info('[REGISTRAR] Included ' . $data['grades']->count() . ' grades');
            }

            if (isset($validated['include_honors']) && $validated['include_honors'] === '1') {
                $data['honors'] = HonorResult::with(['student', 'honorType', 'academicLevel'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                Log::info('[REGISTRAR] Included ' . $data['honors']->count() . ' honors');
            }

            if (isset($validated['include_certificates']) && $validated['include_certificates'] === '1') {
                $data['certificates'] = Certificate::with(['student', 'template', 'academicLevel'])
                    ->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year'])
                    ->get();
                Log::info('[REGISTRAR] Included ' . $data['certificates']->count() . ' certificates');
            }

            $academicLevel = AcademicLevel::find($validated['academic_level_id']);
            $filename = 'academic_records_' . $academicLevel->key . '_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('[REGISTRAR] Generating archive with filename: ' . $filename);

            switch ($validated['format']) {
                case 'excel':
                    return Excel::download(new AcademicRecordsExport($data), $filename . '.xlsx');
                case 'csv':
                    return Excel::download(new AcademicRecordsExport($data), $filename . '.csv');
                default:
                    Log::error('[REGISTRAR] Invalid format selected: ' . $validated['format']);
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] Academic records archive failed: ' . $e->getMessage());
            Log::error('[REGISTRAR] Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to create academic archive. Please try again.']);
        }
    }

    public function generateClassSectionReport(Request $request)
    {
        Log::info('[REGISTRAR] === CLASS SECTION REPORT REQUEST RECEIVED ===');
        Log::info('[REGISTRAR] Request method: ' . $request->method());
        Log::info('[REGISTRAR] Request URL: ' . $request->url());
        Log::info('[REGISTRAR] All request data:', $request->all());
        Log::info('[REGISTRAR] User: ' . Auth::user()->name . ' (ID: ' . Auth::user()->id . ')');

        try {
            Log::info('[REGISTRAR] Starting validation...');

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

            Log::info('[REGISTRAR] Validation passed!');
            Log::info('[REGISTRAR] Validated data:', $validated);

            if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                Log::info('[REGISTRAR] Validating specific section ID: ' . $validated['section_id']);
                if (!\App\Models\Section::find($validated['section_id'])) {
                    Log::error('[REGISTRAR] Invalid section ID: ' . $validated['section_id']);
                    return back()->withErrors(['section_id' => 'Invalid section selected.']);
                }
                Log::info('[REGISTRAR] Section ID validation passed');
            }

            Log::info('[REGISTRAR] Generating class section report with validated data:', $validated);

            $academicLevel = AcademicLevel::find($validated['academic_level_id']);
            Log::info('[REGISTRAR] Academic Level found:', [
                'id' => $academicLevel->id,
                'name' => $academicLevel->name,
                'key' => $academicLevel->key
            ]);

            Log::info('[REGISTRAR] Building sections query...');
            $sectionsQuery = \App\Models\Section::with(['academicLevel', 'students', 'course', 'department', 'strand', 'track'])
                ->withCount('students');

            if (!empty($validated['section_id']) && $validated['section_id'] !== 'all') {
                $sectionsQuery->where('id', $validated['section_id']);
                Log::info('[REGISTRAR] Filtering by specific section only:', ['section_id' => $validated['section_id']]);
            } else {
                $sectionsQuery->where('academic_level_id', $validated['academic_level_id'])
                    ->where('school_year', $validated['school_year']);

                Log::info('[REGISTRAR] Base query filters:', [
                    'academic_level_id' => $validated['academic_level_id'],
                    'school_year' => $validated['school_year']
                ]);

                if (!empty($validated['year_level'])) {
                    $sectionsQuery->where('specific_year_level', $validated['year_level']);
                    Log::info('[REGISTRAR] Applied year level filter:', ['year_level' => $validated['year_level']]);
                }

                if ($academicLevel->key === 'senior_highschool') {
                    Log::info('[REGISTRAR] Applying SHS-specific filters...');
                    if (!empty($validated['track_id'])) {
                        $sectionsQuery->where('track_id', $validated['track_id']);
                        Log::info('[REGISTRAR] Applied track filter:', ['track_id' => $validated['track_id']]);
                    }
                    if (!empty($validated['strand_id'])) {
                        $sectionsQuery->where('strand_id', $validated['strand_id']);
                        Log::info('[REGISTRAR] Applied strand filter:', ['strand_id' => $validated['strand_id']]);
                    }
                }

                if ($academicLevel->key === 'college') {
                    Log::info('[REGISTRAR] Applying College-specific filters...');
                    if (!empty($validated['department_id'])) {
                        $sectionsQuery->where('department_id', $validated['department_id']);
                        Log::info('[REGISTRAR] Applied department filter:', ['department_id' => $validated['department_id']]);
                    }
                    if (!empty($validated['course_id'])) {
                        $sectionsQuery->where('course_id', $validated['course_id']);
                        Log::info('[REGISTRAR] Applied course filter:', ['course_id' => $validated['course_id']]);
                    }
                }
            }

            Log::info('[REGISTRAR] Executing sections query...');
            $sections = $sectionsQuery->orderBy('specific_year_level')->orderBy('name')->get();

            Log::info('[REGISTRAR] Sections query completed. Found ' . $sections->count() . ' sections');
            Log::info('[REGISTRAR] Section IDs found:', $sections->pluck('id')->toArray());

            if ($sections->count() === 0) {
                Log::warning('[REGISTRAR] No sections found for filters');
                return back()->withErrors(['general' => 'No sections found for the selected filters.']);
            }

            Log::info('[REGISTRAR] Mapping section data...');
            $sectionsData = $sections->map(function ($section) use ($validated) {
                Log::info('[REGISTRAR] Processing section:', [
                    'id' => $section->id,
                    'name' => $section->name
                ]);

                $students = \App\Models\User::where('section_id', $section->id)
                    ->where('user_role', 'student')
                    ->orderBy('name')
                    ->get();

                Log::info('[REGISTRAR] Found ' . $students->count() . ' students in section ' . $section->name);

                $sectionInfo = [
                    'section' => $section,
                    'students' => $students,
                    'enrollment_count' => $students->count(),
                    'capacity_percentage' => $section->max_students > 0 ? ($students->count() / $section->max_students) * 100 : 0,
                ];

                if (isset($validated['include_grades']) && $validated['include_grades'] === '1') {
                    Log::info('[REGISTRAR] Including grades for students in section ' . $section->name);
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

            $filename = 'class_section_report_' . $academicLevel->key . '_' . $validated['school_year'] . '_' . now()->format('Y-m-d');

            Log::info('[REGISTRAR] Preparing to generate report in format: ' . $validated['format']);
            Log::info('[REGISTRAR] Filename will be: ' . $filename);
            Log::info('[REGISTRAR] Sections data count: ' . $sectionsData->count());

            switch ($validated['format']) {
                case 'pdf':
                    Log::info('[REGISTRAR] Calling generateClassSectionPDF method...');
                    $result = $this->generateClassSectionPDF($sectionsData, $academicLevel, $validated, $filename);
                    Log::info('[REGISTRAR] PDF generation method returned successfully');
                    return $result;
                case 'excel':
                    Log::info('[REGISTRAR] Generating Excel file...');
                    return Excel::download(new \App\Exports\ClassSectionReportExport($sectionsData, $academicLevel, $validated), $filename . '.xlsx');
                case 'csv':
                    Log::info('[REGISTRAR] Generating CSV file...');
                    return Excel::download(new \App\Exports\ClassSectionReportExport($sectionsData, $academicLevel, $validated), $filename . '.csv');
                default:
                    Log::error('[REGISTRAR] Invalid format selected: ' . $validated['format']);
                    return back()->withErrors(['format' => 'Invalid format selected.']);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('[REGISTRAR] Validation failed:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] === CLASS SECTION REPORT GENERATION FAILED ===');
            Log::error('[REGISTRAR] Exception type: ' . get_class($e));
            Log::error('[REGISTRAR] Exception message: ' . $e->getMessage());
            Log::error('[REGISTRAR] Exception file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('[REGISTRAR] Exception trace: ' . $e->getTraceAsString());
            return back()->withErrors(['general' => 'Failed to generate class section report. Error: ' . $e->getMessage()]);
        }
    }

    private function generateClassSectionPDF($sectionsData, $academicLevel, $filters, $filename)
    {
        Log::info('[REGISTRAR] === GENERATING CLASS SECTION PDF ===');
        Log::info('[REGISTRAR] Filename: ' . $filename);
        Log::info('[REGISTRAR] Academic Level: ' . $academicLevel->name);
        Log::info('[REGISTRAR] School Year: ' . $filters['school_year']);
        Log::info('[REGISTRAR] Include Grades: ' . (isset($filters['include_grades']) && $filters['include_grades'] === '1' ? 'Yes' : 'No'));
        Log::info('[REGISTRAR] Sections data count: ' . $sectionsData->count());

        // Check if we have any sections to report
        if ($sectionsData->count() === 0) {
            Log::warning('[REGISTRAR] No sections found for PDF generation');
            return response()->view('errors.no-data', [
                'message' => 'No class sections found for the selected criteria.',
                'details' => 'There are no sections matching your filters. Please adjust your selection and try again.'
            ], 404);
        }

        try {
            Log::info('[REGISTRAR] Preparing view data...');
            $viewData = [
                'sectionsData' => $sectionsData,
                'academicLevel' => $academicLevel,
                'schoolYear' => $filters['school_year'],
                'includeGrades' => isset($filters['include_grades']) && $filters['include_grades'] === '1',
                'generatedAt' => now()->format('F d, Y h:i A'),
            ];

            Log::info('[REGISTRAR] View data prepared. Checking if view exists...');

            if (!view()->exists('reports.class-section')) {
                Log::error('[REGISTRAR] View does not exist: reports.class-section');
                throw new \Exception('PDF template view not found: reports.class-section');
            }

            Log::info('[REGISTRAR] View exists. Loading view...');
            $pdf = PDF::loadView('reports.class-section', $viewData);
            Log::info('[REGISTRAR] View loaded successfully');

            Log::info('[REGISTRAR] Setting PDF paper size to A4 portrait...');
            $pdf->setPaper('a4', 'portrait');
            Log::info('[REGISTRAR] PDF paper size set');

            Log::info('[REGISTRAR] Generating PDF download response...');
            $response = $pdf->download($filename . '.pdf');
            Log::info('[REGISTRAR] PDF download response generated successfully');

            return $response;
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] === PDF GENERATION FAILED ===');
            Log::error('[REGISTRAR] Exception type: ' . get_class($e));
            Log::error('[REGISTRAR] Error message: ' . $e->getMessage());
            Log::error('[REGISTRAR] Error file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('[REGISTRAR] Stack trace: ' . $e->getTraceAsString());
            return response()->view('errors.no-data', [
                'message' => 'Failed to generate PDF report.',
                'details' => 'An error occurred while generating the class section report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateGradePDF($grades, $statistics, $filename)
    {
        try {
            Log::info('[REGISTRAR] Starting PDF generation for grade report', ['filename' => $filename, 'grades_count' => $grades->count()]);

            if ($grades->count() === 0) {
                Log::warning('[REGISTRAR] No grades found for PDF generation');
                return response()->view('errors.no-data', [
                    'message' => 'No grade data found for the selected criteria.',
                    'details' => 'There are no grade records matching your filters. Please adjust your selection and try again.'
                ], 404);
            }

            $html = view('reports.grade-report', compact('grades', 'statistics'))->render();
            Log::info('[REGISTRAR] HTML generated successfully', ['html_length' => strlen($html)]);

            $pdf = Pdf::loadHTML($html);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            Log::info('[REGISTRAR] PDF options set, generating output');

            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] PDF generation failed: ' . $e->getMessage());
            Log::error('[REGISTRAR] PDF generation stack trace: ' . $e->getTraceAsString());
            return response()->view('errors.no-data', [
                'message' => 'Failed to generate PDF report.',
                'details' => 'An error occurred while generating the grade report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateHonorStatisticsPDF($honors, $statistics, $filename)
    {
        try {
            Log::info('[REGISTRAR] Starting PDF generation for honor statistics', ['filename' => $filename, 'honors_count' => $honors->count()]);

            if ($honors->count() === 0) {
                Log::warning('[REGISTRAR] No honors found for PDF generation');
                return response()->view('errors.no-data', [
                    'message' => 'No honor data found for the selected criteria.',
                    'details' => 'There are no honor records matching your filters. Please adjust your selection and try again.'
                ], 404);
            }

            $html = view('reports.honor-statistics', compact('honors', 'statistics'))->render();
            Log::info('[REGISTRAR] HTML generated successfully', ['html_length' => strlen($html)]);

            $pdf = Pdf::loadHTML($html);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            Log::info('[REGISTRAR] PDF options set, generating output');

            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            Log::error('[REGISTRAR] PDF generation failed: ' . $e->getMessage());
            Log::error('[REGISTRAR] PDF generation stack trace: ' . $e->getTraceAsString());
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

        $gradeRanges = [
            'A (90-100)' => $grades->whereBetween('grade', [90, 100])->count(),
            'B (80-89)' => $grades->whereBetween('grade', [80, 89])->count(),
            'C (70-79)' => $grades->whereBetween('grade', [70, 79])->count(),
            'D (60-69)' => $grades->whereBetween('grade', [60, 69])->count(),
            'F (Below 60)' => $grades->where('grade', '<', 60)->count(),
        ];

        $stats['grade_distribution'] = $gradeRanges;

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
}
