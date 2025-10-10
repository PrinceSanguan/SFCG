<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class ClassSectionReportExport implements WithMultipleSheets
{
    protected $sectionsData;
    protected $academicLevel;
    protected $filters;

    public function __construct($sectionsData, $academicLevel, $filters)
    {
        $this->sectionsData = $sectionsData;
        $this->academicLevel = $academicLevel;
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        $sheets = [];
        
        // Add overview sheet
        $sheets[] = new SectionOverviewSheet($this->sectionsData, $this->academicLevel, $this->filters);
        
        // Add student roster sheet for each section
        foreach ($this->sectionsData as $sectionData) {
            $sheets[] = new SectionRosterSheet($sectionData);
        }

        return $sheets;
    }
}

class SectionOverviewSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $sectionsData;
    protected $academicLevel;
    protected $filters;

    public function __construct($sectionsData, $academicLevel, $filters)
    {
        $this->sectionsData = $sectionsData;
        $this->academicLevel = $academicLevel;
        $this->filters = $filters;
    }

    public function collection()
    {
        return $this->sectionsData;
    }

    public function headings(): array
    {
        $isSeniorHighSchool = $this->academicLevel->key === 'senior_highschool';

        return [
            'Section Name',
            'Year Level',
            'Current Enrollment',
            'Max Capacity',
            'Capacity %',
            $isSeniorHighSchool ? 'Academic Strand' : 'Course',
            $isSeniorHighSchool ? 'Track' : 'Department',
            'School Year',
        ];
    }

    public function map($sectionData): array
    {
        $section = $sectionData['section'];
        $isSeniorHighSchool = $this->academicLevel->key === 'senior_highschool';

        return [
            $section->name,
            $section->specific_year_level ?? 'N/A',
            $sectionData['enrollment_count'],
            $section->max_students ?? 'N/A',
            number_format($sectionData['capacity_percentage'], 1) . '%',
            $isSeniorHighSchool ? ($section->strand->name ?? 'N/A') : ($section->course->name ?? 'N/A'),
            $isSeniorHighSchool ? ($section->track->name ?? 'N/A') : ($section->department->name ?? 'N/A'),
            $this->filters['school_year'],
        ];
    }

    public function title(): string
    {
        return 'Section Overview';
    }
}

class SectionRosterSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $sectionData;

    public function __construct($sectionData)
    {
        $this->sectionData = $sectionData;
    }

    public function collection()
    {
        return collect($this->sectionData['students']);
    }

    public function headings(): array
    {
        $headers = [
            'Student Name',
            'Student Number',
            'Email',
            'Year Level',
        ];

        // Add average grade column if grades are included
        if (isset($this->sectionData['students']->first()->grades)) {
            $headers[] = 'Average Grade';
        }

        return $headers;
    }

    public function map($student): array
    {
        $data = [
            $student->name,
            $student->student_number,
            $student->email,
            $student->specific_year_level ?? 'N/A',
        ];

        // Add average grade if available
        if (isset($student->average_grade)) {
            $data[] = number_format($student->average_grade, 2);
        }

        return $data;
    }

    public function title(): string
    {
        return substr($this->sectionData['section']->name, 0, 31); // Excel sheet name limit
    }
}
