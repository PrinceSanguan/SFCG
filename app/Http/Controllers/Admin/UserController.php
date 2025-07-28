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
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
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
            } else {
                // For K-12 students: use academic level and strand, no college course
                $profileData['academic_level_id'] = $request->academic_level_id;
                $profileData['academic_strand_id'] = $request->academic_strand_id ?: null;
                $profileData['college_course_id'] = null; // K-12 students don't have college courses
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
        } else {
            $rules['academic_level_id'] = 'required|exists:academic_levels,id';
            $rules['academic_strand_id'] = 'nullable|exists:academic_strands,id';
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
            } else {
                // For K-12 students: use academic level and strand, no college course
                $profileData['academic_level_id'] = $request->academic_level_id;
                $profileData['academic_strand_id'] = $request->academic_strand_id ?: null;
                $profileData['college_course_id'] = null; // K-12 students don't have college courses
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
} 