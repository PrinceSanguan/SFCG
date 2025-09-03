<?php

/**
 * Email Configuration Diagnostic Script
 * Run this on your live server to diagnose email issues
 */

echo "=== EMAIL CONFIGURATION DIAGNOSTIC ===\n\n";

// Check if .env file exists
if (!file_exists('.env')) {
    echo "❌ .env file not found!\n";
    exit(1);
}

// Load environment variables
$envContent = file_get_contents('.env');
$envLines = explode("\n", $envContent);

echo "1. ENVIRONMENT FILE CHECK:\n";
$requiredVars = [
    'MAIL_MAILER' => 'gmail',
    'MAIL_HOST' => 'smtp.gmail.com',
    'MAIL_PORT' => '587',
    'MAIL_USERNAME' => 'hansel.canete24@gmail.com',
    'MAIL_PASSWORD' => 'zgvshkdfzsvwdarp',
    'MAIL_ENCRYPTION' => 'tls',
    'MAIL_FROM_ADDRESS' => 'hansel.canete24@gmail.com',
    'MAIL_FROM_NAME' => 'SFCG System'
];

$envVars = [];
foreach ($envLines as $line) {
    if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
        list($key, $value) = explode('=', $line, 2);
        $envVars[trim($key)] = trim($value, '"\'');
    }
}

foreach ($requiredVars as $var => $expected) {
    if (isset($envVars[$var])) {
        if ($var === 'MAIL_PASSWORD') {
            echo "✅ {$var}: " . (strlen($envVars[$var]) > 0 ? "SET (length: " . strlen($envVars[$var]) . ")" : "NOT SET") . "\n";
        } else {
            $status = ($envVars[$var] === $expected) ? "✅" : "⚠️";
            echo "{$status} {$var}: {$envVars[$var]}\n";
        }
    } else {
        echo "❌ {$var}: NOT SET\n";
    }
}

echo "\n2. LARAVEL CONFIGURATION CHECK:\n";

// Check if Laravel is properly loaded
if (file_exists('vendor/autoload.php')) {
    require_once 'vendor/autoload.php';
    
    // Bootstrap Laravel
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "✅ Laravel loaded successfully\n";
    
    // Check mail configuration
    $mailConfig = config('mail');
    echo "✅ Mail config loaded\n";
    echo "   Default mailer: " . config('mail.default') . "\n";
    echo "   Gmail host: " . config('mail.mailers.gmail.host') . "\n";
    echo "   Gmail port: " . config('mail.mailers.gmail.port') . "\n";
    echo "   Gmail encryption: " . config('mail.mailers.gmail.encryption') . "\n";
    echo "   From address: " . config('mail.from.address') . "\n";
    
} else {
    echo "❌ Laravel not found (vendor/autoload.php missing)\n";
}

echo "\n3. SMTP CONNECTION TEST:\n";

try {
    $socket = @fsockopen('smtp.gmail.com', 587, $errno, $errstr, 10);
    if ($socket) {
        echo "✅ SMTP connection to smtp.gmail.com:587 successful\n";
        fclose($socket);
    } else {
        echo "❌ SMTP connection failed: {$errstr} ({$errno})\n";
        echo "   This might indicate port 587 is blocked\n";
    }
} catch (Exception $e) {
    echo "❌ SMTP connection test failed: " . $e->getMessage() . "\n";
}

echo "\n4. ALTERNATIVE PORT TEST:\n";

try {
    $socket = @fsockopen('smtp.gmail.com', 465, $errno, $errstr, 10);
    if ($socket) {
        echo "✅ SMTP connection to smtp.gmail.com:465 successful\n";
        fclose($socket);
    } else {
        echo "❌ SMTP connection to port 465 failed: {$errstr} ({$errno})\n";
    }
} catch (Exception $e) {
    echo "❌ Port 465 test failed: " . $e->getMessage() . "\n";
}

echo "\n5. RECOMMENDATIONS:\n";

if (isset($envVars['MAIL_MAILER']) && $envVars['MAIL_MAILER'] !== 'gmail') {
    echo "⚠️  MAIL_MAILER is not set to 'gmail'\n";
}

if (isset($envVars['MAIL_PASSWORD']) && strpos($envVars['MAIL_PASSWORD'], ' ') !== false) {
    echo "⚠️  MAIL_PASSWORD contains spaces - remove them!\n";
}

if (isset($envVars['APP_ENV']) && $envVars['APP_ENV'] !== 'production') {
    echo "⚠️  APP_ENV should be 'production' on live server\n";
}

if (isset($envVars['APP_DEBUG']) && $envVars['APP_DEBUG'] !== 'false') {
    echo "⚠️  APP_DEBUG should be 'false' on live server\n";
}

echo "\n=== DIAGNOSTIC COMPLETE ===\n";
echo "If issues persist, check the LIVE_SERVER_EMAIL_FIX.md guide\n";
