<?php

/**
 * Script to fix queue configuration on live server
 * This will make emails send immediately instead of being queued
 */

echo "=== FIXING QUEUE CONFIGURATION ===\n\n";

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

// Process each line
$newEnvLines = [];
$queueUpdated = false;

foreach ($envLines as $line) {
    $trimmedLine = trim($line);
    
    // Skip empty lines and comments
    if (empty($trimmedLine) || str_starts_with($trimmedLine, '#')) {
        $newEnvLines[] = $line;
        continue;
    }
    
    // Check if this line contains QUEUE_CONNECTION
    if (strpos($line, 'QUEUE_CONNECTION=') !== false) {
        $newEnvLines[] = "QUEUE_CONNECTION=sync";
        $queueUpdated = true;
        echo "✅ Updated QUEUE_CONNECTION to 'sync'\n";
    } else {
        $newEnvLines[] = $line;
    }
}

// Add QUEUE_CONNECTION if it doesn't exist
if (!$queueUpdated) {
    $newEnvLines[] = "QUEUE_CONNECTION=sync";
    echo "✅ Added QUEUE_CONNECTION=sync\n";
}

// Write the updated .env file
$newEnvContent = implode("\n", $newEnvLines);
if (file_put_contents('.env', $newEnvContent)) {
    echo "\n✅ .env file updated successfully!\n";
} else {
    echo "\n❌ Failed to update .env file\n";
    exit(1);
}

echo "\n=== WHAT THIS FIXES ===\n";
echo "Your mail classes implement 'ShouldQueue', which means:\n";
echo "- Emails are queued instead of sent immediately\n";
echo "- On live server, they wait for a queue worker\n";
echo "- With QUEUE_CONNECTION=sync, emails send immediately\n";

echo "\n=== NEXT STEPS ===\n";
echo "1. Clear Laravel caches:\n";
echo "   php artisan config:clear\n";
echo "   php artisan cache:clear\n";
echo "\n2. Test email functionality:\n";
echo "   php artisan email:test hansel.canete24@gmail.com\n";
echo "\n3. Check if emails are now sending immediately!\n";

echo "\n=== FIX COMPLETE ===\n";
echo "Emails should now work on your live server!\n";
