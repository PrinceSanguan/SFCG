<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\ClassAdviserAssignment;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CSVUploadController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $schoolYear = request('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereHas('subject')
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->get();

        $assignedSubjects = $assignments->filter(function ($assignment) {
            return $assignment->subject && $assignment->academicLevel;
        })->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'subject' => [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                ],
                'academicLevel' => [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ],
            ];
        })->values();

        $academicLevels = AcademicLevel::whereIn('key', ['elementary', 'junior_highschool'])->orderBy('name')->get();
        $gradingPeriods = GradingPeriod::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Adviser/Grades/Upload', [
            'user' => $user,
            'assignedSubjects' => $assignedSubjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'schoolYear' => $schoolYear,
        ]);
    }

    public function upload(Request $request)
    {
        $user = Auth::user();

        // Handle "0" value for grading_period_id (no period selected)
        if ($request->grading_period_id === '0') {
            $request->merge(['grading_period_id' => null]);
        }

        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
        ]);

        // Ensure adviser is assigned to this subject in the selected school year
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('school_year', $request->school_year)
            ->where('is_active', true)
            ->whereHas('academicLevel', function ($query) {
                $query->whereIn('key', ['elementary', 'junior_highschool']);
            })
            ->exists();

        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject or advisers can only upload grades for Elementary and Junior High School.']);
        }

        try {
            $file = $request->file('csv_file');
            $csvData = $this->parseCSV($file);

            if (empty($csvData)) {
                return back()->withErrors(['csv_file' => 'The CSV file is empty or has no valid data rows.']);
            }

            $results = $this->processGrades($csvData, $request->all());

            if ($results['errors'] > 0) {
                $errorMessage = "{$results['errors']} errors occurred:\n" . implode("\n", array_slice($results['error_details'], 0, 5));
                if (count($results['error_details']) > 5) {
                    $errorMessage .= "\n... and " . (count($results['error_details']) - 5) . " more errors.";
                }

                return back()->with([
                    'success' => "Successfully processed {$results['success']} grades.",
                    'warning' => $errorMessage
                ]);
            }

            return back()->with('success', "Successfully processed {$results['success']} grades!");
        } catch (\Exception $e) {
            return back()->withErrors(['csv_file' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate(Request $request)
    {
        $user = Auth::user();
        $subjectId = $request->get('subject_id');
        $schoolYear = $request->get('school_year', '2024-2025');

        $filename = 'grades_template_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($user, $subjectId, $schoolYear) {
            $file = fopen('php://output', 'w');

            // Write header row
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);

            // If a subject is selected, include actual enrolled students
            if ($subjectId) {
                $enrollments = \App\Models\StudentSubjectAssignment::with('student')
                    ->where('subject_id', $subjectId)
                    ->where('school_year', $schoolYear)
                    ->where('is_active', true)
                    ->whereHas('student')
                    ->get();

                foreach ($enrollments as $enrollment) {
                    if ($enrollment->student) {
                        fputcsv($file, [
                            $enrollment->student->student_number ?? $enrollment->student->id,
                            $enrollment->student->name,
                            '', // Empty grade to fill in
                            '' // Empty notes
                        ]);
                    }
                }
            } else {
                // Show example rows if no subject selected
                fputcsv($file, ['STUDENT-001', 'John Doe', '95', 'Example: Excellent performance']);
                fputcsv($file, ['STUDENT-002', 'Jane Smith', '83', 'Example: Good work']);
                fputcsv($file, ['STUDENT-003', 'Bob Johnson', '78', 'Example: Needs improvement']);
            }

            // Add instructions as comments at the bottom
            fputcsv($file, []);
            fputcsv($file, ['Instructions:']);
            fputcsv($file, ['1. Fill in the Grade column for each student (75-100 for Elementary/JHS)']);
            fputcsv($file, ['2. Student ID can be either the student number or database ID']);
            fputcsv($file, ['3. Notes are optional']);
            fputcsv($file, ['4. Do not modify the Student ID or Student Name columns']);
            fputcsv($file, ['5. Save the file and upload it back to the system']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function parseCSV($file)
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');

        // Skip header row
        $header = fgetcsv($handle);

        $lineNumber = 1; // Start from 1 since we skip header
        while (($row = fgetcsv($handle)) !== false) {
            $lineNumber++;

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Ensure minimum required columns
            if (count($row) >= 3 && !empty(trim($row[0])) && !empty(trim($row[2]))) {
                $data[] = [
                    'line_number' => $lineNumber,
                    'student_id' => trim($row[0]),
                    'student_name' => trim($row[1] ?? ''),
                    'grade' => trim($row[2]),
                    'notes' => isset($row[3]) ? trim($row[3]) : '',
                ];
            }
        }
        fclose($handle);
        return $data;
    }

    private function processGrades($csvData, $requestData)
    {
        $success = 0;
        $errors = 0;
        $errorDetails = [];

        foreach ($csvData as $row) {
            try {
                $lineNum = $row['line_number'] ?? 'Unknown';

                // Find student by ID or student number
                $student = User::where('id', $row['student_id'])
                    ->orWhere('student_number', $row['student_id'])
                    ->where('user_role', 'student')
                    ->first();

                if (!$student) {
                    $errors++;
                    $errorDetails[] = "Line {$lineNum}: Student '{$row['student_id']}' not found";
                    \Log::warning("CSV Upload - Student not found", [
                        'line' => $lineNum,
                        'student_id' => $row['student_id']
                    ]);
                    continue;
                }

                // Validate grade value
                $grade = floatval($row['grade']);
                if ($grade < 75 || $grade > 100) {
                    $errors++;
                    $errorDetails[] = "Line {$lineNum}: Invalid grade {$row['grade']} (must be 75-100)";
                    \Log::warning("CSV Upload - Invalid grade", [
                        'line' => $lineNum,
                        'grade' => $row['grade']
                    ]);
                    continue;
                }

                // Check for existing grade
                $existing = StudentGrade::where([
                    'student_id' => $student->id,
                    'subject_id' => $requestData['subject_id'],
                    'academic_level_id' => $requestData['academic_level_id'],
                    'school_year' => $requestData['school_year'],
                ])->when($requestData['grading_period_id'] ?? null, function ($q, $gp) {
                    $q->where('grading_period_id', $gp);
                })->when(!($requestData['grading_period_id'] ?? null), function ($q) {
                    $q->whereNull('grading_period_id');
                })->first();

                if ($existing) {
                    $existing->update(['grade' => $grade]);
                    \Log::info("CSV Upload - Grade updated", [
                        'student_id' => $student->id,
                        'grade' => $grade
                    ]);
                } else {
                    // Auto-populate year_of_study from student's specific_year_level if not provided
                    $yearOfStudy = $requestData['year_of_study'] ?? null;
                    if (!$yearOfStudy && $student->specific_year_level) {
                        // Extract numeric value from specific_year_level
                        // e.g., "grade_1" -> 1, "1st_year" -> 1, "grade_10" -> 10
                        if (preg_match('/(\d+)/', $student->specific_year_level, $matches)) {
                            $yearOfStudy = (int)$matches[1];
                        }
                    }

                    StudentGrade::create([
                        'student_id' => $student->id,
                        'subject_id' => $requestData['subject_id'],
                        'academic_level_id' => $requestData['academic_level_id'],
                        'grading_period_id' => $requestData['grading_period_id'] ?? null,
                        'school_year' => $requestData['school_year'],
                        'year_of_study' => $yearOfStudy,
                        'grade' => $grade,
                    ]);
                    \Log::info("CSV Upload - Grade created", [
                        'student_id' => $student->id,
                        'grade' => $grade
                    ]);
                }

                $success++;
            } catch (\Exception $e) {
                $errors++;
                $lineNum = $row['line_number'] ?? 'Unknown';
                $errorDetails[] = "Line {$lineNum}: {$e->getMessage()}";
                \Log::error("CSV Upload - Processing error", [
                    'line' => $lineNum,
                    'error' => $e->getMessage()
                ]);
            }
        }

        \Log::info("CSV Upload - Completed", [
            'success' => $success,
            'errors' => $errors,
            'error_details' => $errorDetails
        ]);

        return [
            'success' => $success,
            'errors' => $errors,
            'error_details' => $errorDetails
        ];
    }
}


