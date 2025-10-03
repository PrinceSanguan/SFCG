<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Class Section Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 11px;
            color: #666;
        }
        .section-block {
            page-break-inside: avoid;
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 15px;
        }
        .section-header {
            background-color: #f5f5f5;
            padding: 10px;
            margin: -15px -15px 15px -15px;
            border-bottom: 2px solid #333;
        }
        .section-header h2 {
            margin: 0;
            font-size: 14px;
            color: #333;
        }
        .section-info {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 150px;
            padding: 3px 0;
        }
        .info-value {
            display: table-cell;
            padding: 3px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #333;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
        }
        td {
            border: 1px solid #ddd;
            padding: 6px;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            position: fixed;
            bottom: 15px;
            right: 20px;
            font-size: 8px;
            color: #999;
        }
        .no-students {
            text-align: center;
            padding: 20px;
            color: #999;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Class Section Report</h1>
        <p>{{ $academicLevel->name }} - School Year {{ $schoolYear }}</p>
        <p style="font-size: 9px; margin-top: 5px;">Generated on: {{ $generatedAt }}</p>
    </div>

    @foreach ($sectionsData as $sectionData)
        <div class="section-block">
            <div class="section-header">
                <h2>{{ $sectionData['section']->name }}</h2>
            </div>

            <div class="section-info">
                <div class="info-row">
                    <div class="info-label">Year Level:</div>
                    <div class="info-value">{{ $sectionData['section']->specific_year_level ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Current Enrollment:</div>
                    <div class="info-value">{{ $sectionData['enrollment_count'] }} students</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Max Capacity:</div>
                    <div class="info-value">{{ $sectionData['section']->max_students ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Capacity:</div>
                    <div class="info-value">{{ number_format($sectionData['capacity_percentage'], 1) }}%</div>
                </div>
                @if ($sectionData['section']->course)
                    <div class="info-row">
                        <div class="info-label">Course:</div>
                        <div class="info-value">{{ $sectionData['section']->course->name }}</div>
                    </div>
                @endif
                @if ($sectionData['section']->department)
                    <div class="info-row">
                        <div class="info-label">Department:</div>
                        <div class="info-value">{{ $sectionData['section']->department->name }}</div>
                    </div>
                @endif
                @if ($sectionData['section']->strand)
                    <div class="info-row">
                        <div class="info-label">Strand:</div>
                        <div class="info-value">{{ $sectionData['section']->strand->name }}</div>
                    </div>
                @endif
            </div>

            @if (count($sectionData['students']) > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">Student Name</th>
                            <th style="width: 15%;">Student Number</th>
                            <th style="width: 25%;">Email</th>
                            <th style="width: 15%;">Year Level</th>
                            @if ($includeGrades)
                                <th style="width: 15%;">Avg Grade</th>
                            @endif
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($sectionData['students'] as $index => $student)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>{{ $student->name }}</td>
                                <td>{{ $student->student_number }}</td>
                                <td>{{ $student->email }}</td>
                                <td>{{ $student->specific_year_level ?? 'N/A' }}</td>
                                @if ($includeGrades)
                                    <td>{{ isset($student->average_grade) ? number_format($student->average_grade, 2) : 'N/A' }}</td>
                                @endif
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-students">
                    No students enrolled in this section.
                </div>
            @endif
        </div>
    @endforeach

    <div class="footer">
        Page {{ $loop->iteration ?? 1 }} | Generated by School Management System
    </div>
</body>
</html>
