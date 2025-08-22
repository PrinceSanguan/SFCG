<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class HonorStatisticsExport implements WithMultipleSheets
{
    protected $honors;
    protected $statistics;

    public function __construct($honors, $statistics)
    {
        $this->honors = $honors;
        $this->statistics = $statistics;
    }

    public function sheets(): array
    {
        $sheets = [];
        
        // Only add HonorListSheet if there are honors
        if ($this->honors && $this->honors->count() > 0) {
            $sheets[] = new HonorListSheet($this->honors);
        }
        
        // Always add StatisticsSheet (it handles empty data)
        $sheets[] = new HonorStatisticsSheet($this->statistics);
        
        // Ensure we always have at least one sheet
        if (empty($sheets)) {
            $sheets[] = new HonorStatisticsSheet($this->statistics);
        }
        
        return $sheets;
    }
}

class HonorListSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $honors;

    public function __construct($honors)
    {
        $this->honors = $honors;
    }

    public function collection()
    {
        // Return empty collection if no honors
        if (!$this->honors || $this->honors->count() === 0) {
            return collect();
        }
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
        ];
    }

    public function map($honor): array
    {
        return [
            $honor->student->name,
            $honor->student->student_number,
            $honor->honorType->name,
            $honor->academicLevel->name,
            $honor->school_year,
            $honor->gpa,
            $honor->is_overridden ? 'Yes' : 'No',
            $honor->override_reason ?? '',
        ];
    }

    public function title(): string
    {
        return 'Honor Roll';
    }
}

class HonorStatisticsSheet implements FromCollection, WithHeadings, WithTitle
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
        $data->push(['Total Honors', $this->statistics['total_honors'], '']);
        $data->push(['Average GPA', $this->statistics['total_honors'] > 0 ? round($this->statistics['average_gpa'], 2) : 'N/A', '']);
        $data->push(['Highest GPA', $this->statistics['total_honors'] > 0 ? $this->statistics['highest_gpa'] : 'N/A', '']);
        $data->push(['', '', '']);

        // Honor type distribution
        $data->push(['Honor Type Distribution', '', '']);
        if (!empty($this->statistics['honor_type_distribution'])) {
            foreach ($this->statistics['honor_type_distribution'] as $type) {
                $data->push([$type['type'], $type['count'], $type['percentage'] . '%']);
            }
        } else {
            $data->push(['No honors found', '0', '0%']);
        }
        $data->push(['', '', '']);

        // Academic level distribution
        $data->push(['Academic Level Distribution', '', '']);
        if (!empty($this->statistics['academic_level_distribution'])) {
            foreach ($this->statistics['academic_level_distribution'] as $level) {
                $data->push([$level['level'], $level['count'], round($level['average_gpa'], 2)]);
            }
        } else {
            $data->push(['No honors found', '0', 'N/A']);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Category',
            'Value',
            'Additional Info',
        ];
    }

    public function title(): string
    {
        return 'Statistics';
    }
}
