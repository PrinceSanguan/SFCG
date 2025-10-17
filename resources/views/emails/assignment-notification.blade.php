<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ ucfirst($assignmentType) }} Assignment Notification</title>
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
            background-color: #28a745;
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
        .details-box {
            background-color: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
        }
        .details-box .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .details-box .detail-row:last-child {
            border-bottom: none;
        }
        .details-box .detail-label {
            font-weight: bold;
            min-width: 150px;
            color: #555;
        }
        .details-box .detail-value {
            flex: 1;
            color: #333;
        }
        .highlight {
            background-color: #d4edda;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #28a745;
            margin: 15px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
            font-weight: bold;
        }
        .cta-button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 {{ ucfirst($assignmentType) }} Assignment Notification</h1>
        <p>New Assignment Notification</p>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $user->name }}</strong>,</p>

        <div class="highlight">
            <strong>You have been assigned as a {{ ucfirst($assignmentType) }}!</strong>
        </div>

        <p>This is to inform you that you have been assigned to teach/advise the following:</p>

        <div class="details-box">
            @if(isset($assignmentDetails['subject_name']))
                <div class="detail-row">
                    <span class="detail-label">Subject:</span>
                    <span class="detail-value">{{ $assignmentDetails['subject_name'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['course_name']))
                <div class="detail-row">
                    <span class="detail-label">Course:</span>
                    <span class="detail-value">{{ $assignmentDetails['course_name'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['department_name']))
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">{{ $assignmentDetails['department_name'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['section_name']))
                <div class="detail-row">
                    <span class="detail-label">Section:</span>
                    <span class="detail-value">{{ $assignmentDetails['section_name'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['academic_level']))
                <div class="detail-row">
                    <span class="detail-label">Academic Level:</span>
                    <span class="detail-value">{{ $assignmentDetails['academic_level'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['year_level']))
                <div class="detail-row">
                    <span class="detail-label">Year Level:</span>
                    <span class="detail-value">{{ ucfirst(str_replace('_', ' ', $assignmentDetails['year_level'])) }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['grade_level']))
                <div class="detail-row">
                    <span class="detail-label">Grade Level:</span>
                    <span class="detail-value">{{ ucfirst(str_replace('_', ' ', $assignmentDetails['grade_level'])) }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['school_year']))
                <div class="detail-row">
                    <span class="detail-label">School Year:</span>
                    <span class="detail-value">{{ $assignmentDetails['school_year'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['grading_period']))
                <div class="detail-row">
                    <span class="detail-label">Grading Period:</span>
                    <span class="detail-value">{{ $assignmentDetails['grading_period'] }}</span>
                </div>
            @endif

            @if(isset($assignmentDetails['notes']) && $assignmentDetails['notes'])
                <div class="detail-row">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">{{ $assignmentDetails['notes'] }}</span>
                </div>
            @endif
        </div>

        <p>Please log in to the system to view your complete assignment details and begin your responsibilities.</p>

        <center>
            <a href="{{ url('/login') }}" class="cta-button">View Assignment Details</a>
        </center>

        <p style="margin-top: 20px;">If you have any questions about this assignment, please contact the administration office.</p>

        <p>Best regards,<br>
        <strong>School Administration</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated notification from the School Management System.</p>
        <p>Please do not reply to this email. Contact your school administration for support.</p>
    </div>
</body>
</html>
