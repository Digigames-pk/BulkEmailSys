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

        return Inertia::render('CampaignWizard/Index', [
            'baseTemplates' => $baseTemplates,
            'emailTemplates' => $emailTemplates,
            'groups' => $groups,
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
