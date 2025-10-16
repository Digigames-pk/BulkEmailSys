<?php

namespace App\Imports;

use App\Models\Contact;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SimpleContactImport implements ToCollection, WithHeadingRow
{
    public int $userId;
    public int $totalProcessed = 0;
    public int $totalImported = 0;
    public int $totalSkipped = 0;
    public int $totalFailed = 0;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
        Log::info('Starting CSV import', [
            'user_id' => $this->userId,
            'total_rows' => $collection->count(),
            'first_row' => $collection->first(),
        ]);

        foreach ($collection as $row) {
            $this->totalProcessed++;

            // Normalize column names to lowercase for case-insensitive access
            $normalizedRow = [];
            foreach ($row as $key => $value) {
                // Clean up the key (remove empty spaces and normalize)
                $cleanKey = strtolower(trim($key));
                // Only add non-empty keys
                if (!empty($cleanKey)) {
                    $normalizedRow[$cleanKey] = trim($value);
                }
            }

            // Skip if email is empty or null
            if (empty($normalizedRow['email']) || $normalizedRow['email'] === null) {
                $this->totalFailed++;
                Log::warning('Skipped row: Email is empty');
                continue;
            }

            $email = trim($normalizedRow['email']);

            // Skip if email is still empty after trimming
            if (empty($email)) {
                $this->totalFailed++;
                Log::warning('Skipped row: Email is empty after trimming');
                continue;
            }

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->totalFailed++;
                Log::warning("Skipped row: Invalid email format - {$email}");
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
                Contact::create([
                    'email' => $email,
                    'user_id' => $this->userId,
                    'name' => !empty($normalizedRow['name']) ? $normalizedRow['name'] : $this->extractNameFromEmail($email),
                    'mobile' => !empty($normalizedRow['mobile']) ? $normalizedRow['mobile'] : null,
                    'gender' => !empty($normalizedRow['gender']) ? $normalizedRow['gender'] : null,
                ]);

                $this->totalImported++;
                Log::info("Imported contact: {$email}");
            } catch (\Exception $e) {
                $this->totalFailed++;
                Log::error("Failed to import contact {$email}: " . $e->getMessage());
            }
        }

        // Log summary
        Log::info("CSV Import Summary for User {$this->userId}: Total: {$this->totalProcessed}, Imported: {$this->totalImported}, Skipped: {$this->totalSkipped}, Failed: {$this->totalFailed}");
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
}
