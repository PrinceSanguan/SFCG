<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Honor Qualification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .school-logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .honor-badge {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #1a1a1a;
            padding: 15px 25px;
            border-radius: 50px;
            display: inline-block;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            border: 2px solid #ffd700;
            box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
        }
        .student-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .approval-status {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .status-pending {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }
        .status-approved {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            color: #065f46;
        }
        .status-rejected {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }
        .next-steps {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
        }
        .next-steps h3 {
            margin-top: 0;
            color: #1e40af;
        }
        .congratulations {
            text-align: center;
            font-size: 20px;
            color: #059669;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="school-logo">{{ $schoolName }}</div>
            <p>Academic Excellence Recognition</p>
        </div>

        <div class="congratulations">
            🎉 Congratulations! Your child has qualified for academic honors! 🎉
        </div>

        <p>Dear {{ $parentName }},</p>

        <p>We are delighted to inform you that your child, <strong>{{ $studentName }}</strong>, has demonstrated exceptional academic performance and has qualified for academic honors recognition.</p>

        <div class="honor-badge">
            🏆 {{ $honorType }}
        </div>

        <div class="student-info">
            <div class="info-row">
                <span class="info-label">Student Name:</span>
                <span class="info-value">{{ $studentName }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Academic Level:</span>
                <span class="info-value">{{ $academicLevel }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Honor Type:</span>
                <span class="info-value">{{ $honorType }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Grade Point Average:</span>
                <span class="info-value">{{ number_format($gpa, 2) }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">School Year:</span>
                <span class="info-value">{{ $schoolYear }}</span>
            </div>
        </div>

        <div class="approval-status
            @if(str_contains($approvalStatus, 'pending')) status-pending
            @elseif(str_contains($approvalStatus, 'approved')) status-approved
            @elseif(str_contains($approvalStatus, 'rejected') || str_contains($approvalStatus, 'not approved')) status-rejected
            @else status-pending @endif">
            <h3>📋 Approval Status</h3>
            <p>{{ $approvalStatus }}</p>
        </div>

        <div class="next-steps">
            <h3>📝 Next Steps</h3>
            <p>{{ $nextSteps }}</p>
        </div>

        <div class="contact-info">
            <h3>📞 Need Help?</h3>
            <p>If you have any questions or need assistance, please contact our Academic Office:</p>
            <ul style="text-align: left; margin: 10px 0;">
                <li><strong>Phone:</strong> (044) 123-4567</li>
                <li><strong>Email:</strong> academic@{{ strtolower(str_replace(' ', '', $schoolName)) }}.edu.ph</li>
                <li><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</li>
            </ul>
        </div>

        <p>We are incredibly proud of {{ $studentName }}'s academic achievements and dedication to excellence. This honor is a testament to their hard work and your support as a parent.</p>

        <p>Congratulations once again on this outstanding accomplishment!</p>

        <p>Best regards,<br>
        <strong>Academic Affairs Office</strong><br>
        {{ $schoolName }}</p>

        <div class="footer">
            <p>This is an automated notification from the {{ $schoolName }} Academic Management System.</p>
            <p>Please do not reply directly to this email. For inquiries, contact the Academic Office.</p>
            <p><small>Generated on {{ now()->format('F d, Y \a\t h:i A') }}</small></p>
        </div>
    </div>
</body>
</html>