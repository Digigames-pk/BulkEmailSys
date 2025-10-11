<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailTemplate;
use App\Models\Group;
use App\Jobs\SendBulkEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailCampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $campaigns = EmailCampaign::where('user_id', Auth::id())
            ->with(['emailTemplate', 'group'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('EmailCampaign/Index', [
            'campaigns' => $campaigns
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $emailTemplates = EmailTemplate::where('user_id', Auth::id())
            ->select('id', 'name', 'email_subject')
            ->get();

        $groups = Group::where('user_id', Auth::id())
            ->withCount('contacts')
            ->select('id', 'name', 'description')
            ->get();

        return Inertia::render('EmailCampaign/Create', [
            'emailTemplates' => $emailTemplates,
            'groups' => $groups
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'email_template_id' => 'required|exists:email_templates,id',
            'group_id' => 'required|exists:groups,id',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        // Ensure the template and group belong to the authenticated user
        $emailTemplate = EmailTemplate::where('user_id', Auth::id())
            ->findOrFail($request->email_template_id);

        $group = Group::where('user_id', Auth::id())
            ->findOrFail($request->group_id);

        $campaign = EmailCampaign::create([
            'name' => $request->name,
            'subject' => $request->subject,
            'description' => $request->description,
            'email_template_id' => $request->email_template_id,
            'group_id' => $request->group_id,
            'user_id' => Auth::id(),
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'scheduled_at' => $request->scheduled_at,
            'total_recipients' => $group->contacts()->count(),
        ]);

        // If no scheduled time, send immediately
        if (!$request->scheduled_at) {
            $this->sendCampaign($campaign);
        }

        return redirect()->route('email-campaigns.index')
            ->with('success', 'Email campaign created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EmailCampaign $emailCampaign)
    {
        // Ensure user can only view their own campaigns
        if ($emailCampaign->user_id !== Auth::id()) {
            abort(403);
        }

        $emailCampaign->load(['emailTemplate', 'group.contacts', 'emailLogs']);

        return Inertia::render('EmailCampaign/Show', [
            'campaign' => $emailCampaign
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmailCampaign $emailCampaign)
    {
        // Ensure user can only edit their own campaigns
        if ($emailCampaign->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow editing draft campaigns
        if (!$emailCampaign->canBeSent()) {
            return redirect()->route('email-campaigns.index')
                ->with('error', 'Only draft campaigns can be edited.');
        }

        $emailTemplates = EmailTemplate::where('user_id', Auth::id())
            ->select('id', 'name', 'email_subject')
            ->get();

        $groups = Group::where('user_id', Auth::id())
            ->withCount('contacts')
            ->select('id', 'name', 'description')
            ->get();

        return Inertia::render('EmailCampaign/Edit', [
            'campaign' => $emailCampaign,
            'emailTemplates' => $emailTemplates,
            'groups' => $groups
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailCampaign $emailCampaign)
    {
        // Ensure user can only update their own campaigns
        if ($emailCampaign->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow updating draft campaigns
        if (!$emailCampaign->canBeSent()) {
            return redirect()->route('email-campaigns.index')
                ->with('error', 'Only draft campaigns can be updated.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'email_template_id' => 'required|exists:email_templates,id',
            'group_id' => 'required|exists:groups,id',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        // Ensure the template and group belong to the authenticated user
        $emailTemplate = EmailTemplate::where('user_id', Auth::id())
            ->findOrFail($request->email_template_id);

        $group = Group::where('user_id', Auth::id())
            ->findOrFail($request->group_id);

        $emailCampaign->update([
            'name' => $request->name,
            'subject' => $request->subject,
            'description' => $request->description,
            'email_template_id' => $request->email_template_id,
            'group_id' => $request->group_id,
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'scheduled_at' => $request->scheduled_at,
            'total_recipients' => $group->contacts()->count(),
        ]);

        return redirect()->route('email-campaigns.index')
            ->with('success', 'Email campaign updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailCampaign $emailCampaign)
    {
        // Ensure user can only delete their own campaigns
        if ($emailCampaign->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow deleting draft campaigns
        if (!$emailCampaign->canBeSent()) {
            return redirect()->route('email-campaigns.index')
                ->with('error', 'Only draft campaigns can be deleted.');
        }

        $emailCampaign->delete();

        return redirect()->route('email-campaigns.index')
            ->with('success', 'Email campaign deleted successfully.');
    }

    /**
     * Send a campaign immediately.
     */
    public function send(EmailCampaign $emailCampaign)
    {
        // Ensure user can only send their own campaigns
        if ($emailCampaign->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$emailCampaign->canBeSent()) {
            return redirect()->route('email-campaigns.index')
                ->with('error', 'Campaign cannot be sent in its current status.');
        }

        $this->sendCampaign($emailCampaign);

        return redirect()->route('email-campaigns.index')
            ->with('success', 'Email campaign is being sent.');
    }

    /**
     * Send the campaign emails.
     */
    private function sendCampaign(EmailCampaign $campaign)
    {
        $campaign->update(['status' => 'sending']);

        // Dispatch job to send emails
        SendBulkEmailJob::dispatch($campaign);
    }
}
