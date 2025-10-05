<?php

namespace App\Jobs;

use App\Models\Contact;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ContactEmailImport;

class ProcessCsvImportJob implements ShouldQueue
{
    use Queueable;

    public EmailTemplate $emailTemplate;
    public int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(EmailTemplate $emailTemplate, int $userId)
    {
        $this->emailTemplate = $emailTemplate;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if (!$this->emailTemplate->csv_file) {
                Log::error('No CSV file found for email template: ' . $this->emailTemplate->id);
                return;
            }

            $csvPath = Storage::disk('public')->path($this->emailTemplate->csv_file);

            if (!file_exists($csvPath)) {
                Log::error('CSV file not found at path: ' . $csvPath);
                return;
            }

            // Import contacts and send emails
            Excel::import(new ContactEmailImport($this->emailTemplate, $this->userId), $csvPath);

            Log::info('CSV import completed for email template: ' . $this->emailTemplate->id);
        } catch (\Exception $e) {
            Log::error('Error processing CSV import: ' . $e->getMessage());
        }
    }
}
