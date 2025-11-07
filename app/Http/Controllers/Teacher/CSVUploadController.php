<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\TeacherSubjectAssignment;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CSVUploadController extends Controller
{
    public function index()
    {
        Log::info('Teacher CSVUploadController@index accessed', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->user_role,
            'timestamp' => now()
        ]);
        
        $user = Auth::user();
        
        try {
            // Get teacher's assigned subjects (Senior High School only)
            $assignedSubjects = \App\Models\TeacherSubjectAssignment::with([
                'subject.course',
                'academicLevel',
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'senior_highschool');
            })
            ->get()
            ->map(function ($assignment) {
                $enrolledStudents = \App\Models\StudentSubjectAssignment::with(['student'])
                    ->where('subject_id', $assignment->subject_id)
                    ->where('school_year', $assignment->school_year)
                    ->where('is_active', true)
                    ->get();
                
                return [
                    'id' => $assignment->id,
                    'subject' => $assignment->subject,
                    'academicLevel' => $assignment->academicLevel,
                    'gradingPeriod' => $assignment->gradingPeriod,
                    'school_year' => $assignment->school_year,
                    'is_active' => $assignment->is_active,
                    'enrolled_students' => $enrolledStudents,
                    'student_count' => $enrolledStudents->count(),
                ];
            });

            // Get academic levels (SHS only)
            $academicLevels = \App\Models\AcademicLevel::where('key', 'senior_highschool')->get();

            // Get grading periods based on teacher's assignments
            // First, try to get specific grading period IDs from teacher's assignments
            $assignedGradingPeriodIds = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
                ->where('is_active', true)
                ->whereNotNull('grading_period_id')
                ->pluck('grading_period_id')
                ->unique()
                ->toArray();

            if (!empty($assignedGradingPeriodIds)) {
                // Teacher has specific grading period assignments - show ONLY those periods
                $assignedPeriods = \App\Models\GradingPeriod::where('is_active', true)
                    ->whereIn('id', $assignedGradingPeriodIds)
                    ->orderBy('sort_order')
                    ->get();

                // Get unique parent IDs from assigned periods
                $parentIds = $assignedPeriods->whereNotNull('parent_id')->pluck('parent_id')->unique()->toArray();

                if (!empty($parentIds)) {
                    // Fetch parent semesters to enable grouped display
                    $parentSemesters = \App\Models\GradingPeriod::where('is_active', true)
                        ->whereIn('id', $parentIds)
                        ->get();

                    // Merge parents and children, then sort by sort_order
                    $gradingPeriods = $assignedPeriods->merge($parentSemesters)->sortBy('sort_order')->values();
                } else {
                    $gradingPeriods = $assignedPeriods;
                }

                Log::info('Teacher CSV upload - grading periods filtered by specific assignments', [
                    'teacher_id' => $user->id,
                    'assigned_subjects_count' => $assignedSubjects->count(),
                    'academic_levels_count' => $academicLevels->count(),
                    'assigned_grading_period_ids' => $assignedGradingPeriodIds,
                    'parent_ids_included' => $parentIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray()
                ]);
            } else {
                // Fallback: No specific grading periods assigned, show all for teacher's academic levels
                $assignedAcademicLevelIds = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
                    ->where('is_active', true)
                    ->pluck('academic_level_id')
                    ->unique()
                    ->toArray();

                $gradingPeriods = \App\Models\GradingPeriod::where('is_active', true)
                    ->whereIn('academic_level_id', $assignedAcademicLevelIds)
                    ->orderBy('sort_order')
                    ->get();

                Log::warning('Teacher CSV upload - no specific grading period assignments, showing all for academic level', [
                    'teacher_id' => $user->id,
                    'assigned_subjects_count' => $assignedSubjects->count(),
                    'academic_levels_count' => $academicLevels->count(),
                    'assigned_academic_level_ids' => $assignedAcademicLevelIds,
                    'grading_periods_count' => $gradingPeriods->count(),
                    'grading_periods' => $gradingPeriods->pluck('name', 'id')->toArray(),
                    'note' => 'Admin should assign teacher to specific grading periods'
                ]);
            }

            return Inertia::render('Teacher/Grades/Upload', [
                'user' => $user,
                'assignedSubjects' => $assignedSubjects,
                'academicLevels' => $academicLevels,
                'gradingPeriods' => $gradingPeriods,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher CSVUploadController@index', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Internal server error: ' . $e->getMessage());
        }
    }

    /**
     * Handle CSV upload and process grades for teachers.
     */
    public function upload(Request $request)
    {
        $user = Auth::user();
        
        Log::info('Teacher CSV upload attempt', [
            'teacher_id' => $user->id,
            'user_role' => $user->user_role,
            'request_data' => $request->all()
        ]);
        
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
        ]);
        
        // Get academic level for grade validation
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        
        // Verify the teacher is assigned to this subject
        $isAssigned = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            Log::warning('Teacher attempted to upload grades for unassigned subject', [
                'teacher_id' => $user->id,
                'subject_id' => $request->subject_id
            ]);
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }
        
        try {
            $file = $request->file('csv_file');
            $csvData = $this->parseCSV($file);
            
            $results = $this->processGrades($csvData, $request->all(), $user, $academicLevel);
            
            Log::info('Teacher CSV upload completed successfully', [
                'teacher_id' => $user->id,
                'subject_id' => $request->subject_id,
                'success_count' => $results['success'],
                'error_count' => $results['errors']
            ]);
            
            return back()->with('success', "Successfully processed {$results['success']} grades. {$results['errors']} errors occurred.");
            
        } catch (\Exception $e) {
            Log::error('Error in Teacher CSV upload', [
                'teacher_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['csv_file' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        // Get academic level from query parameter (defaults to senior_highschool)
        $academicLevelKey = request()->get('academic_level', 'senior_highschool');

        // Teachers use 1.0-5.0 grading scale (same as instructors/college)
        Log::info('Teacher CSV template download', [
            'user_id' => Auth::id(),
            'academic_level' => $academicLevelKey,
            'grading_scale' => '1.0-5.0'
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template_' . $academicLevelKey . '.csv"',
        ];

        $callback = function() use ($academicLevelKey) {
            $file = fopen('php://output', 'w');

            // Add headers
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);

            // Add sample data - Teachers use 1.0-5.0 scale (1.0 highest, 3.0 passing)
            $levelPrefix = strtoupper(substr($academicLevelKey, 0, 2));
            fputcsv($file, [$levelPrefix . '-2024-001', 'John Doe', '1.25', 'Excellent performance']);
            fputcsv($file, [$levelPrefix . '-2024-002', 'Jane Smith', '2.0', 'Very good work']);
            fputcsv($file, [$levelPrefix . '-2024-003', 'Mike Johnson', '2.75', 'Good work']);
            fputcsv($file, [$levelPrefix . '-2024-004', 'Sarah Williams', '3.0', 'Passing grade']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Download subject-specific CSV template with enrolled students pre-filled.
     * This template includes columns for MIDTERM and FINAL TERM grades.
     */
    public function downloadSubjectTemplate(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'school_year' => 'required|string|max:20',
        ]);

        $subjectId = $request->query('subject_id');
        $schoolYear = $request->query('school_year');

        // Verify teacher is assigned to this subject
        $assignment = TeacherSubjectAssignment::with(['subject.course', 'section', 'academicLevel', 'gradingPeriod'])
            ->where('teacher_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            Log::warning('Teacher attempted to download template for unassigned subject', [
                'teacher_id' => $user->id,
                'subject_id' => $subjectId,
                'school_year' => $schoolYear,
            ]);
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }

        // Get enrolled students for this subject
        $students = $this->getEnrolledStudents($assignment);

        if ($students->isEmpty()) {
            Log::info('No enrolled students found for subject template', [
                'teacher_id' => $user->id,
                'subject_id' => $subjectId,
                'school_year' => $schoolYear,
            ]);
            return back()->withErrors(['subject_id' => 'No students enrolled in this subject.']);
        }

        $subject = $assignment->subject;
        $subjectName = $subject->name . ' (' . $subject->code . ')';
        $filename = 'grades_template_' . $subject->code . '_' . str_replace('-', '_', $schoolYear) . '.csv';

        Log::info('Teacher downloading subject-specific template', [
            'teacher_id' => $user->id,
            'teacher_name' => $user->name,
            'subject_id' => $subjectId,
            'subject_name' => $subjectName,
            'school_year' => $schoolYear,
            'students_count' => $students->count(),
            'filename' => $filename,
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($students, $subject, $user, $assignment, $schoolYear) {
            $file = fopen('php://output', 'w');

            // Add header information
            fputcsv($file, ['Teacher:', $user->name]);
            fputcsv($file, ['Subject:', $subject->name . ' (' . $subject->code . ')']);
            if ($assignment->section) {
                fputcsv($file, ['Section:', $assignment->section->name]);
            }
            fputcsv($file, ['School Year:', $schoolYear]);
            fputcsv($file, []); // Empty row

            // Add column headers - exact format for Senior High School
            fputcsv($file, ['No.', 'Student ID', 'NAME OF STUDENTS', 'Grade Level Section', 'MIDTERM', 'FINAL TERM', 'FINAL GRADE', 'Remarks']);

            // Add student rows
            $rowNumber = 1;
            foreach ($students as $student) {
                // Build Grade Level Section column: "Grade {level} - {section}"
                $gradeLevelSection = '';
                if ($student->section) {
                    $gradeLevelSection = $student->section->name;
                } elseif ($student->year_of_study) {
                    $gradeLevelSection = 'Year ' . $student->year_of_study;
                }

                fputcsv($file, [
                    $rowNumber++,
                    $student->student_number ?? $student->id,
                    $student->name,
                    $gradeLevelSection,
                    '', // MIDTERM - to be filled by teacher
                    '', // FINAL TERM - to be filled by teacher
                    '', // FINAL GRADE - to be filled by teacher (manual calculation)
                    '', // Remarks - optional notes
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get enrolled students for a teacher's subject assignment.
     * Eager loads section relationships for building Grade Level Section column.
     */
    private function getEnrolledStudents($assignment)
    {
        // Get students enrolled in this subject via StudentSubjectAssignment
        $studentIds = \App\Models\StudentSubjectAssignment::where('subject_id', $assignment->subject_id)
            ->where('school_year', $assignment->school_year)
            ->where('is_active', true)
            ->pluck('student_id');

        if ($studentIds->isEmpty()) {
            // Fallback: get students who have grades in this subject
            $studentIds = StudentGrade::where('subject_id', $assignment->subject_id)
                ->where('school_year', $assignment->school_year)
                ->distinct()
                ->pluck('student_id');
        }

        return User::whereIn('id', $studentIds)
            ->where('user_role', 'student')
            ->with(['section']) // Eager load section for Grade Level Section column
            ->orderBy('name')
            ->get();
    }

    /**
     * Parse CSV file and return data array.
     * Supports multiple formats:
     * - Subject Template: No., Student ID, NAME, Grade Level Section, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
     * - Single: Student ID, Student Name, Grade, Notes
     * - Multi: Student ID, Student Name, Subject Code, Grade, Grading Period, Notes
     */
    private function parseCSV($file)
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');

        // Skip header rows (may have Teacher:, Subject: info)
        $firstLine = fgetcsv($handle);

        // Check if first line is metadata (e.g., "Teacher:", "Subject:")
        if (isset($firstLine[0]) && (stripos($firstLine[0], 'teacher') !== false || stripos($firstLine[0], 'subject') !== false)) {
            // Skip metadata rows until we find the actual header
            while (($line = fgetcsv($handle)) !== false) {
                if (empty($line[0]) || stripos($line[0], 'no.') !== false || stripos($line[0], 'student') !== false) {
                    // Found header row or empty row before header
                    if (stripos($line[0], 'no.') !== false) {
                        $headers = $line;
                        break;
                    }
                }
            }
        } else {
            $headers = $firstLine;
        }

        // Determine format based on headers
        $isSubjectTemplate = false;
        $isMultiSubject = false;

        if (isset($headers[0])) {
            $headerLower = strtolower($headers[0]);
            if (stripos($headerLower, 'no.') !== false || stripos($headerLower, 'no') !== false) {
                // Subject template format: No., Student ID, NAME, Grade Level Section, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
                $isSubjectTemplate = true;
            } elseif (count($headers) >= 5) {
                // Multi-subject format
                $isMultiSubject = true;
            }
        }

        Log::info('CSV parsing started', [
            'format_detected' => $isSubjectTemplate ? 'subject_template' : ($isMultiSubject ? 'multi_subject' : 'single_subject'),
            'header_columns' => count($headers),
        ]);

        while (($row = fgetcsv($handle)) !== false) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            if ($isSubjectTemplate && count($row) >= 6) {
                // Subject template format: No., Student ID, NAME OF STUDENTS, Grade Level Section, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
                // Column indices: 0=No., 1=Student ID, 2=NAME, 3=Grade Level Section, 4=MIDTERM, 5=FINAL TERM, 6=FINAL GRADE, 7=Remarks
                $midterm = isset($row[4]) ? trim($row[4]) : '';
                $finalTerm = isset($row[5]) ? trim($row[5]) : '';
                $finalGrade = isset($row[6]) ? trim($row[6]) : '';
                $remarks = isset($row[7]) ? trim($row[7]) : '';

                // Skip rows without any grades
                if (empty($midterm) && empty($finalTerm) && empty($finalGrade)) {
                    continue;
                }

                $data[] = [
                    'format' => 'subject_template',
                    'student_id' => trim($row[1]), // Student ID column
                    'student_name' => trim($row[2]), // NAME OF STUDENTS column
                    'grade_level_section' => isset($row[3]) ? trim($row[3]) : '', // Grade Level Section column (informational)
                    'midterm' => $midterm, // MIDTERM column
                    'final_term' => $finalTerm, // FINAL TERM column
                    'final_grade' => $finalGrade, // FINAL GRADE column (optional)
                    'remarks' => $remarks, // Remarks column (optional)
                    'subject_code' => '', // Will be filled from form data
                    'grading_period_code' => '',
                ];
            } elseif ($isMultiSubject && count($row) >= 4) {
                // Multi-subject format: Student ID, Student Name, Subject Code, Grade, Grading Period, Notes
                $data[] = [
                    'format' => 'multi_subject',
                    'student_id' => trim($row[0]),
                    'student_name' => trim($row[1]),
                    'subject_code' => trim($row[2]),
                    'grade' => trim($row[3]),
                    'grading_period_code' => isset($row[4]) ? trim($row[4]) : '',
                    'notes' => isset($row[5]) ? trim($row[5]) : '',
                ];
            } elseif (count($row) >= 3) {
                // Single-subject format: Student ID, Student Name, Grade, Notes
                $data[] = [
                    'format' => 'single_subject',
                    'student_id' => trim($row[0]),
                    'student_name' => trim($row[1]),
                    'subject_code' => '', // Will be filled from form data
                    'grade' => trim($row[2]),
                    'grading_period_code' => '',
                    'notes' => isset($row[3]) ? trim($row[3]) : '',
                ];
            }
        }

        Log::info('CSV parsing completed', [
            'rows_parsed' => count($data),
            'format' => $isSubjectTemplate ? 'subject_template' : ($isMultiSubject ? 'multi_subject' : 'single_subject'),
        ]);

        fclose($handle);
        return $data;
    }
    
    /**
     * Process grades from CSV data for teachers.
     * Supports single-subject, multi-subject, and subject template modes.
     */
    private function processGrades($csvData, $requestData, $user, $academicLevel)
    {
        $success = 0;
        $errors = 0;
        $errorDetails = [];

        Log::info('Starting CSV grade processing', [
            'teacher_id' => $user->id,
            'teacher_name' => $user->name,
            'row_count' => count($csvData),
            'school_year' => $requestData['school_year'],
            'subject_id' => $requestData['subject_id'] ?? null,
        ]);

        foreach ($csvData as $index => $row) {
            try {
                // Validate student exists
                $student = User::where('id', $row['student_id'])
                    ->orWhere('student_number', $row['student_id'])
                    ->first();

                if (!$student) {
                    $errors++;
                    $errorDetails[] = "Row " . ($index + 1) . ": Student not found - " . $row['student_id'];
                    Log::warning('CSV upload: Student not found', [
                        'row' => $index + 1,
                        'student_id' => $row['student_id'],
                        'teacher_id' => $user->id,
                    ]);
                    continue;
                }

                // Handle subject template format (MIDTERM and FINAL TERM columns)
                if (isset($row['format']) && $row['format'] === 'subject_template') {
                    $processed = $this->processSubjectTemplateRow($row, $requestData, $user, $student, $academicLevel, $index);
                    $success += $processed['success'];
                    $errors += $processed['errors'];
                    if (!empty($processed['error_message'])) {
                        $errorDetails[] = $processed['error_message'];
                    }
                    continue;
                }

                // Determine subject_id (from CSV or form)
                $subjectId = $requestData['subject_id'] ?? null;
                $rowAcademicLevel = $academicLevel;
                $academicLevelId = $requestData['academic_level_id'] ?? null;

                if (!empty($row['subject_code'])) {
                    // Multi-subject mode: Look up subject by code
                    $subject = Subject::where('code', $row['subject_code'])->first();

                    if (!$subject) {
                        $errors++;
                        $errorDetails[] = "Row " . ($index + 1) . ": Subject not found - " . $row['subject_code'];
                        Log::warning('CSV upload: Subject not found', [
                            'row' => $index + 1,
                            'subject_code' => $row['subject_code'],
                            'teacher_id' => $user->id,
                        ]);
                        continue;
                    }

                    $subjectId = $subject->id;

                    // Verify teacher is assigned to this subject
                    $assignment = \App\Models\TeacherSubjectAssignment::where('teacher_id', $user->id)
                        ->where('subject_id', $subjectId)
                        ->where('is_active', true)
                        ->with('academicLevel')
                        ->first();

                    if (!$assignment) {
                        $errors++;
                        $errorDetails[] = "Row " . ($index + 1) . ": Teacher not assigned to subject - " . $row['subject_code'];
                        Log::warning('CSV upload: Teacher not assigned to subject', [
                            'row' => $index + 1,
                            'subject_code' => $row['subject_code'],
                            'teacher_id' => $user->id,
                        ]);
                        continue;
                    }

                    // Get academic level from assignment
                    $rowAcademicLevel = $assignment->academicLevel;
                    $academicLevelId = $rowAcademicLevel->id;
                }

                if (!$subjectId) {
                    $errors++;
                    $errorDetails[] = "Row " . ($index + 1) . ": Subject ID required";
                    continue;
                }

                // Determine grading_period_id (from CSV or form)
                $gradingPeriodId = $requestData['grading_period_id'] ?? null;

                if (!empty($row['grading_period_code'])) {
                    // Look up grading period by code
                    $gradingPeriod = \App\Models\GradingPeriod::where('code', $row['grading_period_code'])->first();
                    if ($gradingPeriod) {
                        $gradingPeriodId = $gradingPeriod->id;
                    }
                }

                // Validate grade - Teachers use 1.0-5.0 grading scale (same as instructors)
                $grade = floatval($row['grade']);
                $isValidGrade = ($grade >= 1.0 && $grade <= 5.0);

                if (!$isValidGrade) {
                    $errors++;
                    $errorDetails[] = "Row " . ($index + 1) . ": Invalid grade value - " . $grade . " (must be 1.0-5.0)";
                    Log::warning('CSV upload: Invalid grade', [
                        'row' => $index + 1,
                        'student_id' => $student->id,
                        'grade' => $grade,
                        'expected_range' => '1.0-5.0',
                        'academic_level' => $rowAcademicLevel ? $rowAcademicLevel->key : 'unknown',
                    ]);
                    continue;
                }

                // Check if grade already exists
                $existingGrade = StudentGrade::where([
                    'student_id' => $student->id,
                    'subject_id' => $subjectId,
                    'academic_level_id' => $academicLevelId,
                    'grading_period_id' => $gradingPeriodId,
                    'school_year' => $requestData['school_year'],
                ])->first();

                if ($existingGrade) {
                    // Check if grade is still editable (5-day window and not submitted)
                    if (!$existingGrade->isEditableByInstructor()) {
                        $editStatus = $existingGrade->getEditStatus();
                        $reason = $editStatus === 'locked'
                            ? 'submitted for validation'
                            : 'edit window expired (5 days)';

                        Log::warning('CSV upload attempted to update non-editable grade', [
                            'teacher_id' => $user->id,
                            'grade_id' => $existingGrade->id,
                            'student_id' => $student->id,
                            'edit_status' => $editStatus,
                            'reason' => $reason,
                            'days_since_creation' => $existingGrade->created_at->diffInDays(now()),
                        ]);

                        $errors++;
                        continue; // Skip this grade and move to next
                    }

                    // Update existing grade (only if editable)
                    $existingGrade->update([
                        'grade' => $grade,
                        'updated_by' => $user->id,
                        'updated_at' => now(),
                    ]);
                    Log::info('CSV upload: Grade updated', [
                        'row' => $index + 1,
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subjectId,
                        'grade' => $grade,
                        'action' => 'update',
                        'days_remaining' => $existingGrade->getDaysRemainingForEdit(),
                    ]);
                } else {
                    // Create new grade
                    StudentGrade::create([
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_level_id' => $academicLevelId,
                        'grading_period_id' => $gradingPeriodId,
                        'school_year' => $requestData['school_year'],
                        'year_of_study' => $requestData['year_of_study'],
                        'grade' => $grade,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]);
                    Log::info('CSV upload: Grade created', [
                        'row' => $index + 1,
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subjectId,
                        'grade' => $grade,
                        'action' => 'create',
                    ]);
                }

                $success++;

            } catch (\Exception $e) {
                $errors++;
                $errorDetails[] = "Row " . ($index + 1) . ": " . $e->getMessage();
                Log::error('CSV upload: Exception processing row', [
                    'row' => $index + 1,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('CSV grade processing completed', [
            'teacher_id' => $user->id,
            'success_count' => $success,
            'error_count' => $errors,
            'total_rows' => count($csvData),
        ]);

        return [
            'success' => $success,
            'errors' => $errors,
            'error_details' => $errorDetails,
        ];
    }

    /**
     * Process a single row from subject template format.
     * Creates separate grade entries for MIDTERM and FINAL TERM.
     * Optionally logs FINAL GRADE if provided by teacher.
     */
    private function processSubjectTemplateRow($row, $requestData, $user, $student, $academicLevel, $rowIndex)
    {
        $success = 0;
        $errors = 0;
        $errorMessage = '';

        // Get subject_id from request (required for this format)
        $subjectId = $requestData['subject_id'] ?? null;

        if (!$subjectId) {
            $errorMessage = "Row " . ($rowIndex + 1) . ": Subject ID is required for template upload";
            Log::warning('CSV upload: Missing subject ID for template format', [
                'row' => $rowIndex + 1,
                'student_id' => $student->id,
            ]);
            return ['success' => 0, 'errors' => 1, 'error_message' => $errorMessage];
        }

        // Log if teacher provided final grade (informational)
        if (!empty($row['final_grade'])) {
            Log::info('CSV upload: Teacher provided FINAL GRADE in template', [
                'row' => $rowIndex + 1,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'final_grade' => $row['final_grade'],
                'remarks' => $row['remarks'] ?? '',
            ]);
        }

        // Verify teacher is assigned to this subject
        $assignment = TeacherSubjectAssignment::where('teacher_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('is_active', true)
            ->with('academicLevel')
            ->first();

        if (!$assignment) {
            $errorMessage = "Row " . ($rowIndex + 1) . ": Teacher not assigned to subject";
            Log::warning('CSV upload: Teacher not assigned to subject', [
                'row' => $rowIndex + 1,
                'student_id' => $student->id,
                'subject_id' => $subjectId,
                'teacher_id' => $user->id,
            ]);
            return ['success' => 0, 'errors' => 1, 'error_message' => $errorMessage];
        }

        $rowAcademicLevel = $assignment->academicLevel;
        $academicLevelId = $rowAcademicLevel->id;

        // Find midterm and final term grading periods for Senior High School
        // Pattern: SHS_S*_M for midterm, SHS_S*_F for final
        $midtermPeriod = \App\Models\GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('code', 'LIKE', '%_M')
            ->where('is_active', true)
            ->first();

        $finalPeriod = \App\Models\GradingPeriod::where('academic_level_id', $academicLevelId)
            ->where('code', 'LIKE', '%_F')
            ->where('is_active', true)
            ->first();

        // Process MIDTERM grade if provided
        if (!empty($row['midterm'])) {
            $midtermGrade = floatval($row['midterm']);

            // Validate grade - Teachers use 1.0-5.0 scale (same as instructors)
            $isValidGrade = ($midtermGrade >= 1.0 && $midtermGrade <= 5.0);

            if ($isValidGrade && $midtermPeriod) {
                try {
                    $existingGrade = StudentGrade::where([
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_level_id' => $academicLevelId,
                        'grading_period_id' => $midtermPeriod->id,
                        'school_year' => $requestData['school_year'],
                    ])->first();

                    $gradeProcessed = false;

                    if ($existingGrade) {
                        // Check if grade is still editable
                        if (!$existingGrade->isEditableByInstructor()) {
                            $editStatus = $existingGrade->getEditStatus();
                            Log::warning('CSV upload attempted to update non-editable midterm grade', [
                                'teacher_id' => $user->id,
                                'grade_id' => $existingGrade->id,
                                'edit_status' => $editStatus,
                                'days_since_creation' => $existingGrade->created_at->diffInDays(now()),
                            ]);
                            $errors++;
                        } else {
                            $existingGrade->update([
                                'grade' => $midtermGrade,
                                'updated_by' => $user->id,
                            ]);
                            $gradeProcessed = true;
                        }
                    } else {
                        StudentGrade::create([
                            'student_id' => $student->id,
                            'subject_id' => $subjectId,
                            'academic_level_id' => $academicLevelId,
                            'grading_period_id' => $midtermPeriod->id,
                            'school_year' => $requestData['school_year'],
                            'year_of_study' => $requestData['year_of_study'] ?? $row['grade_level_section'],
                            'grade' => $midtermGrade,
                            'created_by' => $user->id,
                            'updated_by' => $user->id,
                        ]);
                        $gradeProcessed = true;
                    }

                    if ($gradeProcessed) {
                        Log::info('CSV upload: Midterm grade processed', [
                            'row' => $rowIndex + 1,
                            'student_id' => $student->id,
                            'student_name' => $student->name,
                            'subject_id' => $subjectId,
                            'grade' => $midtermGrade,
                            'period' => 'midterm',
                        ]);

                        $success++;
                    }
                } catch (\Exception $e) {
                    $errors++;
                    Log::error('CSV upload: Error processing midterm grade', [
                        'row' => $rowIndex + 1,
                        'student_id' => $student->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            } else {
                $errors++;
                $errorMessage = "Row " . ($rowIndex + 1) . ": Invalid midterm grade - " . $midtermGrade;
            }
        }

        // Process FINAL TERM grade if provided
        if (!empty($row['final_term'])) {
            $finalGrade = floatval($row['final_term']);

            // Validate grade - Teachers use 1.0-5.0 scale (same as instructors)
            $isValidGrade = ($finalGrade >= 1.0 && $finalGrade <= 5.0);

            if ($isValidGrade && $finalPeriod) {
                try {
                    $existingGrade = StudentGrade::where([
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_level_id' => $academicLevelId,
                        'grading_period_id' => $finalPeriod->id,
                        'school_year' => $requestData['school_year'],
                    ])->first();

                    $gradeProcessed = false;

                    if ($existingGrade) {
                        // Check if grade is still editable
                        if (!$existingGrade->isEditableByInstructor()) {
                            $editStatus = $existingGrade->getEditStatus();
                            Log::warning('CSV upload attempted to update non-editable final grade', [
                                'teacher_id' => $user->id,
                                'grade_id' => $existingGrade->id,
                                'edit_status' => $editStatus,
                                'days_since_creation' => $existingGrade->created_at->diffInDays(now()),
                            ]);
                            $errors++;
                        } else {
                            $existingGrade->update([
                                'grade' => $finalGrade,
                                'updated_by' => $user->id,
                            ]);
                            $gradeProcessed = true;
                        }
                    } else {
                        StudentGrade::create([
                            'student_id' => $student->id,
                            'subject_id' => $subjectId,
                            'academic_level_id' => $academicLevelId,
                            'grading_period_id' => $finalPeriod->id,
                            'school_year' => $requestData['school_year'],
                            'year_of_study' => $requestData['year_of_study'] ?? $row['grade_level_section'],
                            'grade' => $finalGrade,
                            'created_by' => $user->id,
                            'updated_by' => $user->id,
                        ]);
                        $gradeProcessed = true;
                    }

                    if ($gradeProcessed) {
                        Log::info('CSV upload: Final grade processed', [
                            'row' => $rowIndex + 1,
                            'student_id' => $student->id,
                            'student_name' => $student->name,
                            'subject_id' => $subjectId,
                            'grade' => $finalGrade,
                            'period' => 'final',
                        ]);

                        $success++;
                    }
                } catch (\Exception $e) {
                    $errors++;
                    Log::error('CSV upload: Error processing final grade', [
                        'row' => $rowIndex + 1,
                        'student_id' => $student->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            } else {
                $errors++;
                $errorMessage = "Row " . ($rowIndex + 1) . ": Invalid final grade - " . $finalGrade;
            }
        }

        return [
            'success' => $success,
            'errors' => $errors,
            'error_message' => $errorMessage,
        ];
    }
}
