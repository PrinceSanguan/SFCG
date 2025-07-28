<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AcademicLevel;
use App\Models\AcademicStrand;
use App\Models\AcademicPeriod;
use App\Models\Subject;
use App\Models\CollegeCourse;
use App\Models\HonorCriterion;
use App\Models\CertificateTemplate;
use App\Models\StudentProfile;
use App\Models\ParentStudentLink;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class HonorSystemSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->createAcademicLevels();
            $this->createAcademicStrands();
            $this->createAcademicPeriods();
            $this->createCollegeCourses(); // New method
            $this->createSubjects();
            $this->createHonorCriteria();
            $this->createCertificateTemplates();
            $this->createSampleUsers();
        });

        $this->command->info('Honor System seeding completed successfully!');
    }

    private function createAcademicLevels(): void
    {
        $levels = [
            ['name' => 'Elementary', 'code' => 'ELEM', 'description' => 'Elementary Education (Grades 1-6)'],
            ['name' => 'Junior High School', 'code' => 'JHS', 'description' => 'Junior High School (Grades 7-10)'],
            ['name' => 'Senior High School', 'code' => 'SHS', 'description' => 'Senior High School (Grades 11-12)'],
            ['name' => 'College', 'code' => 'COL', 'description' => 'College Education'],
        ];

        foreach ($levels as $level) {
            AcademicLevel::create([
                'name' => $level['name'],
                'code' => $level['code'],
                'description' => $level['description'],
                'is_active' => true,
            ]);
        }
    }

    private function createAcademicStrands(): void
    {
        $shsLevel = AcademicLevel::where('code', 'SHS')->first();

        $strands = [
            ['name' => 'Science, Technology, Engineering and Mathematics', 'code' => 'STEM'],
            ['name' => 'Humanities and Social Sciences', 'code' => 'HUMSS'],
            ['name' => 'Accountancy, Business and Management', 'code' => 'ABM'],
            ['name' => 'General Academic Strand', 'code' => 'GAS'],
            ['name' => 'Technical-Vocational-Livelihood', 'code' => 'TVL'],
        ];

        foreach ($strands as $strand) {
            AcademicStrand::create([
                'name' => $strand['name'],
                'code' => $strand['code'],
                'description' => "Senior High School {$strand['name']} strand",
                'academic_level_id' => $shsLevel->id,
                'is_active' => true,
            ]);
        }
    }

    private function createAcademicPeriods(): void
    {
        $periods = [
            [
                'name' => '1st Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2024-08-15',
                'end_date' => '2024-12-20',
                'is_active' => true,
            ],
            [
                'name' => '2nd Semester',
                'type' => 'semester',
                'school_year' => '2024-2025',
                'start_date' => '2025-01-15',
                'end_date' => '2025-05-30',
                'is_active' => false,
            ],
            [
                'name' => '1st Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-08-15',
                'end_date' => '2024-10-15',
                'is_active' => false,
            ],
            [
                'name' => '2nd Quarter',
                'type' => 'quarter',
                'school_year' => '2024-2025',
                'start_date' => '2024-10-16',
                'end_date' => '2024-12-20',
                'is_active' => false,
            ],
        ];

        foreach ($periods as $period) {
            AcademicPeriod::create($period);
        }
    }

    private function createCollegeCourses(): void
    {
        $courses = [
            [
                'name' => 'Bachelor of Science in Computer Science',
                'code' => 'BSCS',
                'description' => 'A comprehensive program focusing on computer programming, software development, and computational theory.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Engineering and Technology',
            ],
            [
                'name' => 'Bachelor of Science in Information Technology',
                'code' => 'BSIT',
                'description' => 'A program emphasizing the practical application of technology in business and organizations.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Engineering and Technology',
            ],
            [
                'name' => 'Bachelor of Science in Business Administration',
                'code' => 'BSBA',
                'description' => 'A comprehensive business program covering management, marketing, finance, and entrepreneurship.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Business',
            ],
            [
                'name' => 'Bachelor of Science in Nursing',
                'code' => 'BSN',
                'description' => 'A professional nursing program preparing students for healthcare careers.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Health Sciences',
            ],
            [
                'name' => 'Bachelor of Elementary Education',
                'code' => 'BEED',
                'description' => 'A teacher education program for elementary level instruction.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Education',
            ],
            [
                'name' => 'Bachelor of Secondary Education Major in English',
                'code' => 'BSED-ENG',
                'description' => 'A teacher education program specializing in English language instruction.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Education',
            ],
            [
                'name' => 'Bachelor of Arts in Psychology',
                'code' => 'BAPSYC',
                'description' => 'A program studying human behavior, mental processes, and psychological theories.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Liberal Arts',
            ],
            [
                'name' => 'Bachelor of Science in Criminology',
                'code' => 'BSCRIM',
                'description' => 'A program focused on criminal justice, law enforcement, and crime prevention.',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'College of Criminal Justice',
            ],
        ];

        foreach ($courses as $course) {
            CollegeCourse::create([
                'name' => $course['name'],
                'code' => $course['code'],
                'description' => $course['description'],
                'degree_type' => $course['degree_type'],
                'years_duration' => $course['years_duration'],
                'department' => $course['department'],
                'is_active' => true,
            ]);
        }
    }

    private function createSubjects(): void
    {
        // Get references
        $elemLevel = AcademicLevel::where('code', 'ELEM')->first();
        $jhsLevel = AcademicLevel::where('code', 'JHS')->first();
        $shsLevel = AcademicLevel::where('code', 'SHS')->first();
        $collegeLevel = AcademicLevel::where('code', 'COL')->first();
        
        $stemStrand = AcademicStrand::where('code', 'STEM')->first();
        $humssStrand = AcademicStrand::where('code', 'HUMSS')->first();
        $abmStrand = AcademicStrand::where('code', 'ABM')->first();

        $bscsCourse = CollegeCourse::where('code', 'BSCS')->first();
        $bsitCourse = CollegeCourse::where('code', 'BSIT')->first();
        $bsbaCourse = CollegeCourse::where('code', 'BSBA')->first();

        // K-12 Subjects
        $k12Subjects = [
            // Elementary subjects
            ['name' => 'Mathematics', 'code' => 'MATH-ELEM', 'units' => 1, 'level_id' => $elemLevel->id],
            ['name' => 'English', 'code' => 'ENG-ELEM', 'units' => 1, 'level_id' => $elemLevel->id],
            ['name' => 'Science', 'code' => 'SCI-ELEM', 'units' => 1, 'level_id' => $elemLevel->id],
            ['name' => 'Filipino', 'code' => 'FIL-ELEM', 'units' => 1, 'level_id' => $elemLevel->id],

            // JHS subjects
            ['name' => 'Mathematics', 'code' => 'MATH-JHS', 'units' => 1, 'level_id' => $jhsLevel->id],
            ['name' => 'English', 'code' => 'ENG-JHS', 'units' => 1, 'level_id' => $jhsLevel->id],
            ['name' => 'Science', 'code' => 'SCI-JHS', 'units' => 1, 'level_id' => $jhsLevel->id],
            ['name' => 'Filipino', 'code' => 'FIL-JHS', 'units' => 1, 'level_id' => $jhsLevel->id],

            // SHS STEM subjects
            ['name' => 'General Mathematics', 'code' => 'GENMATH', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $stemStrand->id],
            ['name' => 'Statistics and Probability', 'code' => 'STAT', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $stemStrand->id],
            ['name' => 'General Physics 1', 'code' => 'PHYS1', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $stemStrand->id],
            ['name' => 'General Chemistry 1', 'code' => 'CHEM1', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $stemStrand->id],

            // SHS ABM subjects
            ['name' => 'Business Mathematics', 'code' => 'BUSMATH', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $abmStrand->id],
            ['name' => 'Fundamentals of Accountancy', 'code' => 'FUNDACC', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $abmStrand->id],
            ['name' => 'Business Ethics and Social Responsibility', 'code' => 'BESR', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $abmStrand->id],

            // SHS HUMSS subjects
            ['name' => 'Creative Writing', 'code' => 'CREWRI', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $humssStrand->id],
            ['name' => 'Philippine Politics and Governance', 'code' => 'POLGO', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $humssStrand->id],
            ['name' => 'Introduction to World Religions', 'code' => 'WORLDREL', 'units' => 1, 'level_id' => $shsLevel->id, 'strand_id' => $humssStrand->id],
        ];

        foreach ($k12Subjects as $subject) {
            Subject::create([
                'name' => $subject['name'],
                'code' => $subject['code'],
                'description' => "K-12 {$subject['name']} course",
                'units' => $subject['units'],
                'academic_level_id' => $subject['level_id'],
                'academic_strand_id' => $subject['strand_id'] ?? null,
                'is_active' => true,
            ]);
        }

        // College Subjects
        $collegeSubjects = [
            // BSCS 1st Year 1st Semester
            ['name' => 'Introduction to Computing', 'code' => 'CS101', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Programming Fundamentals', 'code' => 'CS102', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Mathematics in the Modern World', 'code' => 'MATH101', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Understanding the Self', 'code' => 'GE101', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'National Service Training Program', 'code' => 'NSTP101', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '1st'],

            // BSCS 1st Year 2nd Semester
            ['name' => 'Object-Oriented Programming', 'code' => 'CS103', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '2nd'],
            ['name' => 'Discrete Mathematics', 'code' => 'CS104', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '2nd'],
            ['name' => 'Readings in Philippine History', 'code' => 'GE102', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '2nd'],
            ['name' => 'The Contemporary World', 'code' => 'GE103', 'units' => 3, 'course_id' => $bscsCourse->id, 'year' => 1, 'sem' => '2nd'],

            // BSIT 1st Year 1st Semester
            ['name' => 'Introduction to Information Technology', 'code' => 'IT101', 'units' => 3, 'course_id' => $bsitCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Computer Programming 1', 'code' => 'IT102', 'units' => 3, 'course_id' => $bsitCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Mathematics in the Modern World', 'code' => 'MATH101', 'units' => 3, 'course_id' => $bsitCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Understanding the Self', 'code' => 'GE101', 'units' => 3, 'course_id' => $bsitCourse->id, 'year' => 1, 'sem' => '1st'],

            // BSBA 1st Year 1st Semester
            ['name' => 'Introduction to Business', 'code' => 'BA101', 'units' => 3, 'course_id' => $bsbaCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Business Mathematics', 'code' => 'BA102', 'units' => 3, 'course_id' => $bsbaCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Principles of Economics', 'code' => 'BA103', 'units' => 3, 'course_id' => $bsbaCourse->id, 'year' => 1, 'sem' => '1st'],
            ['name' => 'Understanding the Self', 'code' => 'GE101', 'units' => 3, 'course_id' => $bsbaCourse->id, 'year' => 1, 'sem' => '1st'],
        ];

        foreach ($collegeSubjects as $subject) {
            Subject::create([
                'name' => $subject['name'],
                'code' => $subject['code'],
                'description' => "College level {$subject['name']} course",
                'units' => $subject['units'],
                'college_course_id' => $subject['course_id'],
                'year_level' => $subject['year'],
                'semester' => $subject['sem'],
                'is_active' => true,
            ]);
        }
    }

    private function createHonorCriteria(): void
    {
        $levels = AcademicLevel::all();

        foreach ($levels as $level) {
            $criteria = [
                [
                    'honor_type' => 'with_highest_honors',
                    'min_gpa' => 98.0,
                    'max_gpa' => 100.0,
                    'description' => 'Summa Cum Laude equivalent for ' . $level->name,
                ],
                [
                    'honor_type' => 'with_high_honors',
                    'min_gpa' => 95.0,
                    'max_gpa' => 97.99,
                    'description' => 'Magna Cum Laude equivalent for ' . $level->name,
                ],
                [
                    'honor_type' => 'with_honors',
                    'min_gpa' => 90.0,
                    'max_gpa' => 94.99,
                    'description' => 'Cum Laude equivalent for ' . $level->name,
                ],
            ];

            foreach ($criteria as $criterion) {
                HonorCriterion::create([
                    'academic_level_id' => $level->id,
                    'honor_type' => $criterion['honor_type'],
                    'minimum_grade' => $criterion['min_gpa'],
                    'maximum_grade' => $criterion['max_gpa'],
                    'criteria_description' => $criterion['description'],
                    'is_active' => true,
                ]);
            }
        }
    }

    private function createCertificateTemplates(): void
    {
        $templates = [
            [
                'name' => 'Honor Roll Certificate',
                'type' => 'honor_roll',
                'template_content' => '<html><body><h1>Certificate of Academic Excellence</h1><p>This is to certify that</p><h2>{{student_name}}</h2><p>has achieved {{honor_type}} for the {{academic_period}} {{school_year}}</p><p>with a General Point Average of {{gpa}}</p></body></html>',
                'description' => 'Standard template for honor roll certificates',
            ],
            [
                'name' => 'Graduation Certificate',
                'type' => 'graduation',
                'template_content' => '<html><body><h1>Certificate of Graduation</h1><p>This is to certify that</p><h2>{{student_name}}</h2><p>has successfully completed the requirements for</p><h3>{{course_name}}</h3><p>Graduated with {{honor_type}}</p></body></html>',
                'description' => 'Standard template for graduation certificates',
            ],
            [
                'name' => 'Academic Achievement Certificate',
                'type' => 'achievement',
                'template_content' => '<html><body><h1>Certificate of Academic Achievement</h1><p>This is to certify that</p><h2>{{student_name}}</h2><p>has demonstrated outstanding academic performance</p><p>in {{subject_name}} for {{academic_period}}</p></body></html>',
                'description' => 'Template for specific academic achievements',
            ],
        ];

        foreach ($templates as $template) {
            CertificateTemplate::create([
                'name' => $template['name'],
                'type' => $template['type'],
                'template_content' => $template['template_content'],
                'variables' => '["{{student_name}}", "{{honor_type}}", "{{academic_period}}", "{{school_year}}", "{{gpa}}", "{{course_name}}", "{{subject_name}}"]',
                'is_active' => true,
            ]);
        }
    }

    private function createSampleUsers(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'admin',
        ]);

        // Create Registrar
        $registrar = User::create([
            'name' => 'School Registrar',
            'email' => 'registrar@school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'registrar',
        ]);

        // Create Instructors
        $instructors = [
            ['name' => 'Dr. John Smith', 'email' => 'john.smith@school.edu'],
            ['name' => 'Prof. Jane Doe', 'email' => 'jane.doe@school.edu'],
            ['name' => 'Dr. Michael Johnson', 'email' => 'michael.johnson@school.edu'],
        ];

        foreach ($instructors as $instructor) {
            User::create([
                'name' => $instructor['name'],
                'email' => $instructor['email'],
                'password' => Hash::make('password'),
                'user_role' => 'instructor',
            ]);
        }

        // Create Teachers
        $teachers = [
            ['name' => 'Ms. Sarah Wilson', 'email' => 'sarah.wilson@school.edu'],
            ['name' => 'Mr. David Brown', 'email' => 'david.brown@school.edu'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'password' => Hash::make('password'),
                'user_role' => 'teacher',
            ]);
        }

        // Create Class Advisers
        $advisers = [
            ['name' => 'Ms. Lisa Anderson', 'email' => 'lisa.anderson@school.edu'],
            ['name' => 'Mr. Robert Garcia', 'email' => 'robert.garcia@school.edu'],
        ];

        foreach ($advisers as $adviser) {
            User::create([
                'name' => $adviser['name'],
                'email' => $adviser['email'],
                'password' => Hash::make('password'),
                'user_role' => 'class_adviser',
            ]);
        }

        // Create Chairperson
        $chairperson = User::create([
            'name' => 'Dr. Maria Rodriguez',
            'email' => 'maria.rodriguez@school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'chairperson',
        ]);

        // Create Principal
        $principal = User::create([
            'name' => 'Dr. William Thompson',
            'email' => 'william.thompson@school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'principal',
        ]);

        // Create Students
        $collegeLevel = AcademicLevel::where('code', 'COL')->first();
        $shsLevel = AcademicLevel::where('code', 'SHS')->first();
        $bscsCourse = CollegeCourse::where('code', 'BSCS')->first();
        $stemStrand = AcademicStrand::where('code', 'STEM')->first();
        $adviser = User::where('user_role', 'class_adviser')->first();

        // Create College Student
        $collegeStudent = User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice.johnson@student.school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'student',
        ]);

        StudentProfile::create([
            'user_id' => $collegeStudent->id,
            'student_id' => 'STU-2024-001',
            'first_name' => 'Alice',
            'middle_name' => 'Marie',
            'last_name' => 'Johnson',
            'birth_date' => '2002-01-15',
            'gender' => 'Female',
            'address' => '123 Main St, City, State',
            'contact_number' => '+1234567890',
            'academic_level_id' => $collegeLevel->id,
            'college_course_id' => $bscsCourse->id,
            'grade_level' => '1st Year',
            'section' => 'A',
            'enrollment_status' => 'active',
            'class_adviser_id' => $adviser->id,
        ]);

        // Create K-12 Student
        $k12Student = User::create([
            'name' => 'Bob Wilson',
            'email' => 'bob.wilson@student.school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'student',
        ]);

        StudentProfile::create([
            'user_id' => $k12Student->id,
            'student_id' => 'STU-2024-002',
            'first_name' => 'Bob',
            'middle_name' => 'James',
            'last_name' => 'Wilson',
            'birth_date' => '2007-05-20',
            'gender' => 'Male',
            'address' => '456 Oak Ave, City, State',
            'contact_number' => '+1234567891',
            'academic_level_id' => $shsLevel->id,
            'academic_strand_id' => $stemStrand->id,
            'grade_level' => 'Grade 11',
            'section' => 'STEM-A',
            'enrollment_status' => 'active',
            'class_adviser_id' => $adviser->id,
        ]);

        // Create Parents
        $parent1 = User::create([
            'name' => 'Robert Johnson',
            'email' => 'robert.johnson@parent.school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'parent',
        ]);

        $parent2 = User::create([
            'name' => 'Mary Wilson',
            'email' => 'mary.wilson@parent.school.edu',
            'password' => Hash::make('password'),
            'user_role' => 'parent',
        ]);

        // Link Parents to Students
        ParentStudentLink::create([
            'parent_id' => $parent1->id,
            'student_id' => $collegeStudent->id,
            'relationship' => 'father',
        ]);

        ParentStudentLink::create([
            'parent_id' => $parent2->id,
            'student_id' => $k12Student->id,
            'relationship' => 'mother',
        ]);
    }
} 