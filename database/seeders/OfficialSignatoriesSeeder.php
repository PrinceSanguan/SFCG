<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class OfficialSignatoriesSeeder extends Seeder
{
    /**
     * Seed system settings for certificate signatories.
     * These can be updated by admins through the system settings UI.
     */
    public function run(): void
    {
        $this->command->info('Seeding Official Signatories...');

        // College Officials
        SystemSetting::set(
            'college_dean_name',
            'BRO. JUANITO O. LEBOSADA, JR., OFM, EdD.',
            'College Dean full name for certificate signatures'
        );

        SystemSetting::set(
            'college_dean_title',
            'College Dean',
            'College Dean title for certificate signatures'
        );

        // School Director (applies to all levels)
        SystemSetting::set(
            'school_director_name',
            'FR. JUNHI J. ALCASODA, OFM',
            'School Director full name for certificate signatures'
        );

        SystemSetting::set(
            'school_director_title',
            'School Director',
            'School Director title for certificate signatures'
        );

        // Elementary Principal
        SystemSetting::set(
            'elementary_principal_name',
            '[Elementary Principal Name]',
            'Elementary Principal full name for certificate signatures'
        );

        SystemSetting::set(
            'elementary_principal_title',
            'Elementary Principal',
            'Elementary Principal title for certificate signatures'
        );

        // Junior High School Principal
        SystemSetting::set(
            'jhs_principal_name',
            '[JHS Principal Name]',
            'Junior High School Principal full name for certificate signatures'
        );

        SystemSetting::set(
            'jhs_principal_title',
            'Junior High School Principal',
            'Junior High School Principal title for certificate signatures'
        );

        // Senior High School Principal
        SystemSetting::set(
            'shs_principal_name',
            '[SHS Principal Name]',
            'Senior High School Principal full name for certificate signatures'
        );

        SystemSetting::set(
            'shs_principal_title',
            'Senior High School Principal',
            'Senior High School Principal title for certificate signatures'
        );

        $this->command->info('✅ Official signatories settings created successfully!');
        $this->command->info('');
        $this->command->info('📝 Note: Update these values through the admin system settings UI as needed.');
    }
}
