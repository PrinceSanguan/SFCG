<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset - {{ config('app.name') }}</title>
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
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .credentials {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .warning {
            background-color: #f8d7da;
            border: 1px solid #f5c2c7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset Notification</h1>
    </div>

    <div class="content">
        <h2>Hello {{ $user->name }},</h2>

        <p>Your password has been reset by
            @if($resetBy)
                <strong>{{ $resetBy }}</strong>
            @else
                an administrator
            @endif
        </p>

        <div class="credentials">
            <h3>Your New Login Credentials:</h3>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>New Password:</strong> <code>{{ $newPassword }}</code></p>
            <p><strong>Role:</strong> {{ ucfirst($user->user_role) }}</p>
        </div>

        <div class="warning">
            <h3>⚠️ Important Security Notice:</h3>
            <ul>
                <li>Please change your password immediately after logging in</li>
                <li>This is a temporary password for security purposes</li>
                <li>Do not share your password with anyone</li>
                <li>If you did not request this password reset, please contact support immediately</li>
            </ul>
        </div>

        <p>To change your password:</p>
        <ol>
            <li>Log in to your account using the new password above</li>
            <li>Go to your profile settings</li>
            <li>Click on "Change Password"</li>
            <li>Enter a new secure password</li>
        </ol>

        <p>If you have any questions or concerns, please contact our support team.</p>

        <p>Best regards,<br>
        The {{ config('app.name') }} Team</p>
    </div>

    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>If you did not request this password reset, please contact support immediately at {{ config('mail.from.address') }}</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>
