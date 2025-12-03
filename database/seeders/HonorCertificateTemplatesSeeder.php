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

        // Get templates for different academic levels
        $collegeTemplate = $this->getCollegeTemplate();
        $basicEducationTemplate = $this->getBasicEducationTemplate();

        // Template configurations
        $templates = [
            // Elementary
            ['key' => 'elementary_honor_certificate', 'name' => 'Elementary With Honors Certificate', 'level' => $elementary],
            ['key' => 'elementary_high_honor_certificate', 'name' => 'Elementary With High Honors Certificate', 'level' => $elementary],
            ['key' => 'elementary_highest_honor_certificate', 'name' => 'Elementary With Highest Honors Certificate', 'level' => $elementary],
            
            // Junior High School
            ['key' => 'junior_high_honor_certificate', 'name' => 'Junior High School With Honors Certificate', 'level' => $juniorHigh],
            ['key' => 'junior_high_high_honor_certificate', 'name' => 'Junior High School With High Honors Certificate', 'level' => $juniorHigh],
            ['key' => 'junior_high_highest_honor_certificate', 'name' => 'Junior High School With Highest Honors Certificate', 'level' => $juniorHigh],
            
            // Senior High School
            ['key' => 'senior_high_honor_certificate', 'name' => 'Senior High School With Honors Certificate', 'level' => $seniorHigh],
            ['key' => 'senior_high_high_honor_certificate', 'name' => 'Senior High School With High Honors Certificate', 'level' => $seniorHigh],
            ['key' => 'senior_high_highest_honor_certificate', 'name' => 'Senior High School With Highest Honors Certificate', 'level' => $seniorHigh],
            
            // College
            ['key' => 'college_deans_list_certificate', 'name' => 'College Dean\'s List Certificate', 'level' => $college],
            ['key' => 'college_honors_certificate', 'name' => 'College Honors Certificate', 'level' => $college],
            ['key' => 'college_cum_laude_certificate', 'name' => 'College Cum Laude Certificate', 'level' => $college],
            ['key' => 'college_magna_cum_laude_certificate', 'name' => 'College Magna Cum Laude Certificate', 'level' => $college],
            ['key' => 'college_summa_cum_laude_certificate', 'name' => 'College Summa Cum Laude Certificate', 'level' => $college],
        ];

        $created = 0;
        $updated = 0;

        foreach ($templates as $templateData) {
            // Determine which template to use based on academic level
            $contentHtml = ($templateData['level']->key === 'college')
                ? $collegeTemplate
                : $basicEducationTemplate;

            $template = CertificateTemplate::updateOrCreate(
                ['key' => $templateData['key']],
                [
                    'academic_level_id' => $templateData['level']->id,
                    'name' => $templateData['name'],
                    'content_html' => $contentHtml,
                    'is_active' => true,
                    'created_by' => 1, // Admin user
                ]
            );
            
            if ($template->wasRecentlyCreated) {
                $this->command->info("✅ Created: {$template->name} ({$template->key})");
                $created++;
            } else {
                $this->command->info("🔄 Updated: {$template->name} ({$template->key})");
                $updated++;
            }
        }

        $this->command->info("📊 Template Creation Summary:");
        $this->command->info("Created: {$created}");
        $this->command->info("Updated: {$updated}");
        $this->command->info("Total Templates: " . CertificateTemplate::count());
        $this->command->info("✅ Honor-specific certificate templates created successfully!");
    }

    /**
     * Get college certificate template with Program Chair, College Dean, and School Director signatures
     */
    private function getCollegeTemplate(): string
    {
        return <<<'HTML'
<div style="text-align: center; padding: 40px; border: 8px double #2c5aa0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="border: 2px solid #2c5aa0; padding: 30px; background: white;">
        <h1 style="color: #2c5aa0; font-size: 36px; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 2px;">Certificate of Achievement</h1>
        <div style="border-top: 2px solid #2c5aa0; border-bottom: 2px solid #2c5aa0; padding: 20px 0; margin: 20px 0;">
            <h2 style="color: #1a365d; font-size: 28px; margin: 0; font-weight: bold;">{{student_name}}</h2>
            <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Student ID: {{student_number}}</p>
        </div>
        <p style="font-size: 18px; color: #2d3748; margin: 20px 0;">is hereby recognized for achieving</p>
        <h3 style="color: #2c5aa0; font-size: 24px; margin: 20px 0; text-transform: uppercase; font-weight: bold;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #4a5568; margin: 15px 0;">{{honor_description}}</p>
        <div style="margin: 30px 0; padding: 20px; background: #f7fafc; border-left: 4px solid #2c5aa0;">
            <p style="margin: 5px 0; font-size: 16px;"><strong>Academic Level:</strong> {{academic_level}}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>School Year:</strong> {{school_year}}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>GPA:</strong> {{gpa}}</p>
        </div>
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0;">Given this {{date_issued}}</p>

        <!-- Three-column signature block for College -->
        <div style="margin-top: 60px; display: table; width: 100%; table-layout: fixed;">
            <div style="display: table-row;">
                <!-- Program Chair (Left) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{program_chair_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{program_chair_title}}</p>
                </div>
                <!-- College Dean (Center) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{college_dean_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{college_dean_title}}</p>
                </div>
                <!-- School Director (Right) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{school_director_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{school_director_title}}</p>
                </div>
            </div>
        </div>

        <div style="margin-top: 20px; font-size: 10px; color: #718096;">Certificate Serial: {{serial_number}}</div>
    </div>
</div>
HTML;
    }

    /**
     * Get basic education certificate template with Adviser, Principal, and School Director signatures
     */
    private function getBasicEducationTemplate(): string
    {
        return <<<'HTML'
<div style="text-align: center; padding: 40px; border: 8px double #2c5aa0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
    <div style="border: 2px solid #2c5aa0; padding: 30px; background: white;">
        <h1 style="color: #2c5aa0; font-size: 36px; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 2px;">Certificate of Achievement</h1>
        <div style="border-top: 2px solid #2c5aa0; border-bottom: 2px solid #2c5aa0; padding: 20px 0; margin: 20px 0;">
            <h2 style="color: #1a365d; font-size: 28px; margin: 0; font-weight: bold;">{{student_name}}</h2>
            <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Student ID: {{student_number}}</p>
        </div>
        <p style="font-size: 18px; color: #2d3748; margin: 20px 0;">is hereby recognized for achieving</p>
        <h3 style="color: #2c5aa0; font-size: 24px; margin: 20px 0; text-transform: uppercase; font-weight: bold;">{{honor_type}}</h3>
        <p style="font-size: 16px; color: #4a5568; margin: 15px 0;">{{honor_description}}</p>
        <div style="margin: 30px 0; padding: 20px; background: #f7fafc; border-left: 4px solid #2c5aa0;">
            <p style="margin: 5px 0; font-size: 16px;"><strong>Academic Level:</strong> {{academic_level}}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>School Year:</strong> {{school_year}}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Average Grade:</strong> {{average_grade}}</p>
        </div>
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0;">Given this {{date_issued}}</p>

        <!-- Three-column signature block for Basic Education -->
        <div style="margin-top: 60px; display: table; width: 100%; table-layout: fixed;">
            <div style="display: table-row;">
                <!-- Adviser (Left) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{adviser_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{adviser_title}}</p>
                </div>
                <!-- Principal (Center) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{principal_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{principal_title}}</p>
                </div>
                <!-- School Director (Right) -->
                <div style="display: table-cell; width: 33.33%; text-align: center; padding: 0 10px; vertical-align: top;">
                    <div style="border-top: 2px solid #2c5aa0; margin: 0 auto 8px auto; max-width: 180px;"></div>
                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #2d3748; line-height: 1.3;">{{school_director_name}}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #4a5568; font-style: italic;">{{school_director_title}}</p>
                </div>
            </div>
        </div>

        <div style="margin-top: 20px; font-size: 10px; color: #718096;">Certificate Serial: {{serial_number}}</div>
    </div>
</div>
HTML;
    }
}