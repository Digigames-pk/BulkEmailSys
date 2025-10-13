<?php

namespace App\Jobs;

use App\Models\EmailCampaign;
use App\Models\EmailLog;
use App\Mail\EmailMailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBulkEmailJob implements ShouldQueue
{
    use Queueable;

    public EmailCampaign $campaign;

    /**
     * Create a new job instance.
     */
    public function __construct(EmailCampaign $campaign)
    {
        $this->campaign = $campaign;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->campaign->load(['emailTemplate', 'group.contacts']);

            $contacts = $this->campaign->group->contacts;
            $template = $this->campaign->emailTemplate;

            $sentCount = 0;
            $failedCount = 0;

            foreach ($contacts as $contact) {
                try {
                    // Create email log entry
                    $emailLog = EmailLog::create([
                        'email_campaign_id' => $this->campaign->id,
                        'email_template_id' => $template->id,
                        'contact_id' => $contact->id,
                        'email' => $contact->email,
                        'subject' => $this->campaign->subject,
                        'status' => 'pending',
                        'sent_at' => null,
                    ]);

                    // Send the email
                    Mail::to($contact->email)->send(new EmailMailable(
                        $this->campaign->subject,
                        $template->html_content,
                        $contact->name
                    ));

                    // Update email log as sent
                    $emailLog->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $sentCount++;

                    Log::info("Email sent successfully to: {$contact->email}", [
                        'campaign_id' => $this->campaign->id,
                        'contact_id' => $contact->id,
                    ]);
                } catch (\Exception $e) {
                    // Update email log as failed
                    if (isset($emailLog)) {
                        $emailLog->update([
                            'status' => 'failed',
                            'error_message' => $e->getMessage(),
                        ]);
                    }

                    $failedCount++;

                    Log::error("Failed to send email to {$contact->email}", [
                        'campaign_id' => $this->campaign->id,
                        'contact_id' => $contact->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Update campaign status
            $this->campaign->update([
                'status' => $failedCount > 0 ? 'failed' : 'sent',
                'sent_at' => now(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
            ]);

            Log::info("Email campaign completed", [
                'campaign_id' => $this->campaign->id,
                'campaign_name' => $this->campaign->name,
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
            ]);
        } catch (\Exception $e) {
            // Update campaign status to failed
            $this->campaign->update([
                'status' => 'failed',
                'failed_count' => $this->campaign->total_recipients,
            ]);

            Log::error("Email campaign failed", [
                'campaign_id' => $this->campaign->id,
                'campaign_name' => $this->campaign->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
