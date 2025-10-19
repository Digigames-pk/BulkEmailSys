<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;

class SubscriptionPlanController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        Stripe::setApiKey(config('services.stripe.secret_key'));
    }

    /**
     * Display a listing of subscription plans.
     */
    public function index()
    {
        $plans = SubscriptionPlan::where('stripe_price_id', '!=', 'price_free')
            ->withCount('userSubscriptions')
            ->get()
            ->map(fn($plan) => [
                ...$plan->toArray(),
                'price' => (float) $plan->price,
            ]);

        return Inertia::render('Plans/Index', [
            'plans' => $plans
        ]);
    }

    /**
     * Show the form for creating a new subscription plan.
     */
    public function create()
    {
        return Inertia::render('Plans/Create');
    }

    /**
     * Store a newly created subscription plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|in:usd,eur,gbp',
            'interval' => 'required|string|in:month,year',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'max_templates' => 'required|integer|min:0',
            'max_contacts' => 'required|integer|min:0',
            'max_emails_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
        ]);

        try {
            // Create Stripe Product
            $stripeProduct = Product::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'type' => 'service',
            ]);

            // Create Stripe Price
            $stripePrice = Price::create([
                'unit_amount' => $validated['price'] * 100, // Convert to cents
                'currency' => $validated['currency'],
                'recurring' => [
                    'interval' => $validated['interval'],
                ],
                'product' => $stripeProduct->id,
            ]);

            // Create local subscription plan
            $plan = SubscriptionPlan::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'stripe_price_id' => $stripePrice->id,
                'stripe_product_id' => $stripeProduct->id,
                'price' => $validated['price'],
                'currency' => $validated['currency'],
                'interval' => $validated['interval'],
                'trial_days' => $validated['trial_days'],
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
                'max_templates' => $validated['max_templates'],
                'max_contacts' => $validated['max_contacts'],
                'max_emails_per_month' => $validated['max_emails_per_month'],
                'features' => $validated['features'] ?? [],
            ]);

            return redirect()->route('plans.index')->with('success', 'Subscription plan created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error creating subscription plan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified subscription plan.
     */
    public function show(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Plans/Show', [
            'plan' => [
                ...$subscriptionPlan->toArray(),
                'price' => (float) $subscriptionPlan->price,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified subscription plan.
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Plans/Edit', [
            'plan' => [
                ...$subscriptionPlan->toArray(),
                'price' => (float) $subscriptionPlan->price,
            ]
        ]);
    }

    /**
     * Update the specified subscription plan.
     */
    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|in:usd,eur,gbp',
            'interval' => 'required|string|in:month,year',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'max_templates' => 'required|integer|min:0',
            'max_contacts' => 'required|integer|min:0',
            'max_emails_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
        ]);

        try {
            // Update Stripe Product
            Product::update($subscriptionPlan->stripe_product_id, [
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            // Update local subscription plan
            $subscriptionPlan->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'currency' => $validated['currency'],
                'interval' => $validated['interval'],
                'trial_days' => $validated['trial_days'],
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
                'max_templates' => $validated['max_templates'],
                'max_contacts' => $validated['max_contacts'],
                'max_emails_per_month' => $validated['max_emails_per_month'],
                'features' => $validated['features'] ?? [],
            ]);

            return redirect()->route('plans.index')->with('success', 'Subscription plan updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error updating subscription plan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified subscription plan.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        try {
            // Archive Stripe Product
            Product::update($subscriptionPlan->stripe_product_id, [
                'active' => false,
            ]);

            // Archive Stripe Price
            Price::update($subscriptionPlan->stripe_price_id, [
                'active' => false,
            ]);

            // Delete local subscription plan
            $subscriptionPlan->delete();

            return redirect()->route('plans.index')->with('success', 'Subscription plan deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error deleting subscription plan: ' . $e->getMessage());
        }
    }
}
