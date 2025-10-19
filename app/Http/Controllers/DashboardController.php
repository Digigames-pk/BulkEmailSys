<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display analytics for the authenticated user.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $contactsCount = Contact::where('user_id', $user->id)->count();
        $templatesCount = EmailTemplate::where('user_id', $user->id)->count();

        $logsQuery = EmailLog::query()
            ->whereHas('emailTemplate', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        $emailsTotal = (clone $logsQuery)->count();
        $emailsSent = (clone $logsQuery)->where('status', 'sent')->count();
        $emailsFailed = (clone $logsQuery)->where('status', 'failed')->count();

        // Build last 14 days timeseries for sent/failed
        $days = collect(range(0, 13))->map(function ($i) {
            return Carbon::today()->subDays(13 - $i);
        });

        $timeseries = $days->map(function (Carbon $day) use ($logsQuery) {
            $start = $day->copy()->startOfDay();
            $end = $day->copy()->endOfDay();

            $sent = (clone $logsQuery)
                ->where('status', 'sent')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $failed = (clone $logsQuery)
                ->where('status', 'failed')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            return [
                'date' => $day->toDateString(),
                'sent' => $sent,
                'failed' => $failed,
            ];
        });

        // Top 5 templates by sent count
        $topTemplates = EmailTemplate::where('user_id', $user->id)
            ->withCount(['emailLogs as sent_count' => function ($q) {
                $q->where('status', 'sent');
            }])
            ->orderByDesc('sent_count')
            ->limit(5)
            ->get(['id', 'name'])
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'sent' => (int) ($t->sent_count ?? 0),
            ]);

        // Recent 10 email activities
        $recentEmails = $logsQuery
            ->latest()
            ->limit(10)
            ->get(['id', 'email', 'subject', 'status', 'created_at'])
            ->map(fn($l) => [
                'id' => $l->id,
                'email' => $l->email,
                'subject' => $l->subject,
                'status' => $l->status,
                'created_at' => $l->created_at?->toIso8601String(),
            ]);

        // Get subscription data
        $currentSubscription = $user->currentSubscription();
        $subscriptionLimits = $user->getSubscriptionLimits();

        // Get current month email count
        $emailsThisMonth = (clone $logsQuery)
            ->whereMonth('email_logs.created_at', now()->month)
            ->whereYear('email_logs.created_at', now()->year)
            ->count();

        // Format subscription data if it exists
        $formattedSubscription = null;
        if ($currentSubscription) {
            $formattedSubscription = [
                'id' => $currentSubscription->id,
                'subscription_plan' => [
                    'name' => $currentSubscription->subscriptionPlan->name,
                    'price' => (float) $currentSubscription->subscriptionPlan->price,
                    'currency' => $currentSubscription->subscriptionPlan->currency,
                    'interval' => $currentSubscription->subscriptionPlan->interval,
                ],
                'status' => $currentSubscription->status,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'contacts' => $contactsCount,
                'templates' => $templatesCount,
                'emails' => [
                    'total' => $emailsTotal,
                    'sent' => $emailsSent,
                    'failed' => $emailsFailed,
                ],
            ],
            'timeseries' => $timeseries,
            'topTemplates' => $topTemplates,
            'recentEmails' => $recentEmails,
            'subscription' => [
                'current' => $formattedSubscription,
                'limits' => $subscriptionLimits,
                'usage' => [
                    'templates' => $templatesCount,
                    'contacts' => $contactsCount,
                    'emails_this_month' => $emailsThisMonth,
                ],
            ],
        ]);
    }
}
