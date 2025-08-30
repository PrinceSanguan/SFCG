<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class HonorCertificateTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Honor Certificate Templates...');

        // Get academic levels
        $elementary = AcademicLevel::where('key', 'elementary')->first();
        $juniorHigh = AcademicLevel::where('key', 'junior_highschool')->first();
        $seniorHigh = AcademicLevel::where('key', 'senior_highschool')->first();
        $college = AcademicLevel::where('key', 'college')->first();

        if (!$elementary || !$juniorHigh || !$seniorHigh || !$college) {
            $this->command->error('Required academic levels not found. Please run AcademicLevelSeeder first.');
            return;
        }

        // Create Elementary Certificate Template
        $this->createElementaryTemplate($elementary);

        // Create Junior High School Certificate Template
        $this->createJuniorHighTemplate($juniorHigh);

        // Create Senior High School Certificate Template
        $this->createSeniorHighTemplate($seniorHigh);

        // Create College Certificate Template
        $this->createCollegeTemplate($college);

        $this->command->info('Honor Certificate Templates seeded successfully!');
    }

    private function createElementaryTemplate(AcademicLevel $level): void
    {
        $html = <<<HTML
<div style="text-align: center; padding: 40px; border: 8px double #2c5aa0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="School Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #2c5aa0; margin: 0; font-size: 36px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Certificate of Recognition</h1>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.8;">
        <p style="font-size: 18px; color: #495057; margin: 0;">This is to certify that</p>
        <h2 style="color: #2c5aa0; margin: 20px 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{student_name}}</h2>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Student ID: <strong>{{student_number}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Grade Level: <strong>{{grade_level}}</strong></p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background: rgba(44, 90, 160, 0.1); border-radius: 10px;">
        <p style="font-size: 18px; color: #495057; margin: 0;">has achieved</p>
        <h3 style="color: #2c5aa0; margin: 15px 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">for the School Year <strong>{{school_year}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">with an average grade of <strong>{{average_grade}}</strong></p>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.6;">
        <p style="font-size: 16px; color: #495057; margin: 0;">This certificate is awarded in recognition of</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">outstanding academic performance and dedication to learning.</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Issued on {{date_issued}}</p>
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Certificate Serial: <strong>{{serial_number}}</strong></p>
    </div>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #2c5aa0; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">Class Adviser</p>
        </div>
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #2c5aa0; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">School Principal</p>
        </div>
    </div>
</div>
HTML;

        CertificateTemplate::updateOrCreate(
            ['key' => 'elementary_honor_certificate'],
            [
                'academic_level_id' => $level->id,
                'name' => 'Elementary Honor Certificate',
                'content_html' => $html,
                'is_active' => true,
            ]
        );
    }

    private function createJuniorHighTemplate(AcademicLevel $level): void
    {
        $html = <<<HTML
<div style="text-align: center; padding: 40px; border: 8px double #6f42c1; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="School Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #6f42c1; margin: 0; font-size: 36px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Certificate of Academic Excellence</h1>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.8;">
        <p style="font-size: 18px; color: #495057; margin: 0;">This is to certify that</p>
        <h2 style="color: #6f42c1; margin: 20px 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{student_name}}</h2>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Student ID: <strong>{{student_number}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Grade Level: <strong>{{grade_level}}</strong></p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background: rgba(111, 66, 193, 0.1); border-radius: 10px;">
        <p style="font-size: 18px; color: #495057; margin: 0;">has achieved</p>
        <h3 style="color: #6f42c1; margin: 15px 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">for the School Year <strong>{{school_year}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">with an average grade of <strong>{{average_grade}}</strong></p>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.6;">
        <p style="font-size: 16px; color: #495057; margin: 0;">This certificate is awarded in recognition of</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">exceptional academic achievement and commitment to excellence.</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Issued on {{date_issued}}</p>
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Certificate Serial: <strong>{{serial_number}}</strong></p>
    </div>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #6f42c1; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">Class Adviser</p>
        </div>
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #6f42c1; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">School Principal</p>
        </div>
    </div>
</div>
HTML;

        CertificateTemplate::updateOrCreate(
            ['key' => 'junior_high_honor_certificate'],
            [
                'academic_level_id' => $level->id,
                'name' => 'Junior High School Honor Certificate',
                'content_html' => $html,
                'is_active' => true,
            ]
        );
    }

    private function createSeniorHighTemplate(AcademicLevel $level): void
    {
        $html = <<<HTML
<div style="text-align: center; padding: 40px; border: 8px double #dc3545; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="School Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #dc3545; margin: 0; font-size: 36px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Certificate of Academic Distinction</h1>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.8;">
        <p style="font-size: 18px; color: #495057; margin: 0;">This is to certify that</p>
        <h2 style="color: #dc3545; margin: 20px 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{student_name}}</h2>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Student ID: <strong>{{student_number}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Grade Level: <strong>{{grade_level}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Strand: <strong>{{strand_name}}</strong></p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background: rgba(220, 53, 69, 0.1); border-radius: 10px;">
        <p style="font-size: 18px; color: #495057; margin: 0;">has achieved</p>
        <h3 style="color: #dc3545; margin: 15px 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">for the School Year <strong>{{school_year}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">with an average grade of <strong>{{average_grade}}</strong></p>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.6;">
        <p style="font-size: 16px; color: #495057; margin: 0;">This certificate is awarded in recognition of</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">outstanding academic performance and dedication to excellence</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">in the <strong>{{strand_name}}</strong> strand.</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Issued on {{date_issued}}</p>
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Certificate Serial: <strong>{{serial_number}}</strong></p>
    </div>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #dc3545; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">Strand Coordinator</p>
        </div>
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #dc3545; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">School Principal</p>
        </div>
    </div>
</div>
HTML;

        CertificateTemplate::updateOrCreate(
            ['key' => 'senior_high_honor_certificate'],
            [
                'academic_level_id' => $level->id,
                'name' => 'Senior High School Honor Certificate',
                'content_html' => $html,
                'is_active' => true,
            ]
        );
    }

    private function createCollegeTemplate(AcademicLevel $level): void
    {
        $html = <<<HTML
<div style="text-align: center; padding: 40px; border: 8px double #28a745; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 30px;">
        <img src="{{logo_url}}" alt="School Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: #28a745; margin: 0; font-size: 36px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Certificate of Academic Achievement</h1>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.8;">
        <p style="font-size: 18px; color: #495057; margin: 0;">This is to certify that</p>
        <h2 style="color: #28a745; margin: 20px 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{student_name}}</h2>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Student ID: <strong>{{student_number}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Course: <strong>{{course_name}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Department: <strong>{{department_name}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">Year Level: <strong>{{year_level}}</strong></p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background: rgba(40, 167, 69, 0.1); border-radius: 10px;">
        <p style="font-size: 18px; color: #495057; margin: 0;">has achieved</p>
        <h3 style="color: #28a745; margin: 15px 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">for the School Year <strong>{{school_year}}</strong></p>
        <p style="font-size: 16px; color: #6c757d; margin: 0;">with a GPA of <strong>{{gpa}}</strong></p>
    </div>
    
    <div style="margin: 40px 0; line-height: 1.6;">
        <p style="font-size: 16px; color: #495057; margin: 0;">This certificate is awarded in recognition of</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">exceptional academic performance and dedication to excellence</p>
        <p style="font-size: 16px; color: #495057; margin: 0;">in the <strong>{{course_name}}</strong> program.</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Issued on {{date_issued}}</p>
        <p style="font-size: 14px; color: #6c757d; margin: 0;">Certificate Serial: <strong>{{serial_number}}</strong></p>
    </div>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #28a745; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">Department Head</p>
        </div>
        <div style="text-align: center; flex: 1;">
            <div style="border-top: 2px solid #28a745; padding-top: 10px; margin-bottom: 10px; width: 200px; margin-left: auto; margin-right: auto;"></div>
            <p style="margin: 0; font-size: 14px; color: #495057;">Dean</p>
        </div>
    </div>
</div>
HTML;

        CertificateTemplate::updateOrCreate(
            ['key' => 'college_honor_certificate'],
            [
                'academic_level_id' => $level->id,
                'name' => 'College Honor Certificate',
                'content_html' => $html,
                'is_active' => true,
            ]
        );
    }
}

