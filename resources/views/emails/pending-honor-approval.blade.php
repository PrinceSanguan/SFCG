<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pending Honor Results for Approval</title>
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
            background-color: #ffc107;
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
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        .stats-box {
            background-color: white;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .stats-number {
            font-size: 48px;
            font-weight: bold;
            color: #ffc107;
            margin: 10px 0;
        }
        .stats-label {
            font-size: 18px;
            color: #666;
            margin: 5px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #ffc107;
            color: #333;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
            font-weight: bold;
        }
        .cta-button:hover {
            background-color: #e0a800;
        }
        .info-box {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Honor Results Pending Approval</h1>
        <p>{{ $academicLevel->name }} - {{ $schoolYear }}</p>
    </div>

    <div class="content">
        <p>Hello <strong>{{ $recipient->name }}</strong>,</p>

        <div class="highlight">
            <strong>⏰ Action Required:</strong> Please review and take action on pending honor applications.
        </div>

        <p>There {{ $honorCount === 1 ? 'is' : 'are' }} <strong>{{ $honorCount }}</strong> student{{ $honorCount === 1 ? '' : 's' }} who {{ $honorCount === 1 ? 'has' : 'have' }} qualified for honors in {{ $academicLevel->name }} ({{ $schoolYear }}) awaiting your review and approval decision.</p>

        <div class="stats-box">
            <div class="stats-number">{{ $honorCount }}</div>
            <div class="stats-label">Honor Results Pending Approval</div>
        </div>

        <div class="info-box">
            <strong>Details:</strong><br>
            <strong>Academic Level:</strong> {{ $academicLevel->name }}<br>
            <strong>School Year:</strong> {{ $schoolYear }}<br>
            <strong>Status:</strong> Pending Your Approval
        </div>

        <p><strong>Required Actions:</strong></p>
        <ul>
            <li><strong>Review:</strong> Examine each honor application for accuracy and eligibility</li>
            <li><strong>Verify:</strong> Confirm student qualifications meet the honor criteria requirements</li>
            <li><strong>Decide:</strong> Approve or decline each application based on your assessment</li>
            <li><strong>Document:</strong> Provide a reason when declining any application</li>
        </ul>

        <p><strong>Time Sensitive:</strong> Please review and process these honor applications at your earliest convenience. Students and their families are awaiting notification of the results.</p>

        <center>
            @if($academicLevel->key === 'college')
                <a href="{{ url('/chairperson/honors') }}" class="cta-button">📋 Review & Process Applications</a>
            @else
                <a href="{{ url('/principal/honors') }}" class="cta-button">📋 Review & Process Applications</a>
            @endif
        </center>

        <p style="margin-top: 20px;"><strong>Important:</strong> Students and parents will be notified once you approve these honor results. Please ensure all information is accurate before approval.</p>

        <p>If you have any questions or concerns, please contact the registrar or administration office.</p>

        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated notification from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
    </div>
</body>
</html>
