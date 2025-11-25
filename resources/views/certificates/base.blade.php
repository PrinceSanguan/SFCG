<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Certificate</title>
    <style>
        @page {
            margin: 30px;
            size: A4 portrait;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
        }
        .certificate-container {
            max-width: 100%;
            margin: 0 auto;
            text-align: center;
            page-break-inside: avoid;
        }
        /* Logo styling for certificates */
        img[alt="School Logo"] {
            display: block;
            margin: 0 auto;
            max-width: 100px;
            max-height: 100px;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        {!! $html !!}
    </div>
</body>
</html>




