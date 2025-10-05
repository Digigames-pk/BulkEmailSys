<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateApiToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:token {email? : User email to generate token for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate an API token for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        if (!$email) {
            $email = $this->ask('Enter user email');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        // Delete existing tokens for this user
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('api-test-token')->plainTextToken;

        $this->info("API Token generated for user: {$user->name} ({$user->email})");
        $this->line("Token: {$token}");
        $this->line("");
        $this->line("You can now use this token to test the API endpoints.");
        $this->line("Example curl command:");
        $this->line("curl -H \"Authorization: Bearer {$token}\" -H \"Accept: application/json\" http://localhost:8000/api/email-templates");

        return 0;
    }
}
