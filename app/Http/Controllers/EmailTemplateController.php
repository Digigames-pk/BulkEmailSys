<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\BaseTemplate;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        // Check template limit
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $currentTemplateCount = $user->emailTemplates()->count();

        if ($limits['templates'] > 0 && $currentTemplateCount >= $limits['templates']) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Template limit reached',
                    'message' => "You've reached your limit of {$limits['templates']} templates. Please upgrade your plan to create more templates.",
                    'limit_reached' => true,
                    'limit_type' => 'templates',
                    'current_usage' => $currentTemplateCount,
                    'limit' => $limits['templates']
                ], 403);
            }

            return redirect()->back()->with('error', "You've reached your limit of {$limits['templates']} templates. Please upgrade your plan to create more templates.");
        }

        $data = $request->all();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('email-templates', 'public');
        }

        if ($request->hasFile('csv_file')) {
            $data['csv_file'] = $request->file('csv_file')->store('email-templates/csv', 'public');
        }

        EmailTemplate::create($data);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Email template created successfully.'
            ]);
        }

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
        // Check if thumbnail is used in Base templates or other Email templates before deleting
        if ($emailTemplate->thumbnail) {
            $isUsedInBaseTemplates = $this->isImageUsedInBaseTemplates($emailTemplate->thumbnail);
            // dd($isUsedInBaseTemplates);
            if (!$isUsedInBaseTemplates) {
                Storage::disk('public')->delete($emailTemplate->thumbnail);
                Log::info("Deleted image: {$emailTemplate->thumbnail}");
            } else {
                Log::info("Preserved image: {$emailTemplate->thumbnail} (used in Base templates or other Email templates)");
            }
        }

        $emailTemplate->delete();

        return redirect()->route('email-template.index')->with('success', 'Email template deleted successfully.');
    }

    /**
     * Check if an image is used in Base templates
     */
    private function isImageUsedInBaseTemplates(string $imagePath): bool
    {
        // Get the filename from the path
        $filename = basename($imagePath);

        // Query Base templates to check if image is referenced in content
        $isUsed = BaseTemplate::where('thumbnail', 'like', "%{$imagePath}%")->exists();

        return $isUsed;
    }


    /**
     * Display base templates
     */
    public function baseTemplate()
    {
        $baseTemplates = BaseTemplate::all();

        // Get user's subscription data for limit checking
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $usage = [
            'templates' => $user->emailTemplates()->count(),
            'contacts' => $user->contacts()->count(),
            'emails_this_month' => $user->emailLogs()
                ->whereMonth('email_logs.created_at', now()->month)
                ->whereYear('email_logs.created_at', now()->year)
                ->count(),
        ];

        // Get available subscription plans for upgrade modal
        $plans = \App\Models\SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(fn($plan) => [
                ...$plan->toArray(),
                'price' => (float) $plan->price,
            ]);

        return Inertia::render('BaseTemplate/Index', [
            'baseTemplates' => $baseTemplates,
            'plans' => $plans,
            'currentSubscription' => $user->currentSubscription(),
            'limits' => $limits,
            'usage' => $usage,
        ]);
    }

    /**
     * View base template
     */
    public function viewBaseTemplate(BaseTemplate $baseTemplate)
    {
        // Get user's subscription data for limit checking
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $usage = [
            'templates' => $user->emailTemplates()->count(),
            'contacts' => $user->contacts()->count(),
            'emails_this_month' => $user->emailLogs()
                ->whereMonth('email_logs.created_at', now()->month)
                ->whereYear('email_logs.created_at', now()->year)
                ->count(),
        ];

        // Get available subscription plans for upgrade modal
        $plans = \App\Models\SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(fn($plan) => [
                ...$plan->toArray(),
                'price' => (float) $plan->price,
            ]);

        return Inertia::render('BaseTemplate/Show', [
            'baseTemplate' => $baseTemplate,
            'plans' => $plans,
            'currentSubscription' => $user->currentSubscription(),
            'limits' => $limits,
            'usage' => $usage,
        ]);
    }

    /**
     * Use base template to create email template
     */
    public function setEmailTemplate(Request $request, BaseTemplate $baseTemplate)
    {
        // Check template limit
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $currentTemplateCount = $user->emailTemplates()->count();

        if ($limits['templates'] > 0 && $currentTemplateCount >= $limits['templates']) {
            Log::info('Template limit reached in setEmailTemplate', [
                'user_id' => $user->id,
                'current_count' => $currentTemplateCount,
                'limit' => $limits['templates'],
                'expects_json' => $request->expectsJson()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Template limit reached',
                    'message' => "You've reached your limit of {$limits['templates']} templates. Please upgrade your plan to create more templates.",
                    'limit_reached' => true,
                    'limit_type' => 'templates',
                    'current_usage' => $currentTemplateCount,
                    'limit' => $limits['templates']
                ], 403);
            }

            return redirect()->back()->with('error', "You've reached your limit of {$limits['templates']} templates. Please upgrade your plan to create more templates.");
        }

        $data = [
            'user_id' => Auth::id(),
            'name' => $baseTemplate->name,
            'editor_content' => $baseTemplate->editor_content,
            'mail_content' => $baseTemplate->mail_content,
            'thumbnail' => $baseTemplate->thumbnail,
        ];

        EmailTemplate::create($data);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Email template created from base template successfully.'
            ]);
        }

        return redirect()->route('email-template.index')->with('success', 'Email template created from base template successfully.');
    }
}
