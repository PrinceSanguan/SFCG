<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Honor Achievement</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .honor-badge {
            background: #ffd700;
            color: #333;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
        }
        .stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Honor Achievement!</h1>
        @if($isParentNotification)
            <p>Your child has achieved academic honors</p>
        @else
            <p>Congratulations on your academic achievement!</p>
        @endif
    </div>

    <div class="content">
        @if($isParentNotification)
            <h2>Dear Parent/Guardian,</h2>
            <p>We are delighted to inform you that your child, <strong>{{ $student->name }}</strong>, has achieved academic honors for the {{ $periodName }} of {{ $schoolYear }}.</p>
        @else
            <h2>Dear {{ $student->name }},</h2>
            <p>Congratulations! We are thrilled to inform you that you have achieved academic honors for the {{ $periodName }} of {{ $schoolYear }}.</p>
        @endif

        <div class="honor-badge">
            {{ $honorDisplayName }}
        </div>

        <div class="stats">
            <h3>Achievement Details:</h3>
            <ul>
                <li><strong>Student:</strong> {{ $student->name }}</li>
                <li><strong>Honor Type:</strong> {{ $honorDisplayName }}</li>
                <li><strong>GPA:</strong> {{ $gpa }}</li>
                <li><strong>Academic Period:</strong> {{ $periodName }}</li>
                <li><strong>School Year:</strong> {{ $schoolYear }}</li>
            </ul>
        </div>

        @if(!$isParentNotification)
            <p>This achievement reflects your hard work, dedication, and commitment to academic excellence. You should be proud of this accomplishment!</p>
        @else
            <p>This achievement reflects your child's hard work, dedication, and commitment to academic excellence. You should be proud of their accomplishment!</p>
        @endif

        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Your honor certificate will be generated and made available for download</li>
            <li>This achievement will be reflected in your academic transcript</li>
            <li>You will receive recognition during our honors ceremony</li>
        </ul>

        @if(!$isParentNotification)
            <p>Keep up the excellent work and continue striving for academic excellence!</p>
        @else
            <p>Please congratulate your child on this wonderful achievement and encourage them to continue their excellent academic performance.</p>
        @endif
    </div>

    <div class="footer">
        <p>This is an automated notification from the Honor Student Tracking & Certificate Management System.</p>
        <p>If you have any questions, please contact the academic office.</p>
    </div>
</body>
</html> 