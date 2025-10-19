<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret_key'));
    }

    /**
     * Create a Stripe customer
     */
    public function createCustomer(User $user): string
    {
        try {
            $customer = $this->stripe->customers->create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            return $customer->id;
        } catch (ApiErrorException $e) {
            Log::error('Stripe customer creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a checkout session for subscription
     */
    public function createCheckoutSession(User $user, SubscriptionPlan $plan): array
    {
        try {
            $customerId = $this->getOrCreateCustomer($user);

            $session = $this->stripe->checkout->sessions->create([
                'customer' => $customerId,
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price' => $plan->stripe_price_id,
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'subscription',
                'success_url' => route('subscriptions.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('subscriptions.cancel'),
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                ],
            ]);

            return [
                'session_id' => $session->id,
                'url' => $session->url,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session creation failed', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Retrieve checkout session
     */
    public function retrieveCheckoutSession(string $sessionId): object
    {
        try {
            return $this->stripe->checkout->sessions->retrieve($sessionId);
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session retrieval failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create subscription from checkout session
     */
    public function createSubscriptionFromSession(object $session): UserSubscription
    {
        $user = User::findOrFail($session->metadata->user_id);
        $plan = SubscriptionPlan::findOrFail($session->metadata->plan_id);

        // Get the subscription from Stripe
        $stripeSubscription = $this->stripe->subscriptions->retrieve($session->subscription);

        return UserSubscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'stripe_customer_id' => $stripeSubscription->customer,
            'status' => $stripeSubscription->status,
            'current_period_start' => now()->createFromTimestamp($stripeSubscription->current_period_start),
            'current_period_end' => now()->createFromTimestamp($stripeSubscription->current_period_end),
            'trial_ends_at' => $stripeSubscription->trial_end ?
                now()->createFromTimestamp($stripeSubscription->trial_end) : null,
            'is_active' => true,
            'metadata' => [
                'stripe_subscription' => $stripeSubscription->toArray(),
            ],
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(UserSubscription $subscription): bool
    {
        try {
            $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);

            $subscription->update([
                'is_active' => false,
                'canceled_at' => now(),
                'status' => 'canceled',
            ]);

            return true;
        } catch (ApiErrorException $e) {
            Log::error('Stripe subscription cancellation failed', [
                'subscription_id' => $subscription->id,
                'stripe_subscription_id' => $subscription->stripe_subscription_id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get or create customer for user
     */
    protected function getOrCreateCustomer(User $user): string
    {
        // Check if user already has a customer ID stored
        $existingSubscription = $user->subscriptions()->first();
        if ($existingSubscription) {
            return $existingSubscription->stripe_customer_id;
        }

        return $this->createCustomer($user);
    }

    /**
     * Handle webhook events
     */
    public function handleWebhook(array $payload): void
    {
        $eventType = $payload['type'];

        switch ($eventType) {
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($payload['data']['object']);
                break;
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($payload['data']['object']);
                break;
            case 'invoice.payment_failed':
                $this->handlePaymentFailed($payload['data']['object']);
                break;
        }
    }

    protected function handleSubscriptionUpdated(array $subscription): void
    {
        $userSubscription = UserSubscription::where('stripe_subscription_id', $subscription['id'])->first();

        if ($userSubscription) {
            $userSubscription->update([
                'status' => $subscription['status'],
                'current_period_start' => now()->createFromTimestamp($subscription['current_period_start']),
                'current_period_end' => now()->createFromTimestamp($subscription['current_period_end']),
                'is_active' => $subscription['status'] === 'active',
            ]);
        }
    }

    protected function handleSubscriptionDeleted(array $subscription): void
    {
        $userSubscription = UserSubscription::where('stripe_subscription_id', $subscription['id'])->first();

        if ($userSubscription) {
            $userSubscription->update([
                'is_active' => false,
                'canceled_at' => now(),
                'status' => 'canceled',
            ]);
        }
    }

    protected function handlePaymentFailed(array $invoice): void
    {
        $subscriptionId = $invoice['subscription'];
        $userSubscription = UserSubscription::where('stripe_subscription_id', $subscriptionId)->first();

        if ($userSubscription) {
            $userSubscription->update([
                'status' => 'past_due',
            ]);
        }
    }
}
