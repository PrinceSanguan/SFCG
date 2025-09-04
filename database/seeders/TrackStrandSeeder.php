<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Track;
use App\Models\Strand;
use App\Models\AcademicLevel;

class TrackStrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Tracks
        $tracks = [
            [
                'name' => 'Academic Track',
                'code' => 'ACAD',
                'description' => 'Focuses on core academic subjects and prepares students for college education',
                'is_active' => true,
            ],
            [
                'name' => 'Technical-Vocational-Livelihood (TVL) Track',
                'code' => 'TVL',
                'description' => 'Provides technical and vocational skills for immediate employment',
                'is_active' => true,
            ],
            [
                'name' => 'Sports Track',
                'code' => 'SPORTS',
                'description' => 'Develops athletic skills and sports-related competencies',
                'is_active' => true,
            ],
            [
                'name' => 'Arts and Design Track',
                'code' => 'ARTS',
                'description' => 'Cultivates artistic and creative skills in various media',
                'is_active' => true,
            ],
        ];

        foreach ($tracks as $trackData) {
            Track::updateOrCreate(
                ['code' => $trackData['code']],
                $trackData
            );
        }

        // Get the Academic Track (for Senior High School strands)
        $academicTrack = Track::where('code', 'ACAD')->first();
        $seniorHighLevel = AcademicLevel::where('key', 'senior_highschool')->first();

        if ($academicTrack && $seniorHighLevel) {
            // Create Academic Track Strands
            $academicStrands = [
                [
                    'name' => 'Science, Technology, Engineering, and Mathematics',
                    'code' => 'STEM',
                    'description' => 'Focuses on science, technology, engineering, and mathematics',
                    'track_id' => $academicTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'Accountancy, Business, and Management',
                    'code' => 'ABM',
                    'description' => 'Prepares students for careers in business and management',
                    'track_id' => $academicTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'Humanities and Social Sciences',
                    'code' => 'HUMSS',
                    'description' => 'Focuses on humanities, social sciences, and liberal arts',
                    'track_id' => $academicTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'General Academic Strand',
                    'code' => 'GAS',
                    'description' => 'Provides a general academic foundation for various fields',
                    'track_id' => $academicTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
            ];

            foreach ($academicStrands as $strandData) {
                Strand::updateOrCreate(
                    ['code' => $strandData['code']],
                    $strandData
                );
            }
        }

        // Create TVL Track Strands
        $tvlTrack = Track::where('code', 'TVL')->first();
        if ($tvlTrack && $seniorHighLevel) {
            $tvlStrands = [
                [
                    'name' => 'Information and Communications Technology',
                    'code' => 'ICT',
                    'description' => 'Computer programming, web development, and IT skills',
                    'track_id' => $tvlTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'Home Economics',
                    'code' => 'HE',
                    'description' => 'Culinary arts, hospitality, and home management',
                    'track_id' => $tvlTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'Industrial Arts',
                    'code' => 'IA',
                    'description' => 'Automotive, electrical, and mechanical skills',
                    'track_id' => $tvlTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
                [
                    'name' => 'Agri-Fishery Arts',
                    'code' => 'AFA',
                    'description' => 'Agriculture, fisheries, and environmental management',
                    'track_id' => $tvlTrack->id,
                    'academic_level_id' => $seniorHighLevel->id,
                    'is_active' => true,
                ],
            ];

            foreach ($tvlStrands as $strandData) {
                Strand::updateOrCreate(
                    ['code' => $strandData['code']],
                    $strandData
                );
            }
        }
    }
}
