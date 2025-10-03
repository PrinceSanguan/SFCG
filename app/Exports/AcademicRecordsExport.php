<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class AcademicRecordsExport implements WithMultipleSheets
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        $sheets = [];

        if (isset($this->data['grades']) && $this->data['grades']->count() > 0) {
            $sheets[] = new AcademicGradesSheet($this->data['grades']);
        }

        if (isset($this->data['honors']) && $this->data['honors']->count() > 0) {
            $sheets[] = new AcademicHonorsSheet($this->data['honors']);
        }

        if (isset($this->data['certificates']) && $this->data['certificates']->count() > 0) {
            $sheets[] = new AcademicCertificatesSheet($this->data['certificates']);
        }

        // If no sheets were added, add a default "No Data" sheet
        if (empty($sheets)) {
            $sheets[] = new NoDataSheet();
        }

        return $sheets;
    }
}

class NoDataSheet implements FromCollection, WithHeadings, WithTitle
{
    public function collection()
    {
        return collect([
            ['No academic records found for the selected criteria.'],
            ['Please try different filters or check if data exists for the selected academic level and school year.'],
        ]);
    }

    public function headings(): array
    {
        return ['Message'];
    }

    public function title(): string
    {
        return 'No Data';
    }
}

class AcademicGradesSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $grades;

    public function __construct($grades)
    {
        $this->grades = $grades;
    }

    public function collection()
    {
        return $this->grades;
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Student Number',
            'Subject',
            'Academic Level',
            'Grading Period',
            'School Year',
            'Grade',
            'Year of Study',
            'Created At',
        ];
    }

    public function map($grade): array
    {
        return [
            $grade->student ? $grade->student->name : 'N/A',
            $grade->student ? $grade->student->student_number : 'N/A',
            $grade->subject ? $grade->subject->name : 'N/A',
            $grade->academicLevel ? $grade->academicLevel->name : 'N/A',
            $grade->gradingPeriod ? $grade->gradingPeriod->name : 'N/A',
            $grade->school_year ?? 'N/A',
            $grade->grade ?? 'N/A',
            $grade->year_of_study ?? 'N/A',
            $grade->created_at ? $grade->created_at->format('Y-m-d H:i:s') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Grades';
    }
}

class AcademicHonorsSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $honors;

    public function __construct($honors)
    {
        $this->honors = $honors;
    }

    public function collection()
    {
        return $this->honors;
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Student Number',
            'Honor Type',
            'Academic Level',
            'School Year',
            'GPA',
            'Is Overridden',
            'Override Reason',
            'Created At',
        ];
    }

    public function map($honor): array
    {
        return [
            $honor->student ? $honor->student->name : 'N/A',
            $honor->student ? $honor->student->student_number : 'N/A',
            $honor->honorType ? $honor->honorType->name : 'N/A',
            $honor->academicLevel ? $honor->academicLevel->name : 'N/A',
            $honor->school_year ?? 'N/A',
            $honor->gpa ?? 'N/A',
            $honor->is_overridden ? 'Yes' : 'No',
            $honor->override_reason ?? '',
            $honor->created_at ? $honor->created_at->format('Y-m-d H:i:s') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Honors';
    }
}

class AcademicCertificatesSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $certificates;

    public function __construct($certificates)
    {
        $this->certificates = $certificates;
    }

    public function collection()
    {
        return $this->certificates;
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Student Number',
            'Template',
            'Serial Number',
            'Academic Level',
            'School Year',
            'Status',
            'Generated At',
            'Downloaded At',
            'Printed At',
        ];
    }

    public function map($certificate): array
    {
        return [
            $certificate->student ? $certificate->student->name : 'N/A',
            $certificate->student ? $certificate->student->student_number : 'N/A',
            $certificate->template ? $certificate->template->name : 'N/A',
            $certificate->serial_number ?? 'N/A',
            $certificate->academicLevel ? $certificate->academicLevel->name : 'N/A',
            $certificate->school_year ?? 'N/A',
            $certificate->status ?? 'N/A',
            $certificate->generated_at ? $certificate->generated_at->format('Y-m-d H:i:s') : '',
            $certificate->downloaded_at ? $certificate->downloaded_at->format('Y-m-d H:i:s') : '',
            $certificate->printed_at ? $certificate->printed_at->format('Y-m-d H:i:s') : '',
        ];
    }

    public function title(): string
    {
        return 'Certificates';
    }
}
