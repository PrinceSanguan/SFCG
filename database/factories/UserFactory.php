<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Counter for generating unique names and emails
     */
    protected static int $counter = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static::$counter++;
        
        $roles = ['student', 'parent', 'teacher', 'instructor', 'adviser', 'registrar'];
        $role = $roles[static::$counter % count($roles)];
        
        return [
            'name' => 'User ' . static::$counter,
            'email' => 'user' . static::$counter . '@example.com',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'user_role' => $role,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Set a specific role for the user
     */
    public function role(string $role): static
    {
        return $this->state(fn (array $attributes) => [
            'user_role' => $role,
        ]);
    }
}
