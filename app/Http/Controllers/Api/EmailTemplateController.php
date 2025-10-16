<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmailTemplateResource;
use App\Jobs\ProcessCsvImportJob;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $emailTemplates = EmailTemplate::orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => EmailTemplateResource::collection($emailTemplates)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email_subject' => 'nullable|string|max:255',
                'from_name' => 'nullable|string|max:255',
                'reply_to_email' => 'nullable|email|max:255',
                'csv_file' => 'nullable|file', // 10MB max for CSV files
                'editor_content' => 'nullable|string',
                'mail_content' => 'nullable|string',
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $data = $request->all();
            // Set user_id to authenticated user
            $data['user_id'] = Auth::id();

            $data['editor_content'] = base64_decode($data['editor_content'] ?? '');
            $data['mail_content'] = base64_decode($data['mail_content'] ?? '');

            if ($request->hasFile('thumbnail')) {
                $data['thumbnail'] = $request->file('thumbnail')->store('email-templates', 'public');
            }

            if ($request->hasFile('csv_file')) {
                $data['csv_file'] = $request->file('csv_file')->store('email-templates/csv', 'public');
            }

            $emailTemplate = EmailTemplate::create($data);

            // Dispatch CSV import job if CSV file was uploaded
            if ($request->hasFile('csv_file')) {
                ProcessCsvImportJob::dispatch($emailTemplate, $data['user_id']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Email template created successfully.',
                'data' => new EmailTemplateResource($emailTemplate)
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the email template.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(EmailTemplate $emailTemplate)
    {
        return response()->json([
            'success' => true,
            'data' => new EmailTemplateResource($emailTemplate)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email_subject' => 'nullable|string|max:255',
                'from_name' => 'nullable|string|max:255',
                'reply_to_email' => 'nullable|email|max:255',
                'csv_file' => 'nullable|file', // 10MB max for CSV files
                'editor_content' => 'nullable|string',
                'mail_content' => 'nullable|string',
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $data = $request->all();
            $data['editor_content'] = base64_decode($data['editor_content'] ?? '');
            $data['mail_content'] = base64_decode($data['mail_content'] ?? '');
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail
                if ($emailTemplate->thumbnail) {
                    Storage::disk('public')->delete($emailTemplate->thumbnail);
                }
                $data['thumbnail'] = $request->file('thumbnail')->store('email-templates', 'public');
            }

            if ($request->hasFile('csv_file')) {
                // Delete old CSV file
                if ($emailTemplate->csv_file) {
                    Storage::disk('public')->delete($emailTemplate->csv_file);
                }
                $data['csv_file'] = $request->file('csv_file')->store('email-templates/csv', 'public');
            }

            $emailTemplate->update($data);

            // Dispatch CSV import job if new CSV file was uploaded
            if ($request->hasFile('csv_file')) {
                ProcessCsvImportJob::dispatch($emailTemplate, $emailTemplate->user_id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Email template updated successfully.',
                'data' => new EmailTemplateResource($emailTemplate->fresh())
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the email template.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailTemplate $emailTemplate)
    {
        try {

            // Delete associated files
            if ($emailTemplate->thumbnail) {
                Storage::disk('public')->delete($emailTemplate->thumbnail);
            }
            if ($emailTemplate->csv_file) {
                Storage::disk('public')->delete($emailTemplate->csv_file);
            }

            $emailTemplate->delete();

            return response()->json([
                'success' => true,
                'message' => 'Email template deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the email template.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
