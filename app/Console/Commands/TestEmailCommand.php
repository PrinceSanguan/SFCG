<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $testEmail = $this->argument('email');
        
        if (!filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
            $this->error('Please provide a valid email address.');
            return 1;
        }

        $this->info('Testing email configuration...');
        $this->info('Mail Driver: ' . config('mail.default'));
        $this->info('Gmail Username: ' . config('mail.mailers.gmail.username'));
        $this->info('From Address: ' . config('mail.from.address'));
        $this->info('From Name: ' . config('mail.from.name'));

        try {
            Mail::raw('This is a test email from SFCG. If you receive this, your email configuration is working correctly!', function ($message) use ($testEmail) {
                $message->to($testEmail)
                        ->subject('SFCG Email Test - ' . now()->format('Y-m-d H:i:s'));
            });

            $this->info('✅ Test email sent successfully to: ' . $testEmail);
            $this->info('Please check your inbox (and spam folder) for the test email.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email: ' . $e->getMessage());
            Log::error('Email test failed: ' . $e->getMessage());
            
            return 1;
        }
    }
}
