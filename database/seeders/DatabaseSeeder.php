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
            BasicStructureSeeder::class,
            CollegeGradingPeriodsSeeder::class,
            TrackStrandSeeder::class,
            // Required for Honor System and Certificates
            HonorTypesSeeder::class,
            HonorCriteriaSeeder::class,
            CertificateTemplateSeeder::class,  // CRITICAL: Required for certificate generation
            // Commented out - requires departments which don't exist with minimal seeding
            // AssignChairpersonToDepartmentSeeder::class,
            // Commented out - only keeping 9 users (one per role)
            // RealisticSchoolDataSeeder::class,
            // Commented out temporarily - keeping only one user per role
            // AcademicManagementSeeder::class,
            // ParentStudentSeeder::class,
            // StrandCourseDepartmentSeeder::class,
            // UpdateDepartmentsAcademicLevelSeeder::class,
            // HonorDemoSeeder::class,
            // HonorSampleDataSeeder::class,
            // CertificateTemplatesSeeder::class,
            // HonorCertificateTemplatesSeeder::class,
            // SampleGradesSeeder::class,
            // InstructorAssignmentSeeder::class,
            // StudentEnrollmentSeeder::class,
            // TeacherAssignmentSeeder::class,
            // CreateSampleGradesForChairpersonSeeder::class,
            // CreateSampleHonorsForChairpersonSeeder::class,
        ]);
    }
}
