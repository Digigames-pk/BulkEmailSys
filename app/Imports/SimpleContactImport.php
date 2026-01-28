<?php

namespace App\Imports;

use App\Models\Contact;
use App\Models\Group;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SimpleContactImport implements ToCollection, WithHeadingRow
{
    public int $userId;
    public int $groupId;
    public int $totalProcessed = 0;
    public int $totalImported = 0;
    public int $totalSkipped = 0;
    public int $totalFailed = 0;

    public function __construct(int $userId, int $groupId)
    {
        $this->userId = $userId;
        $this->groupId = $groupId;
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
                // Clean up the key (remove empty spaces, punctuation, and normalize)
                $cleanKey = strtolower(trim($key));
                // Remove common punctuation and extra spaces
                $cleanKey = preg_replace('/[^\w\s]/', '', $cleanKey);
                $cleanKey = preg_replace('/\s+/', ' ', $cleanKey);
                $cleanKey = trim($cleanKey);
                // Only add non-empty keys
                if (!empty($cleanKey)) {
                    $normalizedRow[$cleanKey] = trim($value);
                }
            }

            // Dynamically find email column (handles: email, email address, emailaddress, etc.)
            $email = $this->findColumnValue($normalizedRow, [
                'email',
                'emailaddress',
                'email address',
                'e mail',
                'e-mail',
                'mail',
            ]);

            // Skip if email is empty or null
            if (empty($email)) {
                $this->totalFailed++;
                Log::warning('Skipped row: Email is empty');
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

                // Dynamically find name column
                $name = $this->findColumnValue($normalizedRow, [
                    'name',
                    'full name',
                    'fullname',
                    'contact name',
                    'contactname',
                ]);

                // Dynamically find mobile/phone column
                $mobile = $this->findColumnValue($normalizedRow, [
                    'mobile',
                    'phone',
                    'contact no',
                    'contactno',
                    'contact number',
                    'contactnumber',
                    'phone number',
                    'phonenumber',
                    'tel',
                    'telephone',
                ]);

                // Dynamically find gender column
                $gender = $this->findColumnValue($normalizedRow, [
                    'gender',
                    'sex',
                ]);

                // Create new contact
                $contact = Contact::create([
                    'email' => $email,
                    'user_id' => $this->userId,
                    'name' => !empty($name) ? $name : $this->extractNameFromEmail($email),
                    'mobile' => !empty($mobile) ? $mobile : null,
                    'gender' => !empty($gender) ? $gender : null,
                ]);

                // Assign contact to the group
                $group = Group::find($this->groupId);
                if ($group) {
                    $group->contacts()->attach($contact->id);
                    Log::info("Assigned contact {$email} to group {$group->name}");
                }

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
     * Find column value by checking multiple possible column name variations
     * 
     * @param array $normalizedRow
     * @param array $possibleNames
     * @return string|null
     */
    private function findColumnValue(array $normalizedRow, array $possibleNames): ?string
    {
        // First, try exact matches
        foreach ($possibleNames as $name) {
            if (isset($normalizedRow[$name]) && !empty(trim($normalizedRow[$name]))) {
                return trim($normalizedRow[$name]);
            }
        }
        
        // Then, try normalized matches (remove spaces and special chars)
        foreach ($possibleNames as $name) {
            $normalizedName = preg_replace('/[^\w]/', '', strtolower($name));
            
            foreach ($normalizedRow as $key => $value) {
                if (empty(trim($value))) {
                    continue;
                }
                
                // Normalize the key the same way
                $normalizedKey = preg_replace('/[^\w]/', '', strtolower($key));
                
                // Exact normalized match (e.g., "email address" -> "emailaddress" matches "email")
                if ($normalizedKey === $normalizedName) {
                    return trim($value);
                }
                
                // Contains match (e.g., "email address" contains "email")
                if (strlen($normalizedName) >= 3 && strpos($normalizedKey, $normalizedName) !== false) {
                    return trim($value);
                }
                
                // Reverse contains (e.g., "email" is contained in "emailaddress")
                if (strlen($normalizedKey) >= 3 && strpos($normalizedName, $normalizedKey) !== false) {
                    return trim($value);
                }
            }
        }
        
        return null;
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
