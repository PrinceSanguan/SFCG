<?php

/**
 * Test Email Configuration Script
 * This script tests email functionality with Gmail SMTP
 * Run this on your live server to verify email setup
 */

require_once 'vendor/autoload.php';

use Illuminate\Mail\MailManager;
use Illuminate\Mail\Transport\SmtpTransport;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream;

// Gmail SMTP Configuration
$config = [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'hansel.canete24@gmail.com',
    'password' => 'zgvshkdfzsvwdarp',
    'encryption' => 'tls',
    'from_address' => 'hansel.canete24@gmail.com',
    'from_name' => 'SFCG System'
];

echo "Testing Gmail SMTP Configuration...\n";
echo "Host: {$config['host']}\n";
echo "Port: {$config['port']}\n";
echo "Username: {$config['username']}\n";
echo "Encryption: {$config['encryption']}\n";
echo "From: {$config['from_address']}\n\n";

// Test SMTP connection
try {
    $socket = new SocketStream();
    $socket->setHost($config['host']);
    $socket->setPort($config['port']);
    $socket->setEncryption($config['encryption']);
    $socket->setTimeout(30);
    
    echo "Attempting to connect to SMTP server...\n";
    $socket->initialize();
    echo "✅ SMTP connection successful!\n";
    
    $socket->terminate();
    
} catch (Exception $e) {
    echo "❌ SMTP connection failed: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting tips:\n";
    echo "1. Check if port 587 is open on your server\n";
    echo "2. Verify Gmail app password is correct\n";
    echo "3. Ensure 2-factor authentication is enabled on Gmail account\n";
    echo "4. Check if your hosting provider blocks SMTP ports\n";
    exit(1);
}

echo "\n✅ Email configuration test completed successfully!\n";
echo "Your Gmail SMTP setup is working correctly.\n";
echo "\nNext steps:\n";
echo "1. Update your .env file with the Gmail configuration\n";
echo "2. Run: php artisan config:clear\n";
echo "3. Test with: php artisan email:test your-email@example.com\n";
