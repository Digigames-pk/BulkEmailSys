<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Contact;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use App\Imports\SimpleContactImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $contacts = Contact::where('user_id', Auth::id())
            ->where(function ($q) use ($request) {
                if ($search = $request->get('search')) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                }
            })
            ->orderBy('created_at', 'DESC')
            ->paginate(10);

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => ['nullable', 'string', 'max:255'],
            'email'  => ['required', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
        ]);
        $validated['user_id'] = Auth::id();
        Contact::create($validated);

        return redirect()->route('contacts.index')->with('success', 'Contact created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $contact = Contact::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'name'   => ['nullable', 'string', 'max:255'],
            'email'  => ['required', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
        ]);
        $validated['user_id'] = Auth::id();
        $contact->update($validated);

        return redirect()->route('contacts.index')->with('success', 'Contact updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::where('user_id', Auth::id())->findOrFail($id);
        $contact->delete();

        return redirect()->route('contacts.index')->with('success', 'Contact deleted successfully.');
    }

    /**
     * Import contacts from CSV file
     */
    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file',
        ]);

        try {
            $file = $request->file('csv_file');

            // Debug information
            Log::info('CSV Import Debug', [
                'has_file' => $request->hasFile('csv_file'),
                'filename' => $file ? $file->getClientOriginalName() : 'No file',
                'mime_type' => $file ? $file->getMimeType() : 'No file',
                'extension' => $file ? $file->getClientOriginalExtension() : 'No file',
                'size' => $file ? $file->getSize() : 'No file',
                'all_files' => $request->allFiles(),
            ]);

            if (!$file) {
                return response()->json([
                    'success' => false,
                    'message' => 'No file uploaded'
                ], 400);
            }

            // Create a group for this import
            $groupName = $this->generateGroupName(Auth::id());
            $group = Group::create([
                'name' => $groupName,
                'description' => 'Auto-created group from CSV import: ' . $file->getClientOriginalName(),
                'user_id' => Auth::id(),
            ]);

            Log::info('Created group for CSV import', [
                'group_id' => $group->id,
                'group_name' => $group->name,
                'user_id' => Auth::id(),
                'filename' => $file->getClientOriginalName(),
            ]);

            $fileName = 'contacts_import_' . time() . '_' . Auth::id() . '.csv';
            $filePath = $file->storeAs('temp', $fileName, 'public');

            // Set longer timeout for large files
            set_time_limit(300); // 5 minutes

            // Import contacts using SimpleContactImport with group
            Excel::import(new SimpleContactImport(Auth::id(), $group->id), storage_path('app/public/' . $filePath));

            // Clean up temporary file
            Storage::disk('public')->delete($filePath);

            return response()->json([
                'success' => true,
                'message' => "Contacts imported successfully! Created group: {$group->name}",
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', $e->errors()['csv_file'] ?? [])
            ], 422);
        } catch (\Exception $e) {
            Log::error('CSV Import Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to import contacts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a unique group name for the user
     */
    private function generateGroupName(int $userId): string
    {
        $baseName = 'Group';
        $counter = 1;

        do {
            $groupName = $baseName . ' ' . $counter;
            $exists = Group::where('user_id', $userId)
                ->where('name', $groupName)
                ->exists();
            $counter++;
        } while ($exists);

        return $groupName;
    }
}
