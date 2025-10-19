<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'description' => 'Perfect for getting started with email marketing',
                'stripe_price_id' => 'price_free',
                'stripe_product_id' => 'prod_free',
                'price' => 0.00,
                'currency' => 'usd',
                'interval' => 'month',
                'trial_days' => 0,
                'is_active' => true,
                'is_featured' => false,
                'max_templates' => 3,
                'max_contacts' => 100,
                'max_emails_per_month' => 50,
                'features' => [
                    '3 Email Templates',
                    '100 Contacts',
                    '50 Emails per Month',
                    'Basic Support'
                ],
            ],
            [
                'name' => 'Starter',
                'description' => 'Great for small businesses and individuals',
                'stripe_price_id' => 'price_starter_monthly',
                'stripe_product_id' => 'prod_starter',
                'price' => 9.99,
                'currency' => 'usd',
                'interval' => 'month',
                'trial_days' => 14,
                'is_active' => true,
                'is_featured' => false,
                'max_templates' => 10,
                'max_contacts' => 1000,
                'max_emails_per_month' => 500,
                'features' => [
                    '10 Email Templates',
                    '1,000 Contacts',
                    '500 Emails per Month',
                    'Email Analytics',
                    'Priority Support'
                ],
            ],
            [
                'name' => 'Professional',
                'description' => 'Perfect for growing businesses',
                'stripe_price_id' => 'price_professional_monthly',
                'stripe_product_id' => 'prod_professional',
                'price' => 29.99,
                'currency' => 'usd',
                'interval' => 'month',
                'trial_days' => 14,
                'is_active' => true,
                'is_featured' => true,
                'max_templates' => 50,
                'max_contacts' => 10000,
                'max_emails_per_month' => 5000,
                'features' => [
                    '50 Email Templates',
                    '10,000 Contacts',
                    '5,000 Emails per Month',
                    'Advanced Analytics',
                    'A/B Testing',
                    'Priority Support',
                    'API Access'
                ],
            ],
            [
                'name' => 'Enterprise',
                'description' => 'For large organizations with high volume needs',
                'stripe_price_id' => 'price_enterprise_monthly',
                'stripe_product_id' => 'prod_enterprise',
                'price' => 99.99,
                'currency' => 'usd',
                'interval' => 'month',
                'trial_days' => 14,
                'is_active' => true,
                'is_featured' => false,
                'max_templates' => 0, // Unlimited
                'max_contacts' => 0, // Unlimited
                'max_emails_per_month' => 0, // Unlimited
                'features' => [
                    'Unlimited Templates',
                    'Unlimited Contacts',
                    'Unlimited Emails',
                    'Advanced Analytics',
                    'A/B Testing',
                    'White-label Options',
                    'Dedicated Support',
                    'Full API Access',
                    'Custom Integrations'
                ],
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::create($planData);
        }
    }
}
