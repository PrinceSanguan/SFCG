<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\AcademicLevel;
use App\Models\AcademicStrand;
use App\Models\CollegeCourse;
use App\Models\ParentStudentLink;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    // ==================== INSTRUCTORS ====================
    
    public function instructors()
    {
        $instructors = User::where('user_role', 'instructor')
            ->with(['subjectAssignments.subject', 'subjectAssignments.academicPeriod'])
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Instructors', [
            'instructors' => $instructors
        ]);
    }

    public function storeInstructor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $instructor = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'instructor',
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'User',
            $instructor->id,
            null,
            $instructor->toArray()
        );

        return redirect()->back()->with('success', 'Instructor created successfully.');
    }

    public function updateInstructor(Request $request, User $instructor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $instructor->id,
            'password' => 'nullable|string|min:8',
        ]);

        $oldValues = $instructor->toArray();
        
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $instructor->update($updateData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $instructor->id,
            $oldValues,
            $instructor->toArray()
        );

        return redirect()->back()->with('success', 'Instructor updated successfully.');
    }

    public function destroyInstructor(User $instructor)
    {
        // Check if instructor has assignments
        if ($instructor->subjectAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete instructor with subject assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'User',
            $instructor->id,
            $instructor->toArray(),
            null
        );

        $instructor->delete();

        return redirect()->back()->with('success', 'Instructor deleted successfully.');
    }

    // ==================== TEACHERS ====================
    
    public function teachers()
    {
        $teachers = User::where('user_role', 'teacher')
            ->with(['subjectAssignments.subject', 'subjectAssignments.academicPeriod'])
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Teachers', [
            'teachers' => $teachers
        ]);
    }

    public function storeTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'teacher',
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'User',
            $teacher->id,
            null,
            $teacher->toArray()
        );

        return redirect()->back()->with('success', 'Teacher created successfully.');
    }

    public function updateTeacher(Request $request, User $teacher)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->id,
            'password' => 'nullable|string|min:8',
        ]);

        $oldValues = $teacher->toArray();
        
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $teacher->update($updateData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $teacher->id,
            $oldValues,
            $teacher->toArray()
        );

        return redirect()->back()->with('success', 'Teacher updated successfully.');
    }

    public function destroyTeacher(User $teacher)
    {
        // Check if teacher has assignments
        if ($teacher->subjectAssignments()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete teacher with subject assignments.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'User',
            $teacher->id,
            $teacher->toArray(),
            null
        );

        $teacher->delete();

        return redirect()->back()->with('success', 'Teacher deleted successfully.');
    }

    // ==================== CLASS ADVISERS ====================
    
    public function advisers()
    {
        $advisers = User::where('user_role', 'class_adviser')
            ->with(['advisedStudents.academicLevel', 'advisedStudents.academicStrand', 'advisedStudents.collegeCourse'])
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Advisers', [
            'advisers' => $advisers
        ]);
    }

    public function storeAdviser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $adviser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'class_adviser',
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'User',
            $adviser->id,
            null,
            $adviser->toArray()
        );

        return redirect()->back()->with('success', 'Class adviser created successfully.');
    }

    public function updateAdviser(Request $request, User $adviser)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $adviser->id,
            'password' => 'nullable|string|min:8',
        ]);

        $oldValues = $adviser->toArray();
        
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $adviser->update($updateData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $adviser->id,
            $oldValues,
            $adviser->toArray()
        );

        return redirect()->back()->with('success', 'Class adviser updated successfully.');
    }

    public function destroyAdviser(User $adviser)
    {
        // Check if adviser has assigned students
        if ($adviser->advisedStudents()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete adviser with assigned students.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'User',
            $adviser->id,
            $adviser->toArray(),
            null
        );

        $adviser->delete();

        return redirect()->back()->with('success', 'Class adviser deleted successfully.');
    }

    // ==================== CHAIRPERSONS ====================
    
    public function chairpersons()
    {
        $chairpersons = User::where('user_role', 'chairperson')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Chairpersons', [
            'chairpersons' => $chairpersons
        ]);
    }

    public function storeChairperson(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $chairperson = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'chairperson',
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'User',
            $chairperson->id,
            null,
            $chairperson->toArray()
        );

        return redirect()->back()->with('success', 'Chairperson created successfully.');
    }

    public function updateChairperson(Request $request, User $chairperson)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $chairperson->id,
            'password' => 'nullable|string|min:8',
        ]);

        $oldValues = $chairperson->toArray();
        
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $chairperson->update($updateData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $chairperson->id,
            $oldValues,
            $chairperson->toArray()
        );

        return redirect()->back()->with('success', 'Chairperson updated successfully.');
    }

    public function destroyChairperson(User $chairperson)
    {
        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'User',
            $chairperson->id,
            $chairperson->toArray(),
            null
        );

        $chairperson->delete();

        return redirect()->back()->with('success', 'Chairperson deleted successfully.');
    }

    // ==================== PRINCIPALS ====================
    
    public function principals()
    {
        $principals = User::where('user_role', 'principal')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Principals', [
            'principals' => $principals
        ]);
    }

    public function storePrincipal(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $principal = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => 'principal',
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'created',
            'User',
            $principal->id,
            null,
            $principal->toArray()
        );

        return redirect()->back()->with('success', 'Principal created successfully.');
    }

    public function updatePrincipal(Request $request, User $principal)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $principal->id,
            'password' => 'nullable|string|min:8',
        ]);

        $oldValues = $principal->toArray();
        
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $principal->update($updateData);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $principal->id,
            $oldValues,
            $principal->toArray()
        );

        return redirect()->back()->with('success', 'Principal updated successfully.');
    }

    public function destroyPrincipal(User $principal)
    {
        ActivityLog::logActivity(
            Auth::user(),
            'deleted',
            'User',
            $principal->id,
            $principal->toArray(),
            null
        );

        $principal->delete();

        return redirect()->back()->with('success', 'Principal deleted successfully.');
    }

    // ==================== STUDENTS ====================
    
    public function students()
    {
        $students = User::where('user_role', 'student')
            ->with([
                'studentProfile.academicLevel',
                'studentProfile.academicStrand', 
                'studentProfile.collegeCourse',
                'studentProfile.classAdviser'
            ])
            ->orderBy('name')
            ->get();

        $academicLevels = AcademicLevel::active()->get();
        $academicStrands = AcademicStrand::active()->get();
        $collegeCourses = CollegeCourse::active()->get();
        $classAdvisers = User::where('user_role', 'class_adviser')->get();
        
        return Inertia::render('Admin/Users/Students', [
            'students' => $students,
            'academicLevels' => $academicLevels,
            'academicStrands' => $academicStrands,
            'collegeCourses' => $collegeCourses,
            'classAdvisers' => $classAdvisers,
        ]);
    }

    public function storeStudent(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'student_id' => 'required|string|unique:student_profiles,student_id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'address' => 'required|string',
            'contact_number' => 'nullable|string',
            'enrollment_status' => 'required|in:active,inactive,graduated,dropped',
            'section' => 'nullable|string|max:255',
            'class_adviser_id' => 'nullable|exists:users,id',
            'student_type' => 'required|in:k12,college',
            'grade_level' => 'required|string|max:255',
        ];

        if ($request->student_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12';
        }

        $request->validate($rules);

        DB::transaction(function () use ($request) {
            $student = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_role' => 'student',
            ]);

            $profileData = [
                'user_id' => $student->id,
                'student_id' => $request->student_id,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'address' => $request->address,
                'contact_number' => $request->contact_number,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'enrollment_status' => $request->enrollment_status,
                'class_adviser_id' => $request->class_adviser_id ?: null,
            ];

            if ($request->student_type === 'college') {
                // For college students: use college course and set academic level to College
                $collegeLevel = AcademicLevel::where('code', 'COL')->first();
                $profileData['college_course_id'] = $request->college_course_id;
                $profileData['academic_level_id'] = $collegeLevel ? $collegeLevel->id : null;
                $profileData['academic_strand_id'] = null; // College students don't have strands
                $profileData['year_level'] = $request->year_level;
                $profileData['semester'] = $request->semester;
            } else {
                // For K-12 students: use academic level and strand, no college course
                $profileData['academic_level_id'] = $request->academic_level_id;
                $profileData['academic_strand_id'] = $request->academic_strand_id ?: null;
                $profileData['college_course_id'] = null; // K-12 students don't have college courses
                $profileData['year_level'] = $request->year_level;
                $profileData['semester'] = null; // K-12 students don't have semesters
            }

            StudentProfile::create($profileData);

            ActivityLog::logActivity(
                Auth::user(),
                'created',
                'User',
                $student->id,
                null,
                $student->toArray()
            );
        });

        return redirect()->back()->with('success', 'Student created successfully.');
    }

    public function updateStudent(Request $request, User $student)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->id,
            'password' => 'nullable|string|min:8',
            'student_id' => 'required|string|unique:student_profiles,student_id,' . ($student->studentProfile->id ?? 0),
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'address' => 'required|string',
            'contact_number' => 'nullable|string',
            'enrollment_status' => 'required|in:active,inactive,graduated,dropped',
            'section' => 'nullable|string|max:255',
            'class_adviser_id' => 'nullable|exists:users,id',
            'student_type' => 'required|in:k12,college',
            'grade_level' => 'required|string|max:255',
        ];

        if ($request->student_type === 'college') {
            $rules['college_course_id'] = 'required|exists:college_courses,id';
            $rules['year_level'] = 'required|integer|min:1|max:10';
            $rules['semester'] = 'required|in:1st,2nd,summer';
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
            $rules['year_level'] = 'required|integer|min:1|max:12';
        }

        $request->validate($rules);

        DB::transaction(function () use ($request, $student) {
            $oldValues = $student->toArray();
            
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $student->update($updateData);

            $profileData = [
                'student_id' => $request->student_id,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'address' => $request->address,
                'contact_number' => $request->contact_number,
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'enrollment_status' => $request->enrollment_status,
                'class_adviser_id' => $request->class_adviser_id ?: null,
            ];

            if ($request->student_type === 'college') {
                // For college students: use college course and set academic level to College
                $collegeLevel = AcademicLevel::where('code', 'COL')->first();
                $profileData['college_course_id'] = $request->college_course_id;
                $profileData['academic_level_id'] = $collegeLevel ? $collegeLevel->id : null;
                $profileData['academic_strand_id'] = null; // College students don't have strands
                $profileData['year_level'] = $request->year_level;
                $profileData['semester'] = $request->semester;
            } else {
                // For K-12 students: use academic level and strand, no college course
                $profileData['academic_level_id'] = $request->academic_level_id;
                $profileData['academic_strand_id'] = $request->academic_strand_id ?: null;
                $profileData['college_course_id'] = null; // K-12 students don't have college courses
                $profileData['year_level'] = $request->year_level;
                $profileData['semester'] = null; // K-12 students don't have semesters
            }

            if ($student->studentProfile) {
                $student->studentProfile->update($profileData);
            } else {
                $profileData['user_id'] = $student->id;
                StudentProfile::create($profileData);
            }

            ActivityLog::logActivity(
                Auth::user(),
                'updated',
                'User',
                $student->id,
                $oldValues,
                $student->toArray()
            );
        });

        return redirect()->back()->with('success', 'Student updated successfully.');
    }

    public function destroyStudent(User $student)
    {
        // Check if student has grades or honors
        if ($student->receivedGrades()->count() > 0 || $student->honors()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete student with existing grades or honors.');
        }

        DB::transaction(function () use ($student) {
            ActivityLog::logActivity(
                Auth::user(),
                'deleted',
                'User',
                $student->id,
                $student->toArray(),
                null
            );

            // Delete student profile first
            if ($student->studentProfile) {
                $student->studentProfile->delete();
            }

            // Delete parent-student links
            ParentStudentLink::where('student_id', $student->id)->delete();

            $student->delete();
        });

        return redirect()->back()->with('success', 'Student deleted successfully.');
    }

    // ==================== PARENTS ====================
    
    public function parents()
    {
        $parents = User::where('user_role', 'parent')
            ->with(['linkedStudents.studentProfile'])
            ->orderBy('name')
            ->get();

        $students = User::where('user_role', 'student')
            ->with('studentProfile')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Users/Parents', [
            'parents' => $parents,
            'students' => $students,
            'relationshipTypes' => ParentStudentLink::getRelationshipTypes(),
        ]);
    }

    public function storeParent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
            'relationships' => 'nullable|array',
            'relationships.*' => 'in:father,mother,guardian,grandfather,grandmother,uncle,aunt,other',
        ]);

        DB::transaction(function () use ($request) {
            $parent = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_role' => 'parent',
            ]);

            // Link students if provided
            if ($request->student_ids) {
                foreach ($request->student_ids as $index => $studentId) {
                    ParentStudentLink::create([
                        'parent_id' => $parent->id,
                        'student_id' => $studentId,
                        'relationship' => $request->relationships[$index] ?? 'guardian',
                    ]);
                }
            }

            ActivityLog::logActivity(
                Auth::user(),
                'created',
                'User',
                $parent->id,
                null,
                $parent->toArray()
            );
        });

        return redirect()->back()->with('success', 'Parent created successfully.');
    }

    public function updateParent(Request $request, User $parent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $parent->id,
            'password' => 'nullable|string|min:8',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
            'relationships' => 'nullable|array',
            'relationships.*' => 'in:father,mother,guardian,grandfather,grandmother,uncle,aunt,other',
        ]);

        DB::transaction(function () use ($request, $parent) {
            $oldValues = $parent->toArray();
            
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $parent->update($updateData);

            // Update student links
            ParentStudentLink::where('parent_id', $parent->id)->delete();

            if ($request->student_ids) {
                foreach ($request->student_ids as $index => $studentId) {
                    ParentStudentLink::create([
                        'parent_id' => $parent->id,
                        'student_id' => $studentId,
                        'relationship' => $request->relationships[$index] ?? 'guardian',
                    ]);
                }
            }

            ActivityLog::logActivity(
                Auth::user(),
                'updated',
                'User',
                $parent->id,
                $oldValues,
                $parent->toArray()
            );
        });

        return redirect()->back()->with('success', 'Parent updated successfully.');
    }

    public function destroyParent(User $parent)
    {
        DB::transaction(function () use ($parent) {
            ActivityLog::logActivity(
                Auth::user(),
                'deleted',
                'User',
                $parent->id,
                $parent->toArray(),
                null
            );

            // Delete parent-student links
            ParentStudentLink::where('parent_id', $parent->id)->delete();

            $parent->delete();
        });

        return redirect()->back()->with('success', 'Parent deleted successfully.');
    }

    // ==================== SEARCH FUNCTIONS ====================
    
    public function searchUsers(Request $request)
    {
        $query = $request->get('q', '');
        $role = $request->get('role', '');
        $limit = $request->get('limit', 10);

        $users = User::query()
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->when($role, function ($q) use ($role) {
                $q->where('user_role', $role);
            })
            ->where('user_role', '!=', 'student') // Exclude students from general user search
            ->where('user_role', '!=', 'parent')  // Exclude parents from general user search
            ->with(['subjectAssignments.subject', 'subjectAssignments.academicPeriod'])
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_role' => $user->user_role,
                    'created_at' => $user->created_at,
                    'subject_assignments' => $user->subjectAssignments ?? [],
                ];
            });

        return response()->json([
            'users' => $users,
            'total' => $users->count(),
        ]);
    }

    public function searchStudents(Request $request)
    {
        $query = $request->get('q', '');
        $academicLevelId = $request->get('academic_level_id', '');
        $enrollmentStatus = $request->get('enrollment_status', 'active');
        $limit = $request->get('limit', 20);

        $students = User::where('user_role', 'student')
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhereHas('studentProfile', function ($sq) use ($query) {
                      $sq->where('student_id', 'like', "%{$query}%")
                        ->orWhere('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%");
                  });
            })
            ->with(['studentProfile.academicLevel', 'studentProfile.academicStrand', 'studentProfile.collegeCourse'])
            ->whereHas('studentProfile', function ($q) use ($academicLevelId, $enrollmentStatus) {
                $q->where('enrollment_status', $enrollmentStatus);
                if ($academicLevelId) {
                    $q->where('academic_level_id', $academicLevelId);
                }
            })
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(function ($student) {
                $profile = $student->studentProfile;
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'student_id' => $profile->student_id ?? '',
                    'full_name' => $profile ? "{$profile->first_name} {$profile->middle_name} {$profile->last_name}" : $student->name,
                    'grade_level' => $profile->grade_level ?? '',
                    'section' => $profile->section ?? '',
                    'academic_level' => $profile->academicLevel->name ?? '',
                    'academic_strand' => $profile->academicStrand->name ?? '',
                    'college_course' => $profile->collegeCourse->name ?? '',
                    'enrollment_status' => $profile->enrollment_status ?? '',
                    'created_at' => $student->created_at,
                ];
            });

        return response()->json([
            'students' => $students,
            'total' => $students->count(),
        ]);
    }

    public function searchParents(Request $request)
    {
        $query = $request->get('q', '');
        $hasLinkedStudents = $request->get('has_linked_students', '');
        $limit = $request->get('limit', 10);

        $parents = User::where('user_role', 'parent')
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->when($hasLinkedStudents !== '', function ($q) use ($hasLinkedStudents) {
                if ($hasLinkedStudents === '1' || $hasLinkedStudents === 'true') {
                    $q->whereHas('linkedStudents');
                } else {
                    $q->whereDoesntHave('linkedStudents');
                }
            })
            ->with(['linkedStudents.studentProfile'])
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(function ($parent) {
                return [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'email' => $parent->email,
                    'linked_students_count' => $parent->linkedStudents->count(),
                    'linked_students' => $parent->linkedStudents->map(function ($student) {
                        $profile = $student->studentProfile;
                        return [
                            'id' => $student->id,
                            'name' => $student->name,
                            'student_id' => $profile->student_id ?? '',
                            'grade_level' => $profile->grade_level ?? '',
                        ];
                    }),
                    'created_at' => $parent->created_at,
                ];
            });

        return response()->json([
            'parents' => $parents,
            'total' => $parents->count(),
        ]);
    }

    // ==================== CSV UPLOAD ====================
    
    public function uploadCsv()
    {
        return Inertia::render('Admin/Users/UploadCsv');
    }

    public function processCsvUpload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'user_type' => 'required|in:instructor,teacher,class_adviser,chairperson,principal,student,parent',
        ]);

        $file = $request->file('csv_file');
        $userType = $request->user_type;
        
        try {
            $csvData = array_map('str_getcsv', file($file->path()));
            $headers = array_shift($csvData); // Remove header row
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            DB::transaction(function () use ($csvData, $headers, $userType, &$successCount, &$errorCount, &$errors) {
                foreach ($csvData as $rowIndex => $row) {
                    try {
                        $data = array_combine($headers, $row);
                        
                        // Basic validation
                        if (empty($data['name']) || empty($data['email'])) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Name and email are required.";
                            $errorCount++;
                            continue;
                        }

                        // Check if email already exists
                        if (User::where('email', $data['email'])->exists()) {
                            $errors[] = "Row " . ($rowIndex + 2) . ": Email {$data['email']} already exists.";
                            $errorCount++;
                            continue;
                        }

                        $user = User::create([
                            'name' => $data['name'],
                            'email' => $data['email'],
                            'password' => Hash::make($data['password'] ?? 'password123'),
                            'user_role' => $userType,
                        ]);

                        // Create student profile if user type is student
                        if ($userType === 'student') {
                            $this->createStudentProfileFromCsv($user, $data);
                        }

                        ActivityLog::logActivity(
                            Auth::user(),
                            'created',
                            'User',
                            $user->id,
                            null,
                            $user->toArray()
                        );

                        $successCount++;
                        
                    } catch (\Exception $e) {
                        $errors[] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                        $errorCount++;
                    }
                }
            });

            $message = "CSV upload completed. {$successCount} users created successfully.";
            if ($errorCount > 0) {
                $message .= " {$errorCount} rows had errors.";
            }

            return redirect()->back()->with('success', $message)->with('errors', $errors);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error processing CSV file: ' . $e->getMessage());
        }
    }

    private function createStudentProfileFromCsv(User $user, array $data)
    {
        $profileData = [
            'user_id' => $user->id,
            'student_id' => $data['student_id'] ?? 'STU-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            'first_name' => $data['first_name'] ?? explode(' ', $user->name)[0],
            'middle_name' => $data['middle_name'] ?? null,
            'last_name' => $data['last_name'] ?? (explode(' ', $user->name)[1] ?? ''),
            'birth_date' => $data['birth_date'] ?? '2000-01-01',
            'gender' => $data['gender'] ?? 'Male',
            'address' => $data['address'] ?? '',
            'contact_number' => $data['contact_number'] ?? null,
            'grade_level' => $data['grade_level'] ?? 'Grade 1',
            'section' => $data['section'] ?? null,
            'enrollment_status' => 'active',
            'class_adviser_id' => null,
        ];

        // Determine if this is a college student or K-12
        if (isset($data['college_course']) && !empty($data['college_course'])) {
            // College student
            $course = CollegeCourse::where('name', 'like', '%' . $data['college_course'] . '%')
                                  ->orWhere('code', 'like', '%' . $data['college_course'] . '%')
                                  ->first();
            
            if ($course) {
                $profileData['college_course_id'] = $course->id;
                $collegeLevel = AcademicLevel::where('code', 'COL')->first();
                $profileData['academic_level_id'] = $collegeLevel ? $collegeLevel->id : null;
                $profileData['academic_strand_id'] = null;
            } else {
                // Fallback to K-12 if college course not found
                $this->setK12Fields($profileData, $data);
            }
        } else {
            // K-12 student
            $this->setK12Fields($profileData, $data);
        }

        StudentProfile::create($profileData);
    }

    private function setK12Fields(array &$profileData, array $data)
    {
        // Determine academic level for K-12
        if (isset($data['academic_level'])) {
            $level = AcademicLevel::where('name', 'like', '%' . $data['academic_level'] . '%')
                                  ->where('code', '!=', 'COL') // Exclude college level
                                  ->first();
            $profileData['academic_level_id'] = $level ? $level->id : AcademicLevel::where('code', '!=', 'COL')->first()->id;
        } else {
            $profileData['academic_level_id'] = AcademicLevel::where('code', '!=', 'COL')->first()->id;
        }

        // Determine academic strand if provided
        if (isset($data['academic_strand'])) {
            $strand = AcademicStrand::where('name', 'like', '%' . $data['academic_strand'] . '%')->first();
            $profileData['academic_strand_id'] = $strand ? $strand->id : null;
        } else {
            $profileData['academic_strand_id'] = null;
        }

        $profileData['college_course_id'] = null;
    }

    // 1.1.3.4. Change user password (Dedicated method)
    public function changeUserPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Ensure user is not student or parent (use dedicated methods for those)
        if (in_array($user->user_role, ['student', 'parent'])) {
            return back()->withErrors(['error' => 'Use dedicated methods for student/parent passwords']);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $user->id,
            null,
            ['action' => 'password_changed_by_admin']
        );

        return back()->with('success', 'Password updated successfully for ' . $user->name);
    }

    // 1.1.4.5. Change student password (Dedicated method)
    public function changeStudentPassword(Request $request, User $student)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Ensure user is a student
        if ($student->user_role !== 'student') {
            return back()->withErrors(['error' => 'User is not a student']);
        }

        $student->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $student->id,
            null,
            ['action' => 'student_password_changed_by_admin']
        );

        return back()->with('success', 'Password updated successfully for student ' . $student->name);
    }

    // 1.1.5.5. Change parent password (Dedicated method)
    public function changeParentPassword(Request $request, User $parent)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Ensure user is a parent
        if ($parent->user_role !== 'parent') {
            return back()->withErrors(['error' => 'User is not a parent']);
        }

        $parent->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::logActivity(
            Auth::user(),
            'updated',
            'User',
            $parent->id,
            null,
            ['action' => 'parent_password_changed_by_admin']
        );

        return back()->with('success', 'Password updated successfully for parent ' . $parent->name);
    }
} 