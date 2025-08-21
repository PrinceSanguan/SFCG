<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Elementary (3)
            ['key' => 'elementary_recognition', 'name' => 'Elementary Recognition', 'level_key' => 'elementary'],
            ['key' => 'elementary_completion', 'name' => 'Elementary Completion', 'level_key' => 'elementary'],
            ['key' => 'elementary_perfect_attendance', 'name' => 'Elementary Perfect Attendance', 'level_key' => 'elementary'],
            // Junior High School (3)
            ['key' => 'jhs_recognition', 'name' => 'JHS Recognition', 'level_key' => 'junior_highschool'],
            ['key' => 'jhs_completion', 'name' => 'JHS Completion', 'level_key' => 'junior_highschool'],
            ['key' => 'jhs_perfect_attendance', 'name' => 'JHS Perfect Attendance', 'level_key' => 'junior_highschool'],
            // Senior High School (3)
            ['key' => 'shs_recognition', 'name' => 'SHS Recognition', 'level_key' => 'senior_highschool'],
            ['key' => 'shs_completion', 'name' => 'SHS Completion', 'level_key' => 'senior_highschool'],
            ['key' => 'shs_perfect_attendance', 'name' => 'SHS Perfect Attendance', 'level_key' => 'senior_highschool'],
            // College (3)
            ['key' => 'college_recognition', 'name' => 'College Recognition', 'level_key' => 'college'],
            ['key' => 'college_deans_list', 'name' => "Dean's List", 'level_key' => 'college'],
            ['key' => 'college_completion', 'name' => 'College Completion', 'level_key' => 'college'],
        ];

        $baseHtml = <<<HTML
<div style="text-align:center; padding:24px; border:4px double #333;">
    <h1 style="margin:0; font-size:28px;">Certificate</h1>
    <p style="margin:8px 0 0 0;">This is to certify that</p>
    <h2 style="margin:8px 0;">{{student_name}}</h2>
    <p style="margin:0;">Student ID: <strong>{{student_number}}</strong></p>
    <p style="margin:8px 0 0 0;">has fulfilled the requirements for</p>
    <h3 style="margin:8px 0;">{{academic_level}}</h3>
    <p style="margin:0;">School Year: <strong>{{school_year}}</strong></p>
    <div style="margin-top:24px;">Issued on {{date_now}}</div>
    <div style="margin-top:32px;">_________________________<br/>Authorized Signatory</div>
    <div style="margin-top:8px; font-size:10px;">Serial: will appear in PDF filename</div>
</div>
HTML;

        foreach ($defaults as $item) {
            $level = AcademicLevel::where('key', $item['level_key'])->first();
            if (!$level) {
                continue;
            }

            CertificateTemplate::updateOrCreate(
                ['key' => $item['key']],
                [
                    'academic_level_id' => $level->id,
                    'name' => $item['name'],
                    'content_html' => $baseHtml,
                    'is_active' => true,
                ]
            );
        }
    }
}




