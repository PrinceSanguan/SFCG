<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Bulk Certificates</title>
    <style>
        @page {
            margin: 30px;
            size: A4 portrait;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
            margin: 0;
            padding: 0;
        }
        .certificate-container {
            max-width: 100%;
            margin: 0 auto;
            text-align: center;
            page-break-inside: avoid;
        }
        .page-break {
            page-break-after: always;
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
    </style>
</head>
<body>
    {!! $html !!}
</body>
</html>