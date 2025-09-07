<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\AcademicLevel;
use App\Models\Strand;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        // Elementary subjects
        if ($elementary) {
            $elementarySubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH', 'description' => 'Basic mathematics for elementary students'],
                ['name' => 'English', 'code' => 'ENG', 'description' => 'English language and literature'],
                ['name' => 'Science', 'code' => 'SCI', 'description' => 'General science'],
                ['name' => 'Filipino', 'code' => 'FIL', 'description' => 'Filipino language'],
                ['name' => 'Araling Panlipunan', 'code' => 'AP', 'description' => 'Social studies'],
                ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP', 'description' => 'Values education'],
                ['name' => 'Physical Education', 'code' => 'PE', 'description' => 'Physical education and health'],
                ['name' => 'Music, Arts, Physical Education and Health', 'code' => 'MAPEH', 'description' => 'MAPEH subjects'],
            ];

            foreach ($elementarySubjects as $subject) {
                Subject::updateOrCreate(
                    ['code' => $subject['code'] . '_ELEM', 'academic_level_id' => $elementary->id],
                    array_merge($subject, ['code' => $subject['code'] . '_ELEM', 'academic_level_id' => $elementary->id, 'is_active' => true])
                );
            }
        }

        // Junior High School subjects
        if ($juniorHigh) {
            $juniorHighSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH', 'description' => 'Mathematics for junior high'],
                ['name' => 'English', 'code' => 'ENG', 'description' => 'English language and literature'],
                ['name' => 'Science', 'code' => 'SCI', 'description' => 'General science'],
                ['name' => 'Filipino', 'code' => 'FIL', 'description' => 'Filipino language'],
                ['name' => 'Araling Panlipunan', 'code' => 'AP', 'description' => 'Social studies'],
                ['name' => 'Edukasyon sa Pagpapakatao', 'code' => 'ESP', 'description' => 'Values education'],
                ['name' => 'Technology and Livelihood Education', 'code' => 'TLE', 'description' => 'TLE subjects'],
                ['name' => 'Music, Arts, Physical Education and Health', 'code' => 'MAPEH', 'description' => 'MAPEH subjects'],
            ];

            foreach ($juniorHighSubjects as $subject) {
                Subject::updateOrCreate(
                    ['code' => $subject['code'] . '_JHS', 'academic_level_id' => $juniorHigh->id],
                    array_merge($subject, ['code' => $subject['code'] . '_JHS', 'academic_level_id' => $juniorHigh->id, 'is_active' => true])
                );
            }
        }

        // Senior High School subjects (Academic Track)
        if ($seniorHigh) {
            // Get strands for assignment
            $abmStrand = Strand::where('code', 'ABM')->where('academic_level_id', $seniorHigh->id)->first();
            $stemStrand = Strand::where('code', 'STEM')->where('academic_level_id', $seniorHigh->id)->first();
            $humssStrand = Strand::where('code', 'HUMSS')->where('academic_level_id', $seniorHigh->id)->first();
            
            // Core subjects (no strand - available to all)
            $coreSubjects = [
                ['name' => 'Oral Communication', 'code' => 'ORAL_COMM', 'description' => 'Oral communication in context'],
                ['name' => 'Reading and Writing', 'code' => 'READ_WRITE', 'description' => 'Reading and writing skills'],
                ['name' => 'Komunikasyon at Pananaliksik', 'code' => 'KOM_PAN', 'description' => 'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino'],
                ['name' => 'Pagbasa at Pagsusuri', 'code' => 'PAGBASA', 'description' => 'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto'],
                ['name' => '21st Century Literature', 'code' => '21ST_LIT', 'description' => '21st Century Literature from the Philippines and the World'],
                ['name' => 'Contemporary Philippine Arts', 'code' => 'CPA', 'description' => 'Contemporary Philippine Arts from the Regions'],
                ['name' => 'Media and Information Literacy', 'code' => 'MIL', 'description' => 'Media and Information Literacy'],
                ['name' => 'General Mathematics', 'code' => 'GEN_MATH', 'description' => 'General Mathematics'],
                ['name' => 'Statistics and Probability', 'code' => 'STAT_PROB', 'description' => 'Statistics and Probability'],
                ['name' => 'Earth and Life Science', 'code' => 'ELS', 'description' => 'Earth and Life Science'],
                ['name' => 'Physical Science', 'code' => 'PHY_SCI', 'description' => 'Physical Science'],
                ['name' => 'Introduction to Philosophy', 'code' => 'PHILO', 'description' => 'Introduction to Philosophy of the Human Person'],
                ['name' => 'Personal Development', 'code' => 'PERS_DEV', 'description' => 'Personal Development'],
                ['name' => 'Understanding Culture, Society and Politics', 'code' => 'UCSP', 'description' => 'Understanding Culture, Society and Politics'],
                ['name' => 'Physical Education and Health', 'code' => 'PEH', 'description' => 'Physical Education and Health'],
                ['name' => 'Empowerment Technologies', 'code' => 'EMP_TECH', 'description' => 'Empowerment Technologies'],
                ['name' => 'Entrepreneurship', 'code' => 'ENTREP', 'description' => 'Entrepreneurship'],
                ['name' => 'Research in Daily Life', 'code' => 'RESEARCH', 'description' => 'Research in Daily Life'],
            ];

            foreach ($coreSubjects as $subject) {
                Subject::updateOrCreate(
                    ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id],
                    array_merge($subject, ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id, 'strand_id' => null, 'is_active' => true])
                );
            }
            
            // ABM Strand subjects
            if ($abmStrand) {
                $abmSubjects = [
                    ['name' => 'Applied Economics', 'code' => 'APP_ECON', 'description' => 'Applied Economics'],
                    ['name' => 'Business Ethics and Social Responsibility', 'code' => 'BUS_ETHICS', 'description' => 'Business Ethics and Social Responsibility'],
                    ['name' => 'Fundamentals of Accountancy, Business and Management 1', 'code' => 'FABM1', 'description' => 'Fundamentals of Accountancy, Business and Management 1'],
                    ['name' => 'Fundamentals of Accountancy, Business and Management 2', 'code' => 'FABM2', 'description' => 'Fundamentals of Accountancy, Business and Management 2'],
                    ['name' => 'Business Math', 'code' => 'BUS_MATH', 'description' => 'Business Mathematics'],
                    ['name' => 'Business Finance', 'code' => 'BUS_FIN', 'description' => 'Business Finance'],
                    ['name' => 'Organization and Management', 'code' => 'ORG_MGMT', 'description' => 'Organization and Management'],
                    ['name' => 'Principles of Marketing', 'code' => 'PRIN_MARK', 'description' => 'Principles of Marketing'],
                    ['name' => 'Work Immersion/Research/Career Advocacy/Culminating Activity', 'code' => 'WORK_IMM_ABM', 'description' => 'Work Immersion/Research/Career Advocacy/Culminating Activity'],
                ];

                foreach ($abmSubjects as $subject) {
                    Subject::updateOrCreate(
                        ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id],
                        array_merge($subject, ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id, 'strand_id' => $abmStrand->id, 'is_active' => true])
                    );
                }
            }
            
            // STEM Strand subjects
            if ($stemStrand) {
                $stemSubjects = [
                    ['name' => 'Pre-Calculus', 'code' => 'PRE_CALC', 'description' => 'Pre-Calculus'],
                    ['name' => 'Basic Calculus', 'code' => 'BASIC_CALC', 'description' => 'Basic Calculus'],
                    ['name' => 'General Biology 1', 'code' => 'GEN_BIO1', 'description' => 'General Biology 1'],
                    ['name' => 'General Biology 2', 'code' => 'GEN_BIO2', 'description' => 'General Biology 2'],
                    ['name' => 'General Physics 1', 'code' => 'GEN_PHYS1', 'description' => 'General Physics 1'],
                    ['name' => 'General Physics 2', 'code' => 'GEN_PHYS2', 'description' => 'General Physics 2'],
                    ['name' => 'General Chemistry 1', 'code' => 'GEN_CHEM1', 'description' => 'General Chemistry 1'],
                    ['name' => 'General Chemistry 2', 'code' => 'GEN_CHEM2', 'description' => 'General Chemistry 2'],
                    ['name' => 'Work Immersion/Research/Career Advocacy/Culminating Activity', 'code' => 'WORK_IMM_STEM', 'description' => 'Work Immersion/Research/Career Advocacy/Culminating Activity'],
                ];

                foreach ($stemSubjects as $subject) {
                    Subject::updateOrCreate(
                        ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id],
                        array_merge($subject, ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id, 'strand_id' => $stemStrand->id, 'is_active' => true])
                    );
                }
            }
            
            // HUMSS Strand subjects
            if ($humssStrand) {
                $humssSubjects = [
                    ['name' => 'Creative Writing', 'code' => 'CREAT_WRITE', 'description' => 'Creative Writing'],
                    ['name' => 'Creative Non-Fiction', 'code' => 'CREAT_NON', 'description' => 'Creative Non-Fiction'],
                    ['name' => 'World Religions and Belief Systems', 'code' => 'WORLD_REL', 'description' => 'World Religions and Belief Systems'],
                    ['name' => 'Disciplines and Ideas in the Social Sciences', 'code' => 'DISS', 'description' => 'Disciplines and Ideas in the Social Sciences'],
                    ['name' => 'Disciplines and Ideas in Applied Social Sciences', 'code' => 'DIASS', 'description' => 'Disciplines and Ideas in Applied Social Sciences'],
                    ['name' => 'Philippine Politics and Governance', 'code' => 'PHIL_POL', 'description' => 'Philippine Politics and Governance'],
                    ['name' => 'Community Engagement, Solidarity and Citizenship', 'code' => 'CESC', 'description' => 'Community Engagement, Solidarity and Citizenship'],
                    ['name' => 'Trends, Networks, and Critical Thinking in the 21st Century', 'code' => 'TNCT', 'description' => 'Trends, Networks, and Critical Thinking in the 21st Century'],
                    ['name' => 'Work Immersion/Research/Career Advocacy/Culminating Activity', 'code' => 'WORK_IMM_HUMSS', 'description' => 'Work Immersion/Research/Career Advocacy/Culminating Activity'],
                ];

                foreach ($humssSubjects as $subject) {
                    Subject::updateOrCreate(
                        ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id],
                        array_merge($subject, ['code' => $subject['code'] . '_SHS', 'academic_level_id' => $seniorHigh->id, 'strand_id' => $humssStrand->id, 'is_active' => true])
                    );
                }
            }
        }

        // College subjects
        if ($college) {
            $collegeSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH', 'description' => 'College mathematics'],
                ['name' => 'English', 'code' => 'ENG', 'description' => 'College English'],
                ['name' => 'Science', 'code' => 'SCI', 'description' => 'College science'],
                ['name' => 'Filipino', 'code' => 'FIL', 'description' => 'College Filipino'],
                ['name' => 'Physical Education', 'code' => 'PE', 'description' => 'College physical education'],
                ['name' => 'National Service Training Program', 'code' => 'NSTP', 'description' => 'National Service Training Program'],
                ['name' => 'Understanding the Self', 'code' => 'UTS', 'description' => 'Understanding the Self'],
                ['name' => 'Readings in Philippine History', 'code' => 'RPH', 'description' => 'Readings in Philippine History'],
                ['name' => 'The Contemporary World', 'code' => 'TCW', 'description' => 'The Contemporary World'],
                ['name' => 'Science, Technology and Society', 'code' => 'STS', 'description' => 'Science, Technology and Society'],
                ['name' => 'Art Appreciation', 'code' => 'ART_APP', 'description' => 'Art Appreciation'],
                ['name' => 'Ethics', 'code' => 'ETHICS', 'description' => 'Ethics'],
            ];

            foreach ($collegeSubjects as $subject) {
                Subject::updateOrCreate(
                    ['code' => $subject['code'] . '_COL', 'academic_level_id' => $college->id],
                    array_merge($subject, ['code' => $subject['code'] . '_COL', 'academic_level_id' => $college->id, 'is_active' => true])
                );
            }
        }
    }
}