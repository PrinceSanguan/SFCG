<?php

namespace App\Console\Commands;

use App\Mail\WelcomeEmail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

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
    protected $description = 'Test email functionality by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address provided.');
            return 1;
        }

        try {
            // Get the first user or create a test user
            $user = User::first();
            
            if (!$user) {
                $this->error('No users found in database. Please create a user first.');
                return 1;
            }

            $this->info("Sending test email to: {$email}");
            $this->info("Using mailer: " . config('mail.default'));
            $this->info("From address: " . config('mail.from.address'));
            $this->info("SMTP Host: " . config('mail.mailers.gmail.host'));
            $this->info("SMTP Port: " . config('mail.mailers.gmail.port'));
            $this->info("Queue Connection: " . config('queue.default'));
            
            if (config('queue.default') !== 'sync') {
                $this->warn("⚠️  WARNING: Queue is not 'sync' - emails will be queued!");
                $this->warn("   Set QUEUE_CONNECTION=sync in .env for immediate sending");
            }

            // Send the email
            Mail::to($email)->send(new WelcomeEmail($user));

            $this->info('✅ Test email sent successfully!');
            $this->info('Check your inbox and spam folder.');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            
            return 1;
        }
    }
}
