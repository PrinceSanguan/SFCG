<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-user 
                           {--name= : The name of the admin user}
                           {--email= : The email of the admin user}
                           {--password= : The password for the admin user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user for the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🎓 Creating Admin User for School Management System');
        $this->info('================================================');

        // Get user input
        $name = $this->option('name') ?: $this->ask('Enter admin name');
        $email = $this->option('email') ?: $this->ask('Enter admin email');
        $password = $this->option('password') ?: $this->secret('Enter admin password');

        // Validate input
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error('  • ' . $error);
            }
            return 1;
        }

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error("❌ User with email {$email} already exists!");
            return 1;
        }

        // Create the admin user
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'user_role' => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->info('✅ Admin user created successfully!');
            $this->info('');
            $this->info('📋 User Details:');
            $this->info("   Name: {$user->name}");
            $this->info("   Email: {$user->email}");
            $this->info("   Role: {$user->user_role}");
            $this->info("   ID: {$user->id}");
            $this->info('');
            $this->info('🚀 You can now login to the admin dashboard at:');
            $this->info('   URL: ' . url('/admin/dashboard'));
            $this->info("   Email: {$email}");
            $this->info('   Password: [hidden for security]');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to create admin user: ' . $e->getMessage());
            return 1;
        }
    }
}
