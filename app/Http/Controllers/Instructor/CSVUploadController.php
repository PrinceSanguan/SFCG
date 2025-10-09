<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use App\Models\InstructorCourseAssignment;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
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
     * Parse CSV file and return data array.
     * Supports both single-subject and multi-subject formats:
     * - Single: Student ID, Student Name, Grade, Notes
     * - Multi: Student ID, Student Name, Subject Code, Grade, Grading Period, Notes
     */
    private function parseCSV($file)
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');

        // Read header row to determine format
        $headers = fgetcsv($handle);
        $isMultiSubject = count($headers) >= 5; // Multi-subject has at least 5 columns

        while (($row = fgetcsv($handle)) !== false) {
            if ($isMultiSubject && count($row) >= 4) {
                // Multi-subject format: Student ID, Student Name, Subject Code, Grade, Grading Period, Notes
                $data[] = [
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
     * Supports both single-subject and multi-subject modes.
     */
    private function processGrades($csvData, $requestData, $user, $academicLevel)
    {
        $success = 0;
        $errors = 0;

        foreach ($csvData as $row) {
            try {
                // Validate student exists
                $student = User::where('id', $row['student_id'])
                    ->orWhere('student_number', $row['student_id'])
                    ->first();

                if (!$student) {
                    $errors++;
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
                    // Update existing grade
                    $existingGrade->update([
                        'grade' => $grade,
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
                }

                $success++;

            } catch (\Exception $e) {
                $errors++;
            }
        }

        return [
            'success' => $success,
            'errors' => $errors,
        ];
    }
}
