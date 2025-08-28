<?php

namespace App\Http\Controllers\Adviser;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\ClassAdviserAssignment;
use App\Models\GradingPeriod;
use App\Models\StudentGrade;
use App\Models\StudentSubjectAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class GradeManagementController extends Controller
{
    /**
     * List grades limited to the adviser's assigned subjects/sections.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolYear = $request->input('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->get();

        $subjectIds = $assignments->pluck('subject_id')->filter()->unique();

        $assignedData = $assignments->map(function ($assignment) use ($schoolYear) {
            $enrolledStudents = StudentSubjectAssignment::with('student')
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->get();

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => $assignment->subject ? [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                    'course' => $assignment->subject->course ? [
                        'id' => $assignment->subject->course->id,
                        'name' => $assignment->subject->course->name,
                        'code' => $assignment->subject->course->code,
                    ] : null,
                ] : null,
                'academicLevel' => $assignment->academicLevel ? [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ] : null,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                        'semester' => $enrollment->semester,
                        'is_active' => $enrollment->is_active,
                        'school_year' => $enrollment->school_year,
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });

        $grades = StudentGrade::with(['student', 'subject', 'academicLevel', 'gradingPeriod'])
            ->when($subjectIds->isNotEmpty(), function ($query) use ($subjectIds) {
                $query->whereIn('subject_id', $subjectIds);
            }, function ($query) {
                $query->whereRaw('1=0');
            })
            ->when($request->filled('subject'), function ($query) use ($request) {
                $query->where('subject_id', $request->subject);
            })
            ->when($request->filled('academic_level'), function ($query) use ($request) {
                $query->where('academic_level_id', $request->academic_level);
            })
            ->when($request->filled('grading_period'), function ($query) use ($request) {
                $query->where('grading_period_id', $request->grading_period);
            })
            ->when($request->filled('school_year'), function ($query) use ($request) {
                $query->where('school_year', $request->school_year);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Adviser/Grades/Index', [
            'user' => $user,
            'grades' => $grades,
            'assignedSubjects' => $assignedData,
            'filters' => $request->only(['subject', 'academic_level', 'grading_period', 'school_year']),
        ]);
    }

    /**
     * Show create form using adviser's assignments.
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $schoolYear = $request->input('school_year', '2024-2025');

        $assignments = ClassAdviserAssignment::with(['subject.course', 'academicLevel'])
            ->where('adviser_id', $user->id)
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->get();

        $assignedData = $assignments->map(function ($assignment) use ($schoolYear) {
            $enrolledStudents = StudentSubjectAssignment::with('student')
                ->where('subject_id', $assignment->subject_id)
                ->where('school_year', $schoolYear)
                ->where('is_active', true)
                ->get();

            return [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject' => $assignment->subject ? [
                    'id' => $assignment->subject->id,
                    'name' => $assignment->subject->name,
                    'code' => $assignment->subject->code,
                ] : null,
                'academicLevel' => $assignment->academicLevel ? [
                    'id' => $assignment->academicLevel->id,
                    'name' => $assignment->academicLevel->name,
                    'key' => $assignment->academicLevel->key,
                ] : null,
                'school_year' => $assignment->school_year,
                'is_active' => $assignment->is_active,
                'enrolled_students' => $enrolledStudents->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'student' => [
                            'id' => $enrollment->student->id,
                            'name' => $enrollment->student->name,
                            'email' => $enrollment->student->email,
                        ],
                    ];
                }),
                'student_count' => $enrolledStudents->count(),
            ];
        });

        $academicLevels = AcademicLevel::all();
        $gradingPeriods = GradingPeriod::all();

        return Inertia::render('Adviser/Grades/Create', [
            'user' => $user,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
            'assignedSubjects' => $assignedData,
        ]);
    }

    /**
     * Store a newly created grade restricted to adviser's assignments.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable',
            'school_year' => 'required|string|max:20',
            'year_of_study' => 'nullable|integer|min:1|max:10',
            'grade' => 'required|numeric|min:75|max:100',
        ]);

        if ($request->grading_period_id && $request->grading_period_id !== '0') {
            $validator->addRules(['grading_period_id' => 'exists:grading_periods,id']);
        }

        if ($request->grading_period_id === '0') {
            $request->merge(['grading_period_id' => null]);
        }

        // Verify adviser is assigned to this subject for the school year
        $isAssigned = ClassAdviserAssignment::where('adviser_id', $user->id)
            ->where('subject_id', $request->subject_id)
            ->where('school_year', $request->school_year)
            ->where('is_active', true)
            ->exists();

        if (!$isAssigned) {
            return back()->withErrors(['subject_id' => 'You are not assigned to this subject.']);
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Prevent duplicate
        $existing = StudentGrade::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'school_year' => $request->school_year,
        ])->when($request->grading_period_id, function ($query, $gradingPeriodId) {
            $query->where('grading_period_id', $gradingPeriodId);
        })->when(!$request->grading_period_id, function ($query) {
            $query->whereNull('grading_period_id');
        })->first();

        if ($existing) {
            return back()->withErrors(['grade' => 'A grade already exists for this student, subject, and period.']);
        }

        $grade = StudentGrade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'year_of_study' => $request->year_of_study ?: null,
            'grade' => $request->grade,
        ]);

        Log::info('Adviser created grade', ['adviser_id' => $user->id, 'grade_id' => $grade->id]);

        return redirect()->route('adviser.grades.index')
            ->with('success', 'Grade created successfully.');
    }
}


