<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Bulk Certificates</title>
    <style>
        @page {
            margin: 20px;
            size: A4 landscape;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
            margin: 0;
            padding: 0;
        }
        .certificate-container {
            padding: 12px;
            width: 100%;
            min-height: 100vh;
            page-break-inside: avoid;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    {!! $html !!}
</body>
</html>