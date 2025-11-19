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
        <div style="width: 800px; min-height: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdebd0 100%); border: 8px double #8B4513; box-shadow: 0 0 20px rgba(139, 69, 19, 0.3); font-family: Georgia, serif; position: relative;">
            <!-- Decorative corners -->
            <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>

            <div style="text-align: center; padding: 30px;">
                <!-- School Logo -->
                <div style="margin-bottom: 15px;">
                    <img src="/image/logo.jpg" alt="Saint Francis College" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #8B4513; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>

                <!-- School Name -->
                <h3 style="color: #8B4513; font-size: 18px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Saint Francis College</h3>
                <p style="color: #A0522D; font-size: 11px; margin: 5px 0 20px 0; font-style: italic;">Deus Meus et Omnia</p>

                <!-- Certificate Title -->
                <h1 style="color: #8B4513; font-size: 42px; margin: 0 0 5px 0; font-family: Times New Roman, serif; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);">CERTIFICATE</h1>
                <h2 style="color: #A0522D; font-size: 18px; margin: 0 0 25px 0; letter-spacing: 8px; text-transform: uppercase;">OF RECOGNITION</h2>

                <div style="width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #8B4513, transparent); margin: 0 auto 25px auto;"></div>

                <p style="font-size: 14px; color: #5D4037; margin-bottom: 15px; font-style: italic;">This is to certify that</p>

                <h2 style="color: #8B4513; font-size: 32px; margin: 15px 0; font-family: Brush Script MT, cursive; border-bottom: 2px solid #D4A574; display: inline-block; padding: 0 30px 5px 30px;">{{student_name}}</h2>

                <p style="font-size: 13px; color: #5D4037; margin: 15px 0;">Student Number: <strong style="color: #8B4513;">{{student_number}}</strong></p>

                <p style="font-size: 15px; color: #5D4037; margin: 20px 0;">has achieved the distinction of</p>

                <h3 style="color: #8B4513; font-size: 24px; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px;">{{honor_type}}</h3>

                <p style="font-size: 14px; color: #5D4037; margin: 20px 0;">in recognition of outstanding academic performance<br>for School Year <strong style="color: #8B4513;">{{school_year}}</strong></p>

                <p style="font-size: 12px; color: #795548; margin: 25px 0 30px 0; font-style: italic;">Given this {{date_now}}</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px; padding: 0 40px;">
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">School Principal</strong>
                    </div>
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">Registrar</strong>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getJuniorHighHtmlTemplate(): string
    {
        return '
        <div style="width: 800px; min-height: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdebd0 100%); border: 8px double #8B4513; box-shadow: 0 0 20px rgba(139, 69, 19, 0.3); font-family: Georgia, serif; position: relative;">
            <!-- Decorative corners -->
            <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>

            <div style="text-align: center; padding: 30px;">
                <!-- School Logo -->
                <div style="margin-bottom: 15px;">
                    <img src="/image/logo.jpg" alt="Saint Francis College" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #8B4513; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>

                <!-- School Name -->
                <h3 style="color: #8B4513; font-size: 18px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Saint Francis College</h3>
                <p style="color: #A0522D; font-size: 11px; margin: 5px 0 20px 0; font-style: italic;">Deus Meus et Omnia</p>

                <!-- Certificate Title -->
                <h1 style="color: #8B4513; font-size: 42px; margin: 0 0 5px 0; font-family: Times New Roman, serif; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);">CERTIFICATE</h1>
                <h2 style="color: #A0522D; font-size: 18px; margin: 0 0 25px 0; letter-spacing: 8px; text-transform: uppercase;">OF RECOGNITION</h2>

                <div style="width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #8B4513, transparent); margin: 0 auto 25px auto;"></div>

                <p style="font-size: 14px; color: #5D4037; margin-bottom: 15px; font-style: italic;">This is to certify that</p>

                <h2 style="color: #8B4513; font-size: 32px; margin: 15px 0; font-family: Brush Script MT, cursive; border-bottom: 2px solid #D4A574; display: inline-block; padding: 0 30px 5px 30px;">{{student_name}}</h2>

                <p style="font-size: 13px; color: #5D4037; margin: 15px 0;">Student Number: <strong style="color: #8B4513;">{{student_number}}</strong></p>

                <p style="font-size: 15px; color: #5D4037; margin: 20px 0;">has achieved the distinction of</p>

                <h3 style="color: #8B4513; font-size: 24px; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px;">{{honor_type}}</h3>

                <p style="font-size: 14px; color: #5D4037; margin: 20px 0;">in recognition of outstanding academic performance<br>for School Year <strong style="color: #8B4513;">{{school_year}}</strong></p>

                <p style="font-size: 12px; color: #795548; margin: 25px 0 30px 0; font-style: italic;">Given this {{date_now}}</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px; padding: 0 40px;">
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">School Principal</strong>
                    </div>
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">Registrar</strong>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getSeniorHighHtmlTemplate(): string
    {
        return '
        <div style="width: 800px; min-height: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdebd0 100%); border: 8px double #8B4513; box-shadow: 0 0 20px rgba(139, 69, 19, 0.3); font-family: Georgia, serif; position: relative;">
            <!-- Decorative corners -->
            <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>

            <div style="text-align: center; padding: 30px;">
                <!-- School Logo -->
                <div style="margin-bottom: 15px;">
                    <img src="/image/logo.jpg" alt="Saint Francis College" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #8B4513; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>

                <!-- School Name -->
                <h3 style="color: #8B4513; font-size: 18px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Saint Francis College</h3>
                <p style="color: #A0522D; font-size: 11px; margin: 5px 0 20px 0; font-style: italic;">Deus Meus et Omnia</p>

                <!-- Certificate Title -->
                <h1 style="color: #8B4513; font-size: 42px; margin: 0 0 5px 0; font-family: Times New Roman, serif; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);">CERTIFICATE</h1>
                <h2 style="color: #A0522D; font-size: 18px; margin: 0 0 25px 0; letter-spacing: 8px; text-transform: uppercase;">OF RECOGNITION</h2>

                <div style="width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #8B4513, transparent); margin: 0 auto 25px auto;"></div>

                <p style="font-size: 14px; color: #5D4037; margin-bottom: 15px; font-style: italic;">This is to certify that</p>

                <h2 style="color: #8B4513; font-size: 32px; margin: 15px 0; font-family: Brush Script MT, cursive; border-bottom: 2px solid #D4A574; display: inline-block; padding: 0 30px 5px 30px;">{{student_name}}</h2>

                <p style="font-size: 13px; color: #5D4037; margin: 15px 0;">Student Number: <strong style="color: #8B4513;">{{student_number}}</strong></p>

                <p style="font-size: 15px; color: #5D4037; margin: 20px 0;">has achieved the distinction of</p>

                <h3 style="color: #8B4513; font-size: 24px; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px;">{{honor_type}}</h3>

                <p style="font-size: 14px; color: #5D4037; margin: 20px 0;">in recognition of outstanding academic performance<br>for School Year <strong style="color: #8B4513;">{{school_year}}</strong></p>

                <p style="font-size: 12px; color: #795548; margin: 25px 0 30px 0; font-style: italic;">Given this {{date_now}}</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px; padding: 0 40px;">
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">School Principal</strong>
                    </div>
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">Registrar</strong>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getCollegeHtmlTemplate(): string
    {
        return '
        <div style="width: 800px; min-height: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdebd0 100%); border: 8px double #8B4513; box-shadow: 0 0 20px rgba(139, 69, 19, 0.3); font-family: Georgia, serif; position: relative;">
            <!-- Decorative corners -->
            <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>

            <div style="text-align: center; padding: 30px;">
                <!-- School Logo -->
                <div style="margin-bottom: 15px;">
                    <img src="/image/logo.jpg" alt="Saint Francis College" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #8B4513; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>

                <!-- School Name -->
                <h3 style="color: #8B4513; font-size: 18px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Saint Francis College</h3>
                <p style="color: #A0522D; font-size: 11px; margin: 5px 0 20px 0; font-style: italic;">Deus Meus et Omnia</p>

                <!-- Certificate Title -->
                <h1 style="color: #8B4513; font-size: 42px; margin: 0 0 5px 0; font-family: Times New Roman, serif; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);">CERTIFICATE</h1>
                <h2 style="color: #A0522D; font-size: 18px; margin: 0 0 25px 0; letter-spacing: 8px; text-transform: uppercase;">OF RECOGNITION</h2>

                <div style="width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #8B4513, transparent); margin: 0 auto 25px auto;"></div>

                <p style="font-size: 14px; color: #5D4037; margin-bottom: 15px; font-style: italic;">This is to certify that</p>

                <h2 style="color: #8B4513; font-size: 32px; margin: 15px 0; font-family: Brush Script MT, cursive; border-bottom: 2px solid #D4A574; display: inline-block; padding: 0 30px 5px 30px;">{{student_name}}</h2>

                <p style="font-size: 13px; color: #5D4037; margin: 15px 0;">Student Number: <strong style="color: #8B4513;">{{student_number}}</strong></p>

                <p style="font-size: 15px; color: #5D4037; margin: 20px 0;">has achieved the distinction of</p>

                <h3 style="color: #8B4513; font-size: 24px; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px;">{{honor_type}}</h3>

                <p style="font-size: 14px; color: #5D4037; margin: 20px 0;">in recognition of outstanding academic performance<br>for School Year <strong style="color: #8B4513;">{{school_year}}</strong></p>

                <p style="font-size: 12px; color: #795548; margin: 25px 0 30px 0; font-style: italic;">Given this {{date_now}}</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px; padding: 0 40px;">
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">College Dean</strong>
                    </div>
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">Registrar</strong>
                    </div>
                </div>
            </div>
        </div>';
    }

    private function getCollegeDeansListHtmlTemplate(): string
    {
        return '
        <div style="width: 800px; min-height: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdebd0 100%); border: 8px double #8B4513; box-shadow: 0 0 20px rgba(139, 69, 19, 0.3); font-family: Georgia, serif; position: relative;">
            <!-- Decorative corners -->
            <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-left: 4px solid #8B4513;"></div>
            <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 4px solid #8B4513; border-right: 4px solid #8B4513;"></div>

            <div style="text-align: center; padding: 30px;">
                <!-- School Logo -->
                <div style="margin-bottom: 15px;">
                    <img src="/image/logo.jpg" alt="Saint Francis College" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #8B4513; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>

                <!-- School Name -->
                <h3 style="color: #8B4513; font-size: 18px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Saint Francis College</h3>
                <p style="color: #A0522D; font-size: 11px; margin: 5px 0 20px 0; font-style: italic;">Deus Meus et Omnia</p>

                <!-- Certificate Title -->
                <h1 style="color: #8B4513; font-size: 42px; margin: 0 0 5px 0; font-family: Times New Roman, serif; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);">CERTIFICATE</h1>
                <h2 style="color: #A0522D; font-size: 18px; margin: 0 0 25px 0; letter-spacing: 8px; text-transform: uppercase;">DEAN\\\'S LIST</h2>

                <div style="width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #8B4513, transparent); margin: 0 auto 25px auto;"></div>

                <p style="font-size: 14px; color: #5D4037; margin-bottom: 15px; font-style: italic;">This is to certify that</p>

                <h2 style="color: #8B4513; font-size: 32px; margin: 15px 0; font-family: Brush Script MT, cursive; border-bottom: 2px solid #D4A574; display: inline-block; padding: 0 30px 5px 30px;">{{student_name}}</h2>

                <p style="font-size: 13px; color: #5D4037; margin: 15px 0;">Student Number: <strong style="color: #8B4513;">{{student_number}}</strong></p>

                <p style="font-size: 15px; color: #5D4037; margin: 20px 0;">has been included in the</p>

                <h3 style="color: #8B4513; font-size: 24px; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px;">Dean\\\'s List</h3>

                <p style="font-size: 14px; color: #5D4037; margin: 20px 0;">in recognition of exceptional academic achievement<br>for School Year <strong style="color: #8B4513;">{{school_year}}</strong></p>

                <p style="font-size: 12px; color: #795548; margin: 25px 0 30px 0; font-style: italic;">Given this {{date_now}}</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px; padding: 0 40px;">
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">College Dean</strong>
                    </div>
                    <div style="text-align: center; width: 180px;">
                        <div style="border-bottom: 2px solid #8B4513; margin-bottom: 8px; height: 40px;"></div>
                        <strong style="color: #8B4513; font-size: 12px;">Registrar</strong>
                    </div>
                </div>
            </div>
        </div>';
    }
}