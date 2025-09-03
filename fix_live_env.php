<?php

/**
 * Script to fix .env file on live server
 * Run this on your live server to update email configuration
 */

echo "=== FIXING LIVE SERVER .ENV FILE ===\n\n";

// Check if .env file exists
if (!file_exists('.env')) {
    echo "❌ .env file not found!\n";
    exit(1);
}

// Backup current .env file
$backupName = '.env.backup.' . date('Y-m-d_H-i-s');
if (copy('.env', $backupName)) {
    echo "✅ Created backup: {$backupName}\n";
} else {
    echo "❌ Failed to create backup\n";
    exit(1);
}

// Read current .env file
$envContent = file_get_contents('.env');
$envLines = explode("\n", $envContent);

// Email configuration to apply
$emailConfig = [
    'MAIL_MAILER' => 'gmail',
    'MAIL_HOST' => 'smtp.gmail.com',
    'MAIL_PORT' => '587',
    'MAIL_USERNAME' => 'hansel.canete24@gmail.com',
    'MAIL_PASSWORD' => 'zgvshkdfzsvwdarp',
    'MAIL_ENCRYPTION' => 'tls',
    'MAIL_FROM_ADDRESS' => 'hansel.canete24@gmail.com',
    'MAIL_FROM_NAME' => 'SFCG System',
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'false'
];

// Process each line
$newEnvLines = [];
$updatedVars = [];

foreach ($envLines as $line) {
    $trimmedLine = trim($line);
    
    // Skip empty lines and comments
    if (empty($trimmedLine) || str_starts_with($trimmedLine, '#')) {
        $newEnvLines[] = $line;
        continue;
    }
    
    // Check if this line contains a variable we want to update
    if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        
        if (isset($emailConfig[$key])) {
            $newValue = $emailConfig[$key];
            $newEnvLines[] = "{$key}={$newValue}";
            $updatedVars[] = $key;
            echo "✅ Updated {$key}\n";
        } else {
            $newEnvLines[] = $line;
        }
    } else {
        $newEnvLines[] = $line;
    }
}

// Add any missing variables
foreach ($emailConfig as $key => $value) {
    if (!in_array($key, $updatedVars)) {
        $newEnvLines[] = "{$key}={$value}";
        echo "✅ Added {$key}\n";
    }
}

// Write the updated .env file
$newEnvContent = implode("\n", $newEnvLines);
if (file_put_contents('.env', $newEnvContent)) {
    echo "\n✅ .env file updated successfully!\n";
} else {
    echo "\n❌ Failed to update .env file\n";
    exit(1);
}

echo "\n=== NEXT STEPS ===\n";
echo "1. Clear Laravel caches:\n";
echo "   php artisan config:clear\n";
echo "   php artisan cache:clear\n";
echo "\n2. Test email functionality:\n";
echo "   php artisan email:test hansel.canete24@gmail.com\n";
echo "\n3. If still not working, try port 465 with SSL:\n";
echo "   MAIL_PORT=465\n";
echo "   MAIL_ENCRYPTION=ssl\n";
echo "\n4. Check logs:\n";
echo "   tail -f storage/logs/laravel.log\n";

echo "\n=== FIX COMPLETE ===\n";
