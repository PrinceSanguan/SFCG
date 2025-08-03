<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Grade;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use App\Models\AcademicLevel;
use App\Models\StudentProfile;
use App\Models\InstructorSubjectAssignment;
use App\Models\ActivityLog;
use App\Services\HonorCalculationService;

class GradingController extends Controller
{
    public function index(Request $request)
    {
        // Get academic levels for categorization
        $elementaryLevels = AcademicLevel::whereIn('name', ['Elementary'])
            ->orWhere('code', 'ELEM')
            ->pluck('id');
            
        $juniorHighLevels = AcademicLevel::whereIn('name', ['Junior High School', 'Junior High'])
            ->orWhere('code', 'JHS')
            ->pluck('id');
            
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');

        // Count grades by category
        $gradeCounts = [
            'elementary' => Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                $q->whereIn('academic_level_id', $elementaryLevels);
            })->count(),
            'junior_high' => Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                $q->whereIn('academic_level_id', $juniorHighLevels);
            })->count(),
            'senior_high' => Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                $q->whereIn('academic_level_id', $seniorHighLevels);
            })->count(),
            'college' => Grade::whereHas('student.studentProfile', function($q) {
                $q->whereNotNull('college_course_id');
            })->count(),
            'total' => Grade::count(),
            'pending' => Grade::where('status', 'submitted')->count(),
            'approved' => Grade::where('status', 'approved')->count(),
        ];
        
        return Inertia::render('Admin/Grading/Index', [
            'gradeCounts' => $gradeCounts,
        ]);
    }

    public function elementaryGrading(Request $request)
    {
        $elementaryLevels = AcademicLevel::whereIn('name', ['Elementary'])
            ->orWhere('code', 'ELEM')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod',
            'instructor'
        ])->whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
            $q->whereIn('academic_level_id', $elementaryLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('academicLevel', function($q) use ($elementaryLevels) {
            $q->whereIn('id', $elementaryLevels);
        })->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        // Get sections
        $sections = Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
            $q->whereIn('academic_level_id', $elementaryLevels);
        })->distinct()->orderBy('section')->pluck('section')->filter();

        // Stats
        $stats = [
            'totalGrades' => Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                $q->whereIn('academic_level_id', $elementaryLevels);
            })->count(),
            'pendingGrades' => Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                $q->whereIn('academic_level_id', $elementaryLevels);
            })->where('status', 'submitted')->count(),
            'approvedGrades' => Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                $q->whereIn('academic_level_id', $elementaryLevels);
            })->where('status', 'approved')->count(),
            'averageGrade' => Grade::whereHas('student.studentProfile', function($q) use ($elementaryLevels) {
                $q->whereIn('academic_level_id', $elementaryLevels);
            })->where('status', 'approved')->avg('final_grade'),
        ];

        return Inertia::render('Admin/Grading/ElementaryGrading', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'instructors' => $instructors,
            'sections' => $sections,
            'stats' => $stats,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'instructor_id', 'section', 'status'])
        ]);
    }

    public function juniorHighGrading(Request $request)
    {
        $juniorHighLevels = AcademicLevel::whereIn('name', ['Junior High School', 'Junior High'])
            ->orWhere('code', 'JHS')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod',
            'instructor'
        ])->whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
            $q->whereIn('academic_level_id', $juniorHighLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('academicLevel', function($q) use ($juniorHighLevels) {
            $q->whereIn('id', $juniorHighLevels);
        })->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        // Get sections
        $sections = Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
            $q->whereIn('academic_level_id', $juniorHighLevels);
        })->distinct()->orderBy('section')->pluck('section')->filter();

        // Stats
        $stats = [
            'totalGrades' => Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                $q->whereIn('academic_level_id', $juniorHighLevels);
            })->count(),
            'pendingGrades' => Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                $q->whereIn('academic_level_id', $juniorHighLevels);
            })->where('status', 'submitted')->count(),
            'approvedGrades' => Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                $q->whereIn('academic_level_id', $juniorHighLevels);
            })->where('status', 'approved')->count(),
            'averageGrade' => Grade::whereHas('student.studentProfile', function($q) use ($juniorHighLevels) {
                $q->whereIn('academic_level_id', $juniorHighLevels);
            })->where('status', 'approved')->avg('final_grade'),
        ];

        return Inertia::render('Admin/Grading/JuniorHighGrading', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'instructors' => $instructors,
            'sections' => $sections,
            'stats' => $stats,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'instructor_id', 'section', 'status'])
        ]);
    }

    public function seniorHighGrading(Request $request)
    {
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');

        $query = Grade::with([
            'student.studentProfile.academicLevel',
            'subject',
            'academicPeriod',
            'instructor'
        ])->whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
            $q->whereIn('academic_level_id', $seniorHighLevels);
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereHas('academicLevel', function($q) use ($seniorHighLevels) {
            $q->whereIn('id', $seniorHighLevels);
        })->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        // Get sections
        $sections = Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
            $q->whereIn('academic_level_id', $seniorHighLevels);
        })->distinct()->orderBy('section')->pluck('section')->filter();

        // Stats
        $stats = [
            'totalGrades' => Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                $q->whereIn('academic_level_id', $seniorHighLevels);
            })->count(),
            'pendingGrades' => Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                $q->whereIn('academic_level_id', $seniorHighLevels);
            })->where('status', 'submitted')->count(),
            'approvedGrades' => Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                $q->whereIn('academic_level_id', $seniorHighLevels);
            })->where('status', 'approved')->count(),
            'averageGrade' => Grade::whereHas('student.studentProfile', function($q) use ($seniorHighLevels) {
                $q->whereIn('academic_level_id', $seniorHighLevels);
            })->where('status', 'approved')->avg('final_grade'),
        ];

        return Inertia::render('Admin/Grading/SeniorHighGrading', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'instructors' => $instructors,
            'sections' => $sections,
            'stats' => $stats,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'instructor_id', 'section', 'status'])
        ]);
    }

    public function collegeGrading(Request $request)
    {
        $query = Grade::with([
            'student.studentProfile.collegeCourse',
            'subject',
            'academicPeriod',
            'instructor'
        ])->whereHas('student.studentProfile', function($q) {
            $q->whereNotNull('college_course_id');
        });

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('section')) {
            $query->where('section', $request->section);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $subjects = Subject::whereNotNull('college_course_id')->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        // Get sections
        $sections = Grade::whereHas('student.studentProfile', function($q) {
            $q->whereNotNull('college_course_id');
        })->distinct()->orderBy('section')->pluck('section')->filter();

        // Stats
        $stats = [
            'totalGrades' => Grade::whereHas('student.studentProfile', function($q) {
                $q->whereNotNull('college_course_id');
            })->count(),
            'pendingGrades' => Grade::whereHas('student.studentProfile', function($q) {
                $q->whereNotNull('college_course_id');
            })->where('status', 'submitted')->count(),
            'approvedGrades' => Grade::whereHas('student.studentProfile', function($q) {
                $q->whereNotNull('college_course_id');
            })->where('status', 'approved')->count(),
            'averageGrade' => Grade::whereHas('student.studentProfile', function($q) {
                $q->whereNotNull('college_course_id');
            })->where('status', 'approved')->avg('final_grade'),
        ];

        return Inertia::render('Admin/Grading/CollegeGrading', [
            'grades' => $grades,
            'academicPeriods' => $academicPeriods,
            'subjects' => $subjects,
            'instructors' => $instructors,
            'sections' => $sections,
            'stats' => $stats,
            'filters' => $request->only(['academic_period_id', 'subject_id', 'instructor_id', 'section', 'status'])
        ]);
    }

    public function create()
    {
        $students = User::where('user_role', 'student')
                       ->with(['studentProfile.academicLevel', 'studentProfile.collegeCourse'])
                       ->orderBy('name')
                       ->get();

        $subjects = Subject::orderBy('name')->get();
        $academicPeriods = AcademicPeriod::where('is_active', true)->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        return Inertia::render('Admin/Grading/Create', [
            'students' => $students,
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
            'instructors' => $instructors
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'instructor_id' => 'required|exists:users,id',
            'section' => 'required|string|max:255',
            'quarterly_grades.*.grade' => 'required|numeric|min:0|max:100',
            'quarterly_grades.*.weight' => 'required|numeric|min:0|max:100',
            'final_grade' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $grade = Grade::create([
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'academic_period_id' => $request->academic_period_id,
                'instructor_id' => $request->instructor_id,
                'section' => $request->section,
                'quarterly_grades' => $request->quarterly_grades,
                'final_grade' => $request->final_grade,
                'remarks' => $request->remarks,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            ActivityLog::logActivity(
                Auth::user(),
                'created',
                'Grade',
                $grade->id,
                null,
                $grade->toArray()
            );

            // Auto-calculate honors if final grade is high
            if ($request->final_grade >= 90) {
                app(HonorCalculationService::class)->calculateStudentHonors($request->student_id, $request->academic_period_id);
            }
        });

        return redirect()->route('admin.grading.index')->with('success', 'Grade created successfully.');
    }

    public function show(Grade $grade)
    {
        $grade->load([
            'student.studentProfile',
            'subject',
            'academicPeriod',
            'instructor'
        ]);

        return Inertia::render('Admin/Grading/Show', [
            'grade' => $grade
        ]);
    }

    public function edit(Grade $grade)
    {
        $grade->load([
            'student.studentProfile',
            'subject',
            'academicPeriod',
            'instructor'
        ]);

        $students = User::where('user_role', 'student')
                       ->with('studentProfile')
                       ->orderBy('name')
                       ->get();

        $subjects = Subject::orderBy('name')->get();
        $academicPeriods = AcademicPeriod::where('is_active', true)->orderBy('name')->get();
        $instructors = User::where('user_role', 'instructor')
                          ->orWhere('user_role', 'teacher')
                          ->orderBy('name')
                          ->get();

        return Inertia::render('Admin/Grading/Edit', [
            'grade' => $grade,
            'students' => $students,
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
            'instructors' => $instructors
        ]);
    }

    public function update(Request $request, Grade $grade)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'instructor_id' => 'required|exists:users,id',
            'section' => 'required|string|max:255',
            'quarterly_grades.*.grade' => 'required|numeric|min:0|max:100',
            'quarterly_grades.*.weight' => 'required|numeric|min:0|max:100',
            'final_grade' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:draft,submitted,approved,finalized',
        ]);

        DB::transaction(function () use ($request, $grade) {
            $oldValues = $grade->toArray();

            $grade->update([
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'academic_period_id' => $request->academic_period_id,
                'instructor_id' => $request->instructor_id,
                'section' => $request->section,
                'quarterly_grades' => $request->quarterly_grades,
                'final_grade' => $request->final_grade,
                'remarks' => $request->remarks,
                'status' => $request->status ?? $grade->status,
                'approved_at' => $request->status === 'approved' ? now() : null,
                'approved_by' => $request->status === 'approved' ? Auth::id() : null,
            ]);

            ActivityLog::logActivity(
                Auth::user(),
                'updated',
                'Grade',
                $grade->id,
                $oldValues,
                $grade->toArray()
            );

            // Recalculate honors if grade changed
            app(HonorCalculationService::class)->calculateStudentHonors($request->student_id, $request->academic_period_id);
        });

        return redirect()->route('admin.grading.index')->with('success', 'Grade updated successfully.');
    }

    public function destroy(Grade $grade)
    {
        DB::transaction(function () use ($grade) {
            $oldValues = $grade->toArray();

            ActivityLog::logActivity(
                Auth::user(),
                'deleted',
                'Grade',
                $grade->id,
                $oldValues,
                null
            );

            $grade->delete();
        });

        return redirect()->route('admin.grading.index')->with('success', 'Grade deleted successfully.');
    }

    public function bulkApprove(Request $request)
    {
        $request->validate([
            'grade_ids' => 'required|array',
            'grade_ids.*' => 'exists:grades,id'
        ]);

        DB::transaction(function () use ($request) {
            Grade::whereIn('id', $request->grade_ids)
                 ->update([
                     'status' => 'approved',
                     'approved_at' => now(),
                     'approved_by' => Auth::id()
                 ]);

            foreach ($request->grade_ids as $gradeId) {
                $grade = Grade::find($gradeId);
                ActivityLog::logActivity(
                    Auth::user(),
                    'bulk_approved',
                    'Grade',
                    $gradeId,
                                ['status' => 'submitted'],
            ['status' => 'approved']
                );

                // Recalculate honors
                app(HonorCalculationService::class)->calculateStudentHonors($grade->student_id, $grade->academic_period_id);
            }
        });

        return redirect()->back()->with('success', 'Grades approved successfully.');
    }

    public function importGrades(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'subject_id' => 'required|exists:subjects,id',
            'instructor_id' => 'required|exists:users,id'
        ]);

        $file = $request->file('csv_file');
        $csvData = array_map('str_getcsv', file($file->path()));
        $header = array_shift($csvData);

        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        DB::transaction(function () use ($csvData, $header, $request, &$successCount, &$errorCount, &$errors) {
            foreach ($csvData as $row) {
                try {
                    $data = array_combine($header, $row);
                    
                    // Find student by student_id or email
                    $student = User::where('email', $data['student_email'])
                                  ->where('user_role', 'student')
                                  ->first();

                    if (!$student) {
                        $errors[] = "Student not found: " . $data['student_email'];
                        $errorCount++;
                        continue;
                    }

                    // Create or update grade
                    Grade::updateOrCreate([
                        'student_id' => $student->id,
                        'subject_id' => $request->subject_id,
                        'academic_period_id' => $request->academic_period_id,
                        'instructor_id' => $request->instructor_id,
                    ], [
                        'section' => $data['section'] ?? '',
                        'quarterly_grades' => [
                            ['quarter' => 1, 'grade' => floatval($data['q1_grade'] ?? 0), 'weight' => 25],
                            ['quarter' => 2, 'grade' => floatval($data['q2_grade'] ?? 0), 'weight' => 25],
                            ['quarter' => 3, 'grade' => floatval($data['q3_grade'] ?? 0), 'weight' => 25],
                            ['quarter' => 4, 'grade' => floatval($data['q4_grade'] ?? 0), 'weight' => 25],
                        ],
                        'final_grade' => floatval($data['final_grade']),
                        'remarks' => $data['remarks'] ?? null,
                        'status' => 'submitted',
                        'submitted_at' => now(),
                    ]);

                    $successCount++;

                } catch (\Exception $e) {
                    $errors[] = "Row error: " . $e->getMessage();
                    $errorCount++;
                }
            }
        });

        ActivityLog::logActivity(
            Auth::user(),
            'imported_grades',
            'Grade',
            null,
            null,
            ['success_count' => $successCount, 'error_count' => $errorCount]
        );

        $message = "Import completed: {$successCount} successful, {$errorCount} errors.";
        if (!empty($errors)) {
            $message .= " Errors: " . implode(', ', array_slice($errors, 0, 5));
        }

        return redirect()->back()->with('success', $message);
    }

    public function getStudentsBySection(Request $request)
    {
        $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'section' => 'required|string'
        ]);

        $students = User::where('user_role', 'student')
                       ->whereHas('studentProfile', function ($query) use ($request) {
                           $query->where('academic_level_id', $request->academic_level_id)
                                 ->where('section', $request->section);
                       })
                       ->with('studentProfile')
                       ->orderBy('name')
                       ->get();

        return response()->json($students);
    }
}
