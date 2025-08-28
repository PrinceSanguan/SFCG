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

        $assignedSubjects = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->get();

        $academicLevels = AcademicLevel::orderBy('name')->get();
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
            ->exists();

        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }

        try {
            $file = $request->file('csv_file');
            $csvData = $this->parseCSV($file);

            $results = $this->processGrades($csvData, $request->all());

            return back()->with('success', "Successfully processed {$results['success']} grades. {$results['errors']} errors occurred.");
        } catch (\Exception $e) {
            return back()->withErrors(['csv_file' => 'Error processing CSV file: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template_adviser.csv"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);
            // Elementary/JHS scale 75-100
            fputcsv($file, ['EL-2024-001', 'John Doe', '95', 'Excellent']);
            fputcsv($file, ['EL-2024-002', 'Jane Smith', '83', 'Good']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function parseCSV($file)
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');
        fgetcsv($handle); // skip header
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) >= 3) {
                $data[] = [
                    'student_id' => trim($row[0]),
                    'student_name' => trim($row[1]),
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

        foreach ($csvData as $row) {
            try {
                $student = User::where('id', $row['student_id'])
                    ->orWhere('student_number', $row['student_id'])
                    ->first();
                if (!$student) { $errors++; continue; }

                $grade = floatval($row['grade']);
                if ($grade < 75 || $grade > 100) { $errors++; continue; }

                $existing = StudentGrade::where([
                    'student_id' => $student->id,
                    'subject_id' => $requestData['subject_id'],
                    'academic_level_id' => $requestData['academic_level_id'],
                    'school_year' => $requestData['school_year'],
                ])->when($requestData['grading_period_id'] ?? null, function ($q, $gp) { $q->where('grading_period_id', $gp); })
                  ->when(!($requestData['grading_period_id'] ?? null), function ($q) { $q->whereNull('grading_period_id'); })
                  ->first();

                if ($existing) {
                    $existing->update(['grade' => $grade]);
                } else {
                    StudentGrade::create([
                        'student_id' => $student->id,
                        'subject_id' => $requestData['subject_id'],
                        'academic_level_id' => $requestData['academic_level_id'],
                        'grading_period_id' => $requestData['grading_period_id'] ?? null,
                        'school_year' => $requestData['school_year'],
                        'year_of_study' => $requestData['year_of_study'] ?? null,
                        'grade' => $grade,
                    ]);
                }

                $success++;
            } catch (\Exception $e) {
                $errors++;
            }
        }

        return ['success' => $success, 'errors' => $errors];
    }
}


