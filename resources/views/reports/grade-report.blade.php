<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Grade Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .stats-section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }
        .stats-section h3 {
            margin-top: 0;
            color: #333;
        }
        .stats-grid {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        .stat-item {
            margin: 10px 0;
        }
        .stat-label {
            font-weight: bold;
            color: #666;
        }
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
        }
        .grade-excellent { color: #28a745; font-weight: bold; }
        .grade-good { color: #17a2b8; }
        .grade-average { color: #ffc107; }
        .grade-poor { color: #dc3545; font-weight: bold; }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Academic Grade Report</h1>
        <p>Generated on {{ now()->format('F d, Y \a\t g:i A') }}</p>
        <p>Total Records: {{ $grades->count() }}</p>
    </div>

    @if($statistics)
    <div class="stats-section">
        <h3>Report Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Average Grade</div>
                <div class="stat-value">{{ $grades->count() > 0 ? number_format($statistics['average_grade'], 2) : 'N/A' }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Highest Grade</div>
                <div class="stat-value">{{ $grades->count() > 0 ? $statistics['highest_grade'] : 'N/A' }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Lowest Grade</div>
                <div class="stat-value">{{ $grades->count() > 0 ? $statistics['lowest_grade'] : 'N/A' }}</div>
            </div>
        </div>

        <h4>Grade Distribution</h4>
        @if($grades->count() > 0)
        <table style="width: 50%; margin: 0;">
            @foreach($statistics['grade_distribution'] as $range => $count)
            <tr>
                <td>{{ $range }}</td>
                <td style="text-align: center;">{{ $count }}</td>
                <td style="text-align: center;">{{ number_format(($count / $grades->count()) * 100, 1) }}%</td>
            </tr>
            @endforeach
        </table>
        @else
        <p style="text-align: center; color: #666; font-style: italic;">No grades found for the selected criteria.</p>
        @endif
    </div>
    @endif

    @if($grades->count() > 0)
    <table>
        <thead>
            <tr>
                <th>Student Name</th>
                <th>Student Number</th>
                <th>Subject</th>
                <th>Academic Level</th>
                <th>Grading Period</th>
                <th>School Year</th>
                <th>Grade</th>
                <th>Year of Study</th>
            </tr>
        </thead>
        <tbody>
            @foreach($grades as $grade)
            <tr>
                <td>{{ $grade->student->name }}</td>
                <td>{{ $grade->student->student_number }}</td>
                <td>{{ $grade->subject->name }}</td>
                <td>{{ $grade->academicLevel->name }}</td>
                <td>{{ $grade->gradingPeriod->name }}</td>
                <td>{{ $grade->school_year }}</td>
                <td class="@if($grade->grade >= 90) grade-excellent @elseif($grade->grade >= 80) grade-good @elseif($grade->grade >= 70) grade-average @else grade-poor @endif">
                    {{ $grade->grade }}
                </td>
                <td>{{ $grade->year_of_study }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div style="text-align: center; padding: 40px; color: #666;">
        <h4>No Grades Found</h4>
        <p>No grade records were found for the selected criteria.</p>
        <p>Please try different filters or check if grade data exists for the selected academic level, grading period, and school year.</p>
    </div>
    @endif

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>Generated by Academic Management System</p>
    </div>
</body>
</html>
