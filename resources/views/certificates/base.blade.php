<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Certificate</title>
    <style>
        @page { margin: 30px; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
        }
        .certificate-container {
            padding: 12px;
        }
        /* Logo styling for certificates */
        img[alt="School Logo"] {
            display: block;
            margin: 0 auto;
            max-width: 80px;
            max-height: 80px;
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




