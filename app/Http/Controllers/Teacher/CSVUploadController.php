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
            // Get teacher's assigned subjects
            $assignedSubjects = \App\Models\TeacherSubjectAssignment::with([
                'subject.course', 
                'academicLevel', 
                'gradingPeriod'
            ])
            ->where('teacher_id', $user->id)
            ->where('is_active', true)
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

            // Get academic levels
            $academicLevels = \App\Models\AcademicLevel::where('is_active', true)->get();
            
            // Get grading periods
            $gradingPeriods = \App\Models\GradingPeriod::where('is_active', true)->get();
            
            Log::info('Teacher CSV upload form data prepared', [
                'teacher_id' => $user->id,
                'assigned_subjects_count' => $assignedSubjects->count(),
                'academic_levels_count' => $academicLevels->count(),
                'grading_periods_count' => $gradingPeriods->count()
            ]);

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
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template.csv"',
        ];
        
        $callback = function() {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);
            
            // Add sample data for both grading systems
            fputcsv($file, ['SH-2024-001', 'John Doe', '95.5', 'Excellent performance']);
            fputcsv($file, ['SH-2024-002', 'Jane Smith', '88.0', 'Good work']);
            fputcsv($file, ['SH-2024-003', 'Mike Johnson', '78.5', 'Senior High grade example']);
            
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
     * Process grades from CSV data for teachers.
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
                        'updated_by' => $user->id,
                        'updated_at' => now(),
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
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]);
                }
                
                $success++;
                
            } catch (\Exception $e) {
                Log::error('Error processing individual grade in CSV', [
                    'teacher_id' => $user->id,
                    'student_id' => $row['student_id'],
                    'error' => $e->getMessage()
                ]);
                $errors++;
            }
        }
        
        return [
            'success' => $success,
            'errors' => $errors,
        ];
    }
}
