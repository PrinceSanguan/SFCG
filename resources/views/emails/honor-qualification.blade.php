<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Honor Qualification Achievement</title>
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
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #333;
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
        .achievement-box {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Honor Qualification Achievement</h1>
        <p>Congratulations on Your Academic Excellence!</p>
        <p>School Year: {{ $schoolYear }}</p>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $user->name }}</strong>,</p>
        
        <div class="achievement-box">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You have qualified for <strong>{{ $honorResult->honorType->name ?? 'Academic Honors' }}</strong></p>
            <p>This is a remarkable achievement that reflects your dedication and hard work!</p>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">{{ number_format($honorResult->gpa, 2) }}</div>
                <div class="stat-label">GPA</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ $honorResult->academicLevel->name ?? 'N/A' }}</div>
                <div class="stat-label">Academic Level</div>
            </div>
        </div>

        <h3>Honor Details:</h3>
        <ul>
            <li><strong>Honor Type:</strong> {{ $honorResult->honorType->name ?? 'N/A' }}</li>
            <li><strong>Academic Level:</strong> {{ $honorResult->academicLevel->name ?? 'N/A' }}</li>
            <li><strong>School Year:</strong> {{ $schoolYear }}</li>
            <li><strong>Student Number:</strong> {{ $user->student_number ?? 'N/A' }}</li>
        </ul>

        <p>Your academic performance has been exceptional, and this recognition is well-deserved. Keep up the excellent work!</p>
        
        <p><strong>What this means:</strong></p>
        <ul>
            <li>Recognition of your academic excellence</li>
            <li>Potential eligibility for academic awards</li>
            <li>Enhanced academic record for future opportunities</li>
        </ul>

        <p>We are proud of your achievements and look forward to seeing your continued success!</p>
        
        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated notification from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
    </div>
</body>
</html>
