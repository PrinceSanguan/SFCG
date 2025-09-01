<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Department Analysis Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #7f8c8d;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .metrics-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            min-width: 150px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        .progress-bar {
            background-color: #e9ecef;
            border-radius: 3px;
            height: 20px;
            margin: 5px 0;
        }
        .progress-fill {
            background-color: #28a745;
            height: 100%;
            border-radius: 3px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Department Analysis Report</h1>
        <p><strong>Department:</strong> {{ $department->name ?? 'N/A' }}</p>
        <p><strong>Generated:</strong> {{ $generatedAt }}</p>
    </div>

    <!-- Key Metrics -->
    <div class="section">
        <h2>Key Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">{{ $stats['total_students'] }}</div>
                <div class="metric-label">Total Students</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">{{ $stats['total_courses'] }}</div>
                <div class="metric-label">Total Courses</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">{{ $stats['total_instructors'] }}</div>
                <div class="metric-label">Total Instructors</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">{{ $stats['average_gpa'] }}</div>
                <div class="metric-label">Average GPA</div>
            </div>
        </div>
    </div>

    <!-- Student Enrollment by Course -->
    <div class="section">
        <h2>Student Enrollment by Course</h2>
        @if(count($studentEnrollment) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Enrollment Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($studentEnrollment as $course => $count)
                        <tr>
                            <td>{{ $course }}</td>
                            <td>{{ $count }}</td>
                            <td>{{ $stats['total_students'] > 0 ? round(($count / $stats['total_students']) * 100, 1) : 0 }}%</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No enrollment data available.</p>
        @endif
    </div>

    <!-- Course Performance -->
    <div class="section">
        <h2>Course Performance Analysis</h2>
        @if(count($coursePerformance) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Average Grade</th>
                        <th>Total Grades</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($coursePerformance as $course)
                        <tr>
                            <td>{{ $course['course_name'] }}</td>
                            <td>{{ $course['average_grade'] }}</td>
                            <td>{{ $course['total_grades'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No course performance data available.</p>
        @endif
    </div>

    <!-- Instructor Performance -->
    <div class="section">
        <h2>Instructor Performance</h2>
        @if(count($instructorPerformance) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Instructor</th>
                        <th>Average Grade</th>
                        <th>Total Grades</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($instructorPerformance as $instructor)
                        <tr>
                            <td>{{ $instructor['instructor_name'] }}</td>
                            <td>{{ $instructor['average_grade'] }}</td>
                            <td>{{ $instructor['total_grades'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No instructor performance data available.</p>
        @endif
    </div>

    <!-- Honor Statistics -->
    <div class="section">
        <h2>Honor Statistics</h2>
        @if(count($honorStatistics) > 0)
            <div class="metrics-grid">
                @foreach($honorStatistics as $honorType => $count)
                    <div class="metric-card">
                        <div class="metric-value">{{ $count }}</div>
                        <div class="metric-label">{{ $honorType }}</div>
                    </div>
                @endforeach
            </div>
        @else
            <p>No honor statistics available.</p>
        @endif
    </div>

    <!-- Performance Trends -->
    <div class="section">
        <h2>Performance Trends Over Time</h2>
        @if(count($performanceTrends) > 0)
            <table>
                <thead>
                    <tr>
                        <th>School Year</th>
                        <th>Average Grade</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($performanceTrends as $trend)
                        <tr>
                            <td>{{ $trend['school_year'] }}</td>
                            <td>{{ $trend['avg_grade'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No performance trend data available.</p>
        @endif
    </div>

    <div class="footer">
        <p>This report was generated automatically by the School Management System.</p>
        <p>For questions or concerns, please contact the department chairperson.</p>
    </div>
</body>
</html>
