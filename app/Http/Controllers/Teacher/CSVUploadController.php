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

        // Determine if using college grading scale (1.0-5.0) or standard scale (75-100)
        $isCollegeScale = ($academicLevelKey === 'college');

        Log::info('Teacher CSV template download', [
            'user_id' => Auth::id(),
            'academic_level' => $academicLevelKey,
            'is_college_scale' => $isCollegeScale
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="grades_template_' . $academicLevelKey . '.csv"',
        ];

        $callback = function() use ($isCollegeScale, $academicLevelKey) {
            $file = fopen('php://output', 'w');

            // Add headers
            fputcsv($file, ['Student ID', 'Student Name', 'Grade', 'Notes']);

            // Add sample data based on academic level
            if ($isCollegeScale) {
                // College: 1.0-5.0 scale (1.0 highest, 3.0 passing)
                fputcsv($file, ['C-2024-001', 'John Doe', '1.25', 'Excellent performance']);
                fputcsv($file, ['C-2024-002', 'Jane Smith', '2.0', 'Very good work']);
                fputcsv($file, ['C-2024-003', 'Mike Johnson', '2.75', 'Good work']);
                fputcsv($file, ['C-2024-004', 'Sarah Williams', '3.0', 'Passing grade']);
            } else {
                // Elementary/JHS/SHS: 75-100 scale (75 passing)
                $levelPrefix = strtoupper(substr($academicLevelKey, 0, 2));
                fputcsv($file, [$levelPrefix . '-2024-001', 'John Doe', '95.5', 'Excellent performance']);
                fputcsv($file, [$levelPrefix . '-2024-002', 'Jane Smith', '88.0', 'Very good work']);
                fputcsv($file, [$levelPrefix . '-2024-003', 'Mike Johnson', '82.5', 'Good work']);
                fputcsv($file, [$levelPrefix . '-2024-004', 'Sarah Williams', '75.0', 'Passing grade']);
            }

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

                    Log::info('CSV upload updated editable grade', [
                        'teacher_id' => $user->id,
                        'grade_id' => $existingGrade->id,
                        'student_id' => $student->id,
                        'days_remaining' => $existingGrade->getDaysRemainingForEdit(),
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
