<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            AcademicManagementSeeder::class,
            ParentStudentSeeder::class,
            StrandCourseDepartmentSeeder::class,
            UpdateDepartmentsAcademicLevelSeeder::class,
            HonorTypesSeeder::class,
            HonorCriteriaSeeder::class,
            HonorDemoSeeder::class,
            HonorSampleDataSeeder::class,
            CertificateTemplatesSeeder::class,
            HonorCertificateTemplatesSeeder::class,
            SampleGradesSeeder::class,
            InstructorAssignmentSeeder::class,
            StudentEnrollmentSeeder::class,
            TeacherAssignmentSeeder::class,
        ]);
    }
}
