<?php

namespace App\Imports;

use App\Jobs\SendEmailJob;
use App\Mail\EmailMailable;
use App\Models\Contact;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Group;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ContactEmailImport implements ToCollection, WithHeadingRow
{
    public EmailTemplate $emailTemplate;
    public int $userId;
    public int $totalProcessed = 0;
    public int $totalSent = 0;
    public int $totalFailed = 0;
    public int $totalSkipped = 0;
    public array $importedContacts = [];

    public function __construct(EmailTemplate $emailTemplate, int $userId)
    {
        $this->emailTemplate = $emailTemplate;
        $this->userId = $userId;
    }

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
        foreach ($collection as $row) {
            $this->totalProcessed++;

            // Skip if email is empty
            if (empty($row['email'])) {
                $this->logEmailFailure($row['email'] ?? '', 'Email is empty');
                continue;
            }

            $email = trim($row['email']);

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->logEmailFailure($email, 'Invalid email format');
                continue;
            }

            try {
                // Check if contact already exists for this user
                $existingContact = Contact::where('email', $email)
                    ->where('user_id', $this->userId)
                    ->first();

                if ($existingContact) {
                    // Skip existing contact
                    $this->totalSkipped++;
                    Log::info("Skipped existing contact: {$email}");
                    continue;
                }

                // Create new contact
                $contact = Contact::create([
                    'email' => $email,
                    'user_id' => $this->userId,
                    'name' => $row['name'] ?? $this->extractNameFromEmail($email),
                    'mobile' => $row['mobile'] ?? null,
                    'gender' => $row['gender'] ?? null,
                ]);

                // Track newly imported contact for group assignment
                $this->importedContacts[] = $contact->id;

                // Create email log entry
                $emailLog = EmailLog::create([
                    'email_template_id' => $this->emailTemplate->id,
                    'contact_id' => $contact->id,
                    'email' => $email,
                    'subject' => $this->emailTemplate->email_subject ?? 'No Subject',
                    'status' => 'pending',
                ]);

                // Send email
                $this->sendEmail($email, $contact, $emailLog);
            } catch (\Exception $e) {
                $this->logEmailFailure($email, $e->getMessage());
                Log::error("Failed to process contact {$email}: " . $e->getMessage());
            }
        }

        // Create automatic group for imported contacts
        $this->createAutomaticGroup();

        // Log summary
        Log::info("CSV Import Summary for Template {$this->emailTemplate->id}: Total: {$this->totalProcessed}, New: " . count($this->importedContacts) . ", Sent: {$this->totalSent}, Failed: {$this->totalFailed}, Skipped: {$this->totalSkipped}");

        // Touch summary timestamp
        try {
            $this->emailTemplate->update([
                'last_import_summary_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update email template summary timestamp: ' . $e->getMessage());
        }
    }

    /**
     * Send email to contact
     */
    private function sendEmail(string $email, Contact $contact, EmailLog $emailLog): void
    {
        try {
            $subject = $this->emailTemplate->email_subject ?? 'No Subject';
            $content = $this->emailTemplate->mail_content ?? '';

            // Replace placeholders in content
            $content = str_replace('{{name}}', $contact->name, $content);
            $content = str_replace('{{email}}', $contact->email, $content);
            $content = str_replace('{{mobile}}', $contact->mobile ?? '', $content);

            Mail::to($email)->send(new EmailMailable(
                $subject,
                $content,
                $this->emailTemplate->from_name,
                $this->emailTemplate->reply_to_email
            ));

            // Update email log
            $emailLog->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $this->totalSent++;
            Log::info("Email sent successfully to: {$email}");

            // Realtime counters: increment on template
            try {
                $this->emailTemplate->increment('total_processed');
                $this->emailTemplate->increment('total_sent');
            } catch (\Exception $e) {
                Log::warning('Failed to increment sent counters: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            // Update email log with failure
            $emailLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->totalFailed++;
            Log::error("Failed to send email to {$email}: " . $e->getMessage());

            // Realtime counters: increment on template
            try {
                $this->emailTemplate->increment('total_processed');
                $this->emailTemplate->increment('total_failed');
            } catch (\Exception $e2) {
                Log::warning('Failed to increment failed counters: ' . $e2->getMessage());
            }
        }
    }

    /**
     * Log email failure
     */
    private function logEmailFailure(string $email, string $errorMessage): void
    {
        try {
            EmailLog::create([
                'email_template_id' => $this->emailTemplate->id,
                'contact_id' => null,
                'email' => $email,
                'subject' => $this->emailTemplate->email_subject ?? 'No Subject',
                'status' => 'failed',
                'error_message' => $errorMessage,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log email failure for {$email}: " . $e->getMessage());
        }

        $this->totalFailed++;

        // Realtime counters: increment on template
        try {
            $this->emailTemplate->increment('total_processed');
            $this->emailTemplate->increment('total_failed');
        } catch (\Exception $e2) {
            Log::warning('Failed to increment failure counters for invalid row: ' . $e2->getMessage());
        }
    }

    /**
     * Extract name from email address
     */
    private function extractNameFromEmail(string $email): string
    {
        $localPart = explode('@', $email)[0];

        // Convert common patterns
        $name = str_replace(['.', '_', '-'], ' ', $localPart);
        $name = ucwords($name);

        return $name;
    }

    /**
     * Create automatic group for newly imported contacts
     */
    public function createAutomaticGroup(): void
    {
        try {
            // Only create group if we have newly imported contacts
            if (empty($this->importedContacts)) {
                Log::info('No new contacts imported, skipping group creation');
                return;
            }

            // Get the next group number for this user
            $groupCount = Group::where('user_id', $this->userId)->count();
            $groupNumber = $groupCount + 1;

            // Create the group
            $group = Group::create([
                'name' => "Group {$groupNumber}",
                'description' => "Auto-generated group from CSV import for Email Template: {$this->emailTemplate->name} (New contacts only)",
                'color' => $this->getRandomColor(),
                'user_id' => $this->userId,
            ]);

            // Attach all newly imported contacts to the group
            $group->contacts()->attach($this->importedContacts);

            Log::info("Created automatic group '{$group->name}' with " . count($this->importedContacts) . " new contacts for user {$this->userId}");
        } catch (\Exception $e) {
            Log::error('Failed to create automatic group: ' . $e->getMessage());
        }
    }

    /**
     * Get a random color for the group
     */
    private function getRandomColor(): string
    {
        $colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16', // Lime
        ];

        return $colors[array_rand($colors)];
    }
}
