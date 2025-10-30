<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\InstructorCourseAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\InstructorSubjectAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CSVUploadController extends Controller
{
    /**
     * Display the CSV upload form.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get instructor's assigned subjects (new subject-based system)
        $assignedSubjects = \App\Models\InstructorSubjectAssignment::with(['subject.course', 'academicLevel', 'gradingPeriod'])
            ->where('instructor_id', $user->id)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->where('key', 'college');
            })
            ->get();
        
        // Get academic levels (College only) and grading periods for the form
        $academicLevels = \App\Models\AcademicLevel::where('key', 'college')->orderBy('name')->get();
        $gradingPeriods = \App\Models\GradingPeriod::where('is_active', true)->orderBy('sort_order')->get();
        
        return Inertia::render('Instructor/Grades/Upload', [
            'user' => $user,
            'assignedSubjects' => $assignedSubjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }
    
    /**
     * Handle CSV upload and process grades.
     */
    public function upload(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'subject_id' => 'nullable|exists:subjects,id',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
        ]);
        
        // Get academic level for grade validation (optional if multi-subject)
        $academicLevel = $request->academic_level_id ? \App\Models\AcademicLevel::find($request->academic_level_id) : null;

        // If single subject mode, verify the instructor is assigned to this subject
        if ($request->subject_id) {
            $isAssigned = \App\Models\InstructorSubjectAssignment::where('instructor_id', $user->id)
                ->where('subject_id', $request->subject_id)
                ->where('is_active', true)
                ->exists();

            if (!$isAssigned) {
                return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
            }
        }
        
        try {
            $file = $request->file('csv_file');
            $csvData = $this->parseCSV($file);
            
            $results = $this->processGrades($csvData, $request->all(), $user, $academicLevel);
            
            return back()->with('success', "Successfully processed {$results['success']} grades. {$results['errors']} errors occurred.");
            
        } catch (\Exception $e) {
            return back()->withErrors(['csv_file' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Download CSV template.
     * Provides multi-subject template by default.
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template_multi_subject.csv"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');

            // Add headers for multi-subject format
            fputcsv($file, ['Student ID', 'Student Name', 'Subject Code', 'Grade', 'Grading Period', 'Notes']);

            // Add sample data for multiple subjects and grading periods
            fputcsv($file, ['CO-2024-001', 'John Doe', 'DBMS01', '1.5', 'COL_S1_M', 'Good performance']);
            fputcsv($file, ['CO-2024-001', 'John Doe', 'WEBDEV01', '1.75', 'COL_S1_M', 'Excellent work']);
            fputcsv($file, ['CO-2024-002', 'Jane Smith', 'DBMS01', '2.0', 'COL_S1_M', 'Satisfactory']);
            fputcsv($file, ['CO-2024-002', 'Jane Smith', 'WEBDEV01', '1.25', 'COL_S2_M', 'Outstanding']);

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

        // Verify instructor is assigned to this subject
        $assignment = InstructorSubjectAssignment::with(['subject.course', 'section', 'academicLevel', 'gradingPeriod'])
            ->where('instructor_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            Log::warning('Instructor attempted to download template for unassigned subject', [
                'instructor_id' => $user->id,
                'subject_id' => $subjectId,
                'school_year' => $schoolYear,
            ]);
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }

        // Get enrolled students for this subject
        $students = $this->getEnrolledStudents($assignment);

        if ($students->isEmpty()) {
            Log::info('No enrolled students found for subject template', [
                'instructor_id' => $user->id,
                'subject_id' => $subjectId,
                'section_id' => $assignment->section_id,
                'school_year' => $schoolYear,
            ]);
            return back()->withErrors(['subject_id' => 'No students enrolled in this subject.']);
        }

        $subject = $assignment->subject;
        $subjectName = $subject->name . ' (' . $subject->code . ')';
        $filename = 'grades_template_' . $subject->code . '_' . str_replace('-', '_', $schoolYear) . '.csv';

        Log::info('Instructor downloading subject-specific template', [
            'instructor_id' => $user->id,
            'instructor_name' => $user->name,
            'subject_id' => $subjectId,
            'subject_name' => $subjectName,
            'section_id' => $assignment->section_id,
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

            // Add column headers - exact format from screenshot
            fputcsv($file, ['No.', 'Student ID', 'NAME OF STUDENTS', 'Course Year', 'MIDTERM', 'FINAL TERM', 'FINAL GRADE', 'Remarks']);

            // Add student rows
            $rowNumber = 1;
            foreach ($students as $student) {
                // Build Course Year column: "{Course Code} {Section Name}"
                $courseYear = '';
                if ($student->section) {
                    if ($student->section->course) {
                        // Format: "BSCS 1A" (Course Code + Section Name)
                        $courseYear = $student->section->course->code . ' ' . $student->section->name;
                    } else {
                        // Fallback to section name only
                        $courseYear = $student->section->name;
                    }
                } elseif ($student->year_of_study) {
                    // Fallback to year of study
                    $courseYear = 'Year ' . $student->year_of_study;
                }

                fputcsv($file, [
                    $rowNumber++,
                    $student->student_number ?? $student->id,
                    $student->name,
                    $courseYear,
                    '', // MIDTERM - to be filled by instructor
                    '', // FINAL TERM - to be filled by instructor
                    '', // FINAL GRADE - to be filled by instructor (manual calculation)
                    '', // Remarks - optional notes
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get enrolled students for an instructor's subject assignment.
     * Eager loads section and course relationships for building Course Year column.
     */
    private function getEnrolledStudents($assignment)
    {
        // Get students from the section
        if ($assignment->section_id) {
            return User::where('section_id', $assignment->section_id)
                ->where('user_role', 'student')
                ->with(['section.course']) // Eager load section and course for Course Year column
                ->orderBy('name')
                ->get();
        }

        // Fallback: get students who have grades in this subject
        $studentIds = StudentGrade::where('subject_id', $assignment->subject_id)
            ->where('school_year', $assignment->school_year)
            ->distinct()
            ->pluck('student_id');

        return User::whereIn('id', $studentIds)
            ->where('user_role', 'student')
            ->with(['section.course']) // Eager load section and course for Course Year column
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Parse CSV file and return data array.
     * Supports multiple formats:
     * - Subject Template: No., Student ID, NAME, Course Year, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
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
                // Subject template format: No., Student ID, NAME, Course Year, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
                $isSubjectTemplate = true;
            } elseif (count($headers) >= 5) {
                // Multi-subject format
                $isMultiSubject = true;
            }
        }

        while (($row = fgetcsv($handle)) !== false) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            if ($isSubjectTemplate && count($row) >= 6) {
                // Subject template format: No., Student ID, NAME OF STUDENTS, Course Year, MIDTERM, FINAL TERM, FINAL GRADE, Remarks
                // Column indices: 0=No., 1=Student ID, 2=NAME, 3=Course Year, 4=MIDTERM, 5=FINAL TERM, 6=FINAL GRADE, 7=Remarks
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
                    'course_year' => isset($row[3]) ? trim($row[3]) : '', // Course Year column (informational)
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

        fclose($handle);
        return $data;
    }
    
    /**
     * Process grades from CSV data.
     * Supports single-subject, multi-subject, and subject template modes.
     */
    private function processGrades($csvData, $requestData, $user, $academicLevel)
    {
        $success = 0;
        $errors = 0;
        $errorDetails = [];

        Log::info('Starting CSV grade processing', [
            'instructor_id' => $user->id,
            'instructor_name' => $user->name,
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
                        'instructor_id' => $user->id,
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
                        continue;
                    }

                    $subjectId = $subject->id;

                    // Verify instructor is assigned to this subject
                    $assignment = \App\Models\InstructorSubjectAssignment::where('instructor_id', $user->id)
                        ->where('subject_id', $subjectId)
                        ->where('is_active', true)
                        ->with('academicLevel')
                        ->first();

                    if (!$assignment) {
                        $errors++;
                        continue;
                    }

                    // Get academic level from assignment
                    $rowAcademicLevel = $assignment->academicLevel;
                    $academicLevelId = $rowAcademicLevel->id;
                }

                if (!$subjectId) {
                    $errors++;
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

                // Validate grade based on academic level
                $grade = floatval($row['grade']);
                $isValidGrade = false;

                if ($rowAcademicLevel && $rowAcademicLevel->key === 'college') {
                    // College: 1.0 to 5.0, where 3.0 is passing
                    $isValidGrade = ($grade >= 1.0 && $grade <= 5.0);
                } else {
                    // Elementary to Senior High: 75 to 100, where 75 is passing
                    $isValidGrade = ($grade >= 75 && $grade <= 100);
                }

                if (!$isValidGrade) {
                    $errors++;
                    $errorDetails[] = "Row " . ($index + 1) . ": Invalid grade value - " . $grade;
                    Log::warning('CSV upload: Invalid grade', [
                        'row' => $index + 1,
                        'student_id' => $student->id,
                        'grade' => $grade,
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
                            'instructor_id' => $user->id,
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
            'instructor_id' => $user->id,
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
     * Optionally logs FINAL GRADE if provided by instructor.
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

        // Log if instructor provided final grade (informational)
        if (!empty($row['final_grade'])) {
            Log::info('CSV upload: Instructor provided FINAL GRADE in template', [
                'row' => $rowIndex + 1,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'final_grade' => $row['final_grade'],
                'remarks' => $row['remarks'] ?? '',
            ]);
        }

        // Verify instructor is assigned to this subject
        $assignment = InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $subjectId)
            ->where('is_active', true)
            ->with('academicLevel')
            ->first();

        if (!$assignment) {
            $errorMessage = "Row " . ($rowIndex + 1) . ": Instructor not assigned to subject";
            Log::warning('CSV upload: Instructor not assigned to subject', [
                'row' => $rowIndex + 1,
                'student_id' => $student->id,
                'subject_id' => $subjectId,
                'instructor_id' => $user->id,
            ]);
            return ['success' => 0, 'errors' => 1, 'error_message' => $errorMessage];
        }

        $rowAcademicLevel = $assignment->academicLevel;
        $academicLevelId = $rowAcademicLevel->id;

        // Find midterm and final term grading periods for college
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

            // Validate grade
            $isValidGrade = false;
            if ($rowAcademicLevel->key === 'college') {
                $isValidGrade = ($midtermGrade >= 1.0 && $midtermGrade <= 5.0);
            } else {
                $isValidGrade = ($midtermGrade >= 75 && $midtermGrade <= 100);
            }

            if ($isValidGrade && $midtermPeriod) {
                try {
                    $existingGrade = StudentGrade::where([
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_level_id' => $academicLevelId,
                        'grading_period_id' => $midtermPeriod->id,
                        'school_year' => $requestData['school_year'],
                    ])->first();

                    if ($existingGrade) {
                        // Check if grade is still editable
                        if (!$existingGrade->isEditableByInstructor()) {
                            $editStatus = $existingGrade->getEditStatus();
                            Log::warning('CSV upload attempted to update non-editable midterm grade', [
                                'instructor_id' => $user->id,
                                'grade_id' => $existingGrade->id,
                                'edit_status' => $editStatus,
                                'days_since_creation' => $existingGrade->created_at->diffInDays(now()),
                            ]);
                            $errors++;
                            continue; // Skip this grade
                        }
                        $existingGrade->update(['grade' => $midtermGrade]);
                    } else {
                        StudentGrade::create([
                            'student_id' => $student->id,
                            'subject_id' => $subjectId,
                            'academic_level_id' => $academicLevelId,
                            'grading_period_id' => $midtermPeriod->id,
                            'school_year' => $requestData['school_year'],
                            'year_of_study' => $requestData['year_of_study'] ?? $row['course_year'],
                            'grade' => $midtermGrade,
                        ]);
                    }

                    Log::info('CSV upload: Midterm grade processed', [
                        'row' => $rowIndex + 1,
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subjectId,
                        'grade' => $midtermGrade,
                        'period' => 'midterm',
                    ]);

                    $success++;
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

            // Validate grade
            $isValidGrade = false;
            if ($rowAcademicLevel->key === 'college') {
                $isValidGrade = ($finalGrade >= 1.0 && $finalGrade <= 5.0);
            } else {
                $isValidGrade = ($finalGrade >= 75 && $finalGrade <= 100);
            }

            if ($isValidGrade && $finalPeriod) {
                try {
                    $existingGrade = StudentGrade::where([
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_level_id' => $academicLevelId,
                        'grading_period_id' => $finalPeriod->id,
                        'school_year' => $requestData['school_year'],
                    ])->first();

                    if ($existingGrade) {
                        // Check if grade is still editable
                        if (!$existingGrade->isEditableByInstructor()) {
                            $editStatus = $existingGrade->getEditStatus();
                            Log::warning('CSV upload attempted to update non-editable final grade', [
                                'instructor_id' => $user->id,
                                'grade_id' => $existingGrade->id,
                                'edit_status' => $editStatus,
                                'days_since_creation' => $existingGrade->created_at->diffInDays(now()),
                            ]);
                            $errors++;
                            continue; // Skip this grade
                        }
                        $existingGrade->update(['grade' => $finalGrade]);
                    } else {
                        StudentGrade::create([
                            'student_id' => $student->id,
                            'subject_id' => $subjectId,
                            'academic_level_id' => $academicLevelId,
                            'grading_period_id' => $finalPeriod->id,
                            'school_year' => $requestData['school_year'],
                            'year_of_study' => $requestData['year_of_study'] ?? $row['course_year'],
                            'grade' => $finalGrade,
                        ]);
                    }

                    Log::info('CSV upload: Final grade processed', [
                        'row' => $rowIndex + 1,
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'subject_id' => $subjectId,
                        'grade' => $finalGrade,
                        'period' => 'final',
                    ]);

                    $success++;
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
