<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\BaseTemplate;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Jobs\ProcessCsvImportJob;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $emailTemplates = EmailTemplate::where('user_id', Auth::id())->get();

        return Inertia::render('EmailTemplate/Index', [
            'emailTemplates' => $emailTemplates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('EmailTemplate/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email_subject' => 'nullable|string|max:255',
            'from_name' => 'nullable|string|max:255',
            'reply_to_email' => 'nullable|email|max:255',
            'csv_file' => 'nullable|file|mimes:csv|max:10240', // 10MB max for CSV files
            'editor_content' => 'nullable|string',
            'mail_content' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('email-templates', 'public');
        }

        if ($request->hasFile('csv_file')) {
            $data['csv_file'] = $request->file('csv_file')->store('email-templates/csv', 'public');
        }

        EmailTemplate::create($data);

        return redirect()->route('email-template.index')->with('success', 'Email template created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EmailTemplate $emailTemplate)
    {
        return Inertia::render('EmailTemplate/Show', [
            'emailTemplate' => $emailTemplate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmailTemplate $emailTemplate)
    {
        return Inertia::render('EmailTemplate/Edit', [
            'emailTemplate' => $emailTemplate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email_subject' => 'nullable|string|max:255',
            'from_name' => 'nullable|string|max:255',
            'reply_to_email' => 'nullable|email|max:255',
            'csv_file' => 'nullable|file|mimes:csv|max:10240', // 10MB max for CSV files
            'editor_content' => 'nullable|string',
            'mail_content' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'dispatch_job' => 'nullable|boolean',
        ]);

        $data = $request->all();

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

        // Dispatch CSV import job if requested and CSV file exists
        if ($request->boolean('dispatch_job') && $emailTemplate->csv_file) {
            ProcessCsvImportJob::dispatch($emailTemplate, $emailTemplate->user_id);
            return redirect()->route('email-template.index')->with('success', 'Email template updated successfully. CSV import job has been dispatched.');
        }

        return redirect()->route('email-template.index')->with('success', 'Email template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailTemplate $emailTemplate)
    {
        // Delete thumbnail if exists
        if ($emailTemplate->thumbnail) {
            Storage::disk('public')->delete($emailTemplate->thumbnail);
        }

        $emailTemplate->delete();

        return redirect()->route('email-template.index')->with('success', 'Email template deleted successfully.');
    }

    /**
     * Display base templates
     */
    public function baseTemplate()
    {
        $baseTemplates = BaseTemplate::all();

        return Inertia::render('BaseTemplate/Index', [
            'baseTemplates' => $baseTemplates,
        ]);
    }

    /**
     * View base template
     */
    public function viewBaseTemplate(BaseTemplate $baseTemplate)
    {
        return Inertia::render('BaseTemplate/Show', [
            'baseTemplate' => $baseTemplate,
        ]);
    }

    /**
     * Use base template to create email template
     */
    public function setEmailTemplate(Request $request, BaseTemplate $baseTemplate)
    {
        $data = [
            'user_id' => Auth::id(),
            'name' => $baseTemplate->name,
            'editor_content' => $baseTemplate->editor_content,
            'mail_content' => $baseTemplate->mail_content,
            'thumbnail' => $baseTemplate->thumbnail,
        ];

        EmailTemplate::create($data);

        return redirect()->route('email-template.index')->with('success', 'Email template created from base template successfully.');
    }
}
