<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Honor Statistics Report</title>
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
            border-left: 4px solid #ffc107;
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
            color: #ffc107;
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
        .gpa-high { color: #28a745; font-weight: bold; }
        .gpa-medium { color: #17a2b8; }
        .gpa-low { color: #ffc107; }
        .honor-summa { background-color: #fff3cd; }
        .honor-magna { background-color: #d4edda; }
        .honor-cum { background-color: #d1ecf1; }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .chart-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Honor Roll Statistics Report</h1>
        <p>Generated on {{ now()->format('F d, Y \a\t g:i A') }}</p>
        <p>Total Honor Students: {{ $honors->count() }}</p>
    </div>

    <div class="stats-section">
        <h3>Overall Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Total Honors</div>
                <div class="stat-value">{{ $statistics['total_honors'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Average GPA</div>
                <div class="stat-value">{{ $statistics['total_honors'] > 0 ? number_format($statistics['average_gpa'], 2) : 'N/A' }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Highest GPA</div>
                <div class="stat-value">{{ $statistics['total_honors'] > 0 ? $statistics['highest_gpa'] : 'N/A' }}</div>
            </div>
        </div>

        <div class="chart-section">
            <h4>Honor Type Distribution</h4>
            @if(!empty($statistics['honor_type_distribution']))
            <table style="width: 60%; margin: 0;">
                <thead>
                    <tr>
                        <th>Honor Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statistics['honor_type_distribution'] as $type)
                    <tr>
                        <td>{{ $type['type'] }}</td>
                        <td style="text-align: center;">{{ $type['count'] }}</td>
                        <td style="text-align: center;">{{ $type['percentage'] }}%</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p style="text-align: center; color: #666; font-style: italic;">No honor types found for the selected criteria.</p>
            @endif
        </div>

        <div class="chart-section">
            <h4>Academic Level Distribution</h4>
            @if(!empty($statistics['academic_level_distribution']))
            <table style="width: 60%; margin: 0;">
                <thead>
                    <tr>
                        <th>Academic Level</th>
                        <th>Count</th>
                        <th>Average GPA</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statistics['academic_level_distribution'] as $level)
                    <tr>
                        <td>{{ $level['level'] }}</td>
                        <td style="text-align: center;">{{ $level['count'] }}</td>
                        <td style="text-align: center;">{{ number_format($level['average_gpa'], 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p style="text-align: center; color: #666; font-style: italic;">No academic levels found for the selected criteria.</p>
            @endif
        </div>
    </div>

    <h3>Honor Roll List</h3>
    @if($honors->count() > 0)
    <table>
        <thead>
            <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Student Number</th>
                <th>Honor Type</th>
                <th>Academic Level</th>
                <th>School Year</th>
                <th>GPA</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($honors as $index => $honor)
            <tr class="@if(str_contains(strtolower($honor->honorType->name), 'summa')) honor-summa @elseif(str_contains(strtolower($honor->honorType->name), 'magna')) honor-magna @elseif(str_contains(strtolower($honor->honorType->name), 'cum')) honor-cum @endif">
                <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                <td>{{ $honor->student->name }}</td>
                <td>{{ $honor->student->student_number }}</td>
                <td>{{ $honor->honorType->name }}</td>
                <td>{{ $honor->academicLevel->name }}</td>
                <td>{{ $honor->school_year }}</td>
                <td class="@if($honor->gpa >= 3.8) gpa-high @elseif($honor->gpa >= 3.5) gpa-medium @else gpa-low @endif">
                    {{ number_format($honor->gpa, 2) }}
                </td>
                <td>
                    @if($honor->is_overridden)
                        <span style="color: #dc3545;">Overridden</span>
                    @else
                        <span style="color: #28a745;">Valid</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div style="text-align: center; padding: 40px; color: #666;">
        <h4>No Honors Found</h4>
        <p>No honor students were found for the selected criteria.</p>
        <p>Please try different filters or check if honor data exists for the selected academic level and school year.</p>
    </div>
    @endif

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>Generated by Academic Management System</p>
    </div>
</body>
</html>
