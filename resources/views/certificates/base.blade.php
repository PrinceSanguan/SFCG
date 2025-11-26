<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Certificate</title>
    <style>
        @page {
            margin: 0;
            size: A4 portrait;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        html {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
        }
        .certificate-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
            box-sizing: border-box;
        }
        /* Logo styling for certificates */
        img[alt="School Logo"] {
            display: block;
            margin: 0 auto;
            max-width: 100px;
            max-height: 100px;
            object-fit: cover;
            border-radius: 50%;
        }
        /* Helper classes for full-page certificates */
        .certificate-full-page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .certificate-full-page-content {
            width: 100%;
            height: 100%;
            background-color: #F5E6D3;
            padding: 15mm;
            box-sizing: border-box;
        }
        /* Push certificate to maximum safe height */
        body > div[style*="margin"] {
            margin: 0 auto !important;
            width: 96% !important;
            max-width: 96% !important;
            min-height: 290mm !important;
            max-height: 290mm !important;
            padding: 3px !important;
            box-sizing: border-box !important;
        }
        /* Maintain consistent inner border spacing */
        body > div[style*="margin"] > table {
            padding: 25px !important;
        }
    </style>
</head>
<body>
    {!! $html !!}
</body>
</html>




