<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AcademicLevel;
use App\Models\Strand;
use App\Models\Course;
use App\Models\Department;
use App\Models\GradingPeriod;
use App\Models\Subject;
use App\Models\TeacherSubjectAssignment;
use App\Models\InstructorCourseAssignment;
use App\Models\ClassAdviserAssignment;
use App\Models\HonorType;
use App\Models\HonorCriterion;
use App\Models\HonorResult;
use App\Models\StudentGrade;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AcademicController extends Controller
{
    private function sharedUser()
    {
        $user = Auth::user();
        return [
            'name' => $user->name,
            'email' => $user->email,
            'user_role' => $user->user_role,
        ];
    }

    public function index()
    {
        return Inertia::render('Admin/Academic/Index', [
            'user' => $this->sharedUser(),
        ]);
    }

    public function levels()
    {
        $levels = AcademicLevel::orderBy('sort_order')->get();
        return Inertia::render('Admin/Academic/Levels', [
            'user' => $this->sharedUser(),
            'levels' => $levels,
        ]);
    }

    public function grading()
    {
        $gradingPeriods = GradingPeriod::with('academicLevel')
            ->orderBy('academic_level_id')
            ->orderBy('sort_order')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/Grading', [
            'user' => $this->sharedUser(),
            'gradingPeriods' => $gradingPeriods,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function programs()
    {
        $academicLevels = AcademicLevel::with(['strands'])->orderBy('sort_order')->get();
        $departments = Department::with(['courses'])->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/Programs', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'departments' => $departments,
        ]);
    }

    public function assignInstructors()
    {
        // Get College level ID
        $collegeLevel = AcademicLevel::where('key', 'college')->first();
        
        $assignments = InstructorCourseAssignment::with([
            'instructor', 
            'course.department', 
            'academicLevel', 
            'gradingPeriod'
        ])->where('academic_level_id', $collegeLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $instructors = User::where('user_role', 'instructor')->orderBy('name')->get();
        $courses = Course::whereHas('department', function($query) use ($collegeLevel) {
            $query->where('academic_level_id', $collegeLevel->id);
        })->orderBy('name')->get();
        $subjects = Subject::where('academic_level_id', $collegeLevel->id)->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::where('academic_level_id', $collegeLevel->id)->orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignInstructors', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'instructors' => $instructors,
            'courses' => $courses,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function assignTeachers()
    {
        // Get Senior High School level ID
        $shsLevel = AcademicLevel::where('key', 'senior_highschool')->first();
        
        $assignments = TeacherSubjectAssignment::with([
            'teacher', 
            'subject', 
            'academicLevel', 
            'gradingPeriod'
        ])->where('academic_level_id', $shsLevel->id)
          ->orderBy('school_year', 'desc')->get();
        
        $teachers = User::where('user_role', 'teacher')->orderBy('name')->get();
        $subjects = Subject::where('academic_level_id', $shsLevel->id)->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::where('academic_level_id', $shsLevel->id)->orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignTeachers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    public function assignAdvisers()
    {
        // Get Elementary and Junior High School level IDs
        $elementaryLevel = AcademicLevel::where('key', 'elementary')->first();
        $jhsLevel = AcademicLevel::where('key', 'junior_highschool')->first();
        
        $assignments = ClassAdviserAssignment::with([
            'adviser', 
            'academicLevel'
        ])->whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])
          ->orderBy('school_year', 'desc')->get();
        
        $advisers = User::where('user_role', 'adviser')->orderBy('name')->get();
        $subjects = Subject::whereIn('academic_level_id', [$elementaryLevel->id, $jhsLevel->id])->orderBy('name')->get();
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/AssignAdvisers', [
            'user' => $this->sharedUser(),
            'assignments' => $assignments,
            'advisers' => $advisers,
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'gradingPeriod'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();
        
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $gradingPeriods = GradingPeriod::orderBy('academic_level_id')->orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Academic/Subjects', [
            'user' => $this->sharedUser(),
            'subjects' => $subjects,
            'academicLevels' => $academicLevels,
            'gradingPeriods' => $gradingPeriods,
        ]);
    }

    // Honor Management
    public function honors()
    {
        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $honorTypes = HonorType::orderBy('scope')->orderBy('name')->get();
        $criteria = HonorCriterion::with(['honorType', 'academicLevel'])->get();
        
        // Get current school year (you can modify this logic as needed)
        $currentYear = date('Y');
        $schoolYears = [
            ($currentYear - 1) . '-' . $currentYear,
            $currentYear . '-' . ($currentYear + 1),
            ($currentYear + 1) . '-' . ($currentYear + 2),
        ];

        // Get existing honor results for the current school year
        $honorResults = HonorResult::with(['honorType', 'student'])
            ->where('school_year', '2024-2025') // Use the school year that matches our sample data
            ->get();

        // Group results by academic_level_id and honor_type_id for easy UI rendering
        $groupedHonorResults = [];
        foreach ($honorResults as $result) {
            $levelId = (string) $result->academic_level_id;
            $typeId = (string) $result->honor_type_id;
            if (!isset($groupedHonorResults[$levelId])) {
                $groupedHonorResults[$levelId] = [];
            }
            if (!isset($groupedHonorResults[$levelId][$typeId])) {
                $groupedHonorResults[$levelId][$typeId] = [];
            }
            $groupedHonorResults[$levelId][$typeId][] = $result;
        }

        // Debug logging
        \Illuminate\Support\Facades\Log::info('🔍 DEBUG: Honors method data:', [
            'academicLevelsCount' => $academicLevels->count(),
            'honorTypesCount' => $honorTypes->count(),
            'criteriaCount' => $criteria->count(),
            'schoolYears' => $schoolYears,
            'honorResultsCount' => $honorResults->count(),
            'groupedKeys' => array_keys($groupedHonorResults),
        ]);

        return Inertia::render('Admin/Academic/Honors/Index', [
            'user' => $this->sharedUser(),
            'academicLevels' => $academicLevels,
            'honorTypes' => $honorTypes,
            'criteria' => $criteria,
            'schoolYears' => $schoolYears,
            'honorResults' => $honorResults,
            'groupedHonorResults' => $groupedHonorResults,
        ]);
    }

    public function saveHonorCriteria(Request $request)
    {
        $data = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'honor_type_id' => 'required|exists:honor_types,id',
            'min_gpa' => 'nullable|numeric|min:0|max:100',
            'max_gpa' => 'nullable|numeric|min:0|max:100',
            'min_grade' => 'nullable|integer|min:0|max:100',
            'min_grade_all' => 'nullable|integer|min:1|max:100',
            'min_year' => 'nullable|integer|min:1|max:10',
            'max_year' => 'nullable|integer|min:1|max:10',
            'require_consistent_honor' => 'boolean',
            'additional_rules' => 'array|nullable',
        ]);

        HonorCriterion::updateOrCreate(
            [
                'academic_level_id' => $data['academic_level_id'],
                'honor_type_id' => $data['honor_type_id'],
            ],
            $data
        );

        return back()->with('success', 'Honor criteria saved.');
    }

    public function storeHonorCriterion(Request $request)
    {
        return $this->saveHonorCriteria($request);
    }

    public function destroyHonorCriterion(HonorCriterion $criterion)
    {
        $criterion->delete();
        return back()->with('success', 'Honor criterion deleted successfully.');
    }

    public function updateHonorCriterion(Request $request, HonorCriterion $criterion)
    {
        $data = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'honor_type_id' => 'required|exists:honor_types,id',
            'min_gpa' => 'nullable|numeric|min:0|max:100',
            'max_gpa' => 'nullable|numeric|min:0|max:100',
            'min_grade' => 'nullable|integer|min:0|max:100',
            'min_grade_all' => 'nullable|integer|min:1|max:100',
            'min_year' => 'nullable|integer|min:1|max:10',
            'max_year' => 'nullable|integer|min:1|max:10',
            'require_consistent_honor' => 'boolean',
            'additional_rules' => 'array|nullable',
        ]);

        $criterion->update($data);
        return back()->with('success', 'Honor criterion updated successfully.');
    }

    public function generateHonorRoll(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $level = AcademicLevel::findOrFail($validated['academic_level_id']);
        $criteria = HonorCriterion::where('academic_level_id', $level->id)->get();
        
        $honorResults = [];
        
        foreach ($criteria as $criterion) {
            $students = User::where('user_role', 'student')
                ->where('year_level', $level->key)
                ->get();
            
            $qualifiedStudents = [];
            
            foreach ($students as $student) {
                $grades = StudentGrade::where('student_id', $student->id)
                    ->where('academic_level_id', $level->id)
                    ->where('school_year', $validated['school_year']);
                
                // Apply year restrictions for college honors
                if ($criterion->min_year || $criterion->max_year) {
                    $grades = $grades->whereBetween('year_of_study', [
                        $criterion->min_year ?? 1,
                        $criterion->max_year ?? 4
                    ]);
                }
                
                $grades = $grades->pluck('grade');
                
                if ($grades->isEmpty()) {
                    continue;
                }
                
                $gpa = round($grades->avg(), 2);
                $minGrade = (int) floor($grades->min());
                
                // Check if student qualifies for this honor
                $qualifies = true;
                
                // GPA requirements
                if ($criterion->min_gpa && $gpa < $criterion->min_gpa) {
                    $qualifies = false;
                }
                if ($criterion->max_gpa && $gpa > $criterion->max_gpa) {
                    $qualifies = false;
                }
                
                // Minimum grade requirements
                if ($criterion->min_grade && $minGrade < $criterion->min_grade) {
                    $qualifies = false;
                }
                
                // Consistent honor standing (for Dean's List)
                if ($criterion->require_consistent_honor) {
                    // Check if student has been on honor roll in previous years
                    $previousHonors = HonorResult::where('student_id', $student->id)
                        ->where('academic_level_id', $level->id)
                        ->where('school_year', '!=', $validated['school_year'])
                        ->where('is_overridden', false)
                        ->exists();
                    
                    if (!$previousHonors) {
                        $qualifies = false;
                    }
                }
                
                if ($qualifies) {
                    $qualifiedStudents[] = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_number' => $student->student_number,
                        'gpa' => $gpa,
                        'min_grade' => $minGrade,
                        'grades_count' => $grades->count(),
                    ];
                }
            }
            
            if (!empty($qualifiedStudents)) {
                $honorResults[] = [
                    'honor_type' => $criterion->honorType,
                    'criterion' => $criterion,
                    'students' => $qualifiedStudents,
                    'count' => count($qualifiedStudents),
                ];
            }
        }
        
        // Store results in honor_results table
        foreach ($honorResults as $result) {
            foreach ($result['students'] as $student) {
                HonorResult::updateOrCreate([
                    'student_id' => $student['id'],
                    'honor_type_id' => $result['honor_type']->id,
                    'academic_level_id' => $level->id,
                    'school_year' => $validated['school_year'],
                ], [
                    'gpa' => $student['gpa'],
                    'is_overridden' => false,
                ]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Honor roll generated successfully',
            'data' => [
                'academic_level' => $level->name,
                'school_year' => $validated['school_year'],
                'honor_results' => $honorResults,
                'total_students' => array_sum(array_column($honorResults, 'count')),
            ]
        ]);
    }

    public function overrideHonorResult(Request $request, HonorResult $result)
    {
        $data = $request->validate([
            'honor_type_id' => 'required|exists:honor_types,id',
            'override_reason' => 'required|string|max:1000',
        ]);

        $result->update([
            'honor_type_id' => $data['honor_type_id'],
            'is_overridden' => true,
            'override_reason' => $data['override_reason'],
        ]);

        return back()->with('success', 'Honor result overridden.');
    }

    public function exportHonorRoll(Request $request)
    {
        $validated = $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'school_year' => 'required|string',
        ]);

        $results = HonorResult::with(['student', 'honorType'])
            ->where('academic_level_id', $validated['academic_level_id'])
            ->where('school_year', $validated['school_year'])
            ->orderBy('honor_type_id')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="honor_roll_'.$validated['school_year'].'.csv"',
        ];

        $callback = function () use ($results) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Student ID', 'Name', 'Honor', 'GPA', 'Overridden', 'Reason']);
            foreach ($results as $row) {
                fputcsv($handle, [
                    $row->student->student_number ?? $row->student->id,
                    $row->student->name,
                    $row->honorType->name,
                    $row->gpa,
                    $row->is_overridden ? 'Yes' : 'No',
                    $row->override_reason,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Subject Management
    public function storeSubject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'units' => 'nullable|integer|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $subject = Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'units' => $request->units ?? 0,
            'hours_per_week' => $request->hours_per_week ?? 0,
            'is_core' => $request->is_core ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
                'academic_level' => $subject->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Subject created successfully!');
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'units' => 'nullable|integer|min:0',
            'hours_per_week' => 'nullable|integer|min:0',
            'is_core' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'units' => $request->units ?? 0,
            'hours_per_week' => $request->hours_per_week ?? 0,
            'is_core' => $request->is_core ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject updated successfully!');
    }

    public function destroySubject(Subject $subject)
    {
        $subject->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_subject',
            'entity_type' => 'subject',
            'entity_id' => $subject->id,
            'details' => [
                'name' => $subject->name,
                'code' => $subject->code,
            ],
        ]);

        return back()->with('success', 'Subject deleted successfully!');
    }

    // Grading Period Management
    public function storeGradingPeriod(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:grading_periods,code',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod = GradingPeriod::create([
            'name' => $request->name,
            'code' => $request->code,
            'academic_level_id' => $request->academic_level_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
                'academic_level' => $gradingPeriod->academicLevel->name,
            ],
        ]);

        return back()->with('success', 'Grading period created successfully!');
    }

    public function updateGradingPeriod(Request $request, GradingPeriod $gradingPeriod)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:grading_periods,code,' . $gradingPeriod->id,
            'academic_level_id' => 'required|exists:academic_levels,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $gradingPeriod->update([
            'name' => $request->name,
            'code' => $request->code,
            'academic_level_id' => $request->academic_level_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'updated_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period updated successfully!');
    }

    public function destroyGradingPeriod(GradingPeriod $gradingPeriod)
    {
        $gradingPeriod->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_grading_period',
            'entity_type' => 'grading_period',
            'entity_id' => $gradingPeriod->id,
            'details' => [
                'name' => $gradingPeriod->name,
                'code' => $gradingPeriod->code,
            ],
        ]);

        return back()->with('success', 'Grading period deleted successfully!');
    }

    // Assignment Management
    public function storeTeacherAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment = TeacherSubjectAssignment::create([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'assigned_teacher_subject',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assigned to subject successfully!');
    }

    public function updateTeacherAssignment(Request $request, TeacherSubjectAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if teacher has the correct role
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->user_role !== 'teacher') {
            return back()->with('error', 'Selected user is not a teacher.');
        }

        $assignment->update([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->teacher_id,
            'action' => 'updated_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'teacher' => $teacher->name,
                'subject' => $assignment->subject->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Teacher assignment updated successfully!');
    }

    public function storeInstructorAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        $assignment = InstructorCourseAssignment::create([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'assigned_instructor_course',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assigned to course successfully!');
    }

    public function updateInstructorAssignment(Request $request, InstructorCourseAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grading_period_id' => 'nullable|exists:grading_periods,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if instructor has the correct role
        $instructor = User::find($request->instructor_id);
        if (!$instructor || $instructor->user_role !== 'instructor') {
            return back()->with('error', 'Selected user is not an instructor.');
        }

        $assignment->update([
            'instructor_id' => $request->instructor_id,
            'course_id' => $request->course_id,
            'academic_level_id' => $request->academic_level_id,
            'grading_period_id' => $request->grading_period_id,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->instructor_id,
            'action' => 'updated_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'instructor' => $instructor->name,
                'course' => $assignment->course->name,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Instructor assignment updated successfully!');
    }

    public function storeClassAdviserAssignment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'adviser_id' => 'required|exists:users,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|string',
            'section' => 'required|string',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if adviser has the correct role
        $adviser = User::find($request->adviser_id);
        if (!$adviser || $adviser->user_role !== 'adviser') {
            return back()->with('error', 'Selected user is not an adviser.');
        }

        $assignment = ClassAdviserAssignment::create([
            'adviser_id' => $request->adviser_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'school_year' => $request->school_year,
            'assigned_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'assigned_class_adviser',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Class adviser assigned successfully!');
    }

    public function updateClassAdviserAssignment(Request $request, ClassAdviserAssignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'adviser_id' => 'required|exists:users,id',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'grade_level' => 'required|string',
            'section' => 'required|string',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if adviser has the correct role
        $adviser = User::find($request->adviser_id);
        if (!$adviser || $adviser->user_role !== 'adviser') {
            return back()->with('error', 'Selected user is not an adviser.');
        }

        $assignment->update([
            'adviser_id' => $request->adviser_id,
            'academic_level_id' => $request->academic_level_id,
            'grade_level' => $request->grade_level,
            'section' => $request->section,
            'school_year' => $request->school_year,
            'notes' => $request->notes,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $request->adviser_id,
            'action' => 'updated_class_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
            'details' => [
                'adviser' => $adviser->name,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'school_year' => $request->school_year,
            ],
        ]);

        return back()->with('success', 'Class adviser assignment updated successfully!');
    }

    // Delete assignments
    public function destroyTeacherAssignment(TeacherSubjectAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_teacher_subject_assignment',
            'entity_type' => 'teacher_subject_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Teacher assignment removed successfully!');
    }

    public function destroyInstructorAssignment(InstructorCourseAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_instructor_course_assignment',
            'entity_type' => 'instructor_course_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Instructor assignment removed successfully!');
    }

    public function destroyClassAdviserAssignment(ClassAdviserAssignment $assignment)
    {
        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted_class_adviser_assignment',
            'entity_type' => 'class_adviser_assignment',
            'entity_id' => $assignment->id,
        ]);

        return back()->with('success', 'Class adviser assignment removed successfully!');
    }
}


