<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $academicLevels = AcademicLevel::all()->keyBy('key');

        $templates = [
            // Elementary Templates
            [
                'academic_level_id' => $academicLevels['elementary']->id,
                'key' => 'elementary_honor_certificate',
                'name' => 'Elementary Honor Certificate',
                'content_html' => $this->getElementaryHtmlTemplate(),
                'is_active' => true,
            ],

            // Junior High School Templates
            [
                'academic_level_id' => $academicLevels['junior_highschool']->id,
                'key' => 'junior_high_honor_certificate',
                'name' => 'Junior High School Honor Certificate',
                'content_html' => $this->getJuniorHighHtmlTemplate(),
                'is_active' => true,
            ],

            // Senior High School Templates
            [
                'academic_level_id' => $academicLevels['senior_highschool']->id,
                'key' => 'senior_high_honor_certificate',
                'name' => 'Senior High School Honor Certificate',
                'content_html' => $this->getSeniorHighHtmlTemplate(),
                'is_active' => true,
            ],

            // College Templates
            [
                'academic_level_id' => $academicLevels['college']->id,
                'key' => 'college_honor_certificate',
                'name' => 'College Honor Certificate',
                'content_html' => $this->getCollegeHtmlTemplate(),
                'is_active' => true,
            ],
            [
                'academic_level_id' => $academicLevels['college']->id,
                'key' => 'college_deans_list_certificate',
                'name' => 'College Dean\'s List Certificate',
                'content_html' => $this->getCollegeDeansListHtmlTemplate(),
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            CertificateTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }

    private function getElementaryHtmlTemplate(): string
    {
        return '
        <div style="text-align: center; padding: 50px; border: 3px solid #007bff; background: #f8f9fa;">
            <div style="border: 2px solid #0056b3; padding: 40px; background: white;">
                <h1 style="color: #007bff; font-size: 36px; margin-bottom: 10px;">CERTIFICATE OF RECOGNITION</h1>
                <h2 style="color: #495057; font-size: 24px; margin-bottom: 30px;">ELEMENTARY HONOR</h2>

                <p style="font-size: 18px; margin-bottom: 30px;">This is to certify that</p>

                <h2 style="color: #007bff; font-size: 32px; margin: 20px 0; text-decoration: underline;">{{student_name}}</h2>

                <p style="font-size: 18px; margin-bottom: 15px;">Student Number: <strong>{{student_number}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">has achieved <strong>{{honor_type}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">in recognition of outstanding academic performance</p>
                <p style="font-size: 18px; margin-bottom: 30px;">for School Year <strong>{{school_year}}</strong></p>

                <div style="margin-top: 50px;">
                    <p style="font-size: 16px;">Given this <strong>{{date_now}}</strong></p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Principal</strong>
                        </div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Registrar</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getJuniorHighHtmlTemplate(): string
    {
        return '
        <div style="text-align: center; padding: 50px; border: 3px solid #28a745; background: #f8f9fa;">
            <div style="border: 2px solid #155724; padding: 40px; background: white;">
                <h1 style="color: #28a745; font-size: 36px; margin-bottom: 10px;">CERTIFICATE OF RECOGNITION</h1>
                <h2 style="color: #495057; font-size: 24px; margin-bottom: 30px;">JUNIOR HIGH SCHOOL HONOR</h2>

                <p style="font-size: 18px; margin-bottom: 30px;">This is to certify that</p>

                <h2 style="color: #28a745; font-size: 32px; margin: 20px 0; text-decoration: underline;">{{student_name}}</h2>

                <p style="font-size: 18px; margin-bottom: 15px;">Student Number: <strong>{{student_number}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">has achieved <strong>{{honor_type}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">in recognition of outstanding academic performance</p>
                <p style="font-size: 18px; margin-bottom: 30px;">for School Year <strong>{{school_year}}</strong></p>

                <div style="margin-top: 50px;">
                    <p style="font-size: 16px;">Given this <strong>{{date_now}}</strong></p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Principal</strong>
                        </div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Registrar</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getSeniorHighHtmlTemplate(): string
    {
        return '
        <div style="text-align: center; padding: 50px; border: 3px solid #fd7e14; background: #f8f9fa;">
            <div style="border: 2px solid #dc6900; padding: 40px; background: white;">
                <h1 style="color: #fd7e14; font-size: 36px; margin-bottom: 10px;">CERTIFICATE OF RECOGNITION</h1>
                <h2 style="color: #495057; font-size: 24px; margin-bottom: 30px;">SENIOR HIGH SCHOOL HONOR</h2>

                <p style="font-size: 18px; margin-bottom: 30px;">This is to certify that</p>

                <h2 style="color: #fd7e14; font-size: 32px; margin: 20px 0; text-decoration: underline;">{{student_name}}</h2>

                <p style="font-size: 18px; margin-bottom: 15px;">Student Number: <strong>{{student_number}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">has achieved <strong>{{honor_type}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">in recognition of outstanding academic performance</p>
                <p style="font-size: 18px; margin-bottom: 30px;">for School Year <strong>{{school_year}}</strong></p>

                <div style="margin-top: 50px;">
                    <p style="font-size: 16px;">Given this <strong>{{date_now}}</strong></p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Principal</strong>
                        </div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Registrar</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getCollegeHtmlTemplate(): string
    {
        return '
        <div style="text-align: center; padding: 50px; border: 3px solid #6f42c1; background: #f8f9fa;">
            <div style="border: 2px solid #4c2c92; padding: 40px; background: white;">
                <h1 style="color: #6f42c1; font-size: 36px; margin-bottom: 10px;">CERTIFICATE OF RECOGNITION</h1>
                <h2 style="color: #495057; font-size: 24px; margin-bottom: 30px;">COLLEGE HONOR</h2>

                <p style="font-size: 18px; margin-bottom: 30px;">This is to certify that</p>

                <h2 style="color: #6f42c1; font-size: 32px; margin: 20px 0; text-decoration: underline;">{{student_name}}</h2>

                <p style="font-size: 18px; margin-bottom: 15px;">Student Number: <strong>{{student_number}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">has achieved <strong>{{honor_type}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">in recognition of outstanding academic performance</p>
                <p style="font-size: 18px; margin-bottom: 30px;">for School Year <strong>{{school_year}}</strong></p>

                <div style="margin-top: 50px;">
                    <p style="font-size: 16px;">Given this <strong>{{date_now}}</strong></p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Dean</strong>
                        </div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Registrar</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getCollegeDeansListHtmlTemplate(): string
    {
        return '
        <div style="text-align: center; padding: 50px; border: 3px solid #dc3545; background: #f8f9fa;">
            <div style="border: 2px solid #a71e2a; padding: 40px; background: white;">
                <h1 style="color: #dc3545; font-size: 36px; margin-bottom: 10px;">CERTIFICATE OF RECOGNITION</h1>
                <h2 style="color: #495057; font-size: 24px; margin-bottom: 30px;">DEAN\'S LIST</h2>

                <p style="font-size: 18px; margin-bottom: 30px;">This is to certify that</p>

                <h2 style="color: #dc3545; font-size: 32px; margin: 20px 0; text-decoration: underline;">{{student_name}}</h2>

                <p style="font-size: 18px; margin-bottom: 15px;">Student Number: <strong>{{student_number}}</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">has been included in the <strong>Dean\'s List</strong></p>
                <p style="font-size: 18px; margin-bottom: 30px;">in recognition of exceptional academic achievement</p>
                <p style="font-size: 18px; margin-bottom: 30px;">for School Year <strong>{{school_year}}</strong></p>

                <div style="margin-top: 50px;">
                    <p style="font-size: 16px;">Given this <strong>{{date_now}}</strong></p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Dean</strong>
                        </div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 2px solid #000; margin-top: 40px; padding-top: 5px;">
                            <strong>Registrar</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
    }
}