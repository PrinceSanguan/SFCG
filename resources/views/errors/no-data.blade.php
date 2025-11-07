<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $message ?? 'No Data Found' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: none;
        }
    </style>
</head>
<body>
    <div data-error-type="no-data" style="display: none;">
        <span class="error-title">{{ $message ?? 'No Data Found' }}</span>
        <span class="error-message">{{ $details ?? 'There is no data available for the selected criteria.' }}</span>
    </div>
</body>
</html>
