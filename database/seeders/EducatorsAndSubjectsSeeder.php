<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\AcademicStrand;
use App\Models\CollegeCourse;
use App\Models\AcademicPeriod;
use App\Models\InstructorSubjectAssignment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EducatorsAndSubjectsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🎓 Creating comprehensive educators and subjects data...');

        DB::beginTransaction();

        try {
            $this->createAcademicStrands();
            $this->createCollegeCourses();
            $this->createSubjects();
            $this->createEducators();
            $this->createSubjectAssignments();

            DB::commit();
            $this->command->info('✅ Educators and subjects seeding completed successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('❌ Error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createAcademicStrands()
    {
        $this->command->info('📚 Creating academic strands...');

        $seniorHighLevel = AcademicLevel::where('name', 'Senior High School')->first();

        if ($seniorHighLevel) {
            $strands = [
                ['name' => 'Science, Technology, Engineering and Mathematics (STEM)', 'code' => 'STEM', 'description' => 'Focuses on developing scientific and mathematical skills'],
                ['name' => 'Accountancy, Business and Management (ABM)', 'code' => 'ABM', 'description' => 'Prepares students for business and entrepreneurship'],
                ['name' => 'Humanities and Social Sciences (HUMSS)', 'code' => 'HUMSS', 'description' => 'Develops communication and social skills'],
                ['name' => 'General Academic Strand (GAS)', 'code' => 'GAS', 'description' => 'Provides a broad academic foundation'],
            ];

            foreach ($strands as $strand) {
                AcademicStrand::firstOrCreate(
                    ['code' => $strand['code']],
                    [
                        'name' => $strand['name'],
                        'description' => $strand['description'],
                        'academic_level_id' => $seniorHighLevel->id,
                        'is_active' => true,
                    ]
                );
            }
        }
    }

    private function createCollegeCourses()
    {
        $this->command->info('🏛️ Creating college courses...');

        $courses = [
            [
                'name' => 'Bachelor of Science in Computer Science', 
                'code' => 'BSCS', 
                'description' => 'Four-year program focusing on computing and software development',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'Computer Science'
            ],
            [
                'name' => 'Bachelor of Science in Information Technology', 
                'code' => 'BSIT', 
                'description' => 'Four-year program focusing on IT systems and applications',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'Information Technology'
            ],
            [
                'name' => 'Bachelor of Elementary Education', 
                'code' => 'BEED', 
                'description' => 'Four-year program for elementary school teachers',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'Education'
            ],
            [
                'name' => 'Bachelor of Secondary Education', 
                'code' => 'BSED', 
                'description' => 'Four-year program for secondary school teachers',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'Education'
            ],
            [
                'name' => 'Bachelor of Science in Business Administration', 
                'code' => 'BSBA', 
                'description' => 'Four-year program in business management',
                'degree_type' => 'bachelor',
                'years_duration' => 4,
                'department' => 'Business Administration'
            ],
        ];

        foreach ($courses as $course) {
            CollegeCourse::firstOrCreate(
                ['code' => $course['code']],
                [
                    'name' => $course['name'],
                    'description' => $course['description'],
                    'degree_type' => $course['degree_type'],
                    'years_duration' => $course['years_duration'],
                    'department' => $course['department'],
                    'is_active' => true,
                ]
            );
        }
    }

    private function createSubjects()
    {
        $this->command->info('📖 Creating subjects for all academic levels...');

        $levels = AcademicLevel::all();

        foreach ($levels as $level) {
            switch ($level->name) {
                case 'Elementary':
                    $this->createElementarySubjects($level);
                    break;
                case 'Junior High School':
                    $this->createJuniorHighSubjects($level);
                    break;
                case 'Senior High School':
                    $this->createSeniorHighSubjects($level);
                    break;
                case 'College':
                    $this->createCollegeSubjects($level);
                    break;
            }
        }
    }

    private function createElementarySubjects($level)
    {
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH_ELEM', 'description' => 'Basic arithmetic and problem solving'],
            ['name' => 'English Language Arts', 'code' => 'ENG_ELEM', 'description' => 'Reading, writing, and communication skills'],
            ['name' => 'Science', 'code' => 'SCI_ELEM', 'description' => 'Basic scientific concepts and exploration'],
            ['name' => 'Filipino', 'code' => 'FIL_ELEM', 'description' => 'National language and literature'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP_ELEM', 'description' => 'Social studies and Philippine history'],
            ['name' => 'Music, Arts, PE & Health (MAPEH)', 'code' => 'MAPEH_ELEM', 'description' => 'Creative and physical development'],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE_ELEM', 'description' => 'Practical life skills'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                [
                    'name' => $subject['name'],
                    'description' => $subject['description'],
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]
            );
        }
    }

    private function createJuniorHighSubjects($level)
    {
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH_JHS', 'description' => 'Algebra, geometry, and statistics'],
            ['name' => 'English', 'code' => 'ENG_JHS', 'description' => 'Literature and advanced communication'],
            ['name' => 'Science', 'code' => 'SCI_JHS', 'description' => 'Biology, chemistry, physics, and earth science'],
            ['name' => 'Filipino', 'code' => 'FIL_JHS', 'description' => 'Advanced Filipino language and literature'],
            ['name' => 'Araling Panlipunan', 'code' => 'AP_JHS', 'description' => 'World history and social sciences'],
            ['name' => 'Music, Arts, PE & Health (MAPEH)', 'code' => 'MAPEH_JHS', 'description' => 'Arts, music, physical education, and health'],
            ['name' => 'Technology and Livelihood Education', 'code' => 'TLE_JHS', 'description' => 'Practical and vocational skills'],
            ['name' => 'Computer Education', 'code' => 'COMP_JHS', 'description' => 'Basic computer literacy and programming'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                [
                    'name' => $subject['name'],
                    'description' => $subject['description'],
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]
            );
        }
    }

    private function createSeniorHighSubjects($level)
    {
        $subjects = [
            // Core Subjects
            ['name' => 'Oral Communication', 'code' => 'ORAL_COMM', 'description' => 'Oral communication skills'],
            ['name' => 'Reading and Writing', 'code' => 'READ_WRITE', 'description' => 'Advanced reading and writing skills'],
            ['name' => 'Komunikasyon at Pananaliksik', 'code' => 'KOMU_PAN', 'description' => 'Filipino communication and research'],
            ['name' => 'General Mathematics', 'code' => 'GEN_MATH', 'description' => 'Applied mathematics'],
            ['name' => 'Statistics and Probability', 'code' => 'STAT_PROB', 'description' => 'Statistical analysis and probability'],
            ['name' => 'Earth and Life Science', 'code' => 'EARTH_LIFE', 'description' => 'Environmental and biological sciences'],
            ['name' => 'Physical Science', 'code' => 'PHYS_SCI', 'description' => 'Physics and chemistry concepts'],
            ['name' => 'Personal Development', 'code' => 'PERS_DEV', 'description' => 'Personal growth and development'],
            ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP', 'description' => 'Social sciences and politics'],
            ['name' => 'Physical Education and Health', 'code' => 'PE_HEALTH', 'description' => 'Physical fitness and health education'],
            
            // STEM Specialized Subjects
            ['name' => 'Pre-Calculus', 'code' => 'PRE_CALC', 'description' => 'Advanced mathematics for STEM'],
            ['name' => 'Basic Calculus', 'code' => 'BASIC_CALC', 'description' => 'Introduction to calculus'],
            ['name' => 'Chemistry', 'code' => 'CHEM_SHS', 'description' => 'General and organic chemistry'],
            ['name' => 'Physics', 'code' => 'PHYS_SHS', 'description' => 'Mechanics, electricity, and waves'],
            ['name' => 'Biology', 'code' => 'BIO_SHS', 'description' => 'Molecular biology and genetics'],
            
            // ABM Specialized Subjects
            ['name' => 'Fundamentals of Accountancy', 'code' => 'FUND_ACCT', 'description' => 'Basic accounting principles'],
            ['name' => 'Business Mathematics', 'code' => 'BUS_MATH', 'description' => 'Mathematics for business'],
            ['name' => 'Business Ethics and Social Responsibility', 'code' => 'BUS_ETHICS', 'description' => 'Business ethics and CSR'],
            ['name' => 'Organization and Management', 'code' => 'ORG_MGMT', 'description' => 'Business organization and management'],
            
            // HUMSS Specialized Subjects
            ['name' => 'Creative Writing', 'code' => 'CREAT_WRITE', 'description' => 'Literary and creative writing'],
            ['name' => 'Philippine Politics and Governance', 'code' => 'PPG', 'description' => 'Philippine political system'],
            ['name' => 'World Religions and Belief Systems', 'code' => 'WRBS', 'description' => 'Comparative religion and beliefs'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                [
                    'name' => $subject['name'],
                    'description' => $subject['description'],
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]
            );
        }
    }

    private function createCollegeSubjects($level)
    {
        $subjects = [
            // Computer Science Subjects
            ['name' => 'Programming Fundamentals', 'code' => 'PROG_FUND', 'description' => 'Introduction to programming concepts'],
            ['name' => 'Object-Oriented Programming', 'code' => 'OOP', 'description' => 'Object-oriented programming principles'],
            ['name' => 'Data Structures and Algorithms', 'code' => 'DSA', 'description' => 'Algorithms and data structures'],
            ['name' => 'Database Management Systems', 'code' => 'DBMS', 'description' => 'Database design and management'],
            ['name' => 'Web Development', 'code' => 'WEB_DEV', 'description' => 'Front-end and back-end web development'],
            ['name' => 'Software Engineering', 'code' => 'SE', 'description' => 'Software development methodologies'],
            ['name' => 'Computer Networks', 'code' => 'COMP_NET', 'description' => 'Network protocols and architecture'],
            ['name' => 'Operating Systems', 'code' => 'OS', 'description' => 'Operating system concepts and design'],
            
            // General Education Subjects
            ['name' => 'Mathematics in the Modern World', 'code' => 'MATH_MW', 'description' => 'Applied mathematics for college'],
            ['name' => 'Science, Technology and Society', 'code' => 'STS', 'description' => 'Impact of science and technology'],
            ['name' => 'The Contemporary World', 'code' => 'TCW', 'description' => 'Global issues and perspectives'],
            ['name' => 'Readings in Philippine History', 'code' => 'RPH', 'description' => 'Philippine historical perspectives'],
            ['name' => 'Ethics', 'code' => 'ETHICS', 'description' => 'Moral philosophy and ethical thinking'],
            ['name' => 'Rizal\'s Life and Works', 'code' => 'RIZAL', 'description' => 'Study of José Rizal\'s contributions'],
            
            // Business Subjects
            ['name' => 'Principles of Management', 'code' => 'PRIN_MGMT', 'description' => 'Management theories and practices'],
            ['name' => 'Marketing Management', 'code' => 'MARK_MGMT', 'description' => 'Marketing strategies and consumer behavior'],
            ['name' => 'Financial Management', 'code' => 'FIN_MGMT', 'description' => 'Corporate finance and investment'],
            ['name' => 'Human Resource Management', 'code' => 'HRM', 'description' => 'Personnel management and development'],
            
            // Education Subjects
            ['name' => 'Child and Adolescent Development', 'code' => 'CAD', 'description' => 'Developmental psychology for educators'],
            ['name' => 'Curriculum Development', 'code' => 'CURR_DEV', 'description' => 'Educational curriculum design'],
            ['name' => 'Educational Assessment', 'code' => 'EDU_ASSESS', 'description' => 'Student assessment and evaluation'],
            ['name' => 'Classroom Management', 'code' => 'CLASS_MGMT', 'description' => 'Effective classroom management strategies'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                [
                    'name' => $subject['name'],
                    'description' => $subject['description'],
                    'academic_level_id' => $level->id,
                    'is_active' => true,
                ]
            );
        }
    }

    private function createEducators()
    {
        $this->command->info('👨‍🏫 Creating instructors and teachers...');

        // Clean up existing assignments and educators first
        InstructorSubjectAssignment::whereHas('instructor', function ($query) {
            $query->whereIn('user_role', ['instructor', 'teacher']);
        })->delete();
        
        User::whereIn('user_role', ['instructor', 'teacher'])->delete();

        $educators = [
            // Elementary Teachers
            [
                'name' => 'Maria Elena Rodriguez',
                'email' => 'maria.rodriguez@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Elementary Education',
                'specialization' => 'Primary Education',
                'contact_number' => '+63917123456',
            ],
            [
                'name' => 'Ana Marie Santos',
                'email' => 'ana.santos@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Elementary Education',
                'specialization' => 'Mathematics Education',
                'contact_number' => '+63917123457',
            ],
            [
                'name' => 'Joseph Patrick Cruz',
                'email' => 'joseph.cruz@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Elementary Education',
                'specialization' => 'Science Education',
                'contact_number' => '+63917123458',
            ],

            // Junior High School Teachers
            [
                'name' => 'Dr. Ricardo Manuel',
                'email' => 'ricardo.manuel@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Secondary Education',
                'specialization' => 'Mathematics',
                'contact_number' => '+63917123459',
            ],
            [
                'name' => 'Prof. Carmen Dela Cruz',
                'email' => 'carmen.delacruz@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Secondary Education',
                'specialization' => 'English Language Arts',
                'contact_number' => '+63917123460',
            ],
            [
                'name' => 'Mark Anthony Reyes',
                'email' => 'mark.reyes@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Secondary Education',
                'specialization' => 'Physical Science',
                'contact_number' => '+63917123461',
            ],

            // Senior High School Teachers
            [
                'name' => 'Dr. Sarah Jane Villanueva',
                'email' => 'sarah.villanueva@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Senior High School',
                'specialization' => 'STEM - Mathematics',
                'contact_number' => '+63917123462',
            ],
            [
                'name' => 'Prof. Miguel Angel Fernandez',
                'email' => 'miguel.fernandez@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Senior High School',
                'specialization' => 'STEM - Physics',
                'contact_number' => '+63917123463',
            ],
            [
                'name' => 'Jennifer Rose Morales',
                'email' => 'jennifer.morales@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Senior High School',
                'specialization' => 'ABM - Accounting',
                'contact_number' => '+63917123464',
            ],
            [
                'name' => 'Prof. Antonio Luis Garcia',
                'email' => 'antonio.garcia@sfcg.edu.ph',
                'user_role' => 'teacher',
                'department' => 'Senior High School',
                'specialization' => 'HUMSS - Social Sciences',
                'contact_number' => '+63917123465',
            ],

            // College Instructors
            [
                'name' => 'Dr. Roberto Carlos Medina',
                'email' => 'roberto.medina@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'Computer Science',
                'specialization' => 'Software Engineering',
                'contact_number' => '+63917123466',
            ],
            [
                'name' => 'Prof. Diana Marie Pascual',
                'email' => 'diana.pascual@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'Computer Science',
                'specialization' => 'Database Systems',
                'contact_number' => '+63917123467',
            ],
            [
                'name' => 'Dr. Francis Gabriel Torres',
                'email' => 'francis.torres@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'Information Technology',
                'specialization' => 'Web Development',
                'contact_number' => '+63917123468',
            ],
            [
                'name' => 'Prof. Katrina Mae Lim',
                'email' => 'katrina.lim@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'Business Administration',
                'specialization' => 'Management',
                'contact_number' => '+63917123469',
            ],
            [
                'name' => 'Dr. Eduardo Jose Ramos',
                'email' => 'eduardo.ramos@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'Education',
                'specialization' => 'Curriculum Development',
                'contact_number' => '+63917123470',
            ],
            [
                'name' => 'Prof. Melissa Joy Herrera',
                'email' => 'melissa.herrera@sfcg.edu.ph',
                'user_role' => 'instructor',
                'department' => 'General Education',
                'specialization' => 'Mathematics',
                'contact_number' => '+63917123471',
            ],
        ];

        foreach ($educators as $educator) {
            User::create([
                'name' => $educator['name'],
                'email' => $educator['email'],
                'password' => Hash::make('password123'),
                'user_role' => $educator['user_role'],
                'department' => $educator['department'],
                'specialization' => $educator['specialization'],
                'contact_number' => $educator['contact_number'],
            ]);
        }
    }

    private function createSubjectAssignments()
    {
        $this->command->info('📋 Creating subject assignments...');

        $currentPeriod = AcademicPeriod::first();
        if (!$currentPeriod) {
            $this->command->warn('No academic period found. Skipping subject assignments.');
            return;
        }

        // Get all educators
        $educators = User::whereIn('user_role', ['instructor', 'teacher'])->get();
        $subjects = Subject::with('academicLevel')->get();

        foreach ($educators as $educator) {
            $this->assignSubjectsToEducator($educator, $subjects, $currentPeriod);
        }
    }

    private function assignSubjectsToEducator($educator, $subjects, $period)
    {
        // Determine which subjects to assign based on department and specialization
        $assignableSubjects = $subjects->filter(function ($subject) use ($educator) {
            return $this->isSubjectAssignableToEducator($subject, $educator);
        });

        // Assign 2-4 subjects per educator
        $subjectsToAssign = $assignableSubjects->random(min(3, $assignableSubjects->count()));

        foreach ($subjectsToAssign as $subject) {
            $assignment = [
                'instructor_id' => $educator->id,
                'subject_id' => $subject->id,
                'academic_period_id' => $period->id,
                'is_active' => true,
            ];

            // Add level-specific data
            switch ($subject->academicLevel->name) {
                case 'Elementary':
                    $assignment['section'] = 'Grade ' . rand(1, 6) . '-' . chr(65 + rand(0, 2)); // A, B, C
                    break;
                
                case 'Junior High School':
                    $assignment['section'] = 'Grade ' . rand(7, 10) . '-' . chr(65 + rand(0, 3)); // A, B, C, D
                    break;
                
                case 'Senior High School':
                    $assignment['section'] = 'Grade ' . rand(11, 12) . '-' . chr(65 + rand(0, 2));
                    $assignment['year_level'] = rand(11, 12);
                    
                    // Assign strand based on subject
                    $strand = $this->getStrandForSubject($subject);
                    if ($strand) {
                        $assignment['strand_id'] = $strand->id;
                    }
                    break;
                
                case 'College':
                    $assignment['section'] = 'BSCS-' . rand(1, 4) . chr(65 + rand(0, 1)); // 1A, 1B, 2A, etc.
                    $assignment['year_level'] = rand(1, 4);
                    $assignment['semester'] = rand(1, 2);
                    
                    // Assign college course
                    $course = CollegeCourse::inRandomOrder()->first();
                    if ($course) {
                        $assignment['college_course_id'] = $course->id;
                    }
                    break;
            }

            InstructorSubjectAssignment::create($assignment);
        }
    }

    private function isSubjectAssignableToEducator($subject, $educator)
    {
        $level = $subject->academicLevel->name;
        $department = $educator->department;
        $specialization = $educator->specialization;

        // Elementary
        if ($level === 'Elementary' && $department === 'Elementary Education') {
            return true;
        }

        // Junior High School
        if ($level === 'Junior High School' && $department === 'Secondary Education') {
            return true;
        }

        // Senior High School
        if ($level === 'Senior High School' && $department === 'Senior High School') {
            return true;
        }

        // College
        if ($level === 'College') {
            if (str_contains($subject->name, 'Programming') || str_contains($subject->name, 'Software') || str_contains($subject->name, 'Database')) {
                return $department === 'Computer Science' || $department === 'Information Technology';
            }
            
            if (str_contains($subject->name, 'Web Development')) {
                return $department === 'Information Technology';
            }
            
            if (str_contains($subject->name, 'Management') || str_contains($subject->name, 'Business')) {
                return $department === 'Business Administration';
            }
            
            if (str_contains($subject->name, 'Education') || str_contains($subject->name, 'Development') || str_contains($subject->name, 'Assessment')) {
                return $department === 'Education';
            }
            
            if (str_contains($subject->name, 'Mathematics') || str_contains($subject->name, 'Ethics') || str_contains($subject->name, 'History')) {
                return $department === 'General Education';
            }
        }

        return false;
    }

    private function getStrandForSubject($subject)
    {
        $subjectName = strtolower($subject->name);
        
        if (str_contains($subjectName, 'calculus') || str_contains($subjectName, 'chemistry') || 
            str_contains($subjectName, 'physics') || str_contains($subjectName, 'biology')) {
            return AcademicStrand::where('code', 'STEM')->first();
        }
        
        if (str_contains($subjectName, 'accountancy') || str_contains($subjectName, 'business') || 
            str_contains($subjectName, 'organization')) {
            return AcademicStrand::where('code', 'ABM')->first();
        }
        
        if (str_contains($subjectName, 'creative') || str_contains($subjectName, 'politics') || 
            str_contains($subjectName, 'religion')) {
            return AcademicStrand::where('code', 'HUMSS')->first();
        }
        
        return AcademicStrand::where('code', 'GAS')->first();
    }
}
