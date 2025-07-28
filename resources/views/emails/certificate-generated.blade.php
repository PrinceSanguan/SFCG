<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Ready</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        .certificate-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .download-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #e7f3ff;
            border-radius: 8px;
        }
        .btn {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 15px;
        }
        .btn:hover {
            background: #218838;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="icon">📜</div>
        <h1>Certificate Ready!</h1>
        @if($isParentNotification)
            <p>Your child's certificate has been generated</p>
        @else
            <p>Your certificate is ready for download</p>
        @endif
    </div>

    <div class="content">
        @if($isParentNotification)
            <h2>Dear Parent/Guardian,</h2>
            <p>We are pleased to inform you that a <strong>{{ $certificateType }}</strong> has been generated for your child, <strong>{{ $student->name }}</strong>, for the {{ $periodName }}.</p>
        @else
            <h2>Dear {{ $student->name }},</h2>
            <p>Great news! Your <strong>{{ $certificateType }}</strong> for the {{ $periodName }} has been generated and is now ready for download.</p>
        @endif

        <div class="certificate-info">
            <h3>Certificate Details:</h3>
            <ul>
                <li><strong>Student:</strong> {{ $student->name }}</li>
                <li><strong>Certificate Type:</strong> {{ $certificateType }}</li>
                <li><strong>Academic Period:</strong> {{ $periodName }}</li>
                <li><strong>Certificate Number:</strong> {{ $certificate->certificate_number }}</li>
                <li><strong>Generated Date:</strong> {{ $certificate->generated_at->format('F j, Y') }}</li>
                @if($certificate->is_digitally_signed)
                    <li><strong>Status:</strong> ✅ Digitally Signed</li>
                @else
                    <li><strong>Status:</strong> ⏳ Pending Digital Signature</li>
                @endif
            </ul>
        </div>

        <div class="download-section">
            <h3>📥 Download Your Certificate</h3>
            <p>Click the button below to download your certificate in PDF format:</p>
            <a href="{{ $downloadUrl }}" class="btn">Download Certificate</a>
            <p style="font-size: 14px; margin-top: 15px;">
                <em>Note: This link will remain active and you can download your certificate at any time.</em>
            </p>
        </div>

        @if(!$isParentNotification)
            <p><strong>Important Information:</strong></p>
            <ul>
                <li>Save your certificate in a secure location</li>
                <li>You may print additional copies as needed</li>
                <li>This certificate is digitally verifiable through our system</li>
                <li>Keep your certificate number for future reference</li>
            </ul>

            <p>Congratulations once again on this achievement! This certificate represents your hard work and academic excellence.</p>
        @else
            <p><strong>For Your Information:</strong></p>
            <ul>
                <li>You can download and print the certificate for your records</li>
                <li>The certificate is digitally verifiable through our system</li>
                <li>Please keep the certificate number for future reference</li>
                <li>Additional copies can be downloaded at any time</li>
            </ul>

            <p>Please congratulate your child on this wonderful achievement!</p>
        @endif
    </div>

    <div class="footer">
        <p>This is an automated notification from the Honor Student Tracking & Certificate Management System.</p>
        <p>If you have any questions or issues downloading your certificate, please contact the academic office.</p>
        <p><strong>Certificate Number:</strong> {{ $certificate->certificate_number }}</p>
    </div>
</body>
</html> 