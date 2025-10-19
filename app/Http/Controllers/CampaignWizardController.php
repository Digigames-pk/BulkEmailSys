<?php

namespace App\Http\Controllers;

use App\Models\BaseTemplate;
use App\Models\EmailTemplate;
use App\Models\Group;
use App\Models\EmailCampaign;
use App\Jobs\SendBulkEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CampaignWizardController extends Controller
{
    /**
     * Display the campaign wizard.
     */
    public function index()
    {
        $baseTemplates = BaseTemplate::all();
        $emailTemplates = EmailTemplate::where('user_id', Auth::id())->get();
        $groups = Group::where('user_id', Auth::id())->withCount('contacts')->get();

        // Get user's subscription limits and usage
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

        return Inertia::render('CampaignWizard/Index', [
            'baseTemplates' => $baseTemplates,
            'emailTemplates' => $emailTemplates,
            'groups' => $groups,
            'limits' => $limits,
            'usage' => $usage,
            'plans' => $plans,
            'currentSubscription' => $user->currentSubscription(),
        ]);
    }

    /**
     * Create email template from base template.
     */
    public function createTemplateFromBase(Request $request)
    {
        $request->validate([
            'base_template_id' => 'required|exists:base_templates,id',
            'name' => 'required|string|max:255',
            'email_subject' => 'nullable|string|max:255',
        ]);

        // Check template limit
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $currentTemplateCount = $user->emailTemplates()->count();

        if ($limits['templates'] > 0 && $currentTemplateCount >= $limits['templates']) {
            return response()->json([
                'error' => 'Template limit reached',
                'message' => "You've reached your limit of {$limits['templates']} templates. Please upgrade your plan to create more templates.",
                'limit_reached' => true,
                'limit_type' => 'templates',
                'current_usage' => $currentTemplateCount,
                'limit' => $limits['templates']
            ], 403);
        }

        $baseTemplate = BaseTemplate::findOrFail($request->base_template_id);

        $emailTemplate = EmailTemplate::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'email_subject' => $request->email_subject,
            'editor_content' => $baseTemplate->editor_content,
            'mail_content' => $baseTemplate->mail_content,
            'thumbnail' => $baseTemplate->thumbnail,
        ]);

        return response()->json([
            'success' => true,
            'template' => $emailTemplate,
        ]);
    }

    /**
     * Create email template from scratch.
     */
    public function createTemplateFromScratch(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email_subject' => 'nullable|string|max:255',
            'editor_content' => 'nullable|string',
            'mail_content' => 'nullable|string',
        ]);

        $emailTemplate = EmailTemplate::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'email_subject' => $request->email_subject,
            'editor_content' => $request->editor_content,
            'mail_content' => $request->mail_content,
        ]);

        return response()->json([
            'success' => true,
            'template' => $emailTemplate,
        ]);
    }

    /**
     * Create the final campaign.
     */
    public function createCampaign(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'from_name' => 'nullable|string|max:255',
            'reply_to_email' => 'nullable|email|max:255',
            'description' => 'nullable|string|max:1000',
            'email_template_id' => 'required|exists:email_templates,id',
            'group_id' => 'required|exists:groups,id',
            'scheduled_at' => 'nullable|date',
        ]);

        // Check email limit before creating campaign
        $user = Auth::user();
        $limits = $user->getSubscriptionLimits();
        $group = Group::find($request->group_id);
        $recipientCount = $group->contacts()->count();

        // Get current month's email usage
        $currentMonthEmails = $user->emailLogs()
            ->whereMonth('email_logs.created_at', now()->month)
            ->whereYear('email_logs.created_at', now()->year)
            ->count();

        // Check if sending this campaign would exceed the limit
        if ($limits['emails_per_month'] > 0 && ($currentMonthEmails + $recipientCount) > $limits['emails_per_month']) {
            return response()->json([
                'error' => 'Email limit would be exceeded',
                'message' => "Sending this campaign would exceed your monthly limit of {$limits['emails_per_month']} emails. You have {$currentMonthEmails} emails remaining this month, but this campaign would send {$recipientCount} emails.",
                'limit_reached' => true,
                'limit_type' => 'emails',
                'current_usage' => $currentMonthEmails,
                'limit' => $limits['emails_per_month'],
                'campaign_recipients' => $recipientCount
            ], 403);
        }

        $campaign = EmailCampaign::create([
            'name' => $request->name,
            'subject' => $request->subject,
            'from_name' => $request->from_name,
            'reply_to_email' => $request->reply_to_email,
            'description' => $request->description,
            'email_template_id' => $request->email_template_id,
            'group_id' => $request->group_id,
            'user_id' => Auth::id(),
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'scheduled_at' => $request->scheduled_at,
            'total_recipients' => Group::find($request->group_id)->contacts()->count(),
        ]);

        // Handle sending based on schedule
        if (!$request->scheduled_at) {
            // Send immediately
            $this->sendCampaign($campaign);
        } else {
            // Schedule for later
            $this->scheduleCampaign($campaign);
        }

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'message' => $request->scheduled_at ? 'Campaign scheduled successfully!' : 'Campaign created and emails are being sent!',
        ]);
    }

    /**
     * Send the campaign emails immediately.
     */
    private function sendCampaign(EmailCampaign $campaign)
    {
        $campaign->update(['status' => 'sending']);

        // Dispatch job to send emails immediately
        SendBulkEmailJob::dispatch($campaign);
    }

    /**
     * Schedule the campaign for later sending.
     */
    private function scheduleCampaign(EmailCampaign $campaign)
    {
        // Schedule job to send emails at the specified time
        SendBulkEmailJob::dispatch($campaign)->delay($campaign->scheduled_at);
    }
}
