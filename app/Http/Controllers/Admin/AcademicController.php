<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\AcademicStrand;
use App\Models\AcademicPeriod;
use App\Models\Subject;
use App\Models\CollegeCourse;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\InstructorSubjectAssignment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AcademicController extends Controller
{
    // ==================== ACADEMIC LEVELS ====================
    
    public function levels()
    {
        $levels = AcademicLevel::with(['academicStrands', 'subjects'])->get();
        
        return Inertia::render('Admin/Academic/Levels', [
            'levels' => $levels
        ]);
    }

    public function storeLevels(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_levels,code',
            'description' => 'nullable|string',
        ]);

        $level = AcademicLevel::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicLevel',
            $level->id,
            null,
            $level->toArray()
        );

        return redirect()->back()->with('success', 'Academic level created successfully.');
    }

    public function updateLevels(Request $request, AcademicLevel $level)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_levels,code,' . $level->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $oldValues = $level->toArray();

        $level->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicLevel',
            $level->id,
            $oldValues,
            $level->toArray()
        );

        return redirect()->back()->with('success', 'Academic level updated successfully.');
    }

    public function destroyLevels(AcademicLevel $level)
    {
        // Check if level has associated data
        if ($level->subjects()->count() > 0 || $level->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic level with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicLevel',
            $level->id,
            $level->toArray(),
            null
        );

        $level->delete();

        return redirect()->back()->with('success', 'Academic level deleted successfully.');
    }

    // ==================== ACADEMIC PERIODS ====================
    
    public function periods()
    {
        $periods = AcademicPeriod::orderBy('school_year', 'desc')
            ->orderBy('start_date', 'desc')
            ->get();
        
        return Inertia::render('Admin/Academic/Periods', [
            'periods' => $periods
        ]);
    }

    public function storePeriods(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:semester,quarter,trimester',
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $period = AcademicPeriod::create($request->all());

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicPeriod',
            $period->id,
            null,
            $period->toArray()
        );

        return redirect()->back()->with('success', 'Academic period created successfully.');
    }

    public function updatePeriods(Request $request, AcademicPeriod $period)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:semester,quarter,trimester',
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        $oldValues = $period->toArray();
        $period->update($request->all());

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicPeriod',
            $period->id,
            $oldValues,
            $period->toArray()
        );

        return redirect()->back()->with('success', 'Academic period updated successfully.');
    }

    public function destroyPeriods(AcademicPeriod $period)
    {
        // Check if period has associated grades
        if ($period->grades()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic period with associated grades.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicPeriod',
            $period->id,
            $period->toArray(),
            null
        );

        $period->delete();

        return redirect()->back()->with('success', 'Academic period deleted successfully.');
    }

    // ==================== ACADEMIC STRANDS ====================
    
    public function strands()
    {
        $strands = AcademicStrand::with(['academicLevel', 'subjects'])
            ->withCount('subjects')
            ->get();
        $levels = AcademicLevel::active()->get();
        
        return Inertia::render('Admin/Academic/Strands', [
            'strands' => $strands,
            'levels' => $levels
        ]);
    }

    public function storeStrands(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_strands,code',
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
        ]);

        $strand = AcademicStrand::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'AcademicStrand',
            $strand->id,
            null,
            $strand->toArray()
        );

        return redirect()->back()->with('success', 'Academic strand created successfully.');
    }

    public function updateStrands(Request $request, AcademicStrand $strand)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:academic_strands,code,' . $strand->id,
            'description' => 'nullable|string',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'is_active' => 'boolean',
        ]);

        $oldValues = $strand->toArray();

        $strand->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'academic_level_id' => $request->academic_level_id,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'AcademicStrand',
            $strand->id,
            $oldValues,
            $strand->toArray()
        );

        return redirect()->back()->with('success', 'Academic strand updated successfully.');
    }

    public function destroyStrands(AcademicStrand $strand)
    {
        // Check if strand has associated data
        if ($strand->subjects()->count() > 0 || $strand->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete academic strand with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'AcademicStrand',
            $strand->id,
            $strand->toArray(),
            null
        );

        $strand->delete();

        return redirect()->back()->with('success', 'Academic strand deleted successfully.');
    }

    // ==================== COLLEGE COURSES ====================
    
    public function collegeCourses()
    {
        $courses = CollegeCourse::with(['subjects', 'studentProfiles'])
            ->orderBy('department')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Academic/CollegeCourses', [
            'courses' => $courses,
            'degreeTypes' => CollegeCourse::getDegreeTypes(),
        ]);
    }

    public function storeCollegeCourses(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:college_courses,code',
            'description' => 'nullable|string',
            'degree_type' => 'required|in:bachelor,master,doctorate,diploma,certificate',
            'years_duration' => 'required|integer|min:1|max:10',
            'department' => 'nullable|string|max:255',
        ]);

        $course = CollegeCourse::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'degree_type' => $request->degree_type,
            'years_duration' => $request->years_duration,
            'department' => $request->department,
            'is_active' => true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'CollegeCourse',
            $course->id,
            null,
            $course->toArray()
        );

        return redirect()->back()->with('success', 'College course created successfully.');
    }

    public function updateCollegeCourses(Request $request, CollegeCourse $course)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:college_courses,code,' . $course->id,
            'description' => 'nullable|string',
            'degree_type' => 'required|in:bachelor,master,doctorate,diploma,certificate',
            'years_duration' => 'required|integer|min:1|max:10',
            'department' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $oldValues = $course->toArray();

        $course->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'degree_type' => $request->degree_type,
            'years_duration' => $request->years_duration,
            'department' => $request->department,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'CollegeCourse',
            $course->id,
            $oldValues,
            $course->toArray()
        );

        return redirect()->back()->with('success', 'College course updated successfully.');
    }

    public function destroyCollegeCourses(CollegeCourse $course)
    {
        // Check if course has associated data
        if ($course->subjects()->count() > 0 || $course->studentProfiles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete college course with associated subjects or students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'CollegeCourse',
            $course->id,
            $course->toArray(),
            null
        );

        $course->delete();

        return redirect()->back()->with('success', 'College course deleted successfully.');
    }

    // ==================== COLLEGE SUBJECTS ====================
    
    public function collegeSubjects()
    {
        $subjects = Subject::with(['collegeCourse'])
            ->whereNotNull('college_course_id')
            ->orderBy('name')
            ->get();

        $collegeCourses = CollegeCourse::active()->orderBy('name')->get();
        
        return Inertia::render('Admin/Academic/CollegeSubjects', [
            'subjects' => $subjects,
            'collegeCourses' => $collegeCourses,
        ]);
    }

    public function storeCollegeSubjects(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'college_course_id' => 'required|exists:college_courses,id',
            'year_level' => 'required|integer|min:1|max:6',
            'semester' => 'required|in:1st,2nd,summer',
            'is_active' => 'boolean',
        ]);

        $subject = Subject::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'college_course_id' => $request->college_course_id,
            'year_level' => $request->year_level,
            'semester' => $request->semester,
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'Subject',
            $subject->id,
            null,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'College subject created successfully.');
    }

    public function updateCollegeSubjects(Request $request, Subject $subject)
    {
        // Ensure this is a college subject
        if (!$subject->isCollegeSubject()) {
            return redirect()->back()->with('error', 'This subject is not a college subject.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'college_course_id' => 'required|exists:college_courses,id',
            'year_level' => 'required|integer|min:1|max:6',
            'semester' => 'required|in:1st,2nd,summer',
            'is_active' => 'boolean',
        ]);

        $oldValues = $subject->toArray();

        $subject->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'college_course_id' => $request->college_course_id,
            'year_level' => $request->year_level,
            'semester' => $request->semester,
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'Subject',
            $subject->id,
            $oldValues,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'College subject updated successfully.');
    }

    public function destroyCollegeSubjects(Subject $subject)
    {
        // Ensure this is a college subject
        if (!$subject->isCollegeSubject()) {
            return redirect()->back()->with('error', 'This subject is not a college subject.');
        }

        // Check if subject has associated data
        if ($subject->grades()->count() > 0 || $subject->instructorAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete college subject with associated grades or instructor assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'Subject',
            $subject->id,
            $subject->toArray(),
            null
        );

        $subject->delete();

        return redirect()->back()->with('success', 'College subject deleted successfully.');
    }

    // ==================== SUBJECTS ====================
    
    public function subjects()
    {
        $subjects = Subject::with(['academicLevel', 'academicStrand', 'collegeCourse', 'instructorAssignments.instructor'])
            ->orderBy('academic_level_id')
            ->orderBy('college_course_id')
            ->orderBy('name')
            ->get();
        
        $levels = AcademicLevel::active()->get();
        $strands = AcademicStrand::active()->get();
        $collegeCourses = CollegeCourse::active()->get();
        
        return Inertia::render('Admin/Academic/Subjects', [
            'subjects' => $subjects,
            'levels' => $levels,
            'strands' => $strands,
            'collegeCourses' => $collegeCourses,
            'semesters' => CollegeCourse::getSemesters(),
        ]);
    }

    public function storeSubjects(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code',
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
        ];

        // Conditional validation based on subject type
        if ($request->subject_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12'; // Add grade level for K-12
        }

        $request->validate($rules);

        $subjectData = [
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'is_active' => true,
        ];

        if ($request->subject_type === 'college') {
            $subjectData['college_course_id'] = $request->college_course_id;
            $subjectData['year_level'] = $request->year_level;
            $subjectData['semester'] = $request->semester;
        } else {
            $subjectData['academic_level_id'] = $request->academic_level_id;
            $subjectData['academic_strand_id'] = $request->academic_strand_id;
            $subjectData['year_level'] = $request->year_level; // Add grade level for K-12
        }

        $subject = Subject::create($subjectData);

        // Only log activity if user is authenticated
        if (Auth::check()) {
            ActivityLog::logActivity(
                Auth::user(),
                'created',
                'Subject',
                $subject->id,
                null,
                $subject->toArray()
            );
        }

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function updateSubjects(Request $request, Subject $subject)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'units' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ];

        // Conditional validation based on subject type
        if ($request->subject_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12'; // Add grade level for K-12
        }

        $request->validate($rules);

        $oldValues = $subject->toArray();

        $subjectData = [
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'units' => $request->units,
            'is_active' => $request->is_active,
        ];

        if ($request->subject_type === 'college') {
            $subjectData['college_course_id'] = $request->college_course_id;
            $subjectData['year_level'] = $request->year_level;
            $subjectData['semester'] = $request->semester;
            // Clear K-12 fields
            $subjectData['academic_level_id'] = null;
            $subjectData['academic_strand_id'] = null;
        } else {
            $subjectData['academic_level_id'] = $request->academic_level_id;
            $subjectData['academic_strand_id'] = $request->academic_strand_id;
            $subjectData['year_level'] = $request->year_level; // Add grade level for K-12
            // Clear college fields
            $subjectData['college_course_id'] = null;
            $subjectData['semester'] = null;
        }

        $subject->update($subjectData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'Subject',
            $subject->id,
            $oldValues,
            $subject->toArray()
        );

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function destroySubjects(Subject $subject)
    {
        // Check if subject has associated data
        if ($subject->grades()->count() > 0 || $subject->instructorAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete subject with associated grades or assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'Subject',
            $subject->id,
            $subject->toArray(),
            null
        );

        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }

    // ==================== INSTRUCTOR ASSIGNMENTS ====================
    
    public function instructorAssignments()
    {
        $assignments = InstructorSubjectAssignment::with([
            'instructor',
            'subject.academicLevel',
            'subject.academicStrand',
            'subject.collegeCourse',
            'academicPeriod',
            'collegeCourse'
        ])->where('is_active', true)->get();

        $instructors = User::where('user_role', 'instructor')->orderBy('name')->get();
        $subjects = Subject::active()->with(['academicLevel', 'academicStrand', 'collegeCourse'])->get();
        $periods = AcademicPeriod::active()->get();
        $collegeCourses = CollegeCourse::active()->orderBy('name')->get();
        
        return Inertia::render('Admin/Assignments/Instructors', [
            'assignments' => $assignments,
            'instructors' => $instructors,
            'subjects' => $subjects,
            'periods' => $periods,
            'collegeCourses' => $collegeCourses
        ]);
    }

    public function storeInstructorAssignments(Request $request)
    {
        $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:50',
            'college_course_id' => 'nullable|exists:college_courses,id',
            'year_level' => 'nullable|string|max:20',
            'semester' => 'nullable|string|max:20',
        ]);

        // Check if assignment already exists
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->instructor_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
        ])->first();

        if ($existingAssignment) {
            return redirect()->back()->with('error', 'This assignment already exists.');
        }

        $assignment = InstructorSubjectAssignment::create(array_merge($request->all(), ['is_active' => true]));

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'InstructorSubjectAssignment',
            $assignment->id,
            null,
            $assignment->toArray()
        );

        return redirect()->back()->with('success', 'Instructor assignment created successfully.');
    }

    public function updateInstructorAssignments(Request $request, InstructorSubjectAssignment $assignment)
    {
        $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:50',
        ]);

        $oldValues = $assignment->toArray();
        $assignment->update($request->all());

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'InstructorSubjectAssignment',
            $assignment->id,
            $oldValues,
            $assignment->toArray()
        );

        return redirect()->back()->with('success', 'Instructor assignment updated successfully.');
    }

    public function destroyInstructorAssignments(InstructorSubjectAssignment $assignment)
    {
        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'InstructorSubjectAssignment',
            $assignment->id,
            $assignment->toArray(),
            null
        );

        $assignment->delete();

        return redirect()->back()->with('success', 'Instructor assignment removed successfully.');
    }

    // ==================== TEACHER ASSIGNMENTS (SENIOR HIGH SCHOOL) ====================
    
    public function teacherAssignments()
    {
        // Get only senior high school levels
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->get();

        $teachers = User::where('user_role', 'teacher')
            ->orderBy('name')
            ->get();

        $subjects = Subject::whereHas('academicLevel', function($query) use ($seniorHighLevels) {
            $query->whereIn('id', $seniorHighLevels->pluck('id'));
        })->with('academicLevel')->orderBy('name')->get();

        $assignments = InstructorSubjectAssignment::whereHas('subject.academicLevel', function($query) use ($seniorHighLevels) {
            $query->whereIn('id', $seniorHighLevels->pluck('id'));
        })
        ->with(['instructor', 'subject.academicLevel', 'subject.academicStrand', 'academicPeriod', 'strand'])
        ->orderBy('created_at', 'desc')
        ->get();

        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $strands = AcademicStrand::active()->orderBy('name')->get();

        return Inertia::render('Admin/Assignments/Teachers', [
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'academicPeriods' => $academicPeriods,
            'strands' => $strands
        ]);
    }

    public function storeTeacherAssignments(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:255',
            'strand_id' => 'nullable|exists:academic_strands,id',
            'year_level' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        // Check if teacher is actually a teacher
        $teacher = User::find($request->teacher_id);
        if ($teacher->user_role !== 'teacher') {
            return redirect()->back()->with('error', 'Selected user is not a teacher.');
        }

        // Check if subject is for senior high school
        $subject = Subject::with('academicLevel')->find($request->subject_id);
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');
        
        if (!$seniorHighLevels->contains($subject->academic_level_id)) {
            return redirect()->back()->with('error', 'Subject must be for Senior High School level.');
        }

        // Check for existing assignment
        $existingAssignment = InstructorSubjectAssignment::where([
            'instructor_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
        ])->first();

        if ($existingAssignment) {
            return redirect()->back()->with('error', 'Teacher is already assigned to this subject for this period.');
        }

        $assignment = InstructorSubjectAssignment::create([
            'instructor_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
            'strand_id' => $request->strand_id,
            'year_level' => $request->year_level,
            'is_active' => $request->is_active ?? true,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'TeacherSubjectAssignment',
            $assignment->id,
            null,
            $assignment->toArray()
        );

        return redirect()->back()->with('success', 'Teacher assigned successfully.');
    }

    public function updateTeacherAssignments(Request $request, InstructorSubjectAssignment $assignment)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'section' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Check if teacher is actually a teacher
        $teacher = User::find($request->teacher_id);
        if ($teacher->user_role !== 'teacher') {
            return redirect()->back()->with('error', 'Selected user is not a teacher.');
        }

        // Check if subject is for senior high school
        $subject = Subject::with('academicLevel')->find($request->subject_id);
        $seniorHighLevels = AcademicLevel::whereIn('name', ['Senior High School', 'Senior High'])
            ->orWhere('code', 'SHS')
            ->pluck('id');
        
        if (!$seniorHighLevels->contains($subject->academic_level_id)) {
            return redirect()->back()->with('error', 'Subject must be for Senior High School level.');
        }

        $oldValues = $assignment->toArray();

        $assignment->update([
            'instructor_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'academic_period_id' => $request->academic_period_id,
            'section' => $request->section,
            'is_active' => $request->is_active,
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'TeacherSubjectAssignment',
            $assignment->id,
            $oldValues,
            $assignment->toArray()
        );

        return redirect()->back()->with('success', 'Teacher assignment updated successfully.');
    }

    public function destroyTeacherAssignments(InstructorSubjectAssignment $assignment)
    {
        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'TeacherSubjectAssignment',
            $assignment->id,
            $assignment->toArray(),
            null
        );

        $assignment->delete();

        return redirect()->back()->with('success', 'Teacher assignment removed successfully.');
    }

    // ==================== CLASS ADVISER ASSIGNMENTS ====================
    
    public function adviserAssignments()
    {
        // Get advisers with their advised students (as User objects)
        $advisers = User::byRole('class_adviser')
            ->with(['advisedStudents.user.studentProfile.academicLevel', 'advisedStudents.user.studentProfile.academicStrand', 'advisedStudents.user.studentProfile.collegeCourse'])
            ->get()
            ->map(function ($adviser) {
                // Transform advisedStudents from StudentProfile to User objects
                $adviser->advised_students = $adviser->advisedStudents->map(function ($studentProfile) {
                    $user = $studentProfile->user;
                    $user->student_profile = $studentProfile;
                    return $user;
                });
                return $adviser;
            });

        $students = User::students()
            ->with(['studentProfile.academicLevel', 'studentProfile.academicStrand', 'studentProfile.collegeCourse', 'studentProfile.classAdviser'])
            ->get();

        $classAdvisers = User::byRole('class_adviser')->get();
        $levels = AcademicLevel::active()->get();
        $collegeCourses = CollegeCourse::active()->get();
        
        return Inertia::render('Admin/Assignments/Advisers', [
            'advisers' => $advisers,
            'students' => $students,
            'classAdvisers' => $classAdvisers,
            'levels' => $levels,
            'collegeCourses' => $collegeCourses,
        ]);
    }

    public function assignClassAdviser(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
            'class_adviser_id' => 'required|exists:users,id',
        ]);

        $adviser = User::findOrFail($request->class_adviser_id);
        if (!$adviser->isClassAdviser()) {
            return redirect()->back()->with('error', 'Selected user is not a class adviser.');
        }

        $updatedCount = 0;
        foreach ($request->student_ids as $studentId) {
            $student = User::findOrFail($studentId);
            if ($student->studentProfile) {
                $oldAdviser = $student->studentProfile->class_adviser_id;
                $student->studentProfile->update(['class_adviser_id' => $request->class_adviser_id]);
                
                ActivityLog::logActivity(
                    Auth::user(),
                    'updated',
                    'StudentProfile',
                    $student->studentProfile->id,
                    ['class_adviser_id' => $oldAdviser],
                    ['class_adviser_id' => $request->class_adviser_id]
                );
                
                $updatedCount++;
            }
        }

        return redirect()->back()->with('success', "Successfully assigned {$updatedCount} students to {$adviser->name}.");
    }

    public function removeClassAdviser(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $updatedCount = 0;
        foreach ($request->student_ids as $studentId) {
            $student = User::findOrFail($studentId);
            if ($student->studentProfile && $student->studentProfile->class_adviser_id) {
                $oldAdviser = $student->studentProfile->class_adviser_id;
                $student->studentProfile->update(['class_adviser_id' => null]);
                
                ActivityLog::logActivity(
                    Auth::user(),
                    'updated',
                    'StudentProfile',
                    $student->studentProfile->id,
                    ['class_adviser_id' => $oldAdviser],
                    ['class_adviser_id' => null]
                );
                
                $updatedCount++;
            }
        }

        return redirect()->back()->with('success', "Successfully removed class adviser from {$updatedCount} students.");
    }

    // ==================== UTILITY METHODS ====================
    
    public function getStrandsByLevel(Request $request)
    {
        $strands = AcademicStrand::where('academic_level_id', $request->level_id)
            ->active()
            ->get();
            
        return response()->json($strands);
    }

    public function getSubjectsByLevel(Request $request)
    {
        $query = Subject::where('academic_level_id', $request->level_id);
        
        if ($request->strand_id) {
            $query->where(function($q) use ($request) {
                $q->where('academic_strand_id', $request->strand_id)
                  ->orWhereNull('academic_strand_id');
            });
        }
        
        $subjects = $query->active()->get();
        
        return response()->json($subjects);
    }

    public function getSubjectsByCourse(Request $request)
    {
        $query = Subject::where('college_course_id', $request->course_id);
        
        if ($request->year_level) {
            $query->where('year_level', $request->year_level);
        }
        
        if ($request->semester) {
            $query->where('semester', $request->semester);
        }
        
        $subjects = $query->active()->get();
        
        return response()->json($subjects);
    }

    public function getYearLevelsByCourse(Request $request)
    {
        $course = CollegeCourse::findOrFail($request->course_id);
        $yearLevels = $course->getYearLevels();
        
        return response()->json($yearLevels);
    }

    public function getAcademicData()
    {
        $data = [
            'levels' => AcademicLevel::active()->get(),
            'strands' => AcademicStrand::active()->with('academicLevel')->get(),
            'periods' => AcademicPeriod::active()->get(),
            'subjects' => Subject::active()->with(['academicLevel', 'academicStrand', 'collegeCourse'])->get(),
            'collegeCourses' => CollegeCourse::active()->get(),
        ];
        
        return response()->json($data);
    }
} 