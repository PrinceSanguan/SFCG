<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - {{ $certificate->serial_number }}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Times New Roman', serif;
            background-color: #f5f5f5;
        }
        
        .certificate-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .certificate-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .certificate-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .certificate-header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        
        .certificate-content {
            padding: 40px;
        }
        
        .certificate-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .certificate-info h3 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 18px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #495057;
            font-weight: 600;
        }
        
        .certificate-display {
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            background: white;
            min-height: 400px;
            overflow-x: auto;
            text-align: center;
        }

        /* Logo styling for certificates */
        .certificate-display img[alt="School Logo"] {
            display: block;
            margin: 0 auto 20px auto;
            max-width: 100px;
            max-height: 100px;
            object-fit: contain;
        }
        
        .no-download-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
            color: #856404;
        }
        
        .no-download-notice .icon {
            font-size: 24px;
            margin-bottom: 10px;
        }

        @media print {
            .certificate-header,
            .certificate-info,
            .no-download-notice {
                display: none;
            }
            
            .certificate-display {
                border: none;
                padding: 0;
            }
            
            body {
                background: white;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-header">
            <h1>🎓 Honor Certificate</h1>
            <p>View Only - No Download Available</p>
        </div>
        
        <div class="certificate-content">
            <div class="certificate-info">
                <h3>Certificate Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Serial Number</span>
                        <span class="info-value">{{ $certificate->serial_number }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Student</span>
                        <span class="info-value">{{ $certificate->student->name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Academic Level</span>
                        <span class="info-value">{{ $certificate->academicLevel->name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">School Year</span>
                        <span class="info-value">{{ $certificate->school_year }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Generated On</span>
                        <span class="info-value">{{ $certificate->generated_at?->format('M j, Y') ?? 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value">{{ ucfirst($certificate->status) }}</span>
                    </div>
                </div>
            </div>
            
            <h4 style="text-align: center; color: #495057; margin-bottom: 15px;">Certificate Preview</h4>

            <div class="certificate-display">
                {{-- Add school logo at top of certificate to match admin/registrar view --}}
                {!! \App\Helpers\CertificateLogoHelper::getCenteredLogoHtml(100, 100, 20) !!}

                {!! $html !!}
            </div>
            
            <div class="no-download-notice">
                <div class="icon">🔒</div>
                <strong>View Only</strong><br>
                This certificate is displayed for viewing purposes only.
                Download functionality is not available to maintain the integrity of the document.
            </div>
        </div>
    </div>
</body>
</html>

