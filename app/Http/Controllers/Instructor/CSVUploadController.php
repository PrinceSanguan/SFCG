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
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
        ]);
        
        // Get academic level for grade validation
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        
        // Verify the instructor is assigned to this subject (new subject-based system)
        $isAssigned = \App\Models\InstructorSubjectAssignment::where('instructor_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
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
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template.csv"',
        ];
        
        $callback = function() {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);
            
            // Add sample data for both grading systems
            fputcsv($file, ['CO-2024-001', 'John Doe', '95.5', 'Excellent performance']);
            fputcsv($file, ['CO-2024-002', 'Jane Smith', '88.0', 'Good work']);
            fputcsv($file, ['CO-2024-003', 'Mike Johnson', '1.5', 'College grade example']);
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Parse CSV file and return data array.
     */
    private function parseCSV($file)
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');
        
        // Skip header row
        fgetcsv($handle);
        
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
    
    /**
     * Process grades from CSV data.
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
                
                // Validate grade based on academic level
                $grade = floatval($row['grade']);
                $isValidGrade = false;
                
                if ($academicLevel && $academicLevel->key === 'college') {
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
                    'subject_id' => $requestData['subject_id'],
                    'academic_level_id' => $requestData['academic_level_id'],
                    'grading_period_id' => $requestData['grading_period_id'],
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
                        'subject_id' => $requestData['subject_id'],
                        'academic_level_id' => $requestData['academic_level_id'],
                        'grading_period_id' => $requestData['grading_period_id'],
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
