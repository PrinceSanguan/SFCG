<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
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
        .announcement-box {
            background-color: #fff;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .announcement-title {
            color: #007bff;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        .announcement-message {
            font-size: 16px;
            line-height: 1.8;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📢 School Announcement</h1>
        <p>Important Information from School Administration</p>
    </div>

    <div class="content">
        <div class="announcement-box">
            <div class="announcement-title">{{ $title ?? 'Announcement' }}</div>
            <div class="announcement-message">
                {{ $message ?? 'No message content' }}
            </div>
        </div>

        <p>This announcement has been sent to you by the school administration.</p>
        
        <p>If you have any questions or concerns, please contact your school administration.</p>
        
        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated announcement from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
    </div>
</body>
</html>
