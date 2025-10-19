<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }
    /**
     * Display available subscription plans
     */
    public function index()
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(fn($plan) => [
                ...$plan->toArray(),
                'price' => (float) $plan->price,
            ]);

        return Inertia::render('Subscriptions/Index', [
            'plans' => $plans,
            'currentSubscription' => Auth::user()->currentSubscription()
        ]);
    }

    /**
     * Display user's current subscription and usage
     */
    public function dashboard()
    {
        $user = Auth::user();
        $currentSubscription = $user->currentSubscription();

        // Load subscription plan relationship
        if ($currentSubscription) {
            $currentSubscription->load('subscriptionPlan');
            $currentSubscription->subscription_plan->price = (float) $currentSubscription->subscription_plan->price;
        }

        return Inertia::render('Subscriptions/Dashboard', [
            'subscription' => $currentSubscription,
            'limits' => $user->getSubscriptionLimits(),
            'usage' => [
                'templates' => $user->emailTemplates()->count(),
                'contacts' => $user->contacts()->count(),
                'emails_this_month' => $user->emailLogs()
                    ->whereMonth('email_logs.created_at', now()->month)
                    ->whereYear('email_logs.created_at', now()->year)
                    ->count(),
            ]
        ]);
    }

    /**
     * Create Stripe checkout session
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id'
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $user = Auth::user();

        try {
            $checkoutData = $this->stripeService->createCheckoutSession($user, $plan);

            return response()->json([
                'checkout_url' => $checkoutData['url'],
                'session_id' => $checkoutData['session_id'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create checkout session. Please try again.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle successful subscription
     */
    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            return redirect()->route('subscriptions.index')
                ->with('error', 'Invalid session');
        }

        try {
            $session = $this->stripeService->retrieveCheckoutSession($sessionId);

            if ($session->payment_status === 'paid') {
                $subscription = $this->stripeService->createSubscriptionFromSession($session);
                $subscription->load('subscriptionPlan');
                $subscription->subscription_plan->price = (float) $subscription->subscription_plan->price;

                return Inertia::render('Subscriptions/Success', [
                    'subscription' => $subscription
                ]);
            }
        } catch (\Exception $e) {
            return redirect()->route('subscriptions.index')
                ->with('error', 'Failed to process subscription. Please contact support.');
        }

        return redirect()->route('subscriptions.index')
            ->with('error', 'Payment was not completed');
    }

    /**
     * Handle canceled subscription
     */
    public function cancel(Request $request)
    {
        return Inertia::render('Subscriptions/Cancel');
    }

    /**
     * Cancel user's subscription
     */
    public function destroy()
    {
        $subscription = Auth::user()->currentSubscription();

        if (!$subscription) {
            return redirect()->back()->with('error', 'No active subscription found.');
        }

        $success = $this->stripeService->cancelSubscription($subscription);

        if ($success) {
            return redirect()->route('subscriptions.dashboard')
                ->with('success', 'Subscription canceled successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to cancel subscription. Please contact support.');
    }
}
