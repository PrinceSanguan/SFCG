<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class GradeReportExport implements WithMultipleSheets
{
    protected $grades;
    protected $statistics;

    public function __construct($grades, $statistics = null)
    {
        $this->grades = $grades;
        $this->statistics = $statistics;
    }

    public function sheets(): array
    {
        $sheets = [];
        
        // Only add GradeReportSheet if there are grades
        if ($this->grades && $this->grades->count() > 0) {
            $sheets[] = new GradeReportSheet($this->grades);
        }
        
        // Always add StatisticsSheet (it handles empty data)
        if ($this->statistics) {
            $sheets[] = new GradeStatisticsSheet($this->statistics);
        }

        // Ensure we always have at least one sheet
        if (empty($sheets)) {
            $sheets[] = new GradeStatisticsSheet($this->statistics ?? ['total_records' => 0, 'average_grade' => 0, 'highest_grade' => 0, 'lowest_grade' => 0, 'grade_distribution' => [], 'subject_averages' => []]);
        }

        return $sheets;
    }
}

class GradeReportSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $grades;

    public function __construct($grades)
    {
        $this->grades = $grades;
    }

    public function collection()
    {
        // Return empty collection if no grades
        if (!$this->grades || $this->grades->count() === 0) {
            return collect();
        }
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
        ];
    }

    public function title(): string
    {
        return 'Grade Report';
    }
}

class GradeStatisticsSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $statistics;

    public function __construct($statistics)
    {
        $this->statistics = $statistics;
    }

    public function collection()
    {
        $data = collect();

        // Overall statistics
        $data->push(['Overall Statistics', '', '']);
        $data->push(['Total Records', $this->statistics['total_records'], '']);
        $data->push(['Average Grade', round($this->statistics['average_grade'], 2), '']);
        $data->push(['Highest Grade', $this->statistics['highest_grade'], '']);
        $data->push(['Lowest Grade', $this->statistics['lowest_grade'], '']);
        $data->push(['', '', '']);

        // Grade distribution
        $data->push(['Grade Distribution', '', '']);
        foreach ($this->statistics['grade_distribution'] as $range => $count) {
            $data->push([$range, $count, '']);
        }
        $data->push(['', '', '']);

        // Subject averages
        $data->push(['Subject Averages', '', '']);
        foreach ($this->statistics['subject_averages'] as $subject) {
            $data->push([$subject['subject'], round($subject['average'], 2), $subject['count']]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Category',
            'Value',
            'Count',
        ];
    }

    public function title(): string
    {
        return 'Statistics';
    }
}
