<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System Maintenance - {{ config('app.name', 'Laravel') }}</title>
    
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Instrument Sans', sans-serif;
            background-image: url('/image/background.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .maintenance-container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: #f8f9fa;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #e9ecef;
            overflow: hidden;
        }
        
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
        }
        
        .maintenance-title {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .maintenance-message {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #fff3cd;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            border: 1px solid #ffeaa7;
            font-size: 0.9rem;
            font-weight: 500;
            color: #856404;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            background: #ffc107;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .admin-login {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
        }
        
        .admin-login a {
            color: white;
            text-decoration: none;
            background: #007bff;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #0056b3;
            transition: all 0.3s ease;
            display: inline-block;
            font-weight: 500;
        }
        
        .admin-login a:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        
        @media (max-width: 768px) {
            .maintenance-container {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .maintenance-title {
                font-size: 2rem;
            }
            
            .maintenance-message {
                font-size: 1.1rem;
            }
            
            .logo {
                width: 100px;
                height: 100px;
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="maintenance-container">
        <div class="logo">
            <img src="/image/logo.jpg" alt="School Logo" />
        </div>
        
        <h1 class="maintenance-title">System Maintenance</h1>
        
        <p class="maintenance-message">
            We're currently performing maintenance. The system will be back online shortly.
        </p>
        
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Maintenance in Progress</span>
        </div>
        
        <div class="admin-login">
            <a href="{{ route('auth.login') }}">Admin Login</a>
        </div>
    </div>
</body>
</html>
