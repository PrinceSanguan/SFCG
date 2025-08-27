<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Honor Qualification Achievement - Parent Notification</title>
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
        .parent-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Honor Qualification Achievement</h1>
        <p>Congratulations to Your Child!</p>
        <p>School Year: {{ $schoolYear }}</p>
    </div>

    <div class="content">
        <div class="parent-info">
            <h3>Dear {{ $parent->name }},</h3>
            <p>We are pleased to inform you that your child has achieved academic excellence!</p>
        </div>
        
        <div class="achievement-box">
            <h2>🎉 Congratulations! 🎉</h2>
            <p><strong>{{ $student->name }}</strong> has qualified for <strong>{{ $honorResult->honorType->name ?? 'Academic Honors' }}</strong></p>
            <p>This is a remarkable achievement that reflects dedication and hard work!</p>
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
            <li><strong>Student Name:</strong> {{ $student->name }}</li>
            <li><strong>Honor Type:</strong> {{ $honorResult->honorType->name ?? 'N/A' }}</li>
            <li><strong>Academic Level:</strong> {{ $honorResult->academicLevel->name ?? 'N/A' }}</li>
            <li><strong>School Year:</strong> {{ $schoolYear }}</li>
            <li><strong>Student Number:</strong> {{ $student->student_number ?? 'N/A' }}</li>
        </ul>

        <p>Your child's academic performance has been exceptional, and this recognition is well-deserved. We encourage you to celebrate this achievement with them!</p>
        
        <p><strong>What this means:</strong></p>
        <ul>
            <li>Recognition of academic excellence</li>
            <li>Potential eligibility for academic awards</li>
            <li>Enhanced academic record for future opportunities</li>
            <li>Demonstration of strong study habits and dedication</li>
        </ul>

        <p>We are proud of your child's achievements and look forward to seeing their continued success!</p>
        
        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated notification from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
        <p>You can view your child's academic progress by logging into the Parent Portal.</p>
    </div>
</body>
</html>
