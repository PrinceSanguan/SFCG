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
            background-color: #f5f5f5;
            font-family: 'Times New Roman', serif;
        }

        .certificate-wrapper {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }

        .certificate-display {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* Logo styling for certificates */
        .certificate-display img[alt="School Logo"] {
            display: block;
            margin: 0 auto;
            max-width: 120px;
            max-height: 120px;
            object-fit: contain;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .certificate-wrapper {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate-display">
            {!! $html !!}
        </div>
    </div>
</body>
</html>
