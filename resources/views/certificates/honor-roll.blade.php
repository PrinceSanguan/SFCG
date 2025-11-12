<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Honor Roll - {{ $schoolYear }}</title>
    <style>
        @page {
            margin: 30px;
            size: A4 portrait;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #111;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .school-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .document-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .school-year {
            font-size: 14px;
            color: #666;
        }
        .level-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .level-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #f5f5f5;
            padding: 8px 12px;
            border-left: 4px solid #007bff;
            margin-bottom: 15px;
        }
        .honor-type-section {
            margin-bottom: 15px;
        }
        .honor-type-title {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }
        .students-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .students-table th {
            background-color: #f8f9fa;
            padding: 6px 8px;
            border: 1px solid #ddd;
            font-weight: bold;
            text-align: left;
            font-size: 10px;
        }
        .students-table td {
            padding: 5px 8px;
            border: 1px solid #ddd;
            font-size: 10px;
        }
        .students-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .gpa-column {
            text-align: center;
            font-weight: bold;
        }
        .student-number {
            color: #666;
            font-size: 9px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 30px;
            right: 30px;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            font-size: 9px;
            color: #666;
        }
        .stats-summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
        }
        .stats-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .stat-item {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    {!! \App\Helpers\CertificateLogoHelper::getCenteredLogoHtml(60, 60, 15) !!}
    <div class="header">
        <div class="school-title">San Francisco de la Cruz Graduate School</div>
        <div class="document-title">Honor Roll</div>
        <div class="school-year">School Year {{ $schoolYear }}</div>
    </div>

    @if($honorRoll->isNotEmpty())
        @foreach($honorRoll as $levelName => $honorsByType)
            <div class="level-section">
                <div class="level-title">{{ $levelName }}</div>

                @foreach($honorsByType as $honorTypeName => $students)
                    <div class="honor-type-section">
                        <div class="honor-type-title">{{ $honorTypeName }} ({{ $students->count() }} students)</div>

                        <table class="students-table">
                            <thead>
                                <tr>
                                    <th style="width: 5%;">#</th>
                                    <th style="width: 40%;">Student Name</th>
                                    <th style="width: 20%;">Student Number</th>
                                    <th style="width: 15%;">GPA</th>
                                    <th style="width: 20%;">Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($students as $index => $honor)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td>{{ $honor->student->name }}</td>
                                        <td class="student-number">{{ $honor->student->student_number ?? 'N/A' }}</td>
                                        <td class="gpa-column">{{ number_format($honor->gpa, 2) }}</td>
                                        <td>{{ $honor->approvedBy->name ?? 'System' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endforeach
            </div>
        @endforeach

        @php
            $totalStudents = $honorRoll->flatten(2)->count();
            $averageGPA = $honorRoll->flatten(2)->avg('gpa');
            $levelCounts = $honorRoll->map(function($levelHonors) {
                return $levelHonors->flatten()->count();
            });
        @endphp

        <div class="stats-summary">
            <div class="stats-title">Summary Statistics</div>
            <div class="stat-item"><strong>Total Honor Students:</strong> {{ $totalStudents }}</div>
            <div class="stat-item"><strong>Average GPA:</strong> {{ $averageGPA ? number_format($averageGPA, 2) : 'N/A' }}</div>
            @foreach($levelCounts as $level => $count)
                <div class="stat-item"><strong>{{ $level }}:</strong> {{ $count }} students</div>
            @endforeach
        </div>
    @else
        <div style="text-align: center; margin-top: 50px; color: #666;">
            <p>No honor students found for the selected criteria.</p>
        </div>
    @endif

    <div class="footer">
        Generated on {{ $generatedAt }} | Honor Roll - School Year {{ $schoolYear }}
    </div>
</body>
</html>