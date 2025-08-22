<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Grade Update Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 20px;
            border: 1px solid #dee2e6;
        }
        .footer {
            background-color: #6c757d;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
        }
        .grade-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .grade-table th, .grade-table td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
        }
        .grade-table th {
            background-color: #e9ecef;
            font-weight: bold;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Grade Update Notification</h1>
        <p>School Year: {{ $schoolYear }}</p>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $user->name }}</strong>,</p>
        
        <p>This is to inform you that your grades for the <strong>{{ $schoolYear }}</strong> school year have been updated.</p>
        
        <div class="highlight">
            <strong>Academic Level:</strong> {{ $academicLevel->name ?? 'N/A' }}<br>
            <strong>Student Number:</strong> {{ $user->student_number ?? 'N/A' }}
        </div>

        @if($grades && $grades->count() > 0)
            <h3>Your Updated Grades:</h3>
            <table class="grade-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Grading Period</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($grades as $grade)
                        <tr>
                            <td>{{ $grade->subject->name ?? 'N/A' }}</td>
                            <td><strong>{{ $grade->grade }}</strong></td>
                            <td>{{ $grade->gradingPeriod->name ?? 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p><em>No specific grades are available at this time.</em></p>
        @endif

        <p>Please review your grades and contact your teachers or academic advisers if you have any questions or concerns.</p>
        
        <p>Keep up the great work!</p>
        
        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated notification from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
    </div>
</body>
</html>
