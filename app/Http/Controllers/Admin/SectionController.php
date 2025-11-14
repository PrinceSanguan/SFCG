<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicLevel;
use App\Models\Course;
use App\Models\Department;
use App\Models\Section;
use App\Models\Strand;
use App\Models\Track;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isRegistrar = $user->user_role === 'registrar';
        $viewPath = $isRegistrar ? 'Registrar/Academic/SectionsHome' : 'Admin/Academic/SectionsHome';

        return Inertia::render($viewPath, [
            'user' => $user,
        ]);
    }

    public function manage(string $levelKey)
    {
        $user = Auth::user();
        $isRegistrar = $user->user_role === 'registrar';
        $viewPath = $isRegistrar ? 'Registrar/Academic/Sections' : 'Admin/Academic/Sections';

        $sections = Section::with(['academicLevel', 'track', 'strand', 'department', 'course'])
            ->orderBy('academic_level_id')
            ->orderBy('name')
            ->get();

        $academicLevels = AcademicLevel::orderBy('sort_order')->get();
        $tracks = Track::orderBy('name')->get();
        $strands = Strand::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();
        $courses = Course::with('department')->orderBy('name')->get();

        return Inertia::render($viewPath, [
            'user' => $user,
            'sections' => $sections,
            'academicLevels' => $academicLevels,
            'tracks' => $tracks,
            'strands' => $strands,
            'departments' => $departments,
            'courses' => $courses,
            'specificYearLevels' => User::getSpecificYearLevels(),
            'activeLevelKey' => $levelKey,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'specific_year_level' => 'nullable|string|max:50',
            'track_id' => 'nullable|exists:tracks,id',
            'strand_id' => 'nullable|exists:strands,id',
            'department_id' => 'nullable|exists:departments,id',
            'course_id' => 'nullable|exists:courses,id',
            'max_students' => 'nullable|integer|min:1|max:50',
            'is_active' => 'boolean',
        ]);

        // Additional validation for elementary, junior high, senior high, and college sections
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        if ($academicLevel && ($academicLevel->key === 'elementary' || $academicLevel->key === 'junior_highschool' || $academicLevel->key === 'senior_highschool' || $academicLevel->key === 'college')) {
            if ($academicLevel->key === 'elementary') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'elementary';
                });
            } elseif ($academicLevel->key === 'junior_highschool') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_7,grade_8,grade_9,grade_10', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'junior_highschool';
                });
            } elseif ($academicLevel->key === 'senior_highschool') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_11,grade_12', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
                $validator->sometimes('track_id', 'required|exists:tracks,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
                $validator->sometimes('strand_id', 'required|exists:strands,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
            } elseif ($academicLevel->key === 'college') {
                $validator->sometimes('department_id', 'required|exists:departments,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'college';
                });
                $validator->sometimes('course_id', 'required|exists:courses,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'college';
                });
            }
            $validator->sometimes('max_students', 'required|integer|min:1|max:50', function ($input) use ($academicLevel) {
                return in_array($academicLevel->key, ['elementary', 'junior_highschool', 'senior_highschool', 'college']);
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $section = Section::create($validator->validated());

        // Determine if user is registrar or admin
        $isRegistrar = Auth::user()->user_role === 'registrar';
        $routeName = $isRegistrar ? 'registrar.academic.sections.manage' : 'admin.academic.sections.manage';
        $levelKey = $academicLevel->key ?? 'elementary';

        Log::info('[SECTION CREATE] Section created successfully', [
            'section_id' => $section->id,
            'name' => $section->name,
            'academic_level' => $levelKey,
            'user_role' => Auth::user()->user_role,
            'redirect_route' => $routeName,
            'level_key' => $levelKey
        ]);

        return redirect()->route($routeName, ['levelKey' => $levelKey])
            ->with('success', 'Section created successfully.');
    }

    public function update(Request $request, Section $section)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'academic_level_id' => 'required|exists:academic_levels,id',
            'specific_year_level' => 'nullable|string|max:50',
            'track_id' => 'nullable|exists:tracks,id',
            'strand_id' => 'nullable|exists:strands,id',
            'department_id' => 'nullable|exists:departments,id',
            'course_id' => 'nullable|exists:courses,id',
            'max_students' => 'nullable|integer|min:1|max:50',
            'is_active' => 'boolean',
        ]);

        // Additional validation for elementary, junior high, senior high, and college sections
        $academicLevel = \App\Models\AcademicLevel::find($request->academic_level_id);
        if ($academicLevel && ($academicLevel->key === 'elementary' || $academicLevel->key === 'junior_highschool' || $academicLevel->key === 'senior_highschool' || $academicLevel->key === 'college')) {
            if ($academicLevel->key === 'elementary') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_1,grade_2,grade_3,grade_4,grade_5,grade_6', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'elementary';
                });
            } elseif ($academicLevel->key === 'junior_highschool') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_7,grade_8,grade_9,grade_10', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'junior_highschool';
                });
            } elseif ($academicLevel->key === 'senior_highschool') {
                $validator->sometimes('specific_year_level', 'required|string|in:grade_11,grade_12', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
                $validator->sometimes('track_id', 'required|exists:tracks,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
                $validator->sometimes('strand_id', 'required|exists:strands,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'senior_highschool';
                });
            } elseif ($academicLevel->key === 'college') {
                $validator->sometimes('department_id', 'required|exists:departments,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'college';
                });
                $validator->sometimes('course_id', 'required|exists:courses,id', function ($input) use ($academicLevel) {
                    return $academicLevel->key === 'college';
                });
            }
            $validator->sometimes('max_students', 'required|integer|min:1|max:50', function ($input) use ($academicLevel) {
                return in_array($academicLevel->key, ['elementary', 'junior_highschool', 'senior_highschool', 'college']);
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $section->update($validator->validated());

        // Determine if user is registrar or admin
        $isRegistrar = Auth::user()->user_role === 'registrar';
        $routeName = $isRegistrar ? 'registrar.academic.sections.manage' : 'admin.academic.sections.manage';
        $levelKey = $academicLevel->key ?? 'elementary';

        Log::info('[SECTION UPDATE] Section updated successfully', [
            'section_id' => $section->id,
            'name' => $section->name,
            'academic_level' => $levelKey,
            'user_role' => Auth::user()->user_role,
            'redirect_route' => $routeName,
            'level_key' => $levelKey
        ]);

        return redirect()->route($routeName, ['levelKey' => $levelKey])
            ->with('success', 'Section updated successfully.');
    }

    public function destroy(Section $section)
    {
        $section->delete();
        return back()->with('success', 'Section deleted successfully.');
    }

    /**
     * JSON: Filter sections by academic context.
     */
    public function list(Request $request)
    {
        $query = Section::query()->where('is_active', true);

        if ($request->filled('academic_level_id')) {
            $query->where('academic_level_id', $request->integer('academic_level_id'));
        }
        if ($request->filled('specific_year_level')) {
            $query->where('specific_year_level', $request->string('specific_year_level'));
        }
        if ($request->filled('track_id')) {
            $query->where('track_id', $request->integer('track_id'));
        }
        if ($request->filled('strand_id')) {
            $query->where('strand_id', $request->integer('strand_id'));
        }
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->string('school_year'));
        }

        $sections = $query->orderBy('name')->get();

        // Append counts and capacity info
        $sections = $sections->map(function (Section $section) {
            $currentCount = User::where('user_role', 'student')->where('section_id', $section->id)->count();
            return array_merge($section->toArray(), [
                'current_students' => $currentCount,
                'has_capacity' => is_null($section->max_students) ? true : $currentCount < $section->max_students,
            ]);
        });

        return response()->json($sections);
    }
}


